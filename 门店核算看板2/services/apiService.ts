/**
 * API 服务层
 * 封装与后端接口的通信，包括加密参数生成和请求处理
 */

// ===================== 配置常量 =====================

/** API 基础地址 - 使用 Vite 代理，设为空字符串 */
const API_BASE_URL = '';


/** 企业 ID（固定值） */
const COMPANY_ID = 6;

// ===================== 加密函数 =====================

/**
 * 生成 reportDisplayKey 加密参数
 * 格式：Base64 编码的 "2026ReportDisplayKey|时间戳"
 * @returns 加密后的 key 字符串
 */
export function generateReportDisplayKey(): string {
    const timestamp = Date.now();
    const dataToEncode = `2026ReportDisplayKey|${timestamp}`;
    // 使用 btoa + unescape + encodeURIComponent 进行 Base64 编码
    // 参考：后端接口/code.html 中的 generateFlag 函数
    const encoded = btoa(unescape(encodeURIComponent(dataToEncode)));
    console.log('[generateReportDisplayKey] 加密参数:', encoded);
    return encoded;
}


// ===================== 类型定义 =====================

/** 门店统计接口请求参数 */
export interface StoreStatisticsRequest {
    storeIds?: number[];
    storeName?: string;
    reportDisplayKey: string;
    companyId?: number; // 新增：疑似需要指定 CompanyId 才能获取全量数据
}

/** 门店统计接口响应 - 单个门店 */
export interface StoreStatisticsItem {
    storeId: number;
    storeName: string;
    employeeCount: number;
    buildingCount: number;
    apartmentArea: number;
    shopArea: number;
    totalArea: number;
    address: string;
    lng: string;
    lat: string;
}

/** 门店统计接口响应 */
export interface StoreStatisticsResponse {
    code: string;
    message: string;
    data: StoreStatisticsItem[];
    count: number;
}

/** 门店核算报表接口请求参数 */
export interface ProfitReportRequest {
    storeId?: string;           // 门店ID，多个以逗号分隔
    storeName?: string;         // 门店名称，多个以逗号分隔
    warZone?: string;
    statisticsMouth?: string;   // 格式：yyyy-MM
    reportDisplayKey: string;
    companyId: number;
}

/** 科目明细 */
export interface SubjectItem {
    subjectId: number | null;
    subjectName: string;
    incomeAmount: number;
    expendAmount: number;
    netAmount: number;
}

/** 门店数据 */
export interface StoreReportItem {
    storeId: number;
    storeName: string;
    firstSubjects: SubjectItem[];
}

/** 战区数据 */
export interface WarZoneReportItem {
    warZone: string;
    stores: StoreReportItem[];
}

/** 门店核算报表接口响应 */
export interface ProfitReportResponse {
    code: string;
    message: string;
    data: WarZoneReportItem[];
    count: number;
}

// ===================== API 请求函数 =====================

/**
 * 通用请求封装
 * @param endpoint API 路径
 * @param body 请求体
 * @returns 响应数据
 */
async function request<T>(endpoint: string, body: object, options?: RequestInit): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
        ...options, // 合并自定义选项
    });

    if (!response.ok) {
        throw new Error(`API 请求失败: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();

    // 检查业务状态码
    if (result.code !== '200') {
        throw new Error(`API 业务错误: ${result.message}`);
    }

    return result;
}

/**
 * 获取门店统计信息
 * 包括员工总数、楼栋总数、面积、地理位置等
 * @param storeIds 门店 ID 列表（可选，不传则获取全部门店）
 * @param storeName 门店名称（可选）
 */
export async function fetchStoreStatistics(
    storeIds?: number[],
    storeName?: string
): Promise<StoreStatisticsResponse> {
    const params: StoreStatisticsRequest = {
        reportDisplayKey: generateReportDisplayKey(),
        companyId: COMPANY_ID, // 显式传递公司ID，用于获取全量门店数据
    };

    // 仅当指定了门店ID时才添加过滤条件
    if (storeIds && storeIds.length > 0) {
        params.storeIds = storeIds;
    }
    if (storeName) {
        params.storeName = storeName;
    }

    console.log('[fetchStoreStatistics] 请求参数:', JSON.stringify(params));

    const response = await request<StoreStatisticsResponse>('/api/store/getStatisticsStore', params);

    console.log('[fetchStoreStatistics] 响应数据:', {
        code: response.code,
        message: response.message,
        storeCount: response.data?.length || 0
    });

    return response;
}

/**
 * 允许展示的战区白名单（第一战区到第六战区）
 */
const ALLOWED_WAR_ZONES = [
    '第一战区',
    '第二战区',
    '第三战区',
    '第四战区',
    '第五战区',
    '第六战区',
];

/**
 * 筛选报表数据，只保留白名单中的战区及其门店
 * @param response 原始报表响应
 * @returns 筛选后的报表响应
 */
function filterReportByAllowedWarZones(response: ProfitReportResponse): ProfitReportResponse {
    if (!response.data || !Array.isArray(response.data)) {
        return response;
    }

    const filteredData = response.data.filter(warZone =>
        ALLOWED_WAR_ZONES.includes(warZone.warZone)
    );

    console.log('[filterReportByAllowedWarZones] 战区筛选:', {
        原始战区数: response.data.length,
        筛选后战区数: filteredData.length,
        保留战区: filteredData.map(wz => wz.warZone)
    });

    return {
        ...response,
        data: filteredData,
        count: filteredData.length,
    };
}

/**
 * 清洗报表数据，过滤掉 subjectName 为空的科目
 * @param response 原始报表响应
 * @returns 清洗后的报表响应
 */
function cleanReportData(response: ProfitReportResponse): ProfitReportResponse {
    if (!response.data || !Array.isArray(response.data)) {
        return response;
    }

    let emptySubjectCount = 0;

    const cleanedData = response.data.map(warZone => {
        const cleanedStores = warZone.stores?.map(store => {
            const originalCount = store.firstSubjects?.length || 0;
            const cleanedSubjects = store.firstSubjects?.filter(subject => {
                const hasName = subject.subjectName && subject.subjectName.trim() !== '';
                if (!hasName) {
                    emptySubjectCount++;
                }
                return hasName;
            }) || [];

            if (originalCount !== cleanedSubjects.length) {
                console.log(`[cleanReportData] 门店 ${store.storeName} 过滤空科目: ${originalCount} -> ${cleanedSubjects.length}`);
            }

            return {
                ...store,
                firstSubjects: cleanedSubjects,
            };
        }) || [];

        return {
            ...warZone,
            stores: cleanedStores,
        };
    });

    if (emptySubjectCount > 0) {
        console.log(`[cleanReportData] 共过滤 ${emptySubjectCount} 个空名称科目`);
    }

    return {
        ...response,
        data: cleanedData,
    };
}

/**
 * 获取门店核算报表
 * 包括各战区、门店的财务数据（收入、支出、利润明细）
 * @param options 查询参数
 */
export async function fetchProfitReport(options: {
    storeIds?: number[];
    storeNames?: string[];
    warZone?: string;
    month?: string;  // 格式：yyyy-MM
}): Promise<ProfitReportResponse> {
    const params: ProfitReportRequest = {
        reportDisplayKey: generateReportDisplayKey(),
        companyId: COMPANY_ID,
    };

    // 门店 ID 列表转为逗号分隔字符串
    if (options.storeIds && options.storeIds.length > 0) {
        params.storeId = options.storeIds.join(',');
    }

    // 门店名称列表转为逗号分隔字符串（同时传入 storeId 和 storeName）
    if (options.storeNames && options.storeNames.length > 0) {
        params.storeName = options.storeNames.join(',');
    }

    // 战区筛选
    if (options.warZone) {
        params.warZone = options.warZone;
    }

    // 月份筛选
    if (options.month) {
        params.statisticsMouth = options.month;
    }

    console.log('[fetchProfitReport] 请求参数:', JSON.stringify(params));

    const response = await request<ProfitReportResponse>('/web/api/v3/profits/report/display', params);

    // 清洗数据：过滤掉 subjectName 为空的科目
    const cleanedResponse = cleanReportData(response);

    // 对返回数据进行战区筛选，只保留第一战区到第六战区
    return filterReportByAllowedWarZones(cleanedResponse);
}

// ===================== 导出 =====================

export default {
    generateReportDisplayKey,
    fetchStoreStatistics,
    fetchProfitReport,
};
