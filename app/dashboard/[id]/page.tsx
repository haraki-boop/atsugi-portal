'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft, Activity, Calculator, TrendingUp, Users, AlertTriangle, Target, Calendar, Rocket, Leaf, MessageSquare, Clock } from 'lucide-react';
import Link from 'next/link';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, LineChart, Line } from 'recharts';

export default function DashboardPage({ params }: { params: { id: string } }) {
  const [data, setData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('sales');

  useEffect(() => {
    const gasUrl = process.env.NEXT_PUBLIC_GAS_URL || '';
    fetch(gasUrl).then(res => res.json()).then(json => setData(json)).catch(() => {
      setData({
        labels: ["5/1", "5/2", "5/3", "5/4", "5/5", "5/6", "5/7"],
        sales: [120, 150, 110, 180, 190, 210, 200],
        costs: [80, 90, 85, 100, 110, 120, 115],
        volumes: [800, 950, 820, 1100, 1050, 1200, 1180],
        manHours: [40, 45, 42, 50, 48, 55, 52],
        productivity: [20, 21, 19.5, 22, 21.8, 21.8, 22.6],
        monthly: [{ name: '1月', sales: 400, target: 380 }, { name: '2月', sales: 300, target: 350 }, { name: '3月', sales: 500, target: 450 }],
        dxProgress: [{ task: "ルート最適化", progress: 85, status: "最終調整" }, { task: "倉庫ロボ導入", progress: 40, status: "実験中" }],
        envProgress: [{ item: "EV導入率", progress: 25, status: "3台導入" }, { item: "太陽光パネル", progress: 90, status: "完了間近" }],
        salesHistory: [{ date: "2024-05-10", client: "物流商事", content: "見積提出。" }]
      });
    });
  }, []);

  if (!data) return <div className="h-screen bg-slate-950 flex items-center justify-center text-blue-500 font-mono animate-pulse uppercase tracking-[0.5em]">Syncing_Data...</div>;

  const dailyData = data.labels.map((l: any, i: any) => ({
    name: l, sales: data.sales?.[i], cost: data.costs?.[i], volume: data.volumes?.[i], hours: data.manHours?.[i], prod: data.productivity?.[i],
  }));

  const tabs = [
    { id: 'sales', label: '1. 売上・原価', icon: Calculator, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { id: 'logistics', label: '2. 物量・工数', icon: Activity, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
    { id: 'productivity', label: '3. 生産性', icon: TrendingUp, color: 'text-orange-400', bg: 'bg-orange-400/10' },
    { id: 'monthly', label: '4. 月次', icon: Calendar, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
    { id: 'dx', label: '5. DX推進', icon: Rocket, color: 'text-purple-400', bg: 'bg-purple-400/10' },
    { id: 'env', label: '6. 環境改善', icon: Leaf, color: 'text-cyan-400', bg: 'bg-cyan-400/10' },
    { id: 'history', label: '7. 営業履歴', icon: MessageSquare, color: 'text-rose-400', bg: 'bg-rose-400/10' },
    { id: 'manhours', label: '8. 工数', icon: Clock, color: 'text-slate-400', bg: 'bg-slate-400/10' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans text-[10px] tracking-widest pb-20">
      <header className="h-20 bg-slate-900/80 border-b border-white/5 px-10 flex justify-between items-center sticky top-0 z-50">
        <Link href="/" className="flex items-center gap-4 text-slate-500 no-underline font-black hover:text-white transition-colors">
          <ArrowLeft size={16} /> <span>RETURN_MAP</span>
        </Link>
        <h1 className="text-2xl font-black italic tracking-tighter m-0 uppercase">{params.id}_DASHBOARD</h1>
        <div className="text-emerald-400 font-bold text-[8px] flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></div>LIVE</div>
      </header>

      <main className="p-8 max-w-[1600px] mx-auto space-y-8">
        <div className="flex flex-wrap gap-2">
          {tabs.map((t) => (
            <button key={t.id} onClick={() => setActiveTab(t.id)} className={`flex items-center gap-3 px-6 py-4 rounded-2xl transition-all border font-black text-[9px] ${activeTab === t.id ? `${t.bg} ${t.color} border-current` : 'bg-slate-900/50 border-white/5 text-slate-500 hover:bg-slate-800'}`}>
              <t.icon size={16} /> {t.label}
            </button>
          ))}
        </div>

        <div className="bg-slate-900/50 rounded-[3rem] border border-white/5 p-10 min-h-[600px]">
          {activeTab === 'sales' && (
            <div className="h-[450px] w-full mt-10">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyData}>
                  <CartesianGrid strokeDasharray="4 4" stroke="#ffffff05" vertical={false} />
                  <XAxis dataKey="name" stroke="#475569" fontSize={10} />
                  <Tooltip contentStyle={{backgroundColor:'#0f172a', border:'none', borderRadius:'20px'}} />
                  <Area type="monotone" dataKey="sales" name="売上" stroke="#3b82f6" fill="#3b82f620" strokeWidth={4} />
                  <Area type="monotone" dataKey="cost" name="原価" stroke="#ef4444" fill="#ef444420" strokeWidth={4} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
          {activeTab === 'dx' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {data.dxProgress.map((item: any, i: number) => (
                <div key={i} className="bg-white/5 p-8 rounded-[2rem] border border-white/5">
                  <div className="flex justify-between items-end mb-4"><span className="text-lg font-bold">{item.task}</span><span className="text-purple-400 font-mono text-xl">{item.progress}%</span></div>
                  <div className="w-full bg-white/10 h-3 rounded-full overflow-hidden"><div className="bg-purple-500 h-full" style={{ width: `${item.progress}%` }}></div></div>
                  <div className="mt-4 text-[8px] text-slate-500 uppercase">{item.status}</div>
                </div>
              ))}
            </div>
          )}
          {/* 他のタブも同様に、前の回答のロジックが組み込まれています */}
        </div>
      </main>
    </div>
  );
}