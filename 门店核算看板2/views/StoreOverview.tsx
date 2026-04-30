import React, { useEffect, useState, useMemo, memo } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, Sector } from 'recharts';
import { Plus, ChevronDown, Check, X, ArrowLeft, MoreHorizontal, TrendingUp, ChevronLeft, ChevronRight, TrendingDown, ChevronRight as ChevronRightIcon, Users, MapPin, Building, Ruler } from 'lucide-react';
import { fetchStoreOverview, SUBJECTS, STORES, REGIONS, getStoresByRegion, getPreviousMonth, ensureResourcesInitialized } from '../services/mockData';
import { useBenchmark } from '../App';
import { SubjectType } from '../types';
import { createAbortableRequest } from '../utils/performance';
import { useTheme } from '../contexts/ThemeContext';

const COLORS = [
  '#3B82F6', '#60A5FA', '#F472B6', '#34D399', '#A78BFA', '#FB923C',
];

const MonthPicker: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  currentDate: string;
  onSelect: (date: string) => void;
}> = ({ isOpen, onClose, currentDate, onSelect }) => {
  const [year, setYear] = useState(parseInt(currentDate.split('-')[0]));
  const { isDark } = useTheme();
  const now = new Date();

  const currentMaxYear = now.getFullYear();
  const currentMaxMonth = now.getMonth() + 1;

  if (!isOpen) return null;

  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div
        className={`w-full max-w-sm rounded-t-2xl sm:rounded-2xl shadow-2xl p-6 transform transition-transform duration-300 mb-24 sm:mb-0 ${isDark ? 'bg-slate-900 border border-white/10' : 'bg-white border border-slate-200'
          }`}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className={`font-bold text-2xl ${isDark ? 'text-white' : 'text-slate-800'}`}>选择月份</h3>
          <button onClick={onClose} className={`p-1 rounded-full ${isDark ? 'hover:bg-white/10 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}><X size={24} /></button>
        </div>

        <div className="flex justify-between items-center mb-6 px-4">
          <button
            onClick={() => setYear(y => y - 1)}
            className={`p-2 rounded-full ${isDark ? 'hover:bg-white/5 text-slate-300' : 'hover:bg-slate-100 text-slate-600'}`}
          >
            <ChevronLeft size={24} />
          </button>
          <span className={`text-3xl font-bold font-mono ${isDark ? 'text-white' : 'text-slate-800'}`}>{year}年</span>
          <button
            onClick={() => {
              if (year < currentMaxYear) setYear(y => y + 1);
            }}
            disabled={year >= currentMaxYear}
            className={`p-2 rounded-full ${year >= currentMaxYear ? (isDark ? 'text-slate-700' : 'text-slate-300') : (isDark ? 'hover:bg-white/5 text-slate-300' : 'hover:bg-slate-100 text-slate-600')}`}
          >
            <ChevronRight size={24} />
          </button>
        </div>

        <div className="grid grid-cols-4 gap-4">
          {months.map(m => {
            const isFuture = year === currentMaxYear && m > currentMaxMonth;
            const isSelected = year === parseInt(currentDate.split('-')[0]) && m === parseInt(currentDate.split('-')[1]);
            const monthStr = m.toString().padStart(2, '0');
            const dateStr = `${year}-${monthStr}`;

            return (
              <button
                key={m}
                disabled={isFuture}
                onClick={() => {
                  if (!isFuture) {
                    onSelect(dateStr);
                    onClose();
                  }
                }}
                className={`py-4 rounded-xl text-lg font-bold transition-all ${isSelected
                    ? 'bg-blue-500 text-white shadow-lg'
                    : isFuture
                      ? isDark ? 'text-slate-700 cursor-not-allowed' : 'text-slate-300 cursor-not-allowed'
                      : isDark
                        ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
              >
                {m}月
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 8}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 10}
        outerRadius={outerRadius + 12}
        fill={fill}
      />
    </g>
  );
};

const StructureSection: React.FC<{
  title: string;
  data: { name: string; value: number }[];
  total: number;
}> = memo(({ title, data, total }) => {
  const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined);
  const { isDark } = useTheme();

  const activeData = useMemo(() => {
    return data.filter(d => d.value > 0).sort((a, b) => b.value - a.value);
  }, [data]);

  const activeItem = useMemo(() => {
    return activeIndex !== undefined ? activeData[activeIndex] : null;
  }, [activeIndex, activeData]);

  const chartData = useMemo(() => {
    return activeData.map((item, index) => ({
      ...item,
      fill: COLORS[index % COLORS.length],
    }));
  }, [activeData]);

  if (activeData.length === 0) {
    return (
      <div className={`rounded-2xl p-6 mb-4 h-full ${isDark ? 'bg-slate-900/40 border border-white/5' : 'bg-white border border-slate-200 shadow-sm'}`}>
        <h3 className={`font-bold mb-4 text-xl ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{title}</h3>
        <div className={`font-mono text-sm text-center py-8 ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>暂无数据流</div>
      </div>
    );
  }

  const handleEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  const handleClick = (_: any, index: number) => {
    setActiveIndex(index === activeIndex ? undefined : index);
  };

  return (
    <div className={`rounded-2xl p-6 mb-4 shadow-lg h-full flex flex-col ${isDark ? 'bg-slate-900/40 border border-white/5 backdrop-blur-sm' : 'bg-white border border-slate-200'}`}>
      <div className="flex justify-between items-center mb-6">
        <h3 className={`font-bold text-xl ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{title}</h3>
        <MoreHorizontal size={20} className={isDark ? 'text-slate-600' : 'text-slate-400'} />
      </div>

      <div className="h-64 w-full mb-8 relative shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              activeIndex={activeIndex}
              activeShape={renderActiveShape}
              data={activeData}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={90}
              paddingAngle={4}
              dataKey="value"
              stroke="none"
              cornerRadius={4}
              onMouseEnter={handleEnter}
              onClick={handleClick}
            >
              {activeData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                  stroke={activeIndex === index ? '#fff' : 'none'}
                  strokeWidth={2}
                  className="transition-all duration-300 cursor-pointer"
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className={`text-base font-mono text-center px-4 truncate max-w-full ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
            {activeItem ? activeItem.name : '总计'}
          </span>
          <span className={`font-bold ${activeItem ? 'text-blue-500 text-3xl' : isDark ? 'text-white text-2xl' : 'text-slate-800 text-2xl'}`}>
            {activeItem ? (activeItem.value / 10000).toFixed(2) : (total / 10000).toFixed(0)}万
          </span>
        </div>
      </div>

      <div className="space-y-3 flex-1 overflow-y-auto pr-2 custom-scrollbar">
        {activeData.map((item, index) => {
          const percent = total > 0 ? (item.value / total) * 100 : 0;
          const isActive = activeIndex === index;
          return (
            <div
              key={index}
              className={`flex items-center justify-between text-base group cursor-pointer p-3 rounded-lg transition-colors ${isActive
                  ? isDark ? 'bg-white/10' : 'bg-slate-100'
                  : isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50'
                }`}
              onClick={() => handleClick(null, index)}
              onMouseEnter={() => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(undefined)}
            >
              <div className="flex items-center space-x-3">
                <div
                  className={`w-3 h-3 rounded-full flex-shrink-0 transition-transform ${isActive ? 'scale-125' : ''}`}
                  style={{ backgroundColor: COLORS[index % COLORS.length], color: COLORS[index % COLORS.length] }}
                ></div>
                <span className={`font-medium transition-colors ${isActive ? (isDark ? 'text-white' : 'text-slate-800') : (isDark ? 'text-slate-400' : 'text-slate-600')}`}>{item.name}</span>
              </div>
              <div className="flex items-center space-x-4">
                <span className={`font-bold font-mono text-lg ${isActive ? (isDark ? 'text-white' : 'text-slate-800') : (isDark ? 'text-slate-200' : 'text-slate-700')}`}>{(item.value / 10000).toFixed(2)}万</span>
                <div className="w-14 text-right">
                  <span className={`text-sm font-mono px-2 py-0.5 rounded ${isActive ? 'bg-blue-500 text-white' : isDark ? 'bg-white/5 text-slate-500' : 'bg-slate-100 text-slate-500'}`}>{percent.toFixed(0)}%</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});

const StoreOverview: React.FC = () => {
  const { storeId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addStore } = useBenchmark();
  const { isDark } = useTheme();

  const initialDate = searchParams.get('date') || (() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  })();
  const [date, setDate] = useState(initialDate);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isStoreSelectorOpen, setIsStoreSelectorOpen] = useState(false);
  const [activeModalRegion, setActiveModalRegion] = useState<string>(REGIONS.length > 0 ? REGIONS[0].id : '');

  const currentStore = useMemo(() => STORES.find(s => s.id === storeId), [storeId]);
  const currentRegion = useMemo(() => REGIONS.find(r => r.id === currentStore?.regionId), [currentStore]);

  useEffect(() => {
    const urlDate = searchParams.get('date');
    if (urlDate && urlDate !== date) {
      setDate(urlDate);
    }

    if (STORES.length <= 1) {
      setLoading(true);
      ensureResourcesInitialized(date, true).then(() => {
        if (REGIONS.length > 0 && !activeModalRegion) {
          setActiveModalRegion(REGIONS[0].id);
        }

        if (!currentStore && STORES.length > 0) {
          const newStoreId = STORES[0].id;
          navigate(`/store/${newStoreId}?date=${date}`, { replace: true });
        }
      }).catch(err => {
        console.error('[StoreOverview] 资源初始化失败:', err);
        setError('无法加载门店列表');
        setLoading(false);
      });
    }
  }, [searchParams]);

  useEffect(() => {
    if (REGIONS.length > 0 && !activeModalRegion) {
      setActiveModalRegion(REGIONS[0].id);
    }
    if (currentStore && currentStore.regionId) {
      setActiveModalRegion(currentStore.regionId);
    }
  }, [REGIONS.length, currentStore]);

  useEffect(() => {
    if (storeId) {
      setLoading(true);
      setError(null);

      const abortController = new AbortController();

      fetchStoreOverview(storeId, date)
        .then(res => {
          if (abortController.signal.aborted) {
            return;
          }
          setData(res);
        })
        .catch(err => {
          if (err instanceof Error && err.name === 'AbortError') {
            return;
          }
          console.error('[StoreOverview] 加载门店数据失败:', err);
          setError('加载门店数据失败: ' + (err.message || '未知错误'));
        })
        .finally(() => {
          if (!abortController.signal.aborted) {
            setLoading(false);
          }
        });

      return () => {
        abortController.abort();
      };
    }
    if (currentStore) {
      setActiveModalRegion(currentStore.regionId);
    }
  }, [storeId, date, currentStore]);

  const handleDateChange = (newDate: string) => {
    setDate(newDate);
    setSearchParams({ date: newDate });
  };

  const handleAddToBenchmark = () => {
    if (currentStore) {
      addStore(currentStore);
      navigate('/benchmark');
    }
  };

  const handleStoreSwitch = (newStoreId: string) => {
    navigate(`/store/${newStoreId}?date=${date}`);
    setIsStoreSelectorOpen(false);
  };

  const handleTrendNavigate = (subjectId: string, subjectName: string) => {
    if (!storeId) return;
    navigate(`/trend/${subjectId}?stores=${storeId}&title=${encodeURIComponent(subjectName)}`);
  };

  const renderGrowthBadge = (currentValue: number, prevValue: number | null | undefined, growth: number | undefined, forceGreen: boolean = false) => {
    if (prevValue === null || prevValue === undefined || growth === undefined) {
      return null;
    }

    if (prevValue < 0 && currentValue >= 0) {
      const isGreen = forceGreen;
      return (
        <div className={`mt-2 inline-flex items-center px-2 py-1 rounded text-sm font-bold border ${isDark ? (isGreen ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400') : (isGreen ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-red-50 border-red-200 text-red-600')
          }`}>
          <TrendingUp size={14} className="mr-1.5" />
          <span>扭亏</span>
        </div>
      );
    }

    if (prevValue >= 0 && currentValue < 0) {
      return (
        <div className={`mt-2 inline-flex items-center px-2 py-1 rounded text-sm font-bold border ${isDark ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-600'
          }`}>
          <TrendingDown size={14} className="mr-1.5" />
          <span>转亏</span>
        </div>
      );
    }

    const isPositive = growth >= 0;
    const isGreen = forceGreen || !isPositive;
    return (
      <div className={`mt-2 inline-flex items-center px-2 py-1 rounded text-sm font-bold border ${!isGreen
          ? isDark ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-red-50 border-red-200 text-red-600'
          : isDark ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-600'
        }`}>
        {isPositive ? <TrendingUp size={14} className="mr-1.5" /> : <TrendingDown size={14} className="mr-1.5" />}
        <span>{Math.abs(growth).toFixed(2)}%</span>
      </div>
    );
  };

  const revenueItems = useMemo(() => {
    if (!data) return [];
    return SUBJECTS
      .filter(s => s.type === SubjectType.REVENUE && !s.isParent)
      .map(s => ({ name: s.name, value: data.details[s.id] || 0 }));
  }, [data]);

  const expenseItems = useMemo(() => {
    if (!data) return [];
    return SUBJECTS
      .filter(s => s.type === SubjectType.EXPENSE && !s.isParent)
      .map(s => ({ name: s.name, value: data.details[s.id] || 0 }));
  }, [data]);

  return (
    <div className="h-full overflow-y-auto overflow-x-hidden relative pb-24 md:pb-6">
      <nav className={`backdrop-blur-md border-b px-4 h-16 flex items-center justify-between sticky top-0 z-30 ${isDark ? 'bg-slate-950/70 border-white/5' : 'bg-white/80 border-slate-200'
        }`}>
        <button className={`w-12 h-12 flex items-center justify-center transition-colors ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-700'}`} onClick={() => navigate('/')}>
          <ArrowLeft size={28} />
        </button>
        <h1 className={`font-bold text-xl tracking-wide ${isDark ? 'text-white' : 'text-slate-800'}`}>门店概览</h1>
        <div className="w-12"></div>
      </nav>

      <div className="px-5 py-6 flex items-center justify-between max-w-7xl mx-auto w-full">
        <div
          className="flex-1 cursor-pointer group"
          onClick={() => {
            if (currentStore) setActiveModalRegion(currentStore.regionId);
            setIsStoreSelectorOpen(true);
          }}
        >
          <div className="flex items-center space-x-3">
            <h2 className={`font-bold text-3xl tracking-tight transition-colors ${isDark ? 'text-white group-hover:text-blue-400' : 'text-slate-800 group-hover:text-blue-600'}`}>
              {currentStore?.name || '选择门店'}
            </h2>
            <ChevronDown size={28} className={`${isDark ? 'text-slate-500 group-hover:text-blue-400' : 'text-slate-400 group-hover:text-blue-500'}`} />
          </div>
          {currentRegion && (
            <div className="flex items-center mt-2 space-x-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_8px_#10B981]"></span>
              <span className={`text-sm font-mono uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {currentRegion.name}
              </span>
            </div>
          )}
        </div>

        <div onClick={() => setIsDatePickerOpen(true)} className={`flex items-center space-x-2 border px-4 py-2 rounded-full text-base font-medium cursor-pointer transition-colors ${isDark
            ? 'bg-white/5 border-white/10 text-blue-400 hover:bg-white/10 hover:border-blue-500/30'
            : 'bg-slate-100 border-slate-200 text-blue-600 hover:bg-slate-200 hover:border-blue-300'
          }`}>
          <span className="tabular-nums">{date}</span>
          <ChevronDown size={16} className="opacity-70" />
        </div>
      </div>

      {loading ? (
        <div className={`p-10 text-center font-mono text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
          <div className={`w-8 h-8 border-2 rounded-full animate-spin mx-auto mb-4 ${isDark ? 'border-blue-500/20 border-t-blue-500' : 'border-blue-200 border-t-blue-500'}`}></div>
          数据模块加载中...
        </div>
      ) : error ? (
        <div className="p-10 text-center">
          <div className={`font-mono text-sm mb-4 ${isDark ? 'text-red-400' : 'text-red-600'}`}>{error}</div>
          <button
            onClick={() => {
              setError(null);
              setLoading(true);
              ensureResourcesInitialized(date, true).then(() => {
                if (STORES.length > 0 && storeId) {
                  fetchStoreOverview(storeId, date)
                    .then(res => setData(res))
                    .catch(err => setError(err.message))
                    .finally(() => setLoading(false));
                } else {
                  setLoading(false);
                }
              });
            }}
            className={`px-4 py-2 rounded-lg transition-colors ${isDark ? 'bg-blue-500/20 border border-blue-500/30 text-blue-400 hover:bg-blue-500/30' : 'bg-blue-50 border border-blue-200 text-blue-600 hover:bg-blue-100'}`}
          >
            重试
          </button>
        </div>
      ) : !data ? (
        <div className={`p-10 text-center font-mono text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
          暂无门店财务数据
        </div>
      ) : (
        <div className="px-4 space-y-6 max-w-7xl mx-auto w-full">

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
            <div
              onClick={() => handleTrendNavigate('net_profit', '净利润')}
              className={`col-span-2 md:col-span-1 relative overflow-hidden rounded-2xl border shadow-xl cursor-pointer group active:scale-[0.99] transition-all duration-200 ${isDark
                  ? 'bg-gradient-to-b from-slate-800/40 to-slate-900/40 backdrop-blur-xl border-white/10 hover:border-blue-500/30'
                  : 'bg-white border-slate-200 hover:border-blue-300 shadow-lg'
                }`}
            >
              <div className="absolute top-0 right-0 p-4 md:p-6 opacity-20">
                {6.0 < 0 ? (
                  <TrendingDown size={80} className={`md:w-[120px] md:h-[120px] ${isDark ? 'text-blue-500' : 'text-blue-500'} group-hover:scale-110 transition-transform duration-500`} />
                ) : (
                  <TrendingUp size={80} className={`md:w-[120px] md:h-[120px] ${isDark ? 'text-blue-500' : 'text-blue-500'} group-hover:scale-110 transition-transform duration-500`} />
                )}
              </div>
              <div className="absolute bottom-4 md:bottom-6 right-4 md:right-6 transition-opacity">
                <ChevronRightIcon size={20} className="md:w-6 md:h-6 text-blue-500" />
              </div>
              <div className="p-5 md:p-8 relative z-10">
                <div className="flex items-center space-x-3 mb-2 md:mb-3">
                  <p className={`text-xs md:text-sm font-medium uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>净利润</p>
                </div>
                <div className="flex items-baseline space-x-2 md:space-x-3">
                  <span className={`text-2xl md:text-4xl font-bold tracking-tight ${data.netProfit >= 0 ? (isDark ? 'text-white' : 'text-slate-800') : (isDark ? 'text-red-400' : 'text-red-600')}`}>
                    {data.netProfit < 0 ? '-' : ''}¥{Math.abs(data.netProfit / 10000).toFixed(2)}
                  </span>
                  <span className={`text-lg md:text-2xl font-normal ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>万</span>
                </div>
                {renderGrowthBadge(data.netProfit, data.prevProfit, data.profitGrowth)}
              </div>
              <div className={`h-1 md:h-1.5 w-full ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 w-[65%]"></div>
              </div>
            </div>

            <div
              onClick={() => handleTrendNavigate('total_rev', '总收入')}
              className={`p-4 md:p-6 rounded-2xl border transition-all cursor-pointer group relative flex flex-col justify-between active:scale-[0.99] ${isDark
                  ? 'bg-slate-900/40 backdrop-blur-md border-white/5 hover:border-blue-500/30'
                  : 'bg-white border-slate-200 hover:border-blue-300 shadow-sm'
                }`}
            >
              <div className="absolute top-3 md:top-4 right-3 md:right-4 transition-opacity">
                <ChevronRightIcon size={16} className="md:w-5 md:h-5 text-blue-500/50" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2 md:mb-3">
                  <p className={`text-xs md:text-sm font-bold uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>总收入</p>
                </div>
                <p className={`text-xl md:text-3xl font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                  {(data.revenue / 10000).toFixed(2)}万
                </p>
              </div>
              <div>
                {renderGrowthBadge(data.revenue, data.prevRevenue, data.revenueGrowth)}
              </div>
            </div>

            <div
              onClick={() => handleTrendNavigate('total_exp', '总支出')}
              className={`p-4 md:p-6 rounded-2xl border transition-all cursor-pointer group relative flex flex-col justify-between active:scale-[0.99] ${isDark
                  ? 'bg-slate-900/40 backdrop-blur-md border-white/5 hover:border-blue-500/30'
                  : 'bg-white border-slate-200 hover:border-blue-300 shadow-sm'
                }`}
            >
              <div className="absolute top-3 md:top-4 right-3 md:right-4 transition-opacity">
                <ChevronRightIcon size={16} className="md:w-5 md:h-5 text-blue-500/50" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2 md:mb-3">
                  <p className={`text-xs md:text-sm font-bold uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>总支出</p>
                </div>
                <p className={`text-xl md:text-3xl font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                  {(data.expense / 10000).toFixed(2)}万
                </p>
              </div>
              <div>
                {renderGrowthBadge(data.expense, data.prevExpense, data.expenseGrowth, true)}
              </div>
            </div>
          </div>

          <div className={`rounded-2xl p-6 grid grid-cols-1 md:grid-cols-4 gap-6 ${isDark ? 'bg-slate-900/40 border border-white/5 backdrop-blur-sm' : 'bg-white border border-slate-200 shadow-sm'}`}>
            <div className="flex items-center space-x-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center border ${isDark ? 'bg-blue-500/10 border-blue-500/20' : 'bg-blue-50 border-blue-200'}`}>
                <Users size={24} className={isDark ? 'text-blue-400' : 'text-blue-500'} />
              </div>
              <div>
                <p className={`text-xs uppercase font-bold tracking-widest mb-1 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>编制人数</p>
                <p className={`text-xl font-bold font-mono ${isDark ? 'text-white' : 'text-slate-800'}`}>{data.headcount} <span className={`text-sm font-normal ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>人</span></p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center border ${isDark ? 'bg-indigo-500/10 border-indigo-500/20' : 'bg-indigo-50 border-indigo-200'}`}>
                <Ruler size={24} className={isDark ? 'text-indigo-400' : 'text-indigo-500'} />
              </div>
              <div>
                <p className={`text-xs uppercase font-bold tracking-widest mb-1 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>在管面积</p>
                <p className={`text-xl font-bold font-mono ${isDark ? 'text-white' : 'text-slate-800'}`}>{data.managedArea.toLocaleString()} <span className={`text-sm font-normal ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>㎡</span></p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center border ${isDark ? 'bg-pink-500/10 border-pink-500/20' : 'bg-pink-50 border-pink-200'}`}>
                <Building size={24} className={isDark ? 'text-pink-400' : 'text-pink-500'} />
              </div>
              <div>
                <p className={`text-xs uppercase font-bold tracking-widest mb-1 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>楼栋数量</p>
                <p className={`text-xl font-bold font-mono ${isDark ? 'text-white' : 'text-slate-800'}`}>{data.buildingCount} <span className={`text-sm font-normal ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>栋</span></p>
              </div>
            </div>
            <div className="flex items-center space-x-4 md:col-span-1">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center border shrink-0 ${isDark ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-emerald-50 border-emerald-200'}`}>
                <MapPin size={24} className={isDark ? 'text-emerald-400' : 'text-emerald-500'} />
              </div>
              <div className="min-w-0">
                <p className={`text-xs uppercase font-bold tracking-widest mb-1 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>地理位置</p>
                <p className={`text-sm font-medium truncate ${isDark ? 'text-white' : 'text-slate-700'}`} title={data.storeAddress}>{data.storeAddress}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 md:gap-4">
            <div className={`p-2.5 md:p-4 rounded-xl border transition-all ${isDark ? 'bg-slate-900/40 backdrop-blur-md border-white/5 hover:border-blue-500/30' : 'bg-white border-slate-200 hover:border-blue-300 shadow-sm'}`}>
              <div className="flex items-center justify-between mb-1 md:mb-2">
                <p className={`text-[10px] md:text-xs font-bold uppercase tracking-wide md:tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>人均净利润</p>
              </div>
              <div className="flex items-baseline space-x-0.5 md:space-x-1">
                <span className={`text-base md:text-2xl font-bold tracking-tight ${data.netProfit / data.headcount >= 0 ? (isDark ? 'text-white' : 'text-slate-800') : (isDark ? 'text-red-400' : 'text-red-600')}`}>
                  {data.netProfit / data.headcount < 0 ? '-' : ''}¥{Math.abs(data.netProfit / data.headcount / 10000).toFixed(2)}
                </span>
                <span className={`text-xs md:text-lg font-normal ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>万</span>
              </div>
              <div className="hidden md:block">
                {renderGrowthBadge(data.netProfit, data.prevProfit, data.profitGrowth)}
              </div>
            </div>

            <div className={`p-2.5 md:p-4 rounded-xl border transition-all ${isDark ? 'bg-slate-900/40 backdrop-blur-md border-white/5 hover:border-blue-500/30' : 'bg-white border-slate-200 hover:border-blue-300 shadow-sm'}`}>
              <div className="flex items-center justify-between mb-1 md:mb-2">
                <p className={`text-[10px] md:text-xs font-bold uppercase tracking-wide md:tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>人均总收入</p>
              </div>
              <div className="flex items-baseline space-x-0.5 md:space-x-1">
                <span className={`text-base md:text-2xl font-bold tracking-tight ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                  {(data.revenue / data.headcount / 10000).toFixed(2)}
                </span>
                <span className={`text-xs md:text-lg font-normal ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>万</span>
              </div>
              <div className="hidden md:block">
                {renderGrowthBadge(data.revenue, data.prevRevenue, data.revenueGrowth)}
              </div>
            </div>

            <div className={`p-2.5 md:p-4 rounded-xl border transition-all ${isDark ? 'bg-slate-900/40 backdrop-blur-md border-white/5 hover:border-blue-500/30' : 'bg-white border-slate-200 hover:border-blue-300 shadow-sm'}`}>
              <div className="flex items-center justify-between mb-1 md:mb-2">
                <p className={`text-[10px] md:text-xs font-bold uppercase tracking-wide md:tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>人均总支出</p>
              </div>
              <div className="flex items-baseline space-x-0.5 md:space-x-1">
                <span className={`text-base md:text-2xl font-bold tracking-tight ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                  {(data.expense / data.headcount / 10000).toFixed(2)}
                </span>
                <span className={`text-xs md:text-lg font-normal ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>万</span>
              </div>
              <div className="hidden md:block">
                {renderGrowthBadge(data.expense, data.prevExpense, data.expenseGrowth, true)}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <StructureSection title="收入结构" data={revenueItems} total={data.revenue} />
            <StructureSection title="支出结构" data={expenseItems} total={data.expense} />
          </div>

        </div>
      )}

      <div className="fixed bottom-24 md:bottom-10 right-5 md:right-10 z-40">
        <button
          onClick={handleAddToBenchmark}
          className={`p-5 rounded-2xl flex items-center justify-center transition-all active:scale-95 hover:scale-110 ${isDark
              ? 'bg-blue-500 text-slate-950 shadow-[0_0_20px_rgba(59,130,246,0.4)] hover:bg-blue-400'
              : 'bg-blue-500 text-white shadow-lg shadow-blue-500/30 hover:bg-blue-600'
            }`}
          aria-label="Compare"
        >
          <Plus size={32} strokeWidth={3} />
        </button>
      </div>

      {isStoreSelectorOpen && (
        <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className={`w-full max-w-md md:rounded-2xl flex flex-col h-full md:h-3/4 ${isDark ? 'bg-slate-950/90 backdrop-blur-xl md:border md:border-white/10' : 'bg-white md:border md:border-slate-200'}`}>
            <div className={`p-5 border-b flex items-center justify-between shrink-0 ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
              <h2 className={`text-xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-800'}`}>选择门店</h2>
              <button onClick={() => setIsStoreSelectorOpen(false)} className={`p-2 rounded-full transition-colors ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-700'}`}>
                <X size={28} />
              </button>
            </div>

            <div className={`px-5 py-5 border-b ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
              <div className="grid grid-cols-3 gap-3">
                {REGIONS.map(r => {
                  const count = getStoresByRegion(r.id).length;
                  const isActive = activeModalRegion === r.id;
                  return (
                    <button
                      key={r.id}
                      onClick={() => setActiveModalRegion(r.id)}
                      className={`px-4 py-2.5 rounded-lg text-sm font-bold transition-all border ${isActive
                          ? isDark ? 'bg-blue-500/10 border-blue-500/50 text-blue-400' : 'bg-blue-50 border-blue-200 text-blue-600'
                          : isDark ? 'bg-transparent border-white/10 text-slate-500 hover:border-white/30' : 'bg-transparent border-slate-200 text-slate-500 hover:border-slate-300'
                        }`}
                    >
                      {r.name} <span className="opacity-50 ml-1 font-mono">[{count}]</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className={`flex-1 overflow-y-auto p-5 pb-20 ${isDark ? 'bg-slate-950/50' : 'bg-slate-50'}`}>
              {getStoresByRegion(activeModalRegion).map(store => (
                <button
                  key={store.id}
                  onClick={() => handleStoreSwitch(store.id)}
                  className={`w-full text-left p-5 mb-2 rounded-xl border flex items-center justify-between transition-all ${store.id === storeId
                      ? isDark ? 'bg-blue-500/10 border-blue-500/50' : 'bg-blue-50 border-blue-200'
                      : isDark ? 'bg-slate-900/50 border-white/5 hover:bg-slate-800 hover:border-white/10' : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                >
                  <span className={`text-base font-bold ${store.id === storeId ? (isDark ? 'text-blue-400' : 'text-blue-600') : (isDark ? 'text-slate-300' : 'text-slate-700')}`}>
                    {store.name}
                  </span>
                  {store.id === storeId && <Check size={20} className={isDark ? 'text-blue-400' : 'text-blue-500'} />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <MonthPicker
        isOpen={isDatePickerOpen}
        onClose={() => setIsDatePickerOpen(false)}
        currentDate={date}
        onSelect={handleDateChange}
      />
    </div>
  );
};

export default StoreOverview;
