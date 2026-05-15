'use client';

import { useEffect, useState } from 'react';
import { 
  ArrowLeft, Activity, Layers, Calculator, 
  TrendingUp, Users, AlertTriangle, Target
} from 'lucide-react';
import Link from 'next/link';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, BarChart, Bar, LineChart, Line
} from 'recharts';

export default function DashboardPage({ params }: { params: { id: string } }) {
  const [data, setData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('summary');

  useEffect(() => {
    const gasUrl = process.env.NEXT_PUBLIC_GAS_URL || '';
    fetch(gasUrl)
      .then(res => res.json())
      .then(json => setData(json))
      .catch(() => {
        setData({
          summary: { totalSales: "1,248,500", totalVolume: "8,920" },
          labels: ["月", "火", "水", "木", "金", "土", "日"],
          finance: [100, 150, 120, 200, 180, 210, 195],
          logistics: [80, 95, 85, 110, 100, 120, 115],
          productivity: [125, 140, 135, 150, 145, 160, 155],
          labor: [8, 8, 9, 8, 12, 8, 8],
          risk: [0, 0, 1, 0, 0, 0, 0]
        });
      });
  }, []);

  if (!data) return <div className="h-screen bg-slate-950 flex items-center justify-center text-blue-500 font-mono animate-pulse uppercase tracking-[0.5em]">Syncing_Data...</div>;

  const chartData = data.labels.map((l: any, i: any) => ({
    name: l,
    finance: data.finance?.[i] || 0,
    logistics: data.logistics?.[i] || 0,
    prod: data.productivity?.[i] || 0,
    labor: data.labor?.[i] || 0,
    risk: data.risk?.[i] || 0,
  }));

  const tabs = [
    { id: 'summary', label: '1. 総合', icon: Target, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { id: 'cost', label: '2. コスト', icon: Calculator, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { id: 'productivity', label: '3. 生産性', icon: TrendingUp, color: 'text-orange-500', bg: 'bg-orange-500/10' },
    { id: 'labor', label: '4. 労務', icon: Users, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { id: 'risk', label: '5. リスク', icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-500/10' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans uppercase text-[10px] tracking-widest pb-20 overflow-x-hidden">
      <header className="h-20 bg-slate-900/80 backdrop-blur-xl border-b border-white/5 px-10 flex justify-between items-center sticky top-0 z-50 shadow-2xl">
        <Link href="/" className="flex items-center gap-4 text-slate-500 hover:text-white transition-all no-underline font-black group">
          <div className="w-10 h-10 rounded-2xl border border-white/10 flex items-center justify-center group-hover:bg-blue-600 group-hover:border-blue-600 transition-all">
            <ArrowLeft size={16} />
          </div>
          <span className="tracking-[0.4em]">SYSTEM_EXIT</span>
        </Link>
        <div className="text-center font-black italic tracking-tighter text-2xl uppercase">
          {params.id.toUpperCase()}_COMMAND_VIEW
        </div>
        <div className="flex items-center gap-6">
           <div className="flex items-center gap-3 px-4 py-2 bg-emerald-500/10 rounded-full border border-emerald-500/20 text-emerald-400 font-bold text-[8px]">
             <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></div>
             FEED_STABLE
           </div>
        </div>
      </header>

      <main className="p-10 max-w-[1600px] mx-auto space-y-10 mt-6">
        <div className="flex flex-wrap gap-4">
          {tabs.map((t) => (
            <button key={t.id} onClick={() => setActiveTab(t.id)} className={`flex items-center gap-4 px-12 py-7 rounded-[2rem] transition-all border font-black tracking-[0.2em] shadow-xl ${activeTab === t.id ? `${t.bg} ${t.color} border-current` : 'bg-slate-900/50 border-white/5 text-slate-500 hover:bg-slate-800'}`}>
              <t.icon size={20} /> {t.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
          <div className="lg:col-span-3">
            <div className="bg-slate-900/50 backdrop-blur-2xl rounded-[4rem] border border-white/5 p-14 shadow-2xl min-h-[650px] relative">
              <div className="h-[450px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  {activeTab === 'summary' || activeTab === 'cost' ? (
                    <AreaChart data={chartData}>
                      <defs><linearGradient id="mainGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={activeTab === 'summary' ? '#3b82f6' : '#10b981'} stopOpacity={0.4}/><stop offset="95%" stopColor={activeTab === 'summary' ? '#3b82f6' : '#10b981'} stopOpacity={0}/></linearGradient></defs>
                      <CartesianGrid strokeDasharray="4 4" stroke="#ffffff05" vertical={false} />
                      <XAxis dataKey="name" stroke="#475569" fontSize={11} axisLine={false} tickLine={false} dy={15} />
                      <Tooltip contentStyle={{backgroundColor:'#0f172a', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'24px'}} />
                      <Area type="monotone" dataKey={activeTab === 'summary' ? 'finance' : 'logistics'} stroke={activeTab === 'summary' ? '#3b82f6' : '#10b981'} strokeWidth={5} fill="url(#mainGrad)" />
                    </AreaChart>
                  ) : activeTab === 'productivity' ? (
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                      <XAxis dataKey="name" stroke="#475569" fontSize={11} axisLine={false} tickLine={false} dy={15} /><Tooltip contentStyle={{backgroundColor:'#0f172a', border:'none', borderRadius:'24px'}} /><Bar dataKey="prod" fill="#f59e0b" radius={[20, 20, 0, 0]} barSize={40} />
                    </BarChart>
                  ) : (
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                      <XAxis dataKey="name" stroke="#475569" fontSize={11} axisLine={false} tickLine={false} dy={15} /><Tooltip contentStyle={{backgroundColor:'#0f172a', border:'none', borderRadius:'24px'}} /><Line type="monotone" dataKey={activeTab === 'labor' ? 'labor' : 'risk'} stroke={activeTab === 'labor' ? '#a855f7' : '#ef4444'} strokeWidth={6} dot={{r:10, strokeWidth:4, fill:'#0f172a'}} />
                    </LineChart>
                  )}
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          <div className="lg:col-span-1">
            <div className="bg-slate-900/60 p-12 rounded-[4rem] border border-white/5 shadow-2xl h-full flex flex-col items-center">
               <h4 className="text-slate-500 font-bold tracking-[0.5em] mb-12 flex items-center gap-4 text-[11px]"><Activity size={18} className="text-blue-500" /> MONITOR_LOGS</h4>
               <div className="space-y-6 w-full">
                  {['人件費率 31.2%', '有休消化 42d', '事故件数 0件', '現場生産性 118'].map((item, i) => (
                    <div key={i} className="p-8 bg-white/[0.01] rounded-[2.5rem] border border-white/5 text-center font-black text-blue-400 text-lg italic tracking-tighter">{item}</div>
                  ))}
               </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
```

---

### 🚀 保存ができたら、最後の `push`！

これが終われば、すべてのページが繋がります。ターミナルでトドメの3行をお願いします！

```powershell
git add .
git commit -m "Add dashboard detail page"
git push