/**
 * 百度地图容器组件（传统版）
 * 使用百度地图 JavaScript API v3.0 展示门店分布
 * 【优化】使用 requestAnimationFrame 分批渲染标记点，避免阻塞主线程
 * 【新增】支持主题联动，亮色/暗色主题自动切换地图样式
 * 【优化】门店标点外边框根据主题自动调整：亮色模式深色边框，暗色模式白色边框
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { MapPin } from 'lucide-react';
import { getBMap, isBMapLoaded, REGION_COLORS, createInfoWindowContent } from '../services/bmapService';
import { STORES, REGIONS } from '../services/mockData';
import { renderInBatches } from '../utils/performance';
import { useTheme } from '../contexts/ThemeContext';

// 深圳市中心坐标（百度坐标系 BD-09）
const SHENZHEN_CENTER = { lng: 114.064552, lat: 22.548457 };

// 暗色主题样式
const darkStyleJson = [
    { featureType: 'land', elementType: 'geometry', stylers: { visibility: 'on', color: '#091220ff' } },
    { featureType: 'water', elementType: 'geometry', stylers: { visibility: 'on', color: '#113549ff' } },
    { featureType: 'green', elementType: 'geometry', stylers: { visibility: 'on', color: '#0e1b30ff' } },
    { featureType: 'building', elementType: 'geometry.fill', stylers: { color: '#1a2a3aff' } },
    { featureType: 'building', elementType: 'geometry.stroke', stylers: { color: '#0f1f2fff' } },
    { featureType: 'manmade', elementType: 'geometry', stylers: { color: '#0e1b30ff' } },
    { featureType: 'highway', elementType: 'geometry.fill', stylers: { color: '#3d4f5fff' } },
    { featureType: 'highway', elementType: 'geometry.stroke', stylers: { color: '#2a3a4aff' } },
    { featureType: 'highway', elementType: 'labels.text.fill', stylers: { color: '#8faabbff' } },
    { featureType: 'highway', elementType: 'labels.text.stroke', stylers: { color: '#091220ff' } },
    { featureType: 'arterial', elementType: 'geometry.fill', stylers: { color: '#2a3a4aff' } },
    { featureType: 'arterial', elementType: 'geometry.stroke', stylers: { color: '#1a2a3aff' } },
    { featureType: 'arterial', elementType: 'labels.text.fill', stylers: { color: '#7a9aaaff' } },
    { featureType: 'arterial', elementType: 'labels.text.stroke', stylers: { color: '#091220ff' } },
    { featureType: 'local', elementType: 'geometry.fill', stylers: { color: '#1a2a3aff' } },
    { featureType: 'local', elementType: 'geometry.stroke', stylers: { color: '#0f1f2fff' } },
    { featureType: 'local', elementType: 'labels.text.fill', stylers: { color: '#6a8a9aff' } },
    { featureType: 'local', elementType: 'labels.text.stroke', stylers: { color: '#091220ff' } },
    { featureType: 'railway', elementType: 'geometry.fill', stylers: { color: '#1a3a4aff' } },
    { featureType: 'subway', elementType: 'geometry.fill', stylers: { color: '#2a4a5aff' } },
    { featureType: 'subway', elementType: 'labels.text.fill', stylers: { color: '#7aaabbff' } },
    { featureType: 'subway', elementType: 'labels.text.stroke', stylers: { color: '#091220ff' } },
    { featureType: 'road', elementType: 'geometry.fill', stylers: { color: '#1a2a3aff' } },
    { featureType: 'city', elementType: 'labels.text.fill', stylers: { color: '#8faabbff' } },
    { featureType: 'city', elementType: 'labels.text.stroke', stylers: { color: '#091220ff' } },
    { featureType: 'town', elementType: 'labels.text.fill', stylers: { color: '#7a9aaaff' } },
    { featureType: 'town', elementType: 'labels.text.stroke', stylers: { color: '#091220ff' } },
    { featureType: 'district', elementType: 'labels.text.fill', stylers: { color: '#6a8a9aff' } },
    { featureType: 'district', elementType: 'labels.text.stroke', stylers: { color: '#091220ff' } },
    { featureType: 'poilabel', elementType: 'labels.text.fill', stylers: { color: '#5a8a9aff' } },
    { featureType: 'poilabel', elementType: 'labels.text.stroke', stylers: { color: '#091220ff' } },
    { featureType: 'poilabel', elementType: 'labels.icon', stylers: { visibility: 'off' } },
    { featureType: 'scenicspots', elementType: 'labels.icon', stylers: { visibility: 'off' } },
    { featureType: 'scenicspots', elementType: 'labels.text.fill', stylers: { color: '#4a9a8aff' } },
    { featureType: 'scenicspots', elementType: 'labels.text.stroke', stylers: { color: '#091220ff' } },
    { featureType: 'education', elementType: 'labels.icon', stylers: { visibility: 'off' } },
    { featureType: 'education', elementType: 'labels.text.fill', stylers: { color: '#5a8aaaff' } },
    { featureType: 'education', elementType: 'labels.text.stroke', stylers: { color: '#091220ff' } },
    { featureType: 'medical', elementType: 'labels.icon', stylers: { visibility: 'off' } },
    { featureType: 'medical', elementType: 'labels.text.fill', stylers: { color: '#7a8a9aff' } },
    { featureType: 'medical', elementType: 'labels.text.stroke', stylers: { color: '#091220ff' } },
    { featureType: 'shopping', elementType: 'labels.icon', stylers: { visibility: 'off' } },
    { featureType: 'shopping', elementType: 'labels.text.fill', stylers: { color: '#6a8a9aff' } },
    { featureType: 'shopping', elementType: 'labels.text.stroke', stylers: { color: '#091220ff' } },
    { featureType: 'entertainment', elementType: 'labels.icon', stylers: { visibility: 'off' } },
    { featureType: 'entertainment', elementType: 'labels.text.fill', stylers: { color: '#6a8a9aff' } },
    { featureType: 'entertainment', elementType: 'labels.text.stroke', stylers: { color: '#091220ff' } },
    { featureType: 'transportation', elementType: 'labels.icon', stylers: { visibility: 'off' } },
    { featureType: 'transportation', elementType: 'labels.text.fill', stylers: { color: '#5a9aaaff' } },
    { featureType: 'transportation', elementType: 'labels.text.stroke', stylers: { color: '#091220ff' } },
    { featureType: 'subwaystation', elementType: 'labels.icon', stylers: { visibility: 'off' } },
    { featureType: 'subwaystation', elementType: 'labels.text.fill', stylers: { color: '#6aaabbff' } },
    { featureType: 'subwaystation', elementType: 'labels.text.stroke', stylers: { color: '#091220ff' } },
    { featureType: 'estate', elementType: 'labels.icon', stylers: { visibility: 'off' } },
    { featureType: 'estate', elementType: 'labels.text.fill', stylers: { color: '#5a8a9aff' } },
    { featureType: 'estate', elementType: 'labels.text.stroke', stylers: { color: '#091220ff' } },
    { featureType: 'businesstower', elementType: 'labels.icon', stylers: { visibility: 'off' } },
    { featureType: 'businesstower', elementType: 'labels.text.fill', stylers: { color: '#5a8a9aff' } },
    { featureType: 'businesstower', elementType: 'labels.text.stroke', stylers: { color: '#091220ff' } },
    { featureType: 'company', elementType: 'labels.icon', stylers: { visibility: 'off' } },
    { featureType: 'company', elementType: 'labels.text.fill', stylers: { color: '#5a8a9aff' } },
    { featureType: 'company', elementType: 'labels.text.stroke', stylers: { color: '#091220ff' } },
    { featureType: 'highway', elementType: 'labels.icon', stylers: { visibility: 'off' } },
    { featureType: 'arterial', elementType: 'labels.icon', stylers: { visibility: 'off' } },
    { featureType: 'local', elementType: 'labels.icon', stylers: { visibility: 'off' } },
    { featureType: 'road', elementType: 'labels.icon', stylers: { visibility: 'off' } },
    { featureType: 'railway', elementType: 'labels.icon', stylers: { visibility: 'off' } },
    { featureType: 'subway', elementType: 'labels.icon', stylers: { visibility: 'off' } },
    { featureType: 'all', elementType: 'labels.icon', stylers: { visibility: 'off' } },
];

// 亮色主题样式（使用百度地图默认样式）
const lightStyleJson: any[] = [];

interface BMapContainerProps {
    onClickStore: (storeId: string) => void;
}

const BMapContainer: React.FC<BMapContainerProps> = ({ onClickStore }) => {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const [mapLoaded, setMapLoaded] = useState(false);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [markersLoaded, setMarkersLoaded] = useState(false);
    const mapRef = useRef<any>(null);
    const markersRef = useRef<any[]>([]);
    const { isDark } = useTheme();

    const createMarker = useCallback((store: typeof STORES[0], BMap: any, map: any, isDarkMode: boolean) => {
        const { lng, lat } = store;
        if (!lng || !lat) {
            return null;
        }

        const regionColor = REGION_COLORS[store.regionId] || '#3B82F6';
        const regionName = REGIONS.find((r) => r.id === store.regionId)?.name || '未知战区';
        const point = new BMap.Point(lng, lat);

        // 亮色模式使用柔和的深色边框，暗色模式无边框
        const strokeColor = isDarkMode ? 'none' : 'rgba(30, 41, 59, 0.4)';
        const strokeWidth = isDarkMode ? '0' : '2';

        const icon = new BMap.Icon(
            `data:image/svg+xml,${encodeURIComponent(`
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                <defs>
                  <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>
                <circle cx="12" cy="12" r="7.5" fill="${regionColor}" stroke="${strokeColor}" stroke-width="${strokeWidth}" filter="url(#glow)"/>
              </svg>
            `)}`,
            new BMap.Size(24, 24),
            { anchor: new BMap.Size(12, 12) }
        );

        const marker = new BMap.Marker(point, { icon });

        let currentInfoWindow: any = null;

        marker.addEventListener('mouseover', () => {
            if (currentInfoWindow) {
                map.closeInfoWindow();
            }
            const infoWindow = new BMap.InfoWindow(createInfoWindowContent(store.name, regionName, isDarkMode), {
                width: 0,
                height: 0,
                enableMessage: false,
                offset: new BMap.Size(0, -12)
            });
            currentInfoWindow = infoWindow;
            map.openInfoWindow(infoWindow, point);
        });

        marker.addEventListener('mouseout', () => {
            if (currentInfoWindow) {
                map.closeInfoWindow();
                currentInfoWindow = null;
            }
        });

        marker.addEventListener('click', () => {
            onClickStore(store.id);
        });

        return { marker, point };
    }, [onClickStore, isDark]);

    // 主题切换时更新地图样式和标记点
    useEffect(() => {
        if (mapRef.current) {
            // 更新地图样式
            const styleJson = isDark ? darkStyleJson : lightStyleJson;
            mapRef.current.setMapStyleV2({ styleJson });

            // 更新所有标记点的图标
            const BMap = getBMap();
            if (BMap) {
                const validStores = STORES.filter(store => store.lng && store.lat);
                markersRef.current.forEach((marker, index) => {
                    const store = validStores[index];
                    if (store) {
                        const regionColor = REGION_COLORS[store.regionId] || '#3B82F6';
                        // 亮色模式使用柔和的深色边框，暗色模式无边框
                        const strokeColor = isDark ? 'none' : 'rgba(30, 41, 59, 0.4)';
                        const strokeWidth = isDark ? '0' : '2';

                        const icon = new BMap.Icon(
                            `data:image/svg+xml,${encodeURIComponent(`
                              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                                <defs>
                                  <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                                    <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
                                    <feMerge>
                                      <feMergeNode in="coloredBlur"/>
                                      <feMergeNode in="SourceGraphic"/>
                                    </feMerge>
                                  </filter>
                                </defs>
                                <circle cx="12" cy="12" r="7.5" fill="${regionColor}" stroke="${strokeColor}" stroke-width="${strokeWidth}" filter="url(#glow)"/>
                              </svg>
                            `)}`,
                            new BMap.Size(24, 24),
                            { anchor: new BMap.Size(12, 12) }
                        );
                        marker.setIcon(icon);
                    }
                });
            }
        }
    }, [isDark]);

    useEffect(() => {
        let isMounted = true;

        const initMap = async (): Promise<boolean> => {
            try {
                if (!isBMapLoaded()) {
                    console.log('[百度地图] API 未就绪，等待加载...');
                    return false;
                }

                const BMap = getBMap();
                if (!BMap || !mapContainerRef.current) {
                    console.error('[百度地图] 初始化失败');
                    if (isMounted) {
                        setLoadError('地图初始化失败');
                    }
                    return false;
                }

                const map = new BMap.Map(mapContainerRef.current);
                mapRef.current = map;

                const centerPoint = new BMap.Point(SHENZHEN_CENTER.lng, SHENZHEN_CENTER.lat);
                map.centerAndZoom(centerPoint, 11);

                map.enableScrollWheelZoom(true);

                // 根据当前主题设置地图样式
                const styleJson = isDark ? darkStyleJson : lightStyleJson;
                map.setMapStyleV2({ styleJson });

                const allPoints: any[] = [];
                markersRef.current = [];

                const validStores = STORES.filter(store => store.lng && store.lat);

                await renderInBatches(
                    validStores,
                    (batch) => {
                        batch.forEach((store) => {
                            const result = createMarker(store, BMap, map, isDark);
                            if (result) {
                                const { marker, point } = result;
                                map.addOverlay(marker);
                                markersRef.current.push(marker);
                                allPoints.push(point);
                            }
                        });
                    },
                    5
                );

                if (allPoints.length > 0) {
                    map.setViewport(allPoints);
                }

                if (isMounted) {
                    setMapLoaded(true);
                    setMarkersLoaded(true);
                    console.log('[百度地图] 地图渲染完成，标记点数量:', markersRef.current.length);
                }
                return true;

            } catch (error) {
                console.error('[百度地图] 初始化失败:', error);
                if (isMounted) {
                    setLoadError('地图加载失败，请刷新重试');
                }
                return false;
            }
        };

        const tryInit = () => {
            if (mapLoaded) return;

            if (initMap()) {
                return;
            }

            let retryCount = 0;
            const maxRetries = 50;

            const pollInterval = setInterval(() => {
                retryCount++;
                console.log(`[百度地图] 等待 API 加载... (${retryCount}/${maxRetries})`);

                if (initMap()) {
                    clearInterval(pollInterval);
                    return;
                }

                if (retryCount >= maxRetries) {
                    clearInterval(pollInterval);
                    if (isMounted && !mapLoaded) {
                        setLoadError('地图 API 加载超时，请刷新页面');
                    }
                }
            }, 200);

            const handleReady = () => {
                if (isMounted && !mapLoaded) {
                    setTimeout(() => initMap(), 100);
                }
            };
            window.addEventListener('BMapReady', handleReady);

            return () => {
                clearInterval(pollInterval);
                window.removeEventListener('BMapReady', handleReady);
            };
        };

        const timer = setTimeout(tryInit, 100);

        return () => {
            isMounted = false;
            clearTimeout(timer);
            if (mapRef.current) {
                mapRef.current = null;
            }
        };
    }, [onClickStore, createMarker, isDark]);

    return (
        <div className={`hidden md:block rounded-2xl overflow-hidden shadow-lg relative h-[450px] ${
            isDark 
                ? 'bg-slate-900/40 border border-white/5 backdrop-blur-sm' 
                : 'bg-white border border-slate-200'
        }`}>
            {/* 标题栏 */}
            <div className={`absolute top-4 left-4 z-10 p-2 rounded-lg backdrop-blur-md ${
                isDark 
                    ? 'bg-slate-900/50' 
                    : 'bg-white/90 border border-slate-200'
            }`}>
                <h3 className={`font-bold text-lg flex items-center ${isDark ? 'text-white' : 'text-slate-800'}`}>
                    <MapPin size={20} className={`${isDark ? 'text-cyan-400' : 'text-blue-500'} mr-2`} />
                    门店分布地图
                </h3>
                <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>深圳市全域分布</p>
            </div>

            {/* 地图容器 */}
            <div ref={mapContainerRef} className="w-full h-full" />

            {/* 加载状态 */}
            {!mapLoaded && !loadError && (
                <div className={`absolute inset-0 flex items-center justify-center ${isDark ? 'bg-slate-900/80' : 'bg-slate-50/80'}`}>
                    <div className="text-center">
                        <div className={`animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 mx-auto mb-4 ${isDark ? 'border-cyan-400' : 'border-blue-500'}`}></div>
                        <p className={`text-sm font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>地图加载中...</p>
                    </div>
                </div>
            )}

            {/* 错误状态 */}
            {loadError && (
                <div className={`absolute inset-0 flex items-center justify-center ${isDark ? 'bg-slate-900/80' : 'bg-slate-50/80'}`}>
                    <p className={`text-sm ${isDark ? 'text-red-400' : 'text-red-500'}`}>{loadError}</p>
                </div>
            )}

            {/* 战区图例 */}
            <div className={`absolute bottom-4 right-4 p-3 rounded-lg text-xs shadow-lg backdrop-blur-md ${
                isDark 
                    ? 'bg-slate-950/80 border border-white/10' 
                    : 'bg-white/90 border border-slate-200'
            }`}>
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
                            <span className={`font-bold ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{r.name}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default BMapContainer;
