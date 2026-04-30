import React, { useEffect, useState, useRef } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ArrowLeft } from 'lucide-react';
import { fetchTrendData } from '../services/mockData';
import { useBenchmark } from '../App';
import { useTheme } from '../contexts/ThemeContext';

const TrendAnalysis: React.FC = () => {
  const { subjectId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { selectedStores } = useBenchmark();
  const { isDark } = useTheme();
  
  const title = searchParams.get('title') || '趋势分析';
  const mode = searchParams.get('mode');
  const urlStoreIds = searchParams.get('stores')?.split(',') || [];
  
  const targetStoreIds = urlStoreIds.length > 0 ? urlStoreIds : selectedStores.map(s => s.id);
  const targetStores = selectedStores.filter(s => targetStoreIds.includes(s.id));

  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const abortControllerRef = useRef<AbortController | null>(null);

  const isCompanyMode = mode === 'company';

  useEffect(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    const load = async () => {
      setLoading(true);
      try {
        const idsToFetch = isCompanyMode ? [] : targetStoreIds;
        const res = await fetchTrendData(idsToFetch, subjectId || '');
        if (!abortControllerRef.current?.signal.aborted) {
          setData(res);
        }
      } catch (err) {
        if (err instanceof Error && err.name !== 'AbortError') {
          console.error('加载趋势数据失败:', err);
        }
      } finally {
        if (!abortControllerRef.current?.signal.aborted) {
          setLoading(false);
        }
      }
    };
    load();

    return () => {
      abortControllerRef.current?.abort();
    };
  }, [subjectId, targetStoreIds.length, isCompanyMode]);

  const COLORS = ['#22D3EE', '#F472B6', '#34D399', '#A78BFA', '#FB923C'];

  return (
    <div className={`h-full overflow-y-auto relative z-10 flex flex-col pb-24 md:pb-6 ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`}>
      <nav className={`backdrop-blur-md p-6 flex items-center border-b sticky top-0 z-30 ${
        isDark ? 'bg-slate-950/80 border-white/5' : 'bg-white/80 border-slate-200'
      }`}>
        <button onClick={() => navigate(-1)} className={`mr-5 transition-colors ${isDark ? 'text-slate-500 hover:text-white' : 'text-slate-400 hover:text-slate-700'}`}>
          <ArrowLeft size={24} />
        </button>
        <h1 className={`font-bold text-xl tracking-wide ${isDark ? 'text-white' : 'text-slate-800'}`}>
          {title} 
          <span className={`text-base font-normal opacity-50 ${isDark ? 'text-cyan-400' : 'text-blue-500'}`}>
            {' '}/ {isCompanyMode ? '全公司趋势' : '数据分析'}
          </span>
        </h1>
      </nav>

      <div className="flex-1 p-6 max-w-7xl mx-auto w-full">
        <div className={`rounded-2xl p-6 h-[400px] md:h-[500px] mb-6 backdrop-blur-sm shadow-xl ${
          isDark 
            ? 'bg-slate-900/40 border border-white/5' 
            : 'bg-white border border-slate-200'
        }`}>
          {loading ? (
            <div className={`h-full flex items-center justify-center font-mono text-sm ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
              数据流分析中...
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  vertical={false} 
                  stroke={isDark ? '#1e293b' : '#E2E8F0'} 
                />
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 14, fill: isDark ? '#64748B' : '#64748B', fontFamily: 'monospace' }} 
                  axisLine={{ stroke: isDark ? '#334155' : '#CBD5E1' }} 
                  tickLine={false} 
                  dy={10}
                />
                <YAxis 
                  tick={{ fontSize: 14, fill: isDark ? '#64748B' : '#64748B', fontFamily: 'monospace' }} 
                  axisLine={false} 
                  tickLine={false} 
                  tickFormatter={(val) => `${val/10000}w`} 
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: isDark ? '#020617' : '#FFFFFF',
                    borderRadius: '8px',
                    border: isDark ? '1px solid #334155' : '1px solid #E2E8F0',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)'
                  }}
                  itemStyle={{ fontSize: '14px', color: isDark ? '#CBD5E1' : '#475569' }}
                  labelStyle={{ 
                    fontSize: '14px', 
                    fontWeight: 'bold', 
                    color: isDark ? '#94a3b8' : '#475569', 
                    marginBottom: '8px', 
                    fontFamily: 'monospace' 
                  }}
                  formatter={(value: number) => [`¥${value.toLocaleString()}`, '']}
                />
                <Legend 
                  verticalAlign="top" 
                  height={40} 
                  iconType="circle" 
                  iconSize={10}
                  wrapperStyle={{ fontSize: '14px', fontFamily: 'monospace', color: isDark ? '#cbd5e1' : '#475569' }}
                />
                
                {isCompanyMode ? (
                  <Line 
                    type="monotone" 
                    dataKey="company" 
                    name="全公司总计"
                    stroke={isDark ? '#22D3EE' : '#3B82F6'} 
                    strokeWidth={3}
                    dot={{ r: 5, strokeWidth: 0, fill: isDark ? '#22D3EE' : '#3B82F6' }}
                    activeDot={{ r: 8, stroke: '#fff', strokeWidth: 2, fill: isDark ? '#22D3EE' : '#3B82F6' }}
                    style={{ filter: isDark ? `drop-shadow(0 0 8px rgba(34,211,238,0.5))` : undefined }}
                  />
                ) : (
                  targetStoreIds.map((sid, idx) => {
                    const storeName = targetStores.find(s => s.id === sid)?.name || sid;
                    const color = isDark ? COLORS[idx % COLORS.length] : ['#3B82F6', '#F472B6', '#34D399', '#A78BFA', '#FB923C'][idx % 5];
                    return (
                      <Line 
                        key={sid}
                        type="monotone" 
                        dataKey={sid} 
                        name={storeName}
                        stroke={color} 
                        strokeWidth={2}
                        dot={{ r: 4, strokeWidth: 0, fill: color }}
                        activeDot={{ r: 7, stroke: '#fff', strokeWidth: 2, fill: color }}
                        style={{ filter: isDark ? `drop-shadow(0 0 4px ${color})` : undefined }}
                      />
                    );
                  })
                )}
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Data Table */}
        {!loading && (
          <div className={`rounded-2xl overflow-hidden backdrop-blur-sm ${
            isDark 
              ? 'bg-slate-900/30 border border-white/5' 
              : 'bg-white border border-slate-200'
          }`}>
            <div className={`p-5 border-b font-bold text-sm uppercase tracking-widest font-mono ${
              isDark 
                ? 'bg-white/5 border-white/5 text-slate-500' 
                : 'bg-slate-50 border-slate-200 text-slate-500'
            }`}>
              近期数据点
            </div>
            <div className={`divide-y ${isDark ? 'divide-white/5' : 'divide-slate-100'}`}>
              {data.slice(-4).reverse().map((row, i) => (
                <div 
                  key={i} 
                  className={`flex justify-between p-5 text-base transition-colors ${
                    isDark ? 'hover:bg-white/[0.02]' : 'hover:bg-slate-50'
                  }`}
                >
                  <span className={`font-bold font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {row.month}
                  </span>
                  <div className="flex space-x-6">
                    {isCompanyMode ? (
                      <div className="flex flex-col items-end">
                        <span className={`mb-0.5 text-xs font-bold uppercase tracking-wider opacity-70 ${
                          isDark ? 'text-cyan-400' : 'text-blue-500'
                        }`}>
                          COMPANY
                        </span>
                        <span className={`tabular-nums font-mono text-base ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                          {(row.company/10000).toFixed(1)}w
                        </span>
                      </div>
                    ) : (
                      targetStoreIds.map((sid, idx) => {
                        const color = isDark ? COLORS[idx % COLORS.length] : ['#3B82F6', '#F472B6', '#34D399', '#A78BFA', '#FB923C'][idx % 5];
                        return (
                          <div key={sid} className="flex flex-col items-end">
                            <span style={{ color }} className="mb-0.5 text-xs font-bold uppercase tracking-wider opacity-70">
                              {targetStores.find(s => s.id === sid)?.name.slice(0,3)}
                            </span>
                            <span className={`tabular-nums font-mono text-base ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                              {(row[sid]/10000).toFixed(1)}w
                            </span>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrendAnalysis;
