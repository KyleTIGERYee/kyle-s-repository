import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Plus, TrendingUp, AlertCircle } from 'lucide-react';
import { useBenchmark } from '../App';
import { fetchStoreOverview, SUBJECTS, STORES, REGIONS, getStoresByRegion, getPreviousMonth } from '../services/mockData';
import { Subject, Store } from '../types';
import { useTheme } from '../contexts/ThemeContext';

const Benchmark: React.FC = () => {
  const navigate = useNavigate();
  const { selectedStores, removeStore, addStore } = useBenchmark();
  const { isDark } = useTheme();
  const [storeDataMap, setStoreDataMap] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [activeModalRegion, setActiveModalRegion] = useState<string>('');

  // 初始化 activeModalRegion
  useEffect(() => {
    if (REGIONS.length > 0 && !activeModalRegion) {
      setActiveModalRegion(REGIONS[0]?.id || '');
    }
  }, [activeModalRegion]);

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      try {
        const newMap: Record<string, any> = { ...storeDataMap };
        const promises = selectedStores.map(async (store) => {
          if (!newMap[store.id]) {
            const res = await fetchStoreOverview(store.id, getPreviousMonth());
            newMap[store.id] = res.details;
          }
        });
        await Promise.all(promises);
        setStoreDataMap(newMap);
      } catch (err) {
        console.error("加载对比数据失败:", err);
      } finally {
        setLoading(false);
      }
    };

    if (selectedStores.length > 0) {
      loadAll();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStores.length, selectedStores]);

  const handleTrendClick = (subject: Subject) => {
    const storeIds = selectedStores.map(s => s.id).join(',');
    navigate(`/trend/${subject.id}?stores=${storeIds}&title=${subject.name}`);
  };

  const handleAddStore = (store: Store) => {
    if (selectedStores.length >= 5) {
      alert("最多只能选择5个节点");
      return;
    }
    addStore(store);
    setIsSelectorOpen(false);
  };

  const getUnselectedStores = () => {
    const selectedIds = new Set(selectedStores.map(s => s.id));
    return STORES.filter(s => !selectedIds.has(s.id));
  };

  return (
    <div className={`h-full overflow-y-auto relative z-10 flex flex-col pb-24 md:pb-6 ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`}>
      <header className={`backdrop-blur-md border-b p-5 sticky top-0 z-30 ${isDark ? 'bg-slate-950/80 border-white/5' : 'bg-white/80 border-slate-200'}`}>
        <div className="flex justify-between items-center mb-5">
          <h1 className={`font-bold text-xl tracking-wide ${isDark ? 'text-white' : 'text-slate-800'}`}>对标分析 <span className={`font-normal text-base font-mono ml-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>[{selectedStores.length}/5]</span></h1>
          <button onClick={() => navigate('/')} className={`text-sm font-bold uppercase tracking-wider transition-colors ${isDark ? 'text-cyan-400 hover:text-cyan-300' : 'text-blue-600 hover:text-blue-700'}`}>完成</button>
        </div>

        {/* Store Chips */}
        <div className="flex space-x-3 overflow-x-auto no-scrollbar pb-2">
          {selectedStores.map((store, index) => (
            <div key={store.id} className={`flex-none rounded-lg px-4 py-2 flex items-center space-x-3 shadow-sm ${isDark ? 'bg-slate-900 border border-white/10' : 'bg-white border border-slate-200'}`}>
              <span className={`text-sm font-bold whitespace-nowrap ${index === 0 ? (isDark ? 'text-cyan-400' : 'text-blue-600') : (isDark ? 'text-slate-300' : 'text-slate-600')}`}>
                {index === 0 && <span className={`mr-2 font-normal ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>基准:</span>}
                {store.name}
              </span>
              <button onClick={() => removeStore(store.id)} className={`${isDark ? 'text-slate-600 hover:text-red-400' : 'text-slate-400 hover:text-red-500'}`}>
                <X size={16} />
              </button>
            </div>
          ))}
          {selectedStores.length < 5 && (
            <button
              onClick={() => setIsSelectorOpen(true)}
              className={`flex-none border border-dashed rounded-lg px-4 py-2 flex items-center whitespace-nowrap transition-colors ${
                isDark 
                  ? 'border-slate-700 text-slate-500 hover:border-cyan-500/50 hover:text-cyan-400' 
                  : 'border-slate-300 text-slate-400 hover:border-blue-300 hover:text-blue-600'
              }`}
            >
              <Plus size={16} className="mr-2" /> <span className="text-sm font-medium uppercase">添加门店</span>
            </button>
          )}
        </div>
      </header>

      {selectedStores.length === 0 ? (
        <div className={`flex-1 flex flex-col items-center justify-center p-10 text-center m-5 border border-dashed rounded-2xl ${isDark ? 'border-white/5 bg-slate-900/20 text-slate-500' : 'border-slate-200 bg-slate-50 text-slate-400'}`}>
          <AlertCircle size={64} className={`mb-6 ${isDark ? 'text-slate-700' : 'text-slate-300'}`} />
          <p className="font-mono text-sm mb-6">暂无选定数据点</p>
          <button onClick={() => setIsSelectorOpen(true)} className={`px-8 py-3 text-sm font-bold rounded transition-colors uppercase tracking-widest ${
            isDark 
              ? 'bg-cyan-500/10 border border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/20' 
              : 'bg-blue-50 border border-blue-200 text-blue-600 hover:bg-blue-100'
          }`}>选择门店</button>
        </div>
      ) : (
        <div className={`flex-1 overflow-auto relative ${isDark ? 'bg-slate-950/50' : 'bg-slate-50'}`}>
          <div className="min-w-max">
            <div className={`border-b ${isDark ? 'border-white/5' : 'border-slate-200'}`}>
              <table className="border-collapse text-base w-full">
                <thead className={isDark ? 'bg-slate-900' : 'bg-white'}>
                  <tr>
                    <th className={`sticky left-0 z-20 p-4 text-left text-sm font-bold uppercase tracking-widest w-40 border-b border-r shadow-[4px_0_10px_-5px_black] ${
                      isDark 
                        ? 'bg-slate-900 text-slate-500 border-white/10' 
                        : 'bg-white text-slate-500 border-slate-200'
                    }`}>
                      科目
                    </th>
                    {selectedStores.map(s => (
                      <th key={s.id} className={`p-4 text-right text-sm font-bold w-36 min-w-[140px] border-b uppercase tracking-widest ${
                        isDark 
                          ? 'text-slate-400 border-white/10' 
                          : 'text-slate-600 border-slate-200'
                      }`}>
                        {s.name.length > 6 ? s.name.substring(0, 5) + '..' : s.name}
                      </th>
                    ))}
                    <th className={`w-10 border-b ${isDark ? 'border-white/10' : 'border-slate-200'}`}></th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? 'divide-white/5' : 'divide-slate-100'}`}>
                  {SUBJECTS.map(subject => (
                    <tr key={subject.id} className={`${subject.isParent ? (isDark ? 'bg-white/[0.02]' : 'bg-slate-50') : (isDark ? 'hover:bg-white/[0.02]' : 'hover:bg-slate-50')}`}>
                      <td className={`sticky left-0 z-10 p-3 pl-4 text-sm border-r shadow-[4px_0_10px_-5px_black] ${
                        isDark 
                          ? `border-white/10 ${subject.isParent ? 'bg-slate-900 font-bold text-white' : 'bg-slate-950 text-slate-400'}`
                          : `border-slate-200 ${subject.isParent ? 'bg-white font-bold text-slate-800' : 'bg-slate-50 text-slate-500'}`
                      }`}>
                        <div className="flex items-center justify-between">
                          <span className={`${subject.isParent ? '' : 'truncate max-w-[120px]'}`}>
                            {subject.name}
                          </span>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleTrendClick(subject); }}
                            className={`p-1.5 rounded transition-colors flex-shrink-0 ${
                              isDark 
                                ? 'text-slate-600 hover:text-cyan-400 hover:bg-cyan-500/10' 
                                : 'text-slate-400 hover:text-blue-500 hover:bg-blue-50'
                            }`}
                          >
                            <TrendingUp size={16} />
                          </button>
                        </div>
                      </td>
                      {selectedStores.map(s => {
                        const val = storeDataMap[s.id]?.[subject.id] || 0;
                        const isProfit = subject.id === 'net_profit';
                        let colorClass = isDark ? 'text-slate-500' : 'text-slate-500';
                        if (isProfit) colorClass = val >= 0 
                          ? (isDark ? 'text-red-400 font-bold' : 'text-red-600 font-bold') 
                          : (isDark ? 'text-emerald-400 font-bold' : 'text-emerald-600 font-bold');

                        return (
                          <td key={`${s.id}-${subject.id}`} className={`p-4 text-right text-sm font-mono ${colorClass}`}>
                            {loading ? '-' : (val / 10000).toFixed(1)}
                          </td>
                        );
                      })}
                      <td></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      {isSelectorOpen && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className={`w-full max-w-md md:rounded-2xl flex flex-col h-full md:h-2/3 shadow-2xl ${
            isDark 
              ? 'bg-slate-950/90 backdrop-blur-xl md:border md:border-white/10' 
              : 'bg-white md:border md:border-slate-200'
          }`}>
            <div className={`p-6 border-b flex items-center justify-between shrink-0 ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
              <h2 className={`text-xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-800'}`}>添加对比门店</h2>
              <button onClick={() => setIsSelectorOpen(false)} className={`p-2 rounded-full ${isDark ? 'text-slate-500 hover:text-white' : 'text-slate-400 hover:text-slate-600'}`}>
                <X size={28} />
              </button>
            </div>

            {/* Region Tabs */}
            <div className={`px-5 py-5 border-b ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
              <div className="grid grid-cols-3 gap-3">
                {REGIONS.map(r => {
                  const count = getStoresByRegion(r.id).length;
                  const isActive = activeModalRegion === r.id;
                  return (
                    <button
                      key={r.id}
                      onClick={() => setActiveModalRegion(r.id)}
                      className={`px-4 py-2.5 rounded-lg text-sm font-bold transition-all border ${
                        isActive
                          ? isDark 
                            ? 'bg-cyan-500/10 border-cyan-500/50 text-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.2)]' 
                            : 'bg-blue-50 border-blue-200 text-blue-600'
                          : isDark 
                            ? 'bg-transparent border-white/10 text-slate-500 hover:border-white/30' 
                            : 'bg-transparent border-slate-200 text-slate-500 hover:border-slate-300'
                      }`}
                    >
                      {r.name} <span className="opacity-50 ml-1 font-mono">[{count}]</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className={`flex-1 overflow-y-auto p-6 ${isDark ? 'bg-slate-950/50' : 'bg-slate-50'}`}>
              {getUnselectedStores().filter(s => s.regionId === activeModalRegion).map(store => {
                const regionName = REGIONS.find(r => r.id === store.regionId)?.name;
                return (
                  <button
                    key={store.id}
                    onClick={() => handleAddStore(store)}
                    className={`w-full text-left p-5 mb-3 border rounded-xl flex items-center justify-between transition-all group ${
                      isDark 
                        ? 'bg-slate-900/50 border-white/5 hover:border-cyan-500/50 hover:bg-slate-900' 
                        : 'bg-white border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <div className={`text-base font-bold transition-colors ${isDark ? 'text-slate-300 group-hover:text-cyan-400' : 'text-slate-700 group-hover:text-blue-600'}`}>{store.name}</div>
                      <div className={`text-sm mt-1 font-mono uppercase ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>{regionName}</div>
                    </div>
                    <Plus size={20} className={`${isDark ? 'text-slate-600 group-hover:text-cyan-400' : 'text-slate-400 group-hover:text-blue-500'}`} />
                  </button>
                )
              })}

              {getStoresByRegion(activeModalRegion).length === 0 && (
                <div className={`text-center mt-10 font-mono text-sm ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>未检测到门店</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Benchmark;
