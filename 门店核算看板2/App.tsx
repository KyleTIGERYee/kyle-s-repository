import React, { createContext, useContext, useState, useEffect, ReactNode, Suspense, lazy } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Home, PieChart as PieChartIcon, Activity, Bot, TrendingUp, Sun, Moon } from 'lucide-react';
import { Store } from './types';
import { STORES, ensureResourcesInitialized, getPreviousMonth } from './services/mockData';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';

const Dashboard = lazy(() => import('./views/Dashboard'));
const StoreOverview = lazy(() => import('./views/StoreOverview'));
const Benchmark = lazy(() => import('./views/Benchmark'));
const TrendAnalysis = lazy(() => import('./views/TrendAnalysis'));
const AIChat = lazy(() => import('./views/AIChat'));

const PageLoading: React.FC = () => {
  const { isDark } = useTheme();
  return (
    <div className={`min-h-screen flex flex-col items-center justify-center space-y-6 ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`}>
      <div className={`w-12 h-12 border-4 ${isDark ? 'border-blue-500/20 border-t-blue-500' : 'border-blue-200 border-t-blue-500'} rounded-full animate-spin`}></div>
      <p className={`font-mono tracking-widest text-sm animate-pulse ${isDark ? 'text-blue-500' : 'text-blue-600'}`}>页面加载中...</p>
    </div>
  );
};

interface BenchmarkContextType {
  selectedStores: Store[];
  addStore: (store: Store) => void;
  removeStore: (storeId: string) => void;
}

const BenchmarkContext = createContext<BenchmarkContextType | undefined>(undefined);

export const useBenchmark = () => {
  const context = useContext(BenchmarkContext);
  if (!context) throw new Error('useBenchmark must be used within provider');
  return context;
};

const BenchmarkProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedStores, setSelectedStores] = useState<Store[]>([]);

  const addStore = (store: Store) => {
    if (!selectedStores.find(s => s.id === store.id) && selectedStores.length < 5) {
      setSelectedStores([...selectedStores, store]);
    }
  };

  const removeStore = (storeId: string) => {
    setSelectedStores(selectedStores.filter(s => s.id !== storeId));
  };

  return (
    <BenchmarkContext.Provider value={{ selectedStores, addStore, removeStore }}>
      {children}
    </BenchmarkContext.Provider>
  );
};

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme, isDark } = useTheme();
  
  return (
    <button
      onClick={toggleTheme}
      className={`p-2.5 rounded-xl transition-all duration-200 ${
        isDark 
          ? 'bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-yellow-400' 
          : 'bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-amber-500'
      }`}
      title={isDark ? '切换到亮色模式' : '切换到暗色模式'}
    >
      {isDark ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
};

const Sidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isDark } = useTheme();

  const defaultStoreId = STORES.length > 0 ? STORES[0].id : '';

  const navItems = [
    { path: '/', icon: Home, label: '总览' },
    { path: defaultStoreId ? `/store/${defaultStoreId}` : '#', icon: PieChartIcon, label: '门店概览', activeCheck: (p: string) => p.startsWith('/store/') },
    { path: '/benchmark', icon: Activity, label: '分析对比' },
    { path: '/ai-chat', icon: Bot, label: 'AI问数' },
  ];

  return (
    <div className={`hidden md:flex flex-col w-64 h-screen sticky top-0 shrink-0 z-50 border-r ${
      isDark 
        ? 'bg-slate-900/80 backdrop-blur-xl border-white/5' 
        : 'bg-white border-slate-200 shadow-sm'
    }`}>
      <div className="p-6">
        <h1 className="text-3xl font-bold tracking-wide flex items-center gap-2 cursor-pointer font-heading" onClick={() => navigate('/')}>
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center shadow-lg ${
            isDark 
              ? 'bg-gradient-to-tr from-cyan-500 to-blue-600 shadow-cyan-500/20' 
              : 'bg-gradient-to-tr from-blue-500 to-indigo-600 shadow-blue-500/30'
          }`}>
            <TrendingUp size={24} className="text-white" />
          </div>
          <span className={isDark ? 'bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400' : 'text-slate-800'}>安居乐寓</span>
        </h1>
        <p className={`text-base mt-2 font-mono pl-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>门店核算看板</p>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        {navItems.map(item => {
          const isActive = item.activeCheck ? item.activeCheck(location.pathname) : location.pathname === item.path;
          const isDisabled = item.path === '#';

          return (
            <button
              key={item.label}
              onClick={() => !isDisabled && navigate(item.path)}
              disabled={isDisabled}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive
                  ? isDark
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-[0_0_15px_-5px_rgba(34,211,238,0.3)]'
                    : 'bg-blue-50 text-blue-600 border border-blue-200 shadow-sm'
                  : isDisabled
                    ? isDark ? 'text-slate-700 opacity-50 cursor-not-allowed' : 'text-slate-300 opacity-50 cursor-not-allowed'
                    : isDark
                      ? 'text-slate-400 hover:bg-white/5 hover:text-slate-200 border border-transparent'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700 border border-transparent'
              }`}
            >
              <item.icon size={24} className={isActive ? (isDark ? 'animate-pulse' : '') : 'group-hover:scale-110 transition-transform'} />
              <span className="font-medium text-lg">{item.label}</span>
            </button>
          )
        })}
      </nav>

      <div className="p-4 border-t border-slate-200 dark:border-white/5">
        <ThemeToggle />
      </div>
    </div>
  );
};

const BottomNav: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const isStorePage = location.pathname.startsWith('/store/');
  const isHomePage = location.pathname === '/';
  const isBenchmarkPage = location.pathname === '/benchmark';
  const isAiPage = location.pathname === '/ai-chat';

  if (isAiPage) return null;

  return (
    <div className="md:hidden fixed bottom-6 left-0 right-0 z-50 flex justify-center pointer-events-none">
      <div className={`backdrop-blur-xl border rounded-2xl px-6 py-3 shadow-2xl pointer-events-auto flex items-center space-x-6 ${
        isDark 
          ? 'bg-slate-900/90 border-white/10 shadow-black/50' 
          : 'bg-white/95 border-slate-200 shadow-slate-300/50'
      }`}>
        <button onClick={() => navigate('/')} className={`flex flex-col items-center justify-center space-y-1 transition-all ${
          isHomePage 
            ? isDark ? 'text-cyan-400 scale-105 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]' : 'text-blue-600 scale-105'
            : isDark ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'
        }`}>
          <Home size={24} strokeWidth={isHomePage ? 2.5 : 2} />
          <span className="text-xs font-medium">总览</span>
        </button>
        <button
          onClick={() => { if (!isStorePage) { const defaultStoreId = STORES[0]?.id; if (defaultStoreId) navigate(`/store/${defaultStoreId}`); } }}
          className={`flex flex-col items-center justify-center space-y-1 transition-all ${
            isStorePage 
              ? isDark ? 'text-cyan-400 scale-105 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]' : 'text-blue-600 scale-105'
              : isDark ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <PieChartIcon size={24} strokeWidth={isStorePage ? 2.5 : 2} />
          <span className="text-xs font-medium">门店</span>
        </button>
        <button onClick={() => navigate('/benchmark')} className={`flex flex-col items-center justify-center space-y-1 transition-all ${
          isBenchmarkPage 
            ? isDark ? 'text-cyan-400 scale-105 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]' : 'text-blue-600 scale-105'
            : isDark ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'
        }`}>
          <Activity size={24} strokeWidth={isBenchmarkPage ? 2.5 : 2} />
          <span className="text-xs font-medium">对比</span>
        </button>
        <button onClick={() => navigate('/ai-chat')} className={`flex flex-col items-center justify-center space-y-1 transition-all ${
          isAiPage 
            ? isDark ? 'text-cyan-400 scale-105 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]' : 'text-blue-600 scale-105'
            : isDark ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'
        }`}>
          <Bot size={24} strokeWidth={isAiPage ? 2.5 : 2} />
          <span className="text-xs font-medium">AI</span>
        </button>
        <div className={`w-px h-8 ${isDark ? 'bg-white/10' : 'bg-slate-200'}`}></div>
        <button onClick={toggleTheme} className={`flex flex-col items-center justify-center space-y-1 transition-all ${
          isDark ? 'text-slate-500 hover:text-yellow-400' : 'text-slate-400 hover:text-amber-500'
        }`}>
          {isDark ? <Sun size={24} /> : <Moon size={24} />}
          <span className="text-xs font-medium">{isDark ? '亮色' : '暗色'}</span>
        </button>
      </div>
    </div>
  );
};

const AppContent: React.FC = () => {
  const [initialized, setInitialized] = useState(false);
  const { isDark } = useTheme();

  useEffect(() => {
    const init = async () => {
      try {
        await ensureResourcesInitialized(getPreviousMonth());
      } catch (e) {
        console.error('应用初始化失败:', e);
      } finally {
        setInitialized(true);
      }
    };
    init();
  }, []);

  if (!initialized) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center space-y-6 ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`}>
        <div className={`w-16 h-16 border-4 ${isDark ? 'border-blue-500/20 border-t-blue-500' : 'border-blue-200 border-t-blue-500'} rounded-full animate-spin`}></div>
        <p className={`font-mono tracking-widest text-lg animate-pulse ${isDark ? 'text-blue-500' : 'text-blue-600'}`}>系统初始化中...</p>
      </div>
    );
  }

  return (
    <BenchmarkProvider>
      <HashRouter>
        <div className={`min-h-screen font-sans antialiased flex overflow-hidden ${
          isDark 
            ? 'bg-slate-950 text-slate-200 selection:bg-cyan-500/30' 
            : 'bg-slate-50 text-slate-800 selection:bg-blue-500/30'
        }`}>
          {isDark && (
            <>
              <div className="fixed top-0 left-0 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none -translate-y-1/2 -translate-x-1/2 z-0"></div>
              <div className="fixed bottom-0 right-0 w-[500px] h-[500px] bg-violet-500/10 rounded-full blur-[100px] pointer-events-none translate-y-1/3 translate-x-1/3 z-0"></div>
            </>
          )}

          <Sidebar />

          <div className="flex-1 relative z-10 flex flex-col min-w-0 h-[100dvh]">
            <div className="flex-1 relative overflow-hidden">
              <Suspense fallback={<PageLoading />}>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/store/:storeId" element={<StoreOverview />} />
                  <Route path="/benchmark" element={<Benchmark />} />
                  <Route path="/trend/:subjectId" element={<TrendAnalysis />} />
                  <Route path="/ai-chat" element={<AIChat />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Suspense>
            </div>
            <BottomNav />
          </div>
        </div>
      </HashRouter>
    </BenchmarkProvider>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
};

export default App;
