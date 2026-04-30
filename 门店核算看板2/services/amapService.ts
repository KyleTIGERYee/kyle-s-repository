/**
 * 高德地图服务模块
 * 封装高德地图 JS API 2.0 的加载和使用
 */

// 高德地图 API 配置
const AMAP_KEY = '73b3abafaec8eec580f8905facfa71e8';
const AMAP_VERSION = '2.0';

// 全局 AMap 对象引用
let AMapInstance: any = null;
// 地图加载 Promise，避免重复加载
let loadPromise: Promise<any> | null = null;

/**
 * 动态加载高德地图 JS API 脚本
 * @returns Promise<AMap> - 高德地图 AMap 对象
 */
export const loadAMapScript = (): Promise<any> => {
    // 如果已经加载完成，直接返回
    if (AMapInstance) {
        return Promise.resolve(AMapInstance);
    }

    // 如果正在加载中，返回现有的 Promise
    if (loadPromise) {
        return loadPromise;
    }

    // 创建加载 Promise
    loadPromise = new Promise((resolve, reject) => {
        // 检查是否已经存在 AMap
        if ((window as any).AMap) {
            AMapInstance = (window as any).AMap;
            resolve(AMapInstance);
            return;
        }

        // 创建 script 标签
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = `https://webapi.amap.com/maps?v=${AMAP_VERSION}&key=${AMAP_KEY}&plugin=AMap.Geocoder`;
        script.async = true;

        script.onload = () => {
            AMapInstance = (window as any).AMap;
            if (AMapInstance) {
                console.log('[高德地图] JS API 加载成功');
                resolve(AMapInstance);
            } else {
                reject(new Error('[高德地图] AMap 对象未找到'));
            }
        };

        script.onerror = (error) => {
            console.error('[高德地图] JS API 加载失败:', error);
            loadPromise = null;
            reject(error);
        };

        // 添加到 head
        document.head.appendChild(script);
    });

    return loadPromise;
};

/**
 * 获取 AMap 实例
 * @returns AMap 实例或 null
 */
export const getAMap = (): any => {
    return AMapInstance || (window as any).AMap;
};

/**
 * 地理编码：将地址转换为经纬度
 * @param address - 地址字符串
 * @param city - 城市（可选，提高准确度）
 * @returns Promise<{lng: number, lat: number} | null>
 */
export const geocodeAddress = async (
    address: string,
    city: string = '深圳'
): Promise<{ lng: number; lat: number } | null> => {
    const AMap = await loadAMapScript();

    return new Promise((resolve) => {
        const geocoder = new AMap.Geocoder({
            city: city,
        });

        geocoder.getLocation(address, (status: string, result: any) => {
            if (status === 'complete' && result.geocodes && result.geocodes.length > 0) {
                const location = result.geocodes[0].location;
                console.log(`[地理编码] ${address} => ${location.lng}, ${location.lat}`);
                resolve({
                    lng: location.lng,
                    lat: location.lat,
                });
            } else {
                console.warn(`[地理编码] 地址解析失败: ${address}`, result);
                resolve(null);
            }
        });
    });
};

/**
 * 批量地理编码
 * @param addresses - 地址数组
 * @param delayMs - 每次请求间隔（毫秒），避免触发频率限制
 * @returns Promise<Array<{address: string, lng: number, lat: number} | null>>
 */
export const batchGeocodeAddresses = async (
    addresses: string[],
    delayMs: number = 200
): Promise<Array<{ address: string; lng: number; lat: number } | null>> => {
    const results: Array<{ address: string; lng: number; lat: number } | null> = [];

    for (const address of addresses) {
        const result = await geocodeAddress(address);
        if (result) {
            results.push({ address, ...result });
        } else {
            results.push(null);
        }
        // 添加延迟避免频率限制
        await new Promise((r) => setTimeout(r, delayMs));
    }

    return results;
};

// 战区颜色配置（与现有代码保持一致）
export const REGION_COLORS: Record<string, string> = {
    'R1': '#22D3EE', // 青色 - 第一战区
    'R2': '#818CF8', // 紫色 - 第二战区
    'R3': '#F472B6', // 粉色 - 第三战区
    'R4': '#34D399', // 绿色 - 第四战区
    'R5': '#A78BFA', // 浅紫 - 第五战区
    'R6': '#FB923C', // 橙色 - 第六战区
};

/**
 * 创建自定义标记点图标
 * @param color - 标记点颜色
 * @returns 标记点内容 HTML
 */
export const createMarkerContent = (color: string): string => {
    return `
    <div style="
      width: 24px;
      height: 24px;
      background: ${color};
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3), 0 0 12px ${color}80;
      cursor: pointer;
      transition: transform 0.2s ease;
    " onmouseover="this.style.transform='scale(1.3)'" onmouseout="this.style.transform='scale(1)'"></div>
  `;
};

/**
 * 创建信息窗口内容
 * @param storeName - 门店名称
 * @param regionName - 战区名称
 * @returns 信息窗口 HTML
 */
export const createInfoWindowContent = (storeName: string, regionName: string): string => {
    return `
    <div style="
      padding: 12px 16px;
      background: rgba(15, 23, 42, 0.95);
      border: 1px solid rgba(255,255,255,0.2);
      border-radius: 8px;
      backdrop-filter: blur(10px);
      min-width: 120px;
    ">
      <p style="font-weight: bold; color: white; font-size: 14px; margin: 0 0 4px 0;">${storeName}</p>
      <p style="color: #22D3EE; font-size: 12px; margin: 0;">${regionName}</p>
    </div>
  `;
};
