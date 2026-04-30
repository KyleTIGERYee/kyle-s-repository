/**
 * 数据缓存服务
 * 实现内存缓存层，支持 stale-while-revalidate 策略
 * 用于优化频繁的数据请求，减少接口调用次数
 * 
 * 【P0优化】新增原始报表数据缓存，使多页面可复用同一次接口请求的数据
 */

import { DashboardData, StoreFinancialSummary } from '../types';
import type { ProfitReportResponse } from './apiService';

// ===================== 缓存配置 =====================

/** 缓存有效期（毫秒）- 5分钟 */
const CACHE_TTL = 5 * 60 * 1000;

/** 最大缓存条目数 */
const MAX_CACHE_SIZE = 50;

// ===================== 缓存类型定义 =====================

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  month: string;
}

interface DashboardCacheKey {
  type: 'dashboard';
  month: string;
}

interface StoreCacheKey {
  type: 'store';
  storeId: string;
  month: string;
}

type CacheKey = DashboardCacheKey | StoreCacheKey;

// ===================== 缓存存储 =====================

/** Dashboard 数据缓存 */
const dashboardCache = new Map<string, CacheEntry<DashboardData>>();

/** 门店数据缓存 */
const storeCache = new Map<string, CacheEntry<StoreFinancialSummary>>();

/** 【P0优化】原始报表数据缓存 —— 缓存 API 返回的原始数据，供多个页面复用 */
const reportCache = new Map<string, CacheEntry<ProfitReportResponse>>();

/** 正在进行的请求（用于去重） */
const pendingRequests = new Map<string, Promise<unknown>>();

// ===================== 缓存键生成 =====================

function generateCacheKey(key: CacheKey): string {
  if (key.type === 'dashboard') {
    return `dashboard:${key.month}`;
  }
  return `store:${key.storeId}:${key.month}`;
}

// ===================== 缓存管理 =====================

/**
 * 检查缓存是否有效
 */
function isCacheValid<T>(entry: CacheEntry<T> | undefined): boolean {
  if (!entry) return false;
  return Date.now() - entry.timestamp < CACHE_TTL;
}

/**
 * 清理过期缓存
 */
function cleanupExpiredCache(): void {
  const now = Date.now();

  // 清理 Dashboard 缓存
  for (const [key, entry] of dashboardCache.entries()) {
    if (now - entry.timestamp > CACHE_TTL) {
      dashboardCache.delete(key);
    }
  }

  // 清理门店缓存
  for (const [key, entry] of storeCache.entries()) {
    if (now - entry.timestamp > CACHE_TTL) {
      storeCache.delete(key);
    }
  }

  // 清理原始报表缓存
  for (const [key, entry] of reportCache.entries()) {
    if (now - entry.timestamp > CACHE_TTL) {
      reportCache.delete(key);
    }
  }
}

/**
 * 限制缓存大小（LRU 策略）
 */
function limitCacheSize(): void {
  if (dashboardCache.size > MAX_CACHE_SIZE) {
    const entries = Array.from(dashboardCache.entries());
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
    const toDelete = entries.slice(0, entries.length - MAX_CACHE_SIZE);
    toDelete.forEach(([key]) => dashboardCache.delete(key));
  }

  if (storeCache.size > MAX_CACHE_SIZE) {
    const entries = Array.from(storeCache.entries());
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
    const toDelete = entries.slice(0, entries.length - MAX_CACHE_SIZE);
    toDelete.forEach(([key]) => storeCache.delete(key));
  }

  // 原始报表缓存限制为 30 条（每条体积较大）
  const REPORT_MAX = 30;
  if (reportCache.size > REPORT_MAX) {
    const entries = Array.from(reportCache.entries());
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
    const toDelete = entries.slice(0, entries.length - REPORT_MAX);
    toDelete.forEach(([key]) => reportCache.delete(key));
  }
}

// ===================== 缓存操作 API =====================

/**
 * 获取 Dashboard 缓存
 */
export function getDashboardCache(month: string): DashboardData | undefined {
  const key = generateCacheKey({ type: 'dashboard', month });
  const entry = dashboardCache.get(key);

  if (isCacheValid(entry)) {
    console.log('[DataCache] Dashboard 缓存命中:', month);
    return entry.data;
  }

  if (entry) {
    console.log('[DataCache] Dashboard 缓存过期:', month);
    dashboardCache.delete(key);
  }

  return undefined;
}

/**
 * 设置 Dashboard 缓存
 */
export function setDashboardCache(month: string, data: DashboardData): void {
  const key = generateCacheKey({ type: 'dashboard', month });

  dashboardCache.set(key, {
    data,
    timestamp: Date.now(),
    month,
  });

  limitCacheSize();
  console.log('[DataCache] Dashboard 缓存已设置:', month);
}

/**
 * 获取门店数据缓存
 */
export function getStoreCache(storeId: string, month: string): StoreFinancialSummary | undefined {
  const key = generateCacheKey({ type: 'store', storeId, month });
  const entry = storeCache.get(key);

  if (isCacheValid(entry)) {
    console.log('[DataCache] 门店缓存命中:', storeId, month);
    return entry.data;
  }

  if (entry) {
    console.log('[DataCache] 门店缓存过期:', storeId, month);
    storeCache.delete(key);
  }

  return undefined;
}

/**
 * 设置门店数据缓存
 */
export function setStoreCache(storeId: string, month: string, data: StoreFinancialSummary): void {
  const key = generateCacheKey({ type: 'store', storeId, month });

  storeCache.set(key, {
    data,
    timestamp: Date.now(),
    month,
  });

  limitCacheSize();
  console.log('[DataCache] 门店缓存已设置:', storeId, month);
}

// ===================== 原始报表缓存操作 API =====================

/**
 * 【P0优化】获取原始报表数据缓存
 * 用于避免多个页面对同一月份的重复 API 调用
 * @param month 月份 (YYYY-MM)
 * @param scope 请求范围：'all' 全量 | 'store:ID' 单店（全量缓存可用于单店提取）
 */
export function getReportCache(month: string, scope: string = 'all'): ProfitReportResponse | undefined {
  // 优先查找精确 scope 的缓存
  const exactKey = `report:${scope}:${month}`;
  const exactEntry = reportCache.get(exactKey);
  if (isCacheValid(exactEntry)) {
    console.log('[DataCache] 原始报表缓存命中 (精确):', scope, month);
    return exactEntry.data;
  }

  // 如果请求的是单店数据，尝试从全量缓存中提取
  if (scope !== 'all') {
    const allKey = `report:all:${month}`;
    const allEntry = reportCache.get(allKey);
    if (isCacheValid(allEntry)) {
      console.log('[DataCache] 原始报表缓存命中 (从全量提取):', scope, month);
      return allEntry.data;
    }
  }

  return undefined;
}

/**
 * 【P0优化】设置原始报表数据缓存
 * @param month 月份 (YYYY-MM)
 * @param data 原始报表响应数据
 * @param scope 请求范围标识
 */
export function setReportCache(month: string, data: ProfitReportResponse, scope: string = 'all'): void {
  const key = `report:${scope}:${month}`;
  reportCache.set(key, {
    data,
    timestamp: Date.now(),
    month,
  });
  limitCacheSize();
  console.log('[DataCache] 原始报表缓存已设置:', scope, month);
}

/**
 * 获取或创建请求（防止重复请求）
 */
export async function getOrCreateRequest<T>(
  key: string,
  requestFn: () => Promise<T>
): Promise<T> {
  // 检查是否有正在进行的相同请求
  const pending = pendingRequests.get(key);
  if (pending) {
    console.log('[DataCache] 复用进行中的请求:', key);
    return pending as Promise<T>;
  }

  // 创建新请求
  const requestPromise = requestFn().finally(() => {
    pendingRequests.delete(key);
  });

  pendingRequests.set(key, requestPromise);
  return requestPromise;
}

/**
 * 清除所有缓存
 */
export function clearAllCache(): void {
  dashboardCache.clear();
  storeCache.clear();
  reportCache.clear();
  pendingRequests.clear();
  console.log('[DataCache] 所有缓存已清除');
}

/**
 * 清除指定月份的所有缓存
 */
export function clearMonthCache(month: string): void {
  const dashboardKey = generateCacheKey({ type: 'dashboard', month });
  dashboardCache.delete(dashboardKey);

  // 清除该月份的所有门店缓存
  for (const key of storeCache.keys()) {
    if (key.endsWith(`:${month}`)) {
      storeCache.delete(key);
    }
  }

  // 清除该月份的原始报表缓存
  for (const key of reportCache.keys()) {
    if (key.endsWith(`:${month}`)) {
      reportCache.delete(key);
    }
  }

  console.log('[DataCache] 月份缓存已清除:', month);
}

/**
 * 获取缓存统计信息
 */
export function getCacheStats(): {
  dashboardCacheSize: number;
  storeCacheSize: number;
  reportCacheSize: number;
  pendingRequestsCount: number;
} {
  return {
    dashboardCacheSize: dashboardCache.size,
    storeCacheSize: storeCache.size,
    reportCacheSize: reportCache.size,
    pendingRequestsCount: pendingRequests.size,
  };
}

// 定期清理过期缓存（每5分钟）
setInterval(cleanupExpiredCache, CACHE_TTL);

export default {
  getDashboardCache,
  setDashboardCache,
  getStoreCache,
  setStoreCache,
  getReportCache,
  setReportCache,
  getOrCreateRequest,
  clearAllCache,
  clearMonthCache,
  getCacheStats,
};
