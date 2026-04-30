/**
 * 性能优化工具函数
 * 用于大数据处理的时间切片和性能监控
 */

import { onCLS, onINP, onLCP, onFCP, onTTFB, type Metric } from 'web-vitals';

/**
 * 将大数据处理任务切片，避免阻塞主线程
 * @param items 要处理的数据数组
 * @param processor 处理函数
 * @param chunkSize 每批处理的数量（默认100）
 * @param delay 批次间的延迟（毫秒，默认0）
 * @returns 处理后的结果数组
 */
export async function processInChunks<T, R>(
  items: T[],
  processor: (item: T) => R,
  chunkSize: number = 100,
  delay: number = 0
): Promise<R[]> {
  const results: R[] = [];

  for (let i = 0; i < items.length; i += chunkSize) {
    const chunk = items.slice(i, i + chunkSize);

    // 处理当前批次
    const chunkResults = chunk.map(processor);
    results.push(...chunkResults);

    // 如果不是最后一批，给主线程喘息的机会
    if (i + chunkSize < items.length && delay > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }

    // 使用 requestIdleCallback 如果有的话（浏览器环境）
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window && delay > 0) {
      await new Promise(resolve => {
        window.requestIdleCallback(() => resolve(undefined), { timeout: 100 });
      });
    }
  }

  return results;
}

/**
 * 使用 requestAnimationFrame 分批渲染
 * @param items 要渲染的数据
 * @param renderFn 渲染函数
 * @param batchSize 每批渲染数量
 */
export async function renderInBatches<T>(
  items: T[],
  renderFn: (batch: T[]) => void,
  batchSize: number = 50
): Promise<void> {
  return new Promise((resolve) => {
    let index = 0;

    function renderBatch() {
      const batch = items.slice(index, index + batchSize);
      if (batch.length === 0) {
        resolve();
        return;
      }

      renderFn(batch);
      index += batchSize;

      if (index < items.length) {
        requestAnimationFrame(renderBatch);
      } else {
        resolve();
      }
    }

    requestAnimationFrame(renderBatch);
  });
}

/**
 * 使用 requestIdleCallback 延迟执行低优先级任务
 * @param callback 要执行的函数
 * @param timeout 超时时间（毫秒）
 */
export function scheduleIdleWork<T>(callback: () => T, timeout: number = 2000): Promise<T> {
  return new Promise((resolve, reject) => {
    const execute = () => {
      try {
        resolve(callback());
      } catch (error) {
        reject(error);
      }
    };

    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      window.requestIdleCallback(execute, { timeout });
    } else {
      // 降级使用 setTimeout
      setTimeout(execute, 1);
    }
  });
}

/**
 * 防抖函数
 * @param fn 要防抖的函数
 * @param delay 延迟时间（毫秒）
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout> | null = null;

  return function (this: unknown, ...args: Parameters<T>) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}

/**
 * 节流函数
 * @param fn 要节流的函数
 * @param limit 限制时间（毫秒）
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;

  return function (this: unknown, ...args: Parameters<T>) {
    if (!inThrottle) {
      fn.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * 性能测量装饰器
 * @param label 测量标签
 */
export function measurePerformance(label: string) {
  return function (target: unknown, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (this: unknown, ...args: unknown[]) {
      const start = performance.now();
      console.log(`[Performance] ${label} - 开始`);

      try {
        const result = await originalMethod.apply(this, args);
        const duration = performance.now() - start;
        console.log(`[Performance] ${label} - 完成: ${duration.toFixed(2)}ms`);
        return result;
      } catch (error) {
        const duration = performance.now() - start;
        console.log(`[Performance] ${label} - 失败: ${duration.toFixed(2)}ms`);
        throw error;
      }
    };

    return descriptor;
  };
}

/**
 * 创建记忆化函数
 * @param fn 要记忆化的函数
 * @param getKey 生成缓存键的函数
 */
export function memoize<T extends (...args: unknown[]) => unknown>(
  fn: T,
  getKey?: (...args: Parameters<T>) => string
): T {
  const cache = new Map<string, ReturnType<T>>();

  return function (this: unknown, ...args: Parameters<T>): ReturnType<T> {
    const key = getKey ? getKey(...args) : JSON.stringify(args);

    if (cache.has(key)) {
      return cache.get(key) as ReturnType<T>;
    }

    const result = fn.apply(this, args) as ReturnType<T>;
    cache.set(key, result);
    return result;
  } as T;
}

// ==================== Web Vitals 性能监控 ====================

interface WebVitalsConfig {
  /** 是否打印日志 */
  debug?: boolean;
  /** 指标上报回调 */
  onReport?: (metric: Metric) => void;
}

/**
 * 初始化 Web Vitals 性能监控
 * @param config 配置选项
 */
export function initWebVitals(config: WebVitalsConfig = {}): () => void {
  const { debug = false, onReport } = config;

  const handleMetric = (metric: Metric) => {
    if (debug) {
      console.log(`[Web Vitals] ${metric.name}:`, {
        value: metric.value,
        rating: metric.rating,
        delta: metric.delta,
        entries: metric.entries,
      });
    }

    // 上报到分析服务
    if (onReport) {
      onReport(metric);
    }

    // 发送到 Google Analytics 或其他分析工具
    if (typeof window !== 'undefined' && 'gtag' in window) {
      (window as unknown as Record<string, unknown>).gtag?.('event', metric.name, {
        value: Math.round(metric.value),
        metric_rating: metric.rating,
        metric_delta: metric.delta,
      });
    }
  };

  // 注册所有 Core Web Vitals 指标
  onCLS(handleMetric);
  onINP(handleMetric);
  onLCP(handleMetric);
  onFCP(handleMetric);
  onTTFB(handleMetric);

  // 返回清理函数
  return () => {
    // web-vitals 没有提供取消监听的 API
    // 这里只是占位，实际不需要清理
  };
}

/**
 * 获取性能指标评级
 * @param name 指标名称
 * @param value 指标值
 */
export function getMetricRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  const thresholds: Record<string, [number, number]> = {
    CLS: [0.1, 0.25],      // Cumulative Layout Shift
    INP: [200, 500],       // Interaction to Next Paint
    LCP: [2500, 4000],     // Largest Contentful Paint
    FCP: [1800, 3000],     // First Contentful Paint
    TTFB: [800, 1800],     // Time to First Byte
  };

  const [good, poor] = thresholds[name] || [0, 0];

  if (value <= good) return 'good';
  if (value <= poor) return 'needs-improvement';
  return 'poor';
}

/**
 * 测量组件渲染性能
 * @param componentName 组件名称
 */
export function measureComponentRender(componentName: string) {
  return {
    start: () => {
      if (typeof performance !== 'undefined') {
        performance.mark(`${componentName}-start`);
      }
    },
    end: () => {
      if (typeof performance !== 'undefined') {
        performance.mark(`${componentName}-end`);
        performance.measure(
          `${componentName}-render`,
          `${componentName}-start`,
          `${componentName}-end`
        );
        const entries = performance.getEntriesByName(`${componentName}-render`);
        const lastEntry = entries[entries.length - 1];
        console.log(`[Component Render] ${componentName}: ${lastEntry?.duration.toFixed(2)}ms`);
      }
    },
  };
}

/**
 * 创建 AbortController 包装器，支持自动清理
 * @param cleanupCallbacks 清理回调数组
 */
export function createAbortableRequest(cleanupCallbacks: (() => void)[] = []) {
  const controller = new AbortController();

  const cleanup = () => {
    controller.abort();
    cleanupCallbacks.forEach(cb => cb());
  };

  return {
    signal: controller.signal,
    abort: () => controller.abort(),
    cleanup,
  };
}

export default {
  processInChunks,
  renderInBatches,
  scheduleIdleWork,
  debounce,
  throttle,
  measurePerformance,
  memoize,
  initWebVitals,
  getMetricRating,
  measureComponentRender,
  createAbortableRequest,
};
