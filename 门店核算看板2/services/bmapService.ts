/**
 * 百度地图服务模块（传统版）
 * 封装百度地图 JavaScript API v3.0 的使用
 */

// 百度地图 API 配置
const BMAP_AK = 'xFenM98bx3DYAA9tmdWwcHllYp7x5ono';

// 全局 BMap 对象引用
let BMapInstance: any = null;

/**
 * 获取 BMap 实例
 * 百度地图 API 已在 index.html 中通过 script 标签异步加载
 * @returns BMap 实例
 */
export const getBMap = (): any => {
  if (BMapInstance) {
    return BMapInstance;
  }

  BMapInstance = (window as any).BMap;

  if (!BMapInstance) {
    console.error('[百度地图] BMap 对象未找到，请确保 API 已正确加载');
    return null;
  }

  console.log('[百度地图] JS API 已就绪');
  return BMapInstance;
};

/**
 * 检查百度地图 API 是否已完全加载
 * 需要检查 BMap.Map 构造函数是否存在
 * @returns boolean
 */
export const isBMapLoaded = (): boolean => {
  const BMap = (window as any).BMap;
  return !!(BMap && typeof BMap.Map === 'function');
};

// 战区颜色配置（使用战区名称作为key）
export const REGION_COLORS: Record<string, string> = {
  '第一战区': '#22D3EE', // 青色
  '第二战区': '#818CF8', // 紫色
  '第三战区': '#F472B6', // 粉色
  '第四战区': '#34D399', // 绿色
  '第五战区': '#A78BFA', // 浅紫
  '第六战区': '#FB923C', // 橙色
};

/**
 * 创建信息窗口内容
 * @param storeName - 门店名称
 * @param regionName - 战区名称
 * @param isDark - 是否暗色主题
 * @returns 信息窗口 HTML
 */
export const createInfoWindowContent = (storeName: string, regionName: string, isDark: boolean = true): string => {
  if (isDark) {
    return `
      <div style="
        padding: 10px 14px;
        background: linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.95));
        border: 1px solid rgba(34, 211, 238, 0.3);
        border-radius: 8px;
        min-width: 120px;
        box-shadow: 0 0 20px rgba(34, 211, 238, 0.3), 0 4px 12px rgba(0, 0, 0, 0.4);
        backdrop-filter: blur(8px);
      ">
        <p style="font-weight: 600; color: white; font-size: 13px; margin: 0 0 4px 0; text-shadow: 0 0 8px rgba(255,255,255,0.3);">${storeName}</p>
        <p style="color: #22D3EE; font-size: 11px; margin: 0; text-shadow: 0 0 6px rgba(34, 211, 238, 0.5);">${regionName}</p>
      </div>
    `;
  } else {
    return `
      <div style="
        padding: 10px 14px;
        background: linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.98));
        border: 1px solid rgba(59, 130, 246, 0.2);
        border-radius: 8px;
        min-width: 120px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1), 0 2px 8px rgba(59, 130, 246, 0.1);
        backdrop-filter: blur(8px);
      ">
        <p style="font-weight: 600; color: #1E293B; font-size: 13px; margin: 0 0 4px 0;">${storeName}</p>
        <p style="color: #3B82F6; font-size: 11px; margin: 0;">${regionName}</p>
      </div>
    `;
  }
};
