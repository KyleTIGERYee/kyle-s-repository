import { Region, Store, Subject, SubjectType, MonthlyFinancials, RegionFinancialSummary, DashboardData, RankItem, StoreFinancialSummary } from '../types';

// 导入 API 服务和数据适配器
import { fetchStoreStatistics, fetchProfitReport, ProfitReportResponse } from './apiService';
import {
  adaptProfitReportToDashboard,
  extractRankingsFromReport,
  adaptStoreReportToSummary,
  extractStoresFromReport,
  adaptSubjectsToDetails,
  adaptSubjectsToDetailsDynamic,
  extractSubjectsFromReport,
  updateSubjectNameToIdMapping,
  mergeNewSubjectsFromReport,
  setDynamicSubjectsList,
  getOffsetMonth,
  ALLOWED_WAR_ZONES,
} from './dataAdapter';

// 【优化】导入缓存服务
import {
  getDashboardCache,
  setDashboardCache,
  getStoreCache,
  setStoreCache,
  getReportCache,
  setReportCache,
  getOrCreateRequest,
} from './dataCache';


// ===================== 系统动态资源缓存 =====================

/** 动态缓存的门店列表 */
let cachedStores: Store[] = [];
/** 动态缓存的战区列表 */
let cachedRegions: Region[] = [];
/** 动态缓存的科目列表（从接口数据中提取） */
let cachedSubjects: Subject[] = [];
/** 动态缓存的科目名称到ID映射 */
let cachedSubjectNameToId: Record<string, string> = {};
/** 是否已经初始化过资源 */
let isResourcesInitialized = false;

/**
 * 初始化系统资源（门店和战区信息）
 * 优先从后端接口获取，数据流程：
 * 1. 调用门店统计接口获取门店基础信息（地址、经纬度、员工数等）
 * 2. 调用核算报表接口获取门店战区归属
 * 3. 两者合并构建完整门店列表
 * @param month 用于初始化参考的月份
 * @param force 是否强制重新初始化
 */
export async function ensureResourcesInitialized(month: string, force: boolean = false) {
  if (!force && isResourcesInitialized && cachedStores.length > 0) {
    console.log('[Resources] 资源已初始化，跳过。门店数量:', cachedStores.length);
    return;
  }

  try {
    console.log('[Resources] ====== 开始初始化系统资源 ======');
    console.log('[Resources] 参数:', { month, force });

    // 【优化】并行调用接口，消除请求瀑布
    // 两个接口独立，可以并行执行，减少初始化时间约40-50%
    console.log('[Resources] 并行请求：门店统计信息 + 报表数据...');
    const [statsResponse, reportResponse] = await Promise.all([
      fetchStoreStatistics().catch(err => {
        console.error('[Resources] 获取门店统计信息失败:', err);
        return { data: [], code: '200', message: 'fallback', count: 0 };
      }),
      fetchProfitReport({ month }).catch(err => {
        console.warn('[Resources] 获取报表失败或无数据 (可能是当月无报表):', err);
        return { data: [], code: '200', message: 'fallback', count: 0 };
      })
    ]);

    // 详细日志调试
    console.log('[Resources] === 接口响应详情 ===');
    console.log('[Resources] 统计接口:', {
      code: statsResponse.code,
      message: statsResponse.message,
      storeCount: statsResponse.data?.length || 0
    });

    // 打印统计接口返回的门店列表
    if (statsResponse.data && statsResponse.data.length > 0) {
      console.log('[Resources] 统计接口门店列表:');
      statsResponse.data.forEach((store: any, index: number) => {
        console.log(`  [${index + 1}] ID=${store.storeId}, 名称="${store.storeName}"`);
      });
    } else {
      console.warn('[Resources] ⚠️ 统计接口返回门店列表为空！');
    }

    console.log('[Resources] 报表接口:', {
      code: reportResponse.code,
      message: reportResponse.message,
      warZoneCount: reportResponse.data?.length || 0,
      // 计算报表中的门店总数
      totalStoresInReport: (reportResponse.data as any[])?.reduce((acc: number, wz: any) => acc + (wz.stores?.length || 0), 0) || 0
    });

    // 打印报表接口返回的战区和门店
    if (reportResponse.data && reportResponse.data.length > 0) {
      console.log('[Resources] 报表接口门店分布:');
      reportResponse.data.forEach((wz: any) => {
        console.log(`  战区 "${wz.warZone}": ${wz.stores?.length || 0} 个门店`);
      });
    }

    // 提取门店并关联经纬度 (以统计信息为主，报表为辅)
    cachedStores = extractStoresFromReport(reportResponse as any, statsResponse as any);

    console.log('[Resources] 合并后门店数量:', cachedStores.length);

    // 提取去重后的战区
    const regionMap = new Map<string, string>();

    /**
     * 战区名称到 Region ID 的映射辅助函数
     * 直接使用战区原始名称作为ID，避免任何映射冲突
     */
    const generateRegionId = (warZoneName: string): string => {
      // 直接返回战区名称作为ID，确保唯一性
      return warZoneName;
    };

    // 1. 从报表中提取战区名
    // 注意：报表数据已在 apiService.ts 中被筛选，只包含第一战区到第六战区
    if (reportResponse && reportResponse.data) {
      reportResponse.data.forEach(warZone => {
        const regionId = generateRegionId(warZone.warZone);
        regionMap.set(regionId, warZone.warZone);
      });
    }

    // 2. 扫描所有门店，确保其 regionId 在 regionMap 中存在
    // 注意：门店数据已从筛选后的报表中提取，只包含六个战区的门店
    cachedStores.forEach(store => {
      if (!regionMap.has(store.regionId)) {
        // 为未分配战区添加映射
        regionMap.set(store.regionId, store.regionId);
      }
    });

    // 注意：不再创建"未分配战区"，只展示第一战区到第六战区的数据
    // 如果报表接口没有返回数据，则显示空状态

    // 战区排序：按照第一战区到第六战区的固定顺序
    const warZoneOrder = ['第一战区', '第二战区', '第三战区', '第四战区', '第五战区', '第六战区'];
    cachedRegions = Array.from(regionMap.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => {
        const indexA = warZoneOrder.indexOf(a.id);
        const indexB = warZoneOrder.indexOf(b.id);
        return indexA - indexB;
      });

    // Step 3：从报表数据中动态提取科目列表
    console.log('[Resources] Step 3：动态提取科目列表...');
    if (reportResponse && reportResponse.data && reportResponse.data.length > 0) {
      const { subjects, nameToIdMapping } = extractSubjectsFromReport(reportResponse as ProfitReportResponse);
      cachedSubjects = subjects;
      cachedSubjectNameToId = nameToIdMapping;
      // 更新全局的科目映射表
      updateSubjectNameToIdMapping(nameToIdMapping);
      // 同步科目列表引用到 dataAdapter，使增量合并函数能直接操作
      setDynamicSubjectsList(cachedSubjects);
      console.log(`[Resources] 动态科目提取完成: ${cachedSubjects.length}个科目`);
    } else {
      // 报表数据为空时，使用兜底默认科目
      console.warn('[Resources] ⚠️ 报表数据为空，使用默认科目列表');
      cachedSubjects = getDefaultSubjects();
      cachedSubjectNameToId = {};
      cachedSubjects.forEach(s => {
        if (!s.isParent) {
          cachedSubjectNameToId[s.name] = s.id;
        }
      });
      updateSubjectNameToIdMapping(cachedSubjectNameToId);
      // 同步科目列表引用到 dataAdapter
      setDynamicSubjectsList(cachedSubjects);
    }

    isResourcesInitialized = true;
    console.log('[Resources] ====== 初始化完成 ======');
    console.log(`[Resources] 结果: ${cachedRegions.length}个战区, ${cachedStores.length}个门店, ${cachedSubjects.length}个科目`);

    // 最终输出门店列表（前10条）用于确认
    if (cachedStores.length > 0) {
      console.log('[Resources] 最终门店列表 (前10):', cachedStores.slice(0, 10).map(s => `${s.id}:${s.name}`).join(', '));
    }

  } catch (error) {
    console.error('[Resources] 初始化严重失败:', error);
    // 注意：不再创建"未分配战区"作为兜底
    // 如果初始化失败，cachedRegions 保持为空数组
  }
}

/** 导出给外部使用的动态属性（通过 Proxy 确保实时性） */
export const REGIONS: Region[] = new Proxy([] as Region[], {
  get: (target, prop, receiver) => {
    // 直接代理到 cachedRegions，确保所有属性和方法都能正常工作
    const value = (cachedRegions as any)[prop];
    // 如果是函数，绑定到 cachedRegions 执行
    if (typeof value === 'function') {
      return value.bind(cachedRegions);
    }
    return value;
  }
});

export const STORES: Store[] = new Proxy([] as Store[], {
  get: (target, prop, receiver) => {
    // 直接代理到 cachedStores，确保所有属性和方法都能正常工作
    const value = (cachedStores as any)[prop];
    // 如果是函数，绑定到 cachedStores 执行
    if (typeof value === 'function') {
      return value.bind(cachedStores);
    }
    return value;
  }
});

// ===================== 动态科目定义 =====================

/**
 * 获取默认科目列表（兜底用）
 * 当接口数据为空或无法提取科目时使用
 */
function getDefaultSubjects(): Subject[] {
  return [
    // Revenue
    { id: 'total_rev', name: '总收入', type: SubjectType.REVENUE, isParent: true },
    { id: 'rev_1', name: '公寓及商铺收入', type: SubjectType.REVENUE },
    { id: 'rev_2', name: '增值服务收入', type: SubjectType.REVENUE },
    { id: 'rev_3', name: '价外收入', type: SubjectType.REVENUE },
    { id: 'rev_4', name: '换房手续费', type: SubjectType.REVENUE },
    { id: 'rev_5', name: '转租手续费', type: SubjectType.REVENUE },
    { id: 'rev_6', name: '清洁费', type: SubjectType.REVENUE },

    // Expenses
    { id: 'total_exp', name: '总支出', type: SubjectType.EXPENSE, isParent: true },
    { id: 'exp_1', name: '收楼成本', type: SubjectType.EXPENSE },
    { id: 'exp_2', name: '公寓及商铺退款', type: SubjectType.EXPENSE },
    { id: 'exp_3', name: '押金应付款', type: SubjectType.EXPENSE },
    { id: 'exp_4', name: '订金预付账款', type: SubjectType.EXPENSE },
    { id: 'exp_5', name: '一线人工成本', type: SubjectType.EXPENSE },
    { id: 'exp_6', name: '运营期物业管理费', type: SubjectType.EXPENSE },
    { id: 'exp_7', name: '社区文化活动费', type: SubjectType.EXPENSE },
    { id: 'exp_8', name: '客户维护费', type: SubjectType.EXPENSE },
    { id: 'exp_9', name: '安全管理维护费', type: SubjectType.EXPENSE },
    { id: 'exp_10', name: '安保费', type: SubjectType.EXPENSE },
    { id: 'exp_11', name: '保洁费', type: SubjectType.EXPENSE },
    { id: 'exp_12', name: '保险费', type: SubjectType.EXPENSE },
    { id: 'exp_13', name: '公寓维护费', type: SubjectType.EXPENSE },
    { id: 'exp_14', name: '设备设施维护费', type: SubjectType.EXPENSE },
    { id: 'exp_15', name: '消防安全维护费', type: SubjectType.EXPENSE },
    { id: 'exp_16', name: '电梯维护费', type: SubjectType.EXPENSE },
    { id: 'exp_17', name: '空气治理费', type: SubjectType.EXPENSE },
    { id: 'exp_18', name: '水费（缴纳）', type: SubjectType.EXPENSE },
    { id: 'exp_19', name: '电费（缴纳）', type: SubjectType.EXPENSE },
    { id: 'exp_20', name: '网费', type: SubjectType.EXPENSE },
    { id: 'exp_21', name: '日常维修', type: SubjectType.EXPENSE },
    { id: 'exp_22', name: '零星维修', type: SubjectType.EXPENSE },
    { id: 'exp_23', name: '办公费', type: SubjectType.EXPENSE },
    { id: 'exp_24', name: '营销渠道费', type: SubjectType.EXPENSE },
    { id: 'exp_25', name: '营销物料费', type: SubjectType.EXPENSE },
    { id: 'exp_26', name: '营业外支出', type: SubjectType.EXPENSE },
    { id: 'exp_27', name: '优惠券支出', type: SubjectType.EXPENSE },

    // Profit
    { id: 'net_profit', name: '净利润', type: SubjectType.PROFIT, isParent: true },
  ];
}

/**
 * 导出动态科目列表（通过 Proxy 确保实时性）
 * 科目列表在初始化时从后端接口动态提取
 * 如果初始化尚未完成，返回默认科目列表
 */
export const SUBJECTS: Subject[] = new Proxy([] as Subject[], {
  get: (target, prop, receiver) => {
    // 如果 cachedSubjects 为空，使用默认科目
    const subjects = cachedSubjects.length > 0 ? cachedSubjects : getDefaultSubjects();
    const value = (subjects as any)[prop];
    // 如果是函数，绑定到 subjects 执行
    if (typeof value === 'function') {
      return value.bind(subjects);
    }
    return value;
  }
});

// ===================== 核心工具 =====================

/** 获取上一个月的 YYYY-MM 格式 */
export const getPreviousMonth = (): string => {
  const date = new Date();
  date.setMonth(date.getMonth() - 1);
  return date.toISOString().slice(0, 7);
};

// ===================== 核心服务 =====================

/**
 * 抓取全公司仪表盘数据
 * 包含真实增长率计算（并行请求当前月与上月）
 */
export const fetchCompanyDashboard = async (month: string): Promise<DashboardData> => {
  console.log('[fetchCompanyDashboard] 正在抓取真实数据，月份:', month);

  // 确保资源已初始化
  await ensureResourcesInitialized(month);

  // 【优化】检查缓存，优先返回缓存数据
  const cachedData = getDashboardCache(month);
  if (cachedData) {
    console.log('[fetchCompanyDashboard] 返回缓存数据:', month);
    return cachedData;
  }

  // 【优化】使用请求去重，防止并发重复请求
  const cacheKey = `dashboard:${month}`;
  return getOrCreateRequest(cacheKey, async () => {
    const prevMonth = getOffsetMonth(month, -1);

    // 【P0优化】优先从原始报表缓存中获取数据
    let currentResponse: ProfitReportResponse;
    let prevResponse: ProfitReportResponse | null = null;

    const cachedCurrent = getReportCache(month, 'all');
    const cachedPrev = getReportCache(prevMonth, 'all');

    if (cachedCurrent) {
      // 缓存命中，直接使用
      console.log('[fetchCompanyDashboard] 报表缓存命中:', month);
      currentResponse = cachedCurrent;
      prevResponse = cachedPrev || null;

      // 如果上月缓存未命中，单独请求上月数据
      if (!prevResponse) {
        try {
          prevResponse = await fetchProfitReport({ month: prevMonth });
          setReportCache(prevMonth, prevResponse, 'all');
        } catch (e) {
          console.warn('[fetchCompanyDashboard] 获取上月数据失败:', e);
        }
      }
    } else {
      // 【优化】并行请求当前月和上个月数据以计算增长率
      const [currentResult, prevResult] = await Promise.allSettled([
        fetchProfitReport({ month }),
        cachedPrev ? Promise.resolve(cachedPrev) : fetchProfitReport({ month: prevMonth })
      ]);

      currentResponse = currentResult.status === 'fulfilled' ? currentResult.value : { data: [], code: '200', message: 'fallback', count: 0 };
      prevResponse = prevResult.status === 'fulfilled' ? prevResult.value : null;

      if (currentResult.status === 'rejected') {
        console.error('[fetchCompanyDashboard] 获取当前月数据失败:', currentResult.reason);
        throw new Error('获取当前月数据失败');
      }

      // 【P0优化】缓存原始报表数据，供门店详情页和趋势分析页复用
      setReportCache(month, currentResponse, 'all');
      if (prevResponse) {
        setReportCache(prevMonth, prevResponse, 'all');
      }
    }

    // 【关键修复】在适配数据之前，先扫描并增量合并当前月份中新发现的科目
    // 解决跨月份科目不一致导致某些科目（如"保洁费"）无法展示的问题
    mergeNewSubjectsFromReport(currentResponse);
    if (prevResponse) {
      mergeNewSubjectsFromReport(prevResponse);
    }

    const currentData = adaptProfitReportToDashboard(currentResponse, month);
    const rankings = extractRankingsFromReport(currentResponse);

    let profitGrowth = 0;
    let revenueGrowth = 0;
    let expenseGrowth = 0;
    let prevProfit: number | null = null;
    let prevRevenue: number | null = null;
    let prevExpense: number | null = null;

    if (prevResponse) {
      const prevData = adaptProfitReportToDashboard(prevResponse, prevMonth);

      prevProfit = prevData.totalProfit;
      prevRevenue = prevData.totalRevenue;
      prevExpense = prevData.totalExpense;

      const calcGrowth = (curr: number, prev: number) => {
        if (!prev) return 0;
        return parseFloat(((curr - prev) / Math.abs(prev) * 100).toFixed(2));
      };

      profitGrowth = calcGrowth(currentData.totalProfit, prevData.totalProfit);
      revenueGrowth = calcGrowth(currentData.totalRevenue, prevData.totalRevenue);
      expenseGrowth = calcGrowth(currentData.totalExpense, prevData.totalExpense);
    }

    const result: DashboardData = {
      ...currentData,
      profitGrowth,
      revenueGrowth,
      expenseGrowth,
      prevProfit,
      prevRevenue,
      prevExpense,
      rankings
    };

    // 【优化】存入缓存
    setDashboardCache(month, result);

    return result;
  });
};

/**
 * 抓取单店概览
 * 并行获取当月与上月数据，计算真实环比增长率
 */
export const fetchStoreOverview = async (storeId: string, month: string): Promise<StoreFinancialSummary> => {
  console.log('[fetchStoreOverview] 正在抓取单店真实数据，门店:', storeId, '月份:', month);

  // 【优化】检查缓存，优先返回缓存数据
  const cachedData = getStoreCache(storeId, month);
  if (cachedData) {
    console.log('[fetchStoreOverview] 返回缓存数据:', storeId, month);
    return cachedData;
  }

  // 【优化】使用请求去重，防止并发重复请求
  const cacheKey = `store:${storeId}:${month}`;
  return getOrCreateRequest(cacheKey, async () => {
    const numericStoreId = parseInt(storeId, 10);
    const prevMonth = getOffsetMonth(month, -1);

    // 初始化为空数据（默认值）
    let storeBase: Store | undefined;
    let storeReport: any = null;
    let prevStoreReport: any = null;

    try {
      // 1. 优先从缓存获取门店基础信息（已在 ensureResourcesInitialized 时加载）
      const cachedStore = cachedStores.find(s => s.id === storeId);
      if (cachedStore) {
        console.log('[fetchStoreOverview] 从缓存获取门店基础信息:', cachedStore.name, {
          headcount: cachedStore.headcount,
          managedArea: cachedStore.managedArea,
          buildingCount: cachedStore.buildingCount,
          address: cachedStore.address
        });
        // 构造兼容 StoreStatisticsItem 的对象，直接读取 Store 对象的扩展属性
        storeBase = {
          storeId: numericStoreId,
          storeName: cachedStore.name,
          address: cachedStore.address,
          employeeCount: cachedStore.headcount || 0,       // 使用 Store 扩展属性
          totalArea: cachedStore.managedArea || 0,         // 使用 Store 扩展属性
          buildingCount: cachedStore.buildingCount || 0,   // 使用 Store 扩展属性
          apartmentArea: 0,
          shopArea: 0,
          lng: String(cachedStore.lng),
          lat: String(cachedStore.lat)
        } as any;
      } else {
        console.warn(`[fetchStoreOverview] 缓存中未找到门店 ${storeId}，将尝试从报表响应中获取`);
      }

      // 2. 【P0优化】优先从报表缓存中获取财务数据，避免重复网络请求
      const storeName = cachedStore?.name;
      console.log('[fetchStoreOverview] 尝试从报表缓存提取门店数据...');
      const cachedReport = getReportCache(month, `store:${storeId}`);
      const cachedPrevReport = getReportCache(prevMonth, `store:${storeId}`);

      let reportResponse: any = null;
      let prevReportResponse: any = null;

      if (cachedReport) {
        // 缓存命中，直接使用，零网络请求
        console.log('[fetchStoreOverview] 报表缓存命中，跳过网络请求');
        reportResponse = cachedReport;
        prevReportResponse = cachedPrevReport;

        // 如果上月缓存未命中，单独请求
        if (!prevReportResponse) {
          prevReportResponse = await fetchProfitReport({
            storeIds: [numericStoreId],
            storeNames: storeName ? [storeName] : undefined,
            month: prevMonth
          }).catch(e => {
            console.warn(`[fetchStoreOverview] 获取门店 ${storeId} 上月报表失败:`, e);
            return null;
          });
        }
      } else {
        // 缓存未命中，并行请求当前月和上月报表数据
        console.log('[fetchStoreOverview] 缓存未命中，并行请求报表接口...');
        [reportResponse, prevReportResponse] = await Promise.all([
          fetchProfitReport({
            storeIds: [numericStoreId],
            storeNames: storeName ? [storeName] : undefined,
            month
          }).catch(e => {
            console.warn(`[fetchStoreOverview] 获取门店 ${storeId} 当月报表失败:`, e);
            return { data: [] };
          }),
          fetchProfitReport({
            storeIds: [numericStoreId],
            storeNames: storeName ? [storeName] : undefined,
            month: prevMonth
          }).catch(e => {
            console.warn(`[fetchStoreOverview] 获取门店 ${storeId} 上月报表失败:`, e);
            return null;
          })
        ]);
      }

      // 3. 解析当月财务报表数据
      if (reportResponse && reportResponse.data) {
        for (const warZone of reportResponse.data) {
          const found = warZone.stores.find(s => s.storeId === numericStoreId);
          if (found) {
            storeReport = found;
            break;
          }
        }
      }

      // 4. 解析上月财务报表数据
      if (prevReportResponse && prevReportResponse.data) {
        for (const warZone of prevReportResponse.data) {
          const found = warZone.stores.find(s => s.storeId === numericStoreId);
          if (found) {
            prevStoreReport = found;
            break;
          }
        }
      }

      // 【关键修复】在适配数据之前，先增量合并当前门店报表中可能出现的新科目
      if (reportResponse && reportResponse.data) {
        mergeNewSubjectsFromReport(reportResponse as ProfitReportResponse);
      }
      if (prevReportResponse && prevReportResponse.data) {
        mergeNewSubjectsFromReport(prevReportResponse as ProfitReportResponse);
      }

    } catch (err) {
      console.error(`[fetchStoreOverview] 发生意外错误:`, err);
    }

    // 5. 最终兜底检查
    if (!storeReport && !storeBase) {
      // 如果连缓存里都没有，那确实没办法了，只能构造一个"未知门店"对象防止崩溃
      console.error(`[fetchStoreOverview] 严重警告：无法找到门店 ID ${storeId} 的任何信息`);
      return {
        storeId,
        storeName: '未知门店(数据缺失)',
        storeAddress: '',
        headcount: 0,
        managedArea: 0,
        buildingCount: 0,
        date: month,
        revenue: 0,
        expense: 0,
        netProfit: 0,
        details: {}
      };
    }

    // 6. 获取当月和上月的财务汇总数据
    const currentSummary = adaptStoreReportToSummary(
      storeReport || { storeId: numericStoreId, storeName: (storeBase as any)?.storeName || '未知', firstSubjects: [] },
      storeBase as any,
      month
    );

    // 7. 计算环比增长率
    let revenueGrowth: number | undefined;
    let expenseGrowth: number | undefined;
    let profitGrowth: number | undefined;
    let prevRevenue: number | null = null;
    let prevExpense: number | null = null;
    let prevProfit: number | null = null;

    if (prevStoreReport) {
      const prevSummary = adaptStoreReportToSummary(
        prevStoreReport,
        storeBase as any,
        prevMonth
      );

      prevRevenue = prevSummary.revenue;
      prevExpense = prevSummary.expense;
      prevProfit = prevSummary.netProfit;

      // 计算增长率的辅助函数
      const calcGrowth = (curr: number, prev: number): number => {
        if (prev === 0) return curr === 0 ? 0 : 100; // 上月为0，本月不为0则视为100%增长
        return parseFloat(((curr - prev) / Math.abs(prev) * 100).toFixed(2));
      };

      revenueGrowth = calcGrowth(currentSummary.revenue, prevRevenue);
      expenseGrowth = calcGrowth(currentSummary.expense, prevExpense);
      profitGrowth = calcGrowth(currentSummary.netProfit, prevProfit);

      console.log('[fetchStoreOverview] 环比计算完成:', {
        当月: { revenue: currentSummary.revenue, expense: currentSummary.expense, profit: currentSummary.netProfit },
        上月: { revenue: prevRevenue, expense: prevExpense, profit: prevProfit },
        增长率: { revenueGrowth, expenseGrowth, profitGrowth }
      });
    } else {
      console.log('[fetchStoreOverview] 上月数据不存在，跳过环比计算');
    }

    const result: StoreFinancialSummary = {
      ...currentSummary,
      revenueGrowth,
      expenseGrowth,
      profitGrowth,
      prevRevenue,
      prevExpense,
      prevProfit
    };

    // 【优化】存入缓存
    setStoreCache(storeId, month, result);

    return result;
  });
};

/**
 * 抓取趋势数据 (过去12个月真实数据)
 * 支持汇总科目（total_rev、total_exp、net_profit）和子科目
 * 
 * 【P0优化】分批请求 + 报表缓存复用
 */
export const fetchTrendData = async (storeIds: string[], subjectId: string) => {
  console.log('[fetchTrendData] 正在抓取12个月真实趋势数据，科目:', subjectId, '门店:', storeIds);

  // 获取当前参考月份（通常是上个月）
  const referenceMonth = getPreviousMonth();
  const months: string[] = [];
  for (let i = 11; i >= 0; i--) {
    months.push(getOffsetMonth(referenceMonth, -i));
  }

  // 【P0优化】分离已缓存和未缓存的月份
  const cachedResponses = new Map<string, ProfitReportResponse | null>();
  const uncachedMonths: string[] = [];

  months.forEach(m => {
    const scope = storeIds.length > 0 ? `store:${storeIds.join(',')}` : 'all';
    const cached = getReportCache(m, scope);
    if (cached) {
      cachedResponses.set(m, cached);
    } else {
      uncachedMonths.push(m);
    }
  });

  console.log(`[fetchTrendData] 缓存命中 ${cachedResponses.size} 个月，需请求 ${uncachedMonths.length} 个月`);

  // 【P0优化】分批请求未缓存的月份（每批 4 个，降低瞬时并发压力）
  const BATCH_SIZE = 4;
  for (let i = 0; i < uncachedMonths.length; i += BATCH_SIZE) {
    const batch = uncachedMonths.slice(i, i + BATCH_SIZE);
    const batchResults = await Promise.all(
      batch.map(m =>
        fetchProfitReport({
          month: m,
          storeIds: storeIds.length > 0 ? storeIds.map(Number) : undefined
        }).catch((err) => {
          console.warn(`[fetchTrendData] 获取 ${m} 数据失败:`, err);
          return null;
        })
      )
    );

    // 将结果存入缓存和响应集合
    batch.forEach((m, idx) => {
      const result = batchResults[idx];
      cachedResponses.set(m, result);
      if (result) {
        const scope = storeIds.length > 0 ? `store:${storeIds.join(',')}` : 'all';
        setReportCache(m, result, scope);
        // 【关键修复】增量合并每个月份中可能出现的新科目
        mergeNewSubjectsFromReport(result);
      }
    });
  }

  /**
   * 从门店的科目列表中获取指定科目的值
   * @param subjects 后端返回的科目列表
   * @param targetSubjectId 要获取的科目ID
   * @returns 科目数值
   */
  const getSubjectValue = (subjects: any[], targetSubjectId: string): number => {
    const details = adaptSubjectsToDetails(subjects);
    return details[targetSubjectId] || 0;
  };

  return months.map((m) => {
    const res = cachedResponses.get(m) || null;
    const point: any = { month: `${parseInt(m.split('-')[1])}月` };

    if (!res || !res.data || res.data.length === 0) {
      if (storeIds.length === 0) {
        point['company'] = 0;
      } else {
        storeIds.forEach(sid => point[sid] = 0);
      }
      return point;
    }

    if (storeIds.length === 0) {
      // 全公司模式：汇总所有门店该科目的值
      let total = 0;
      res.data.forEach(warZone => {
        warZone.stores.forEach(store => {
          total += getSubjectValue(store.firstSubjects, subjectId);
        });
      });
      point['company'] = total;
    } else {
      // 门店对比模式：获取每个门店该科目的值
      storeIds.forEach(sid => {
        let val = 0;
        const numericSid = parseInt(sid);
        for (const warZone of res.data) {
          const store = warZone.stores.find(s => s.storeId === numericSid);
          if (store) {
            val = getSubjectValue(store.firstSubjects, subjectId);
            break;
          }
        }
        point[sid] = val;
      });
    }
    return point;
  });
};

/** 获取指定战区的门店列表（通过缓存） */
export const getStoresByRegion = (regionId: string) => {
  return cachedStores.filter(s => s.regionId === regionId);
};

/** AI 问数上下文助手 */
export const getAIContextData = async () => {
  const dashboardData = await fetchCompanyDashboard(getPreviousMonth());

  let contextStr = `当前财务数据月份: ${getPreviousMonth()}\n\n`;
  contextStr += `全公司汇总:\n`;
  contextStr += `- 总收入: ${(dashboardData.totalRevenue / 10000).toFixed(2)}万 (环比 ${dashboardData.revenueGrowth}%)\n`;
  contextStr += `- 总支出: ${(dashboardData.totalExpense / 10000).toFixed(2)}万 (环比 ${dashboardData.expenseGrowth}%)\n`;
  contextStr += `- 净利润: ${(dashboardData.totalProfit / 10000).toFixed(2)}万 (环比 ${dashboardData.profitGrowth}%)\n\n`;

  contextStr += `各战区经营概况:\n`;
  dashboardData.matrix.forEach(r => {
    contextStr += `- ${r.regionName}: 净利润 ${(r.data['net_profit'] / 10000).toFixed(2)}万, 收入 ${(r.data['total_rev'] / 10000).toFixed(2)}万\n`;
  });

  return contextStr;
};