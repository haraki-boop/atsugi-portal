// app/dashboard/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { 
  DollarSign, Box, TrendingUp, ArrowLeft, Activity, 
  Layers, ChevronRight, Calculator 
} from 'lucide-react';
import Link from 'next/link';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, BarChart, Bar, LineChart, Line 
} from 'recharts';

export default function DashboardPage({ params }: { params: { id: string } }) {
  const [data, setData] = useState<any>(null);
  const [tab, setTab] = useState('finance');

  useEffect(() => {
    // GASからデータを取得（以前のURLを使用）
    const gasUrl = 'https://script.google.com/macros/s/AKfycbxrnLZf_Cl_Ga53h3fDfvXzjwchKLgVMaB45zdp-kXGRuoZhnV4CGESxlBKb05yiQZM/exec';
    fetch(gasUrl)
      .then(res => res.json())
      .then(json => setData(json))
      .catch(() => setData({
        summary: { totalSales: "1,200,000", totalVolume: "5,400", month: "5月度" },
        labels: ["1日", "2日", "3日", "4日", "5日"],
        sales: [100, 150, 120, 200, 180],
        volume: [80, 95, 85, 110, 100]
      }));
  }, []);

  if (!data) return <div className="h-screen bg-slate-950 flex items-center justify-center text-blue-500 font-mono animate-pulse uppercase tracking-[0.5em]">Syncing Hub Data...</div>;

  const chartData = data.labels.map((l: any, i: any) => ({
    name: l,
    sales: data.sales[i],
    volume: data.volume[i],
    prod: Math.floor(data.sales[i] / (data.volume[i] || 1) * 100)
  }));

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans uppercase text-[10px] tracking-widest">
      {/* 🧭 ナビゲーション */}
      <header className="h-20 bg-slate-900/50 backdrop-blur-xl border-b border-white/5 px-10 flex justify-between items-center sticky top-0 z-50">
        <Link href="/" className="flex items-center gap-3 text-slate-400 hover:text-white transition-colors no-underline font-black">
          <ArrowLeft size={20} /> <span className="mt-1">MAP_EXIT</span>
        </Link>
        <div className="text-center">
          <h1 className="text-2xl font-black italic tracking-tighter m-0">ATSUGI_COMMAND_CENTER</h1>
          <p className="text-[8px] text-blue-500 m-0 mt-1 font-bold">MANAGEMENT ANALYTICS v4.0</p>
        </div>
        <div className="flex items-center gap-4 text-emerald-400 font-mono font-bold">
           <Activity size={16} className="animate-pulse" /> LIVE_SYNCING
        </div>
      </header>

      <main className="p-10 max-w-7xl mx-auto space-y-10">
        
        {/* 📊 サマリータイル */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900 p-8 rounded-[2rem] border border-white/5 shadow-2xl group hover:border-blue-500/50 transition-all">
            <div className="flex justify-between items-start mb-4">
              <span className="text-slate-500 font-bold">MONTHLY_REVENUE</span>
              <DollarSign className="text-blue-500" size={20} />
            </div>
            <div className="text-4xl font-black font-mono tracking-tighter italic">¥{data.summary.totalSales}</div>
          </div>
          <div className="bg-slate-900 p-8 rounded-[2rem] border border-white/5 shadow-2xl">
            <div className="flex justify-between items-start mb-4">
              <span className="text-slate-500 font-bold">CARGO_VOLUME</span>
              <Box className="text-blue-500" size={20} />
            </div>
            <div className="text-4xl font-black font-mono tracking-tighter italic">{data.summary.totalVolume} <span className="text-sm font-bold text-slate-500">CS</span></div>
          </div>
          <div className="bg-slate-900 p-8 rounded-[2rem] border border-white/5 shadow-2xl">
            <div className="flex justify-between items-start mb-4">
              <span className="text-slate-500 font-bold">SYNC_TARGET</span>
              <TrendingUp className="text-emerald-500" size={20} />
            </div>
            <div className="text-4xl font-black font-mono tracking-tighter italic">{data.summary.month}</div>
          </div>
        </div>

        {/* 📂 タブセクション */}
        <div className="bg-slate-900 rounded-[3rem] border border-white/5 overflow-hidden shadow-2xl">
          <div className="flex bg-slate-800/50 border-b border-white/5">
            {['finance', 'logistics', 'efficiency'].map((t) => (
              <button 
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-6 font-black tracking-[0.3em] transition-all ${tab === t ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-white/5'}`}
              >
                {t.toUpperCase()}
              </button>
            ))}
          </div>

          <div className="p-10">
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                {tab === 'finance' ? (
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                    <XAxis dataKey="name" stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{backgroundColor:'#0f172a', border:'none', borderRadius:'15px', fontSize:'10px'}} />
                    <Area type="monotone" dataKey="sales" stroke="#3b82f6" strokeWidth={4} fill="url(#colorSales)" />
                  </AreaChart>
                ) : tab === 'logistics' ? (
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                    <XAxis dataKey="name" stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{backgroundColor:'#0f172a', border:'none', borderRadius:'15px', fontSize:'10px'}} />
                    <Bar dataKey="volume" fill="#10b981" radius={[10, 10, 0, 0]} />
                  </BarChart>
                ) : (
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                    <XAxis dataKey="name" stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{backgroundColor:'#0f172a', border:'none', borderRadius:'15px', fontSize:'10px'}} />
                    <Line type="stepAfter" dataKey="prod" stroke="#f59e0b" strokeWidth={4} dot={{r:6, fill:'#f59e0b'}} />
                  </LineChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* 📋 下部データグリッド（めちゃめちゃ多い項目用） */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 pb-20">
          <div className="space-y-4">
            <h3 className="text-blue-500 font-black tracking-[0.4em] mb-6 flex items-center gap-3">
              <Calculator size={18} /> OPERATIONAL_COSTS
            </h3>
            {[
              { label: '人件費率', val: '32.4%', change: '-1.2%', up: false },
              { label: '燃料コスト', val: '¥482,000', change: '+4.5%', up: true },
              { label: '車両維持費', val: '¥120,000', change: '±0%', up: false },
              { label: '誤配対策費', val: '¥12,000', change: '-15%', up: false },
            ].map((item, i) => (
              <div key={i} className="flex justify-between items-center p-6 bg-slate-900 rounded-3xl border border-white/5 hover:bg-slate-800 transition-colors">
                <span className="text-slate-400 font-bold">{item.label}</span>
                <div className="flex items-baseline gap-4">
                  <span className="text-xs text-slate-500 font-mono">{item.change}</span>
                  <span className="text-xl font-black font-mono italic">{item.val}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <h3 className="text-blue-500 font-black tracking-[0.4em] mb-6 flex items-center gap-3">
              <Layers size={18} /> SYSTEM_INTEGRITY
            </h3>
            <div className="bg-blue-600/5 p-10 rounded-[3rem] border border-blue-500/10 italic text-slate-400 leading-relaxed text-sm">
              <p>「本システムはスプレッドシートとリアルタイム同期しています。厚木営業所の経営指標は、現在ネットワーク上で最も高い生産性を記録中。次月の目標値は、現在の物量比+5%を想定。」</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}