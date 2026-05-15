'use client';

import { useEffect, useState } from 'react';
import { 
  ArrowLeft, Activity, Calculator, TrendingUp, 
  Calendar, Rocket, Leaf, MessageSquare, Clock 
} from 'lucide-react';
import Link from 'next/link';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer
} from 'recharts';

export default function DashboardPage({ params }: { params: { id: string } }) {
  const [data, setData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('logistics');

  useEffect(() => {
    const gasUrl = "https://script.google.com/macros/s/AKfycbyosyzeCglI2Pz2GWh_dbZXAgDslEV5DZrws5ulw24GrkI-fShocaWUdOLMfaNh_m0_/exec";
    fetch(gasUrl)
      .then(res => res.json())
      .then(json => setData(json))
      .catch(err => console.error("Fetch error:", err));
  }, []);

  if (!data) return (
    <div className="h-screen bg-slate-950 flex flex-col items-center justify-center text-blue-500 font-mono animate-pulse uppercase tracking-[0.5em]">
      SVG_ENGINE_STARTING...
    </div>
  );

  const MiniChartCard = ({ title, labels, values, color }: any) => {
    const chartData = (labels || []).map((l: string, i: number) => ({ name: l, val: values ? values[i] : 0 }));
    const gradientId = `grad-${title.replace(/\s+/g, '')}`;
    return (
      <div className="bg-slate-900/60 border border-white/10 p-5 rounded-[1.5rem] hover:border-white/30 transition-all shadow-xl group">
        <h4 className="text-[9px] font-black text-slate-400 mb-3 tracking-tighter uppercase group-hover:text-white transition-colors border-l-2 border-current pl-2 truncate">
          {title}
        </h4>
        <div className="h-[120px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={color} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
              <XAxis dataKey="name" hide />
              <YAxis hide domain={['auto', 'auto']} />
              <Tooltip contentStyle={{backgroundColor:'#0f172a', border:'none', borderRadius:'10px', fontSize:'9px'}} />
              <Area type="monotone" dataKey="val" stroke={color} fill={`url(#${gradientId})`} strokeWidth={2} isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  const tabs = [
    { id: 'sales', label: '1. 売上・原価', icon: Calculator, color: '#3b82f6', dataKey: 'salesData' },
    { id: 'logistics', label: '2. 物量・工数', icon: Activity, color: '#10b981', dataKey: 'logisticsData' },
    { id: 'productivity', label: '3. 生産性', icon: TrendingUp, color: '#f59e0b', dataKey: 'productivityData' },
    { id: 'monthly', label: '4. 月次', icon: Calendar, color: '#eab308', dataKey: 'monthlyData' },
    { id: 'dx', label: '5. DX推進', icon: Rocket, color: '#a855f7', dataKey: 'dxProgress' },
    { id: 'env', label: '6. 環境改善', icon: Leaf, color: '#06b6d4', dataKey: 'envProgress' },
    { id: 'history', label: '7. 営業履歴', icon: MessageSquare, color: '#f43f5e', dataKey: 'salesHistory' },
    { id: 'manhours', label: '8. 工数', icon: Clock, color: '#64748b', dataKey: '' },
  ];

  const currentTab = tabs.find(t => t.id === activeTab);

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans text-[9px] tracking-widest pb-20">
      <header className="h-16 bg-slate-900/90 border-b border-white/5 px-10 flex justify-between items-center sticky top-0 z-50 backdrop-blur-md">
        <Link href="/" className="flex items-center gap-3 text-slate-500 no-underline font-black hover:text-white transition-all">
          <ArrowLeft size={14} /> <span>EXIT_COMMAND</span>
        </Link>
        <h1 className="text-lg font-black italic tracking-tighter m-0 uppercase">{params.id}_STATION</h1>
        <div className="text-blue-500 font-mono text-[8px] animate-pulse">SYSTEM_ACTIVE | {data.lastUpdate}</div>
      </header>

      <main className="p-6 max-w-[2400px] mx-auto space-y-6">
        <div className="flex flex-wrap gap-2">
          {tabs.map((t) => (
            <button key={t.id} onClick={() => setActiveTab(t.id)} className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all border font-black ${activeTab === t.id ? `bg-white/10 text-white border-white/30 shadow-lg` : 'bg-slate-900/40 border-white/5 text-slate-500 hover:bg-slate-800'}`}>
              <t.icon size={12} style={{color: t.color}} /> {t.label}
            </button>
          ))}
        </div>

        <div className="min-h-[70vh]">
          {['sales', 'logistics', 'productivity', 'monthly'].includes(activeTab) && (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-7 gap-3">
              {data[currentTab?.dataKey || '']?.map((m: any, i: number) => (
                <MiniChartCard key={i} title={m.title} labels={data.labels} values={m.values} color={currentTab?.color} />
              ))}
            </div>
          )}

          {(activeTab === 'dx' || activeTab === 'env') && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl">
              {data[currentTab?.dataKey || '']?.map((item: any, i: number) => (
                <div key={i} className="bg-slate-900/50 p-10 rounded-[2.5rem] border border-white/10 shadow-2xl">
                  <div className="flex justify-between items-end mb-4">
                    <span className="text-xl font-black italic tracking-tight">{item.task || item.item}</span>
                    <span className="text-3xl font-mono text-blue-500">{item.progress}%</span>
                  </div>
                  <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                    <div className="bg-blue-500 h-full transition-all duration-1000" style={{ width: `${item.progress}%` }}></div>
                  </div>
                  <div className="mt-3 text-[8px] text-slate-500 font-bold uppercase tracking-[0.2em]">{item.status}</div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-3 max-w-4xl">
              {data.salesHistory?.map((log: any, i: number) => (
                <div key={i} className="bg-slate-900/50 p-6 rounded-2xl border border-white/10 flex gap-8 items-center hover:bg-slate-800/50 transition-colors">
                  <div className="text-rose-500 font-mono font-black border-r border-white/10 pr-8 w-20 text-center">{log.date}</div>
                  <div>
                    <div className="text-white text-base font-black mb-1">{log.client}</div>
                    <div className="text-slate-500 italic leading-relaxed">{log.content}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}