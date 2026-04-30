/**
 * 高德地图容器组件
 * 使用高德地图 JS API 2.0 展示门店分布
 */

import React, { useEffect, useRef, useState } from 'react';
import { MapPin } from 'lucide-react';
import { loadAMapScript, REGION_COLORS, createMarkerContent, createInfoWindowContent } from '../services/amapService';
import { STORES, REGIONS } from '../services/mockData';

// 深圳市中心坐标
const SHENZHEN_CENTER: [number, number] = [114.05, 22.55];

// 门店真实经纬度数据（通过高德地理编码 API 获取并缓存）
// 使用 GCJ-02 坐标系（高德专用）
const STORE_COORDINATES: Record<string, { lng: number; lat: number }> = {
    // 第一战区
    'S101': { lng: 113.939847, lat: 22.697719 }, // 石岩应人石店
    'S102': { lng: 113.942831, lat: 22.703841 }, // 石岩罗租中新店
    'S103': { lng: 114.044167, lat: 22.615283 }, // 民治红山店
    'S104': { lng: 113.917292, lat: 22.771306 }, // 凤凰长圳店
    'S105': { lng: 114.001389, lat: 22.672778 }, // 大浪元芬店
    'S106': { lng: 113.940556, lat: 22.701389 }, // 石岩罗租社区店
    'S107': { lng: 113.943611, lat: 22.705556 }, // 石岩罗租上新店
    'S108': { lng: 114.058056, lat: 22.654167 }, // 龙华弓村清湖店
    'S109': { lng: 114.048889, lat: 22.598611 }, // 民治白石龙店

    // 第二战区
    'S201': { lng: 113.846944, lat: 22.677222 }, // 福海塘尾西店
    'S202': { lng: 113.850278, lat: 22.677778 }, // 福海塘尾东店
    'S203': { lng: 113.852778, lat: 22.665556 }, // 福海新和店
    'S204': { lng: 113.844722, lat: 22.690278 }, // 福海和平店
    'S205': { lng: 113.832778, lat: 22.720556 }, // 沙井后亭店
    'S206': { lng: 113.845833, lat: 22.669444 }, // 福海桥头店
    'S207': { lng: 113.855556, lat: 22.808333 }, // 松岗东方店
    'S208': { lng: 113.858889, lat: 22.658611 }, // 机场北店

    // 第三战区
    'S301': { lng: 113.856389, lat: 22.636111 }, // 福永旗舰店
    'S302': { lng: 113.858611, lat: 22.640556 }, // 福永村店
    'S303': { lng: 113.867778, lat: 22.735556 }, // 新桥洪田店
    'S304': { lng: 113.861389, lat: 22.623611 }, // 机场东店
    'S305': { lng: 113.854722, lat: 22.633889 }, // 福永怀德店
    'S306': { lng: 113.857778, lat: 22.637222 }, // 福永马山小区店
    'S307': { lng: 113.859444, lat: 22.629167 }, // 福永福围西街店
    'S308': { lng: 113.859722, lat: 22.628889 }, // 福永福围广生店
    'S309': { lng: 113.862222, lat: 22.621389 }, // 福永兴围店

    // 第四战区
    'S401': { lng: 113.887778, lat: 22.578889 }, // 西乡麻布店
    'S402': { lng: 113.881944, lat: 22.593611 }, // 航城鹤洲东店
    'S403': { lng: 113.880833, lat: 22.591111 }, // 航城鹤洲南店
    'S404': { lng: 113.897222, lat: 22.567778 }, // 西乡流塘店
    'S405': { lng: 113.894167, lat: 22.571667 }, // 西乡永丰店
    'S406': { lng: 113.910833, lat: 22.556111 }, // 新安翻身店
    'S407': { lng: 113.878333, lat: 22.598333 }, // 航城宝罗店

    // 第五战区
    'S501': { lng: 114.068056, lat: 22.530556 }, // 上沙塘晏店
    'S502': { lng: 114.071111, lat: 22.527778 }, // 上沙沙嘴店
    'S503': { lng: 114.076389, lat: 22.531667 }, // 石厦新洲店
    'S504': { lng: 114.090556, lat: 22.541389 }, // 华强北店
    'S505': { lng: 114.079722, lat: 22.545833 }, // 地勘大院店
    'S506': { lng: 114.067222, lat: 22.533056 }, // 上沙龙秋店
    'S507': { lng: 114.070833, lat: 22.557222 }, // 莲花景田店
    'S508': { lng: 114.072778, lat: 22.570556 }, // 梅林店

    // 第六战区
    'S601': { lng: 114.135556, lat: 22.537778 }, // 黄贝岭店
    'S602': { lng: 114.077222, lat: 22.633333 }, // 坂田岗头店
    'S603': { lng: 114.121944, lat: 22.549167 }, // 笋岗店
    'S604': { lng: 114.333889, lat: 22.636111 }, // 坪山大万新村店
    'S605': { lng: 114.227778, lat: 22.564722 }, // 精茂花园店
    'S606': { lng: 114.079444, lat: 22.631111 }, // 坂田马蹄山店
    'S607': { lng: 114.130556, lat: 22.586389 }, // 布吉大芬店
    'S608': { lng: 114.158611, lat: 22.545556 }, // 莲塘仙湖店
};

interface AMapContainerProps {
    onClickStore: (storeId: string) => void;
}

const AMapContainer: React.FC<AMapContainerProps> = ({ onClickStore }) => {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const [mapLoaded, setMapLoaded] = useState(false);
    const [loadError, setLoadError] = useState<string | null>(null);
    const mapRef = useRef<any>(null);

    useEffect(() => {
        let isMounted = true;

        const initMap = async () => {
            try {
                // 加载高德地图 JS API
                const AMap = await loadAMapScript();

                if (!isMounted || !mapContainerRef.current) return;

                // 创建地图实例
                const map = new AMap.Map(mapContainerRef.current, {
                    zoom: 11, // 缩放级别
                    center: SHENZHEN_CENTER, // 中心点：深圳
                    mapStyle: 'amap://styles/dark', // 深色主题
                    viewMode: '2D', // 2D 模式
                    resizeEnable: true, // 自适应容器大小
                });

                mapRef.current = map;

                // 创建信息窗口（复用一个）
                const infoWindow = new AMap.InfoWindow({
                    isCustom: true, // 使用自定义内容
                    autoMove: true,
                    offset: new AMap.Pixel(0, -30),
                });

                // 添加门店标记点
                STORES.forEach((store) => {
                    const coords = STORE_COORDINATES[store.id];
                    if (!coords) {
                        console.warn(`[地图] 门店 ${store.name} 缺少坐标数据`);
                        return;
                    }

                    const regionColor = REGION_COLORS[store.regionId] || '#22D3EE';
                    const regionName = REGIONS.find((r) => r.id === store.regionId)?.name || '未知战区';

                    // 创建标记点
                    const marker = new AMap.Marker({
                        position: new AMap.LngLat(coords.lng, coords.lat),
                        content: createMarkerContent(regionColor),
                        offset: new AMap.Pixel(-12, -12), // 偏移使中心对准坐标
                        extData: { storeId: store.id, storeName: store.name, regionName },
                    });

                    // 鼠标悬停显示信息窗口
                    marker.on('mouseover', () => {
                        infoWindow.setContent(createInfoWindowContent(store.name, regionName));
                        infoWindow.open(map, marker.getPosition());
                    });

                    marker.on('mouseout', () => {
                        infoWindow.close();
                    });

                    // 点击跳转门店详情
                    marker.on('click', () => {
                        onClickStore(store.id);
                    });

                    map.add(marker);
                });

                // 地图加载完成
                map.on('complete', () => {
                    if (isMounted) {
                        setMapLoaded(true);
                        console.log('[高德地图] 地图渲染完成');
                    }
                });

            } catch (error) {
                console.error('[高德地图] 初始化失败:', error);
                if (isMounted) {
                    setLoadError('地图加载失败，请刷新重试');
                }
            }
        };

        initMap();

        // 清理函数
        return () => {
            isMounted = false;
            if (mapRef.current) {
                mapRef.current.destroy();
                mapRef.current = null;
            }
        };
    }, [onClickStore]);

    return (
        <div className="bg-slate-900/40 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-sm shadow-lg relative h-[450px]">
            {/* 标题栏 */}
            <div className="absolute top-4 left-4 z-10 bg-slate-900/50 p-2 rounded-lg backdrop-blur-md">
                <h3 className="text-white font-bold text-lg flex items-center">
                    <MapPin size={20} className="text-cyan-400 mr-2" />
                    门店分布地图
                </h3>
                <p className="text-slate-400 text-xs mt-1">深圳市全域分布</p>
            </div>

            {/* 地图容器 */}
            <div ref={mapContainerRef} className="w-full h-full" />

            {/* 加载状态 */}
            {!mapLoaded && !loadError && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400 mx-auto mb-4"></div>
                        <p className="text-slate-400 text-sm font-mono">地图加载中...</p>
                    </div>
                </div>
            )}

            {/* 错误状态 */}
            {loadError && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80">
                    <p className="text-red-400 text-sm">{loadError}</p>
                </div>
            )}

            {/* 战区图例 */}
            <div className="absolute bottom-4 right-4 bg-slate-950/80 p-3 rounded-lg border border-white/10 text-xs shadow-lg backdrop-blur-md">
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                    {REGIONS.map((r) => (
                        <div key={r.id} className="flex items-center space-x-1.5">
                            <span
                                className="w-2.5 h-2.5 rounded-full shadow-[0_0_5px_currentColor]"
                                style={{
                                    backgroundColor: REGION_COLORS[r.id],
                                    color: REGION_COLORS[r.id],
                                }}
                            ></span>
                            <span className="text-slate-300 font-bold">{r.name}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AMapContainer;
