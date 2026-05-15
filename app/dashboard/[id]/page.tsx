'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft, Activity, Calculator, TrendingUp, Users, AlertTriangle, Target } from 'lucide-react';
import Link from 'next/link';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, LineChart, Line } from 'recharts';

export default function DashboardPage({ params }: { params: { id: string } }) {
  const [data, setData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('summary');

  useEffect(() => {
    const gasUrl = process.env.NEXT_PUBLIC_GAS_URL || '';
    fetch(gasUrl).then(res => res.json()).then(json => setData(json)).catch(() => {
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
    name: l, finance: data.finance?.[i] || 0, logistics: data.logistics?.[i] || 0,
    prod: data.productivity?.[i] || 0, labor: data.labor?.[i] || 0, risk: data.risk?.[i] || 0,
  }));

  const tabs = [
    { id: 'summary', label: '1. 総合', icon: Target, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { id: 'cost', label: '2. コスト', icon: Calculator, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
    { id: 'productivity', label: '3. 生産性', icon: TrendingUp, color: 'text-orange-400', bg: 'bg-orange-400/10' },
    { id: 'labor', label: '4. 労務', icon: Users, color: 'text-purple-400', bg: 'bg-purple-400/10' },
    { id: 'risk', label: '5. リスク', icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-400/10' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans uppercase text-[10px] tracking-widest pb-20">
      <header className="h-20 bg-slate-900/80 border-b border-white/5 px-10 flex justify-between items-center sticky top-0 z-50">
        <Link href="/" className="flex items-center gap-4 text-slate-500 hover:text-white no-underline font-black">
          <ArrowLeft size={16} /> <span>RETURN_MAP</span>
        </Link>
        <h1 className="text-2xl font-black italic tracking-tighter m-0 uppercase">{params.id}_COMMAND_VIEW</h1>
        <div className="text-emerald-400 font-bold text-[8px] flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></div>LIVE</div>
      </header>
      <main className="p-10 max-w-[1600px] mx-auto space-y-10">
        <div className="flex flex-wrap gap-4">
          {tabs.map((t) => (
            <button key={t.id} onClick={() => setActiveTab(t.id)} className={`flex items-center gap-4 px-12 py-7 rounded-[2rem] border font-black ${activeTab === t.id ? `${t.bg} ${t.color} border-current` : 'bg-slate-900/50 border-white/5 text-slate-500'}`}>
              <t.icon size={20} /> {t.label}
            </button>
          ))}
        </div>
        <div className="bg-slate-900/50 rounded-[4rem] border border-white/5 p-14 h-[600px]">
          <ResponsiveContainer width="100%" height="100%">
            {activeTab === 'summary' || activeTab === 'cost' ? (
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="4 4" stroke="#ffffff05" vertical={false} />
                <XAxis dataKey="name" stroke="#475569" fontSize={11} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{backgroundColor:'#0f172a', border:'none', borderRadius:'24px'}} />
                <Area type="monotone" dataKey={activeTab === 'summary' ? 'finance' : 'logistics'} stroke={activeTab === 'summary' ? '#3b82f6' : '#10b981'} strokeWidth={5} fillOpacity={0.2} fill={activeTab === 'summary' ? '#3b82f6' : '#10b981'} />
              </AreaChart>
            ) : activeTab === 'productivity' ? (
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} /><XAxis dataKey="name" stroke="#475569" fontSize={11} axisLine={false} tickLine={false} /><Tooltip contentStyle={{backgroundColor:'#0f172a', border:'none', borderRadius:'24px'}} /><Bar dataKey="prod" fill="#f59e0b" radius={[20, 20, 0, 0]} barSize={40} />
              </BarChart>
            ) : (
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} /><XAxis dataKey="name" stroke="#475569" fontSize={11} axisLine={false} tickLine={false} /><Tooltip contentStyle={{backgroundColor:'#0f172a', border:'none', borderRadius:'24px'}} /><Line type="monotone" dataKey={activeTab === 'labor' ? 'labor' : 'risk'} stroke={activeTab === 'labor' ? '#a855f7' : '#ef4444'} strokeWidth={6} dot={{r:10, fill:'#0f172a'}} />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
      </main>
    </div>
  );
}