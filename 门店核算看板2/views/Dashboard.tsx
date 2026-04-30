import React, { useState, useEffect, useCallback, useMemo, memo, useTransition, startTransition, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, TrendingUp, TrendingDown, X, ChevronLeft, ChevronRight, ChevronRight as ChevronRightIcon, Award, Coins, Wallet } from 'lucide-react';
import { fetchCompanyDashboard, getPreviousMonth, getStoresByRegion, REGIONS, SUBJECTS } from '../services/mockData';
import { DashboardData, RegionFinancialSummary, Store, SubjectType, RankItem } from '../types';
import { useTheme } from '../contexts/ThemeContext';

const BMapContainer = lazy(() => import('./BMapContainer'));
import { debounce, measureComponentRender } from '../utils/performance';

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
        className={`w-full max-w-sm rounded-t-2xl sm:rounded-2xl shadow-2xl p-6 transform transition-transform duration-300 mb-24 sm:mb-0 ${
          isDark ? 'bg-slate-900 border border-white/10' : 'bg-white border border-slate-200'
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
                className={`py-4 rounded-xl text-lg font-bold transition-all ${
                  isSelected
                    ? isDark
                      ? 'bg-blue-500 text-white shadow-lg'
                      : 'bg-blue-500 text-white shadow-md'
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

const RankingList: React.FC<{ items: RankItem[], type: 'revenue' | 'expense' | 'profit', onClickStore: (id: string) => void }> = memo(({ items, type, onClickStore }) => {
  const { isDark } = useTheme();
  
  const getIcon = (rank: number) => {
    if (type === 'expense') return <span className={`font-mono w-8 text-center text-xl font-bold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{rank}</span>;

    if (rank === 1) return <span className="text-yellow-400 font-bold text-3xl">🥇</span>;
    if (rank === 2) return <span className="text-slate-300 font-bold text-3xl">🥈</span>;
    if (rank === 3) return <span className="text-amber-600 font-bold text-3xl">🥉</span>;
    return <span className={`font-mono w-8 text-center text-xl font-bold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{rank}</span>;
  };

  const getColor = () => {
    if (type === 'revenue') return isDark ? 'text-blue-400' : 'text-blue-600';
    if (type === 'expense') return isDark ? 'text-emerald-400' : 'text-emerald-600';
    return isDark ? 'text-red-400' : 'text-red-600';
  };

  return (
    <div className="space-y-4 pt-2">
      {items.map((item) => (
        <div
          key={item.storeId}
          onClick={() => onClickStore(item.storeId)}
          className={`flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer group ${
            isDark 
              ? 'bg-white/5 border-white/5 hover:bg-white/10' 
              : 'bg-slate-50 border-slate-100 hover:bg-slate-100 hover:border-slate-200'
          } active:scale-[0.99]`}
        >
          <div className="flex items-center space-x-4">
            <div className="w-10 flex justify-center">{getIcon(item.rank)}</div>
            <span className={`text-lg font-medium transition-colors ${isDark ? 'text-slate-200 group-hover:text-blue-300' : 'text-slate-700 group-hover:text-blue-600'}`}>{item.storeName}</span>
          </div>
          <span className={`font-mono font-bold text-lg ${getColor()}`}>
            {(item.value / 10000).toFixed(2)}w
          </span>
        </div>
      ))}
    </div>
  );
});

interface MatrixTableProps {
  data: DashboardData | null;
  expandedSubjects: Set<string>;
  onToggleSubject: (subjectId: string) => void;
  onRegionClick: (regionId: string) => void;
  onTrendNavigate: (subjectId: string, subjectName: string) => void;
  formatCurrency: (val: number) => string;
  isSubjectVisible: (subject: typeof SUBJECTS[0]) => boolean;
}

const MatrixTable: React.FC<MatrixTableProps> = memo(({
  data,
  expandedSubjects,
  onToggleSubject,
  onRegionClick,
  onTrendNavigate,
  formatCurrency,
  isSubjectVisible,
}) => {
  const { isDark } = useTheme();
  
  const visibleSubjects = useMemo(() => {
    return SUBJECTS.filter(subject => {
      // 先检查展开状态（父级是否展开）
      if (!isSubjectVisible(subject)) return false;

      // 父级科目始终显示（总收入、总支出、净利润）
      if (subject.isParent) return true;

      // 子科目：检查在所有战区中是否至少有一个非0值
      // 如果全部战区都为0，则不展示该科目
      if (data?.matrix && data.matrix.length > 0) {
        const hasNonZero = data.matrix.some(
          region => (region.data[subject.id] || 0) !== 0
        );
        if (!hasNonZero) return false;
      }

      return true;
    });
  }, [isSubjectVisible, data?.matrix]);

  // 计算公司级汇总数据：每个科目 = 所有战区该科目之和
  const companySummary = useMemo(() => {
    if (!data?.matrix || data.matrix.length === 0) return {} as Record<string, number>;
    const summary: Record<string, number> = {};
    data.matrix.forEach((region) => {
      Object.entries(region.data).forEach(([subjectId, amount]) => {
        summary[subjectId] = (summary[subjectId] || 0) + amount;
      });
    });
    return summary;
  }, [data?.matrix]);

  const tableRows = useMemo(() => {
    return visibleSubjects.map((subject) => (
      <tr
        key={subject.id}
        className={`cursor-pointer group transition-colors ${
          subject.isParent 
            ? isDark ? 'bg-white/5' : 'bg-slate-50'
            : isDark ? 'hover:bg-white/[0.02]' : 'hover:bg-slate-50'
        }`}
        onClick={() => {
          if (subject.isParent && subject.id !== 'net_profit') {
            onToggleSubject(subject.id);
          } else {
            onTrendNavigate(subject.id, subject.name);
          }
        }}
      >
        <td className={`sticky left-0 z-10 border-r p-5 text-base transition-colors ${
          isDark 
            ? `border-white/10 group-hover:bg-slate-900 ${subject.isParent ? 'bg-slate-900 font-bold text-white' : 'bg-slate-950 text-slate-400 pl-8'}`
            : `border-slate-200 group-hover:bg-slate-100 ${subject.isParent ? 'bg-white font-bold text-slate-800' : 'bg-slate-50 text-slate-500 pl-8'}`
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span>{subject.name}</span>
              {subject.isParent && subject.id !== 'net_profit' && (
                <ChevronDown
                  size={16}
                  className={`${isDark ? 'text-slate-500' : 'text-slate-400'} transition-transform ${expandedSubjects.has(subject.id) ? 'rotate-180' : ''}`}
                />
              )}
            </div>
            {!subject.isParent && <TrendingUp size={14} className={`${isDark ? 'text-blue-500' : 'text-blue-500'} opacity-20 group-hover:opacity-100`} />}
          </div>
        </td>
        {/* 公司汇总列 - 第一战区之前 */}
        <td className={`p-5 text-right font-mono text-base font-bold border-r ${
          isDark 
            ? 'text-white border-white/10 bg-white/[0.03]' 
            : 'text-slate-800 border-slate-200 bg-blue-50/30'
        }`}>
          {formatCurrency(companySummary[subject.id] || 0)}
        </td>
        {data?.matrix.map((region) => (
          <td key={`${region.regionId}-${subject.id}`} className={`p-5 text-right font-mono text-base ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
            {formatCurrency(region.data[subject.id] || 0)}
          </td>
        ))}
      </tr>
    ));
  }, [visibleSubjects, data?.matrix, companySummary, expandedSubjects, onToggleSubject, onTrendNavigate, formatCurrency, isDark]);

  const tableHeaders = useMemo(() => {
    return data?.matrix.map((region) => (
      <th
        key={region.regionId}
        onClick={() => onRegionClick(region.regionId)}
        className={`p-5 border-b min-w-[120px] text-sm font-bold uppercase tracking-wider cursor-pointer transition-colors group ${
          isDark 
            ? 'border-white/5 text-blue-400/80 hover:bg-white/5' 
            : 'border-slate-200 text-blue-600 hover:bg-slate-50'
        }`}
      >
        <div className="flex items-center justify-end space-x-2">
          <span>{region.regionName}</span>
          <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
        </div>
      </th>
    ));
  }, [data?.matrix, onRegionClick, isDark]);

  return (
    <table className="w-full border-collapse text-base min-w-[800px] md:min-w-full">
      <thead>
        <tr>
          <th className={`sticky left-0 z-20 border-b border-r p-5 text-left text-sm font-bold uppercase tracking-wider min-w-[160px] ${
            isDark 
              ? 'bg-slate-900 border-white/10 text-slate-500' 
              : 'bg-white border-slate-200 text-slate-500'
          }`}>
            科目
          </th>
          {/* 公司汇总表头 - 第一战区之前 */}
          <th className={`p-5 border-b border-r min-w-[120px] text-sm font-bold uppercase tracking-wider ${
            isDark 
              ? 'border-white/10 text-amber-400 bg-white/[0.03]' 
              : 'border-slate-200 text-amber-600 bg-blue-50/30'
          }`}>
            <div className="flex items-center justify-end">
              <span>公司汇总</span>
            </div>
          </th>
          {tableHeaders}
        </tr>
      </thead>
      <tbody className={`divide-y ${isDark ? 'divide-white/5' : 'divide-slate-100'}`}>
        {tableRows}
      </tbody>
    </table>
  );
});

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [selectedDate, setSelectedDate] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardData | null>(null);
  const [expandedSubjects, setExpandedSubjects] = useState<Set<string>>(new Set());
  const [rankingTab, setRankingTab] = useState<'revenue' | 'expense' | 'profit'>('revenue');
  const [selectedRegionForModal, setSelectedRegionForModal] = useState<string | null>(null);
  const [availableStores, setAvailableStores] = useState<Store[]>([]);

  const renderPerf = useMemo(() => measureComponentRender('Dashboard'), []);

  useEffect(() => {
    renderPerf.start();
    return () => {
      renderPerf.end();
    };
  });

  useEffect(() => {
    loadData();
  }, [selectedDate]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await fetchCompanyDashboard(selectedDate);
      startTransition(() => {
        setData(result);
      });
    } catch (err) {
      console.error("加载全公司数据失败:", err);
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  const handleRegionClick = useCallback((regionId: string) => {
    const stores = getStoresByRegion(regionId);
    setAvailableStores(stores);
    setSelectedRegionForModal(regionId);
  }, []);

  const handleDateChange = useCallback((date: string) => {
    setSelectedDate(date);
  }, []);

  const handleStoreSelect = useCallback((storeId: string) => {
    navigate(`/store/${storeId}?date=${selectedDate}`);
  }, [navigate, selectedDate]);

  const handleTrendNavigate = useCallback((subjectId: string, subjectName: string) => {
    navigate(`/trend/${subjectId}?mode=company&title=${encodeURIComponent(subjectName)}`);
  }, [navigate]);

  const toggleSubject = useCallback((subjectId: string) => {
    setExpandedSubjects(prev => {
      const next = new Set(prev);
      if (next.has(subjectId)) {
        next.delete(subjectId);
      } else {
        next.add(subjectId);
      }
      return next;
    });
  }, []);

  const formatCurrency = useCallback((val: number) => {
    return (val / 10000).toFixed(1) + '万';
  }, []);

  const renderGrowthBadge = (currentValue: number, prevValue: number | null | undefined, growth: number | undefined, forceGreen: boolean = false) => {
    if (prevValue === null || prevValue === undefined || growth === undefined) {
      return null;
    }

    if (prevValue < 0 && currentValue >= 0) {
      const isGreen = forceGreen;
      return (
        <div className={`mt-2 inline-flex items-center px-2 py-1 rounded text-sm font-bold border ${
          isDark 
            ? (isGreen ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400') 
            : (isGreen ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-red-50 border-red-200 text-red-600')
        }`}>
          <TrendingUp size={14} className="mr-1.5" />
          <span>扭亏</span>
        </div>
      );
    }

    if (prevValue >= 0 && currentValue < 0) {
      return (
        <div className={`mt-2 inline-flex items-center px-2 py-1 rounded text-sm font-bold border ${
          isDark 
            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
            : 'bg-emerald-50 border-emerald-200 text-emerald-600'
        }`}>
          <TrendingDown size={14} className="mr-1.5" />
          <span>转亏</span>
        </div>
      );
    }

    const isPositive = growth >= 0;
    const isGreen = forceGreen || !isPositive;
    return (
      <div className={`mt-2 inline-flex items-center px-2 py-1 rounded text-sm font-bold border ${
        !isGreen 
          ? isDark ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-red-50 border-red-200 text-red-600'
          : isDark ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-600'
      }`}>
        {isPositive ? <TrendingUp size={14} className="mr-1.5" /> : <TrendingDown size={14} className="mr-1.5" />}
        <span>{Math.abs(growth).toFixed(2)}%</span>
      </div>
    );
  };

  const isSubjectVisible = useCallback((subject: any) => {
    if (subject.isParent) return true;
    let parentId = '';
    if (subject.type === SubjectType.REVENUE) parentId = 'total_rev';
    else if (subject.type === SubjectType.EXPENSE) parentId = 'total_exp';
    else if (subject.type === SubjectType.PROFIT) parentId = 'net_profit';
    return expandedSubjects.has(parentId);
  }, [expandedSubjects]);

  const rankingData = useMemo(() => {
    if (!data) return null;
    return {
      revenue: data.rankings.revenue,
      expense: data.rankings.expense,
      profit: data.rankings.profit,
    };
  }, [data]);

  return (
    <div className="h-full overflow-y-auto overflow-x-hidden relative pb-24 md:pb-6">
      <header className={`sticky top-0 z-40 backdrop-blur-md border-b px-6 py-5 flex justify-between items-center ${
        isDark 
          ? 'bg-slate-950/70 border-white/5' 
          : 'bg-white/80 border-slate-200'
      }`}>
        <div className="flex items-center space-x-3">
          <h1 className={`text-2xl font-bold tracking-wide leading-tight font-heading ${isDark ? 'text-white' : 'text-slate-800'}`}>
            安居乐寓<br /><span className={`text-lg font-normal ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>门店核算看板</span>
          </h1>
        </div>

        <div className="relative group" onClick={() => setIsDatePickerOpen(true)}>
          <div className={`flex items-center space-x-2 border px-4 py-2 rounded-full text-base font-medium transition-colors cursor-pointer ${
            isDark 
              ? 'bg-white/5 border-white/10 text-blue-300 hover:bg-white/10 hover:border-blue-500/30 shadow-inner shadow-black/20' 
              : 'bg-slate-100 border-slate-200 text-blue-600 hover:bg-slate-200 hover:border-blue-300'
          }`}>
            <span className="tabular-nums tracking-wide">{selectedDate.replace('-', '.')}</span>
            <ChevronDown size={16} className={isDark ? 'text-blue-400/70' : 'text-blue-500/70'} />
          </div>
        </div>
      </header>

      <div className="p-4 md:p-8 space-y-6 md:space-y-8 max-w-7xl mx-auto">

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-8">
          <div
            onClick={() => handleTrendNavigate('net_profit', '净利润')}
            className={`col-span-2 md:col-span-1 relative overflow-hidden rounded-2xl border shadow-xl cursor-pointer group active:scale-[0.99] transition-all duration-200 ${
              isDark 
                ? 'bg-gradient-to-b from-slate-800/40 to-slate-900/40 backdrop-blur-xl border-white/10 hover:border-blue-500/30' 
                : 'bg-white border-slate-200 hover:border-blue-300 shadow-lg'
            }`}
          >
            <div className="absolute top-0 right-0 p-4 opacity-20">
              {data && data.profitGrowth < 0 ? (
                <TrendingDown size={80} className={`md:w-[120px] md:h-[120px] ${isDark ? 'text-blue-500' : 'text-blue-500'} group-hover:scale-110 transition-transform duration-500`} />
              ) : (
                <TrendingUp size={80} className={`md:w-[120px] md:h-[120px] ${isDark ? 'text-blue-500' : 'text-blue-500'} group-hover:scale-110 transition-transform duration-500`} />
              )}
            </div>
            <div className="absolute bottom-4 right-4 transition-opacity">
              <ChevronRightIcon size={20} className="md:w-6 md:h-6 text-blue-500" />
            </div>
            <div className="p-5 md:p-8 relative z-10">
              <div className="flex items-center space-x-2 mb-2 md:mb-3">
                <p className={`text-xs md:text-base font-medium uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>净利润 (全公司)</p>
              </div>
              <div className="flex items-baseline space-x-2 md:space-x-3">
                <span className={`text-2xl md:text-4xl font-bold tracking-tight ${isDark ? 'text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]' : 'text-slate-800'}`}>
                  {loading ? '...' : `¥${((data?.totalProfit || 0) / 10000).toFixed(2)}万`}
                </span>
              </div>
              {data && renderGrowthBadge(data.totalProfit, data.prevProfit, data.profitGrowth)}
            </div>
            <div className={`h-1 md:h-1.5 w-full ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
              <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 w-[65%]"></div>
            </div>
          </div>

          <div
            onClick={() => handleTrendNavigate('total_rev', '总收入')}
            className={`p-4 md:p-6 rounded-2xl border transition-all cursor-pointer group relative flex flex-col justify-between active:scale-[0.99] ${
              isDark 
                ? 'bg-slate-900/40 backdrop-blur-md border-white/5 hover:border-blue-500/30' 
                : 'bg-white border-slate-200 hover:border-blue-300 shadow-sm'
            }`}
          >
            <div className="absolute top-3 md:top-4 right-3 md:right-4 transition-opacity">
              <ChevronRightIcon size={16} className="md:w-5 md:h-5 text-blue-500/50" />
            </div>
            <div>
              <div className="flex justify-between items-start">
                <p className={`text-xs md:text-sm font-bold uppercase tracking-widest mb-2 md:mb-3 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>总收入</p>
              </div>
              <p className={`text-xl md:text-4xl font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                {loading ? '...' : formatCurrency(data?.totalRevenue || 0)}
              </p>
            </div>
            <div>
              {data && renderGrowthBadge(data.totalRevenue, data.prevRevenue, data.revenueGrowth)}
            </div>
          </div>

          <div
            onClick={() => handleTrendNavigate('total_exp', '总支出')}
            className={`p-4 md:p-6 rounded-2xl border transition-all cursor-pointer group relative flex flex-col justify-between active:scale-[0.99] ${
              isDark 
                ? 'bg-slate-900/40 backdrop-blur-md border-white/5 hover:border-blue-500/30' 
                : 'bg-white border-slate-200 hover:border-blue-300 shadow-sm'
            }`}
          >
            <div className="absolute top-3 md:top-4 right-3 md:right-4 transition-opacity">
              <ChevronRightIcon size={16} className="md:w-5 md:h-5 text-blue-500/50" />
            </div>
            <div>
              <div className="flex justify-between items-start">
                <p className={`text-xs md:text-sm font-bold uppercase tracking-widest mb-2 md:mb-3 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>总支出</p>
              </div>
              <p className={`text-xl md:text-4xl font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                {loading ? '...' : formatCurrency(data?.totalExpense || 0)}
              </p>
            </div>
            <div>
              {data && renderGrowthBadge(data.totalExpense, data.prevExpense, data.expenseGrowth, true)}
            </div>
          </div>
        </div>

        <Suspense fallback={
          <div className={`hidden md:flex h-[400px] items-center justify-center border rounded-2xl font-mono text-sm ${
            isDark ? 'bg-slate-900/30 border-white/5 text-slate-600' : 'bg-slate-50 border-slate-200 text-slate-400'
          }`}>
            地图加载中...
          </div>
        }>
          <BMapContainer onClickStore={(id) => navigate(`/store/${id}?date=${selectedDate}`)} />
        </Suspense>

        <div className={`border rounded-2xl overflow-hidden ${
          isDark 
            ? 'border-white/5 bg-slate-900/30 backdrop-blur-sm' 
            : 'border-slate-200 bg-white shadow-sm'
        }`}>
          <div className={`px-8 py-5 border-b flex justify-between items-center ${
            isDark 
              ? 'border-white/5 bg-slate-900/50' 
              : 'border-slate-100 bg-slate-50'
          }`}>
            <h2 className={`text-base font-bold uppercase tracking-widest ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>战区经营数据明细</h2>
            <div className="flex space-x-1.5">
              <div className={`w-2 h-2 rounded-full animate-pulse ${isDark ? 'bg-blue-500' : 'bg-blue-500'}`}></div>
              <div className={`w-2 h-2 rounded-full ${isDark ? 'bg-slate-700' : 'bg-slate-300'}`}></div>
            </div>
          </div>

          {loading ? (
            <div className={`h-64 flex items-center justify-center font-mono text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>加密数据流加载中...</div>
          ) : (
            <div className="relative w-full overflow-hidden">
              <div className="overflow-x-auto">
                <MatrixTable
                  data={data}
                  expandedSubjects={expandedSubjects}
                  onToggleSubject={toggleSubject}
                  onRegionClick={handleRegionClick}
                  onTrendNavigate={handleTrendNavigate}
                  formatCurrency={formatCurrency}
                  isSubjectVisible={isSubjectVisible}
                />
              </div>
            </div>
          )}
        </div>

        <div className="mt-10">
          <h2 className={`font-bold text-xl mb-6 flex items-center ${isDark ? 'text-white' : 'text-slate-800'}`}>
            <Award size={24} className={`${isDark ? 'text-blue-400' : 'text-blue-500'} mr-3`} />
            门店排行榜 (Top 10)
          </h2>

          <div className={`md:hidden rounded-2xl overflow-hidden shadow-lg ${
            isDark 
              ? 'bg-slate-900/40 border border-white/5 backdrop-blur-sm' 
              : 'bg-white border border-slate-200'
          }`}>
            <div className={`flex border-b ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
              <button onClick={() => setRankingTab('revenue')} className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider transition-colors flex items-center justify-center space-x-2 ${
                rankingTab === 'revenue' 
                  ? isDark ? 'bg-blue-500/10 text-blue-400 border-b-2 border-blue-500' : 'bg-blue-50 text-blue-600 border-b-2 border-blue-500'
                  : isDark ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'
              }`}>
                <Coins size={18} /><span>总收入</span>
              </button>
              <button onClick={() => setRankingTab('expense')} className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider transition-colors flex items-center justify-center space-x-2 ${
                rankingTab === 'expense' 
                  ? isDark ? 'bg-emerald-500/10 text-emerald-400 border-b-2 border-emerald-500' : 'bg-emerald-50 text-emerald-600 border-b-2 border-emerald-500'
                  : isDark ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'
              }`}>
                <Wallet size={18} /><span>总支出</span>
              </button>
              <button onClick={() => setRankingTab('profit')} className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider transition-colors flex items-center justify-center space-x-2 ${
                rankingTab === 'profit' 
                  ? isDark ? 'bg-red-500/10 text-red-400 border-b-2 border-red-500' : 'bg-red-50 text-red-600 border-b-2 border-red-500'
                  : isDark ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'
              }`}>
                <TrendingUp size={18} /><span>净利润</span>
              </button>
            </div>
            <div className="p-4 min-h-[300px]">
              {loading || !rankingData ? (<div className={`flex items-center justify-center h-48 font-mono text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>排行数据分析中...</div>) : (
                <RankingList items={rankingData[rankingTab]} type={rankingTab} onClickStore={handleStoreSelect} />
              )}
            </div>
          </div>

          <div className="hidden md:grid grid-cols-3 gap-8">
            {['revenue', 'expense', 'profit'].map((type) => (
              <div key={type} className={`rounded-2xl overflow-hidden shadow-lg flex flex-col h-full ${
                isDark 
                  ? 'bg-slate-900/40 border border-white/5 backdrop-blur-sm' 
                  : 'bg-white border border-slate-200'
              }`}>
                <div className={`py-4 px-6 border-b flex items-center space-x-3 ${
                  isDark 
                    ? 'border-white/5 bg-slate-800/30' 
                    : 'border-slate-100 bg-slate-50'
                }`}>
                  {type === 'revenue' && <Coins size={18} className={isDark ? 'text-blue-400' : 'text-blue-500'} />}
                  {type === 'expense' && <Wallet size={18} className={isDark ? 'text-emerald-400' : 'text-emerald-500'} />}
                  {type === 'profit' && <TrendingUp size={18} className={isDark ? 'text-red-400' : 'text-red-500'} />}
                  <span className={`text-sm font-bold uppercase tracking-wider ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    {type === 'revenue' ? '总收入' : type === 'expense' ? '总支出' : '净利润'} Top 10
                  </span>
                </div>
                <div className="p-6 flex-1">
                  {loading || !rankingData ? (<div className={`flex items-center justify-center h-32 font-mono text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>...</div>) : (
                    <RankingList items={rankingData[type as 'revenue' | 'expense' | 'profit']} type={type as any} onClickStore={handleStoreSelect} />
                  )}
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>

      {selectedRegionForModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setSelectedRegionForModal(null)}>
          <div className={`w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden transform transition-all ${
            isDark 
              ? 'bg-slate-900 border border-white/10 shadow-blue-900/20' 
              : 'bg-white border border-slate-200'
          }`} onClick={e => e.stopPropagation()}>
            <div className={`p-6 border-b flex justify-between items-center ${
              isDark 
                ? 'border-white/10 bg-slate-800/50' 
                : 'border-slate-100 bg-slate-50'
            }`}>
              <h3 className={`font-bold text-xl tracking-tight ${isDark ? 'text-white' : 'text-slate-800'}`}>
                选择门店 <span className={`text-base font-normal ml-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>({REGIONS.find(r => r.id === selectedRegionForModal)?.name})</span>
              </h3>
              <button onClick={() => setSelectedRegionForModal(null)} className={`${isDark ? 'text-slate-500 hover:text-white' : 'text-slate-400 hover:text-slate-600'} transition-colors`}>✕</button>
            </div>
            <div className="max-h-[50vh] overflow-y-auto p-3">
              {availableStores.length > 0 ? (
                availableStores.map(store => (
                  <button
                    key={store.id}
                    onClick={() => handleStoreSelect(store.id)}
                    className={`w-full text-left p-5 rounded-xl cursor-pointer flex justify-between items-center group transition-all mb-1 border ${
                      isDark 
                        ? 'hover:bg-white/5 border-transparent hover:border-white/5' 
                        : 'hover:bg-slate-50 border-transparent hover:border-slate-200'
                    }`}
                  >
                    <span className={`font-medium text-lg transition-colors ${isDark ? 'text-slate-300 group-hover:text-blue-400' : 'text-slate-600 group-hover:text-blue-600'}`}>{store.name}</span>
                    <span className={`text-lg ${isDark ? 'text-slate-600 group-hover:text-blue-400/50' : 'text-slate-300 group-hover:text-blue-400'}`}>→</span>
                  </button>
                ))
              ) : (
                <div className={`p-8 text-center font-mono text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>未发现活跃节点</div>
              )}
            </div>
          </div>
        </div>
      )}

      <MonthPicker
        isOpen={isDatePickerOpen}
        onClose={() => setIsDatePickerOpen(false)}
        currentDate={selectedDate}
        onSelect={handleDateChange}
      />
    </div>
  );
};

export default Dashboard;
