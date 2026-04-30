/**
 * 数据适配器
 * 将后端 API 响应转换为前端所需的数据格式
 * 支持动态科目提取（从接口数据中自动发现科目）
 */

import {
    StoreStatisticsItem,
    StoreStatisticsResponse,
    ProfitReportResponse,
    WarZoneReportItem,
    SubjectItem,
} from './apiService';

import {
    Store,
    Region,
    Subject,
    SubjectType,
    MonthlyFinancials,
    RegionFinancialSummary,
    DashboardData,
    RankItem,
    StoreFinancialSummary,
} from '../types';

// 【优化】导入性能工具
import { processInChunks, memoize } from '../utils/performance';

// ===================== 工具函数 =====================

/**
 * 获取相对于指定月份的偏移月份
 * @param monthStr yyyy-MM 格式字符串
 * @param offset 偏移量（负数表示过去，正数表示未来）
 * @returns yyyy-MM 格式字符串
 */
export function getOffsetMonth(monthStr: string, offset: number): string {
    const [year, month] = monthStr.split('-').map(Number);
    const date = new Date(year, month - 1 + offset, 1);
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    return `${y}-${m}`;
}

// ===================== 动态科目缓存 =====================

/**
 * 动态科目名称到ID的映射（由 extractSubjectsFromReport 填充）
 * 初始为空，在资源初始化时从接口数据中构建
 * 后续每次获取新月份数据时会增量合并新科目
 */
let dynamicSubjectNameToId: Record<string, string> = {};

/**
 * 动态缓存的科目列表（与 mockData.ts 中的 cachedSubjects 同步）
 * 在增量合并时直接操作此引用
 */
let dynamicSubjectsList: Subject[] = [];

/**
 * 设置动态科目列表的引用（由 mockData.ts 在初始化时调用）
 * @param subjects 科目列表引用
 */
export function setDynamicSubjectsList(subjects: Subject[]): void {
    dynamicSubjectsList = subjects;
}

/**
 * 获取动态科目列表
 */
export function getDynamicSubjectsList(): Subject[] {
    return dynamicSubjectsList;
}

/**
 * 更新动态科目映射表
 * @param mapping 新的映射关系
 */
export function updateSubjectNameToIdMapping(mapping: Record<string, string>): void {
    dynamicSubjectNameToId = { ...mapping };
    console.log('[dataAdapter] 科目映射表已更新，共', Object.keys(dynamicSubjectNameToId).length, '个科目');
}

/**
 * 获取当前的科目名称到ID映射
 */
export function getSubjectNameToIdMapping(): Record<string, string> {
    return dynamicSubjectNameToId;
}

// 兼容性导出（保持旧代码兼容）
export const SUBJECT_NAME_TO_ID: Record<string, string> = new Proxy({} as Record<string, string>, {
    get: (target, prop: string) => dynamicSubjectNameToId[prop],
    has: (target, prop: string) => prop in dynamicSubjectNameToId,
    ownKeys: () => Object.keys(dynamicSubjectNameToId),
    getOwnPropertyDescriptor: (target, prop: string) => ({
        enumerable: true,
        configurable: true,
        value: dynamicSubjectNameToId[prop as string]
    })
});

// ===================== 映射表 =====================

/**
 * 允许展示的战区白名单（第一战区到第六战区）
 */
export const ALLOWED_WAR_ZONES = [
    '第一战区',
    '第二战区',
    '第三战区',
    '第四战区',
    '第五战区',
    '第六战区',
];

/**
 * 战区名称到 Region ID 的映射
 */
const WAR_ZONE_TO_REGION_ID: Record<string, string> = {
    '第一战区': 'R1',
    '第二战区': 'R2',
    '第三战区': 'R3',
    '第四战区': 'R4',
    '第五战区': 'R5',
    '第六战区': 'R6',
};

// ===================== 科目类型判断工具 =====================

/**
 * 收入类科目的名称关键词列表
 * 当累计金额无法判断时，通过名称关键词兜底
 */
const REVENUE_NAME_KEYWORDS = ['收入', '手续费', '清洁费'];

/**
 * 支出类科目的名称关键词列表
 */
const EXPENSE_NAME_KEYWORDS = ['成本', '支出', '退款', '费用'];

/**
 * 通过科目名称辅助判断是否为收入类
 * @param name 科目名称
 * @returns true 表示名称暗示这是收入类科目
 */
function isRevenueByName(name: string): boolean {
    return REVENUE_NAME_KEYWORDS.some(kw => name.includes(kw));
}

/**
 * 通过科目名称辅助判断是否为支出类
 * @param name 科目名称
 * @returns true 表示名称暗示这是支出类科目
 */
function isExpenseByName(name: string): boolean {
    return EXPENSE_NAME_KEYWORDS.some(kw => name.includes(kw));
}

/**
 * 根据累计金额和名称综合判断科目类型
 *
 * 判断优先级：
 * 1. 累计金额：所有门店 incomeAmount 总和 vs expendAmount 总和，哪个大归哪类
 * 2. 名称关键词：当金额无法区分时（都为0或相等），通过名称关键词兜底
 * 3. 最终兜底：默认归为支出类（宁多算支出不多算收入）
 *
 * @param name 科目名称
 * @param totalIncome 所有门店 incomeAmount 的累加和
 * @param totalExpense 所有门店 expendAmount 的累加和
 * @returns 'revenue' | 'expense'
 */
function classifySubjectType(name: string, totalIncome: number, totalExpense: number): 'revenue' | 'expense' {
    // 优先级1：累计金额比较
    if (totalIncome > 0 && totalIncome > totalExpense) {
        return 'revenue';
    }
    if (totalExpense > 0 && totalExpense > totalIncome) {
        return 'expense';
    }

    // 优先级2：金额无法区分时（都为0或相等），用名称关键词
    if (isRevenueByName(name)) {
        return 'revenue';
    }
    if (isExpenseByName(name)) {
        return 'expense';
    }

    // 优先级3：最终兜底为支出
    return 'expense';
}

// ===================== 动态科目提取 =====================

/**
 * 从核算报表响应中提取所有唯一科目
 * 使用【累计法】判断科目类型：汇总所有门店的 incomeAmount 和 expendAmount，
 * 用总和大小来判断收入/支出，避免"后遍历到的门店覆盖前面"的误判。
 *
 * @param reportData 后端核算报表响应
 * @returns 科目列表和映射表
 */
export function extractSubjectsFromReport(reportData: ProfitReportResponse): {
    subjects: Subject[];
    nameToIdMapping: Record<string, string>;
} {
    // Step 1：遍历所有门店，累计每个科目在全局中的 incomeAmount 和 expendAmount 总和
    const subjectIncomeTotal = new Map<string, number>();
    const subjectExpenseTotal = new Map<string, number>();

    reportData.data?.forEach((warZone) => {
        warZone.stores?.forEach((store) => {
            store.firstSubjects?.forEach((subject) => {
                const name = subject.subjectName;
                if (!name || name.trim() === '') return;

                subjectIncomeTotal.set(
                    name,
                    (subjectIncomeTotal.get(name) || 0) + (subject.incomeAmount || 0)
                );
                subjectExpenseTotal.set(
                    name,
                    (subjectExpenseTotal.get(name) || 0) + (subject.expendAmount || 0)
                );
            });
        });
    });

    // Step 2：根据累计金额 + 名称关键词综合判断每个科目的类型
    const revenueNames: string[] = [];
    const expenseNames: string[] = [];

    const allNames = new Set([...subjectIncomeTotal.keys(), ...subjectExpenseTotal.keys()]);
    allNames.forEach(name => {
        const totalIncome = subjectIncomeTotal.get(name) || 0;
        const totalExpense = subjectExpenseTotal.get(name) || 0;
        const type = classifySubjectType(name, totalIncome, totalExpense);

        if (type === 'revenue') {
            revenueNames.push(name);
        } else {
            expenseNames.push(name);
        }
    });

    // Step 3：按中文排序
    revenueNames.sort((a, b) => a.localeCompare(b, 'zh-CN'));
    expenseNames.sort((a, b) => a.localeCompare(b, 'zh-CN'));

    // Step 4：构建科目列表和映射表
    const subjects: Subject[] = [];
    const nameToIdMapping: Record<string, string> = {};
    let revIndex = 1;
    let expIndex = 1;

    // 收入汇总父级
    subjects.push({ id: 'total_rev', name: '总收入', type: SubjectType.REVENUE, isParent: true });

    // 收入子科目
    revenueNames.forEach((name) => {
        const id = `rev_${revIndex++}`;
        subjects.push({ id, name, type: SubjectType.REVENUE });
        nameToIdMapping[name] = id;
    });

    // 支出汇总父级
    subjects.push({ id: 'total_exp', name: '总支出', type: SubjectType.EXPENSE, isParent: true });

    // 支出子科目
    expenseNames.forEach((name) => {
        const id = `exp_${expIndex++}`;
        subjects.push({ id, name, type: SubjectType.EXPENSE });
        nameToIdMapping[name] = id;
    });

    // 净利润
    subjects.push({ id: 'net_profit', name: '净利润', type: SubjectType.PROFIT, isParent: true });

    console.log(`[dataAdapter] 动态提取科目完成: ${revenueNames.length}个收入科目, ${expenseNames.length}个支出科目`);
    console.log(`[dataAdapter]   收入科目: ${revenueNames.join(', ')}`);
    console.log(`[dataAdapter]   支出科目: ${expenseNames.join(', ')}`);

    return { subjects, nameToIdMapping };
}

/**
 * 【增量合并】从新的报表数据中发现并注册之前未见过的科目
 * 解决跨月份科目不一致的问题：不同月份可能出现不同的科目，
 * 仅在首次初始化时构建映射表会遗漏后续月份独有的科目。
 *
 * 使用【累计法】判断科目类型，避免逐门店判断导致的类型误判。
 *
 * @param reportData 新获取的报表数据
 * @returns 是否发现了新科目
 */
export function mergeNewSubjectsFromReport(reportData: ProfitReportResponse): boolean {
    if (!reportData?.data || reportData.data.length === 0) {
        return false;
    }

    // Step 1：收集本次报表中所有尚未在映射表中的新科目，并累计其金额
    const newSubjectIncome = new Map<string, number>();
    const newSubjectExpense = new Map<string, number>();

    reportData.data.forEach((warZone) => {
        warZone.stores?.forEach((store) => {
            store.firstSubjects?.forEach((subject) => {
                const name = subject.subjectName;
                if (!name || name.trim() === '') return;

                // 已在映射表中的科目跳过
                if (dynamicSubjectNameToId[name]) return;

                // 新科目！累计金额
                newSubjectIncome.set(
                    name,
                    (newSubjectIncome.get(name) || 0) + (subject.incomeAmount || 0)
                );
                newSubjectExpense.set(
                    name,
                    (newSubjectExpense.get(name) || 0) + (subject.expendAmount || 0)
                );
            });
        });
    });

    if (newSubjectIncome.size === 0 && newSubjectExpense.size === 0) {
        return false;
    }

    // Step 2：用累计法 + 名称关键词判断每个新科目的类型
    const newRevenueNames: string[] = [];
    const newExpenseNames: string[] = [];
    const allNewNames = new Set([...newSubjectIncome.keys(), ...newSubjectExpense.keys()]);

    allNewNames.forEach(name => {
        const totalIncome = newSubjectIncome.get(name) || 0;
        const totalExpense = newSubjectExpense.get(name) || 0;
        const type = classifySubjectType(name, totalIncome, totalExpense);

        if (type === 'revenue') {
            newRevenueNames.push(name);
        } else {
            newExpenseNames.push(name);
        }
    });

    const totalNew = newRevenueNames.length + newExpenseNames.length;
    if (totalNew === 0) {
        return false;
    }

    console.log(`[dataAdapter] 发现 ${totalNew} 个新科目，开始增量合并！`);

    // Step 3：计算当前最大的 rev_ 和 exp_ 索引号
    let maxRevIndex = 0;
    let maxExpIndex = 0;
    Object.values(dynamicSubjectNameToId).forEach(id => {
        if (id.startsWith('rev_')) {
            const idx = parseInt(id.replace('rev_', ''), 10);
            if (idx > maxRevIndex) maxRevIndex = idx;
        } else if (id.startsWith('exp_')) {
            const idx = parseInt(id.replace('exp_', ''), 10);
            if (idx > maxExpIndex) maxExpIndex = idx;
        }
    });

    // Step 4：注册新的收入科目（插入到 total_exp 之前）
    newRevenueNames.sort((a, b) => a.localeCompare(b, 'zh-CN'));
    newRevenueNames.forEach(name => {
        const id = `rev_${++maxRevIndex}`;
        dynamicSubjectNameToId[name] = id;
        const newSubject: Subject = { id, name, type: SubjectType.REVENUE };
        const totalExpIdx = dynamicSubjectsList.findIndex(s => s.id === 'total_exp');
        if (totalExpIdx >= 0) {
            dynamicSubjectsList.splice(totalExpIdx, 0, newSubject);
        } else {
            dynamicSubjectsList.push(newSubject);
        }
        console.log(`[dataAdapter]   + 新收入科目: "${name}" -> ${id}`);
    });

    // Step 5：注册新的支出科目（插入到 net_profit 之前）
    newExpenseNames.sort((a, b) => a.localeCompare(b, 'zh-CN'));
    newExpenseNames.forEach(name => {
        const id = `exp_${++maxExpIndex}`;
        dynamicSubjectNameToId[name] = id;
        const newSubject: Subject = { id, name, type: SubjectType.EXPENSE };
        const netProfitIdx = dynamicSubjectsList.findIndex(s => s.id === 'net_profit');
        if (netProfitIdx >= 0) {
            dynamicSubjectsList.splice(netProfitIdx, 0, newSubject);
        } else {
            dynamicSubjectsList.push(newSubject);
        }
        console.log(`[dataAdapter]   + 新支出科目: "${name}" -> ${id}`);
    });

    console.log(`[dataAdapter] 科目增量合并完成，当前共 ${Object.keys(dynamicSubjectNameToId).length} 个科目`);
    return true;
}

// ===================== 转换函数 =====================

/**
 * 将门店统计信息转换为前端 Store 类型
 * @param item 后端门店统计数据
 * @returns 前端 Store 对象
 */
export function adaptStoreStatistics(item: StoreStatisticsItem): Store & {
    headcount: number;
    managedArea: number;
    buildingCount: number;
} {
    return {
        id: String(item.storeId),
        name: item.storeName,
        regionId: '', // 需要从其他接口获取或额外处理
        address: item.address,
        lat: parseFloat(item.lat) || 0,
        lng: parseFloat(item.lng) || 0,
        headcount: item.employeeCount,
        managedArea: item.totalArea,
        buildingCount: item.buildingCount,
    };
}

/**
 * 将科目列表转换为 details 记录（动态版本）
 * 使用动态科目映射表，支持自动发现的科目
 * @param subjects 后端科目数据列表
 * @returns 前端 details 对象 { subjectId: amount }
 */
export function adaptSubjectsToDetailsDynamic(subjects: SubjectItem[]): Record<string, number> {
    const details: Record<string, number> = {};
    let totalRevenue = 0;
    let totalExpense = 0;

    subjects.forEach((subject) => {
        // 过滤掉 subjectName 为空的科目
        if (!subject.subjectName || subject.subjectName.trim() === '') {
            return;
        }

        const subjectId = dynamicSubjectNameToId[subject.subjectName];
        if (subjectId) {
            // 根据科目类型使用对应金额
            if (subjectId.startsWith('rev_')) {
                details[subjectId] = subject.incomeAmount;
                totalRevenue += subject.incomeAmount;
            } else if (subjectId.startsWith('exp_')) {
                details[subjectId] = subject.expendAmount;
                totalExpense += subject.expendAmount;
            }
        } else {
            // 未映射的科目（可能是新科目），尝试按金额类型处理并记录
            if (subject.incomeAmount > 0) {
                totalRevenue += subject.incomeAmount;
            }
            if (subject.expendAmount > 0) {
                totalExpense += subject.expendAmount;
            }
            console.warn(`[dataAdapter] 未映射科目: ${subject.subjectName}，金额已计入汇总`);
        }
    });

    // 添加汇总字段
    details['total_rev'] = totalRevenue;
    details['total_exp'] = totalExpense;
    details['net_profit'] = totalRevenue - totalExpense;

    return details;
}

/**
 * 将科目列表转换为 details 记录（兼容旧版本，内部调用动态版本）
 * @deprecated 请使用 adaptSubjectsToDetailsDynamic
 */
export function adaptSubjectsToDetails(subjects: SubjectItem[]): Record<string, number> {
    return adaptSubjectsToDetailsDynamic(subjects);
}

/**
 * 将战区报表数据转换为 RegionFinancialSummary
 * @param warZoneData 后端战区数据
 * @returns 前端战区财务汇总
 */
export function adaptWarZoneToRegionSummary(
    warZoneData: WarZoneReportItem
): RegionFinancialSummary {
    // 直接使用战区名称作为 regionId，与 mockData.ts 中的 ensureResourcesInitialized 保持一致
    const regionId = warZoneData.warZone;

    // 汇总该战区下所有门店的数据
    const aggregatedDetails: Record<string, number> = {};

    warZoneData.stores.forEach((store) => {
        const storeDetails = adaptSubjectsToDetails(store.firstSubjects);

        // 累加各科目数据
        Object.entries(storeDetails).forEach(([key, value]) => {
            aggregatedDetails[key] = (aggregatedDetails[key] || 0) + value;
        });
    });

    return {
        regionId,
        regionName: warZoneData.warZone,
        data: aggregatedDetails,
    };
}

/**
 * 将门店报表数据转换为 StoreFinancialSummary
 * @param storeData 后端门店报表数据
 * @param storeStats 门店统计信息（可选）
 * @param month 查询月份
 * @returns 前端门店财务汇总
 */
export function adaptStoreReportToSummary(
    storeData: { storeId: number; storeName: string; firstSubjects: SubjectItem[] },
    storeStats?: StoreStatisticsItem,
    month?: string
): StoreFinancialSummary {
    const details = adaptSubjectsToDetails(storeData.firstSubjects);

    return {
        storeId: String(storeData.storeId),
        storeName: storeData.storeName,
        storeAddress: storeStats?.address || '',
        headcount: storeStats?.employeeCount || 0,
        managedArea: storeStats?.totalArea || 0,
        buildingCount: storeStats?.buildingCount || 0,
        date: month || new Date().toISOString().slice(0, 7),
        revenue: details['total_rev'] || 0,
        expense: details['total_exp'] || 0,
        netProfit: details['net_profit'] || 0,
        details,
    };
}

/**
 * 战区排序顺序（第一战区到第六战区）
 */
const WAR_ZONE_ORDER = ['第一战区', '第二战区', '第三战区', '第四战区', '第五战区', '第六战区'];

/**
 * 将完整的核算报表响应转换为 DashboardData
 * @param reportData 后端核算报表响应
 * @param month 查询月份
 * @returns 前端仪表盘数据
 */
export function adaptProfitReportToDashboard(
    reportData: ProfitReportResponse,
    month: string
): Omit<DashboardData, 'profitGrowth' | 'revenueGrowth' | 'expenseGrowth' | 'rankings'> {
    // 转换各战区数据
    const matrix: RegionFinancialSummary[] = reportData.data.map(adaptWarZoneToRegionSummary);

    // 按第一战区到第六战区的顺序排序
    matrix.sort((a, b) => {
        const indexA = WAR_ZONE_ORDER.indexOf(a.regionName);
        const indexB = WAR_ZONE_ORDER.indexOf(b.regionName);
        return indexA - indexB;
    });

    // 计算总计
    const totalRevenue = matrix.reduce((acc, curr) => acc + (curr.data['total_rev'] || 0), 0);
    const totalExpense = matrix.reduce((acc, curr) => acc + (curr.data['total_exp'] || 0), 0);
    const totalProfit = matrix.reduce((acc, curr) => acc + (curr.data['net_profit'] || 0), 0);

    return {
        totalProfit,
        totalRevenue,
        totalExpense,
        matrix,
    };
}

/**
 * 从核算报表中提取门店排行榜
 * 【P1优化】使用 toSorted 避免原地排序副作用
 * @param reportData 后端核算报表响应
 * @returns 收入、支出、利润排行榜
 */
export function extractRankingsFromReport(
    reportData: ProfitReportResponse
): { revenue: RankItem[]; expense: RankItem[]; profit: RankItem[] } {
    // 收集所有门店数据，每个门店只调用一次 adaptSubjectsToDetails
    const allStores: Array<{
        storeId: string;
        storeName: string;
        revenue: number;
        expense: number;
        profit: number;
    }> = [];

    reportData.data.forEach((warZone) => {
        warZone.stores.forEach((store) => {
            const details = adaptSubjectsToDetails(store.firstSubjects);
            allStores.push({
                storeId: String(store.storeId),
                storeName: store.storeName,
                revenue: details['total_rev'] || 0,
                expense: details['total_exp'] || 0,
                profit: details['net_profit'] || 0,
            });
        });
    });

    // 【P1优化】使用 toSorted 返回新数组，避免 3 次 in-place sort 的副作用
    const getTop10 = (key: 'revenue' | 'expense' | 'profit'): RankItem[] => {
        return [...allStores]
            .sort((a, b) => b[key] - a[key])
            .slice(0, 10)
            .map((item, idx) => ({
                rank: idx + 1,
                storeId: item.storeId,
                storeName: item.storeName,
                value: item[key],
            }));
    };

    return {
        revenue: getTop10('revenue'),
        expense: getTop10('expense'),
        profit: getTop10('profit'),
    };
}

/**
 * 从核算报表中提取门店列表（用于更新 STORES）
 * @param reportData 后端核算报表响应
 * @param statsData 门店统计响应（可选，用于补充地理信息）
 * @returns 门店列表
 */
export function extractStoresFromReport(
    reportData: ProfitReportResponse,
    statsData?: StoreStatisticsResponse
): Store[] {
    const stores: Store[] = [];

    /**
     * 生成战区ID的辅助函数
     * 直接使用战区原始名称作为ID，避免任何映射冲突
     * @param warZoneName 战区名称
     * @returns 战区ID（即战区名称本身）
     */
    const generateRegionId = (warZoneName: string): string => {
        // 直接返回战区名称作为ID，确保唯一性
        return warZoneName;
    };

    // 1. 建立战区映射 (StoreId -> RegionId)
    const storeRegionMap = new Map<string, string>();
    if (reportData?.data) {
        reportData.data.forEach((warZone) => {
            const regionId = generateRegionId(warZone.warZone);
            warZone.stores.forEach((store) => {
                storeRegionMap.set(String(store.storeId), regionId);
            });
        });
    }

    // 2. 建立已处理门店集合，防止重复
    const processedStoreIds = new Set<string>();

    // 3. 优先遍历统计数据（物理门店全集）
    // 只保留在报表中有战区归属的门店（即属于第一战区到第六战区的门店）
    if (statsData?.data && statsData.data.length > 0) {
        statsData.data.forEach((stat) => {
            const storeIdStr = String(stat.storeId);
            const regionId = storeRegionMap.get(storeIdStr);

            // 只添加有战区归属的门店（即属于六个战区的门店）
            if (regionId) {
                stores.push({
                    id: storeIdStr,
                    name: stat.storeName,
                    regionId,
                    address: stat.address || '',
                    lat: parseFloat(stat.lat) || 0,
                    lng: parseFloat(stat.lng) || 0,
                    // 保存统计接口返回的数据
                    headcount: stat.employeeCount || 0,      // 编制人数
                    managedArea: stat.totalArea || 0,        // 在管面积
                    buildingCount: stat.buildingCount || 0,  // 楼栋数量
                });
                processedStoreIds.add(storeIdStr);
            }
        });
    }

    // 4. 补充仅在报表中出现但未在统计接口中出现的门店（如果有）
    if (reportData?.data) {
        reportData.data.forEach((warZone) => {
            const regionId = generateRegionId(warZone.warZone);
            warZone.stores.forEach((store) => {
                const storeIdStr = String(store.storeId);
                if (!processedStoreIds.has(storeIdStr)) {
                    stores.push({
                        id: storeIdStr,
                        name: store.storeName,
                        regionId,
                        address: '', // 报表中无地址
                        lat: 0,
                        lng: 0,
                    });
                    processedStoreIds.add(storeIdStr);
                }
            });
        });
    }

    return stores;
}

// ===================== 导出 =====================

export default {
    adaptStoreStatistics,
    adaptSubjectsToDetails,
    adaptWarZoneToRegionSummary,
    adaptStoreReportToSummary,
    adaptProfitReportToDashboard,
    extractRankingsFromReport,
    extractStoresFromReport,
    mergeNewSubjectsFromReport,
    setDynamicSubjectsList,
    WAR_ZONE_TO_REGION_ID,
    SUBJECT_NAME_TO_ID,
    ALLOWED_WAR_ZONES,
};
