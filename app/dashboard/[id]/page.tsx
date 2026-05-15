'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft, Activity, Calculator, TrendingUp, Calendar, Rocket, Leaf, MessageSquare, Clock } from 'lucide-react';
import Link from 'next/link';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, LineChart, Line } from 'recharts';

export default function DashboardPage({ params }: { params: { id: string } }) {
  const [data, setData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('logistics');

  useEffect(() => {
    const gasUrl = "https://script.google.com/macros/s/AKfycbyosyzeCglI2Pz2GWh_dbZXAgDslEV5DZrws5ulw24GrkI-fShocaWUdOLMfaNh_m0_/exec";
    fetch(gasUrl).then(res => res.json()).then(json => setData(json)).catch(err => console.error(err));
  }, []);

  if (!data) return <div className="h-screen bg-slate-950 flex items-center justify-center text-blue-500 font-mono animate-pulse uppercase tracking-[0.5em]">Initialising_SVG_Graphics...</div>;

  // 【特製】白背景・大画面グラフカード（Canvas不使用）
  const LargeChartCard = ({ title, labels, values, color, type }: any) => {
    const chartData = (labels || []).map((l: string, i: number) => ({ name: l, val: values ? values[i] : 0 }));
    return (
      <div className="bg-white border border-slate-200 p-8 rounded-[2rem] shadow-sm flex flex-col gap-6">
        <div className="flex justify-between items-start">
          <h4 className="text-lg font-black text-slate-900 tracking-tighter uppercase">{title}</h4>
          <span className="bg-slate-100 text-slate-400 text-[9px] px-3 py-1 rounded-full font-bold">LIVE_DATA</span>
        </div>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            {type === 'bar' ? (
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickMargin={10} axisLine={false} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                <Bar dataKey="val" fill={color} radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            ) : type === 'line' ? (
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickMargin={10} axisLine={false} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                <Line type="monotone" dataKey="val" stroke={color} strokeWidth={4} dot={{r: 6, fill: color, strokeWidth: 3, stroke: '#fff'}} activeDot={{r: 8}} />
              </LineChart>
            ) : (
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickMargin={10} axisLine={false} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                <Area type="monotone" dataKey="val" stroke={color} fill={color} fillOpacity={0.1} strokeWidth={4} />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  const tabs = [
    { id: 'sales', label: '1. 売上・原価', icon: Calculator, color: '#3b82f6', dataKey: 'salesData', type: 'area' },
    { id: 'logistics', label: '2. 物量・工数', icon: Activity, color: '#10b981', dataKey: 'logisticsData', type: 'bar' },
    { id: 'productivity', label: '3. 生産性', icon: TrendingUp, color: '#f59e0b', dataKey: 'productivityData', type: 'line' },
    { id: 'monthly', label: '4. 月次', icon: Calendar, color: '#eab308', dataKey: 'monthlyData', type: 'bar' },
    { id: 'dx', label: '5. DX推進', icon: Rocket, color: '#a855f7', dataKey: 'dxProgress' },
    { id: 'env', label: '6. 環境改善', icon: Leaf, color: '#06b6d4', dataKey: 'envProgress' },
    { id: 'history', label: '7. 営業履歴', icon: MessageSquare, color: '#f43f5e', dataKey: 'salesHistory' },
    { id: 'manhours', label: '8. 工数', icon: Clock, color: '#64748b', dataKey: '' },
  ];

  const currentTab = tabs.find(t => t.id === activeTab);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-20">
      <header className="h-20 bg-white border-b border-slate-200 px-10 flex justify-between items-center sticky top-0 z-50 shadow-sm">
        <Link href="/" className="flex items-center gap-3 text-slate-400 no-underline font-black hover:text-blue-600 transition-all">
          <ArrowLeft size={18} /> <span className="text-sm">EXIT_STATION</span>
        </Link>
        <h1 className="text-xl font-black italic tracking-tighter uppercase text-slate-800">{params.id}_MONITOR</h1>
        <div className="bg-blue-50 text-blue-600 px-4 py-2 rounded-full text-[10px] font-black border border-blue-100 uppercase tracking-widest">System_Active</div>
      </header>

      <main className="p-10 max-w-[1600px] mx-auto space-y-10">
        <div className="flex flex-wrap gap-3">
          {tabs.map((t) => (
            <button key={t.id} onClick={() => setActiveTab(t.id)} className={`flex items-center gap-3 px-6 py-3 rounded-2xl transition-all font-black text-xs ${activeTab === t.id ? `bg-slate-900 text-white shadow-xl scale-105` : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
              <t.icon size={16} style={{color: activeTab === t.id ? '#fff' : t.color}} /> {t.label}
            </button>
          ))}
        </div>

        <div className="min-h-[60vh]">
          {['sales', 'logistics', 'productivity', 'monthly'].includes(activeTab) && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {data[currentTab?.dataKey || '']?.map((m: any, i: number) => (
                <LargeChartCard key={i} title={m.title} labels={data.labels} values={m.values} color={currentTab?.color} type={currentTab?.type} />
              ))}
            </div>
          )}

          {(activeTab === 'dx' || activeTab === 'env') && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {data[currentTab?.dataKey || '']?.map((item: any, i: number) => (
                <div key={i} className="bg-white p-12 rounded-[3rem] border border-slate-200 shadow-sm">
                  <div className="flex justify-between items-end mb-8">
                    <span className="text-2xl font-black italic tracking-tight text-slate-900">{item.task || item.item}</span>
                    <span className="text-5xl font-mono text-blue-600">{item.progress}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden p-1">
                    <div className="bg-blue-600 h-full rounded-full transition-all duration-1000" style={{ width: `${item.progress}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'history' && (
            <div className="bg-white rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden">
              {data.salesHistory?.map((log: any, i: number) => (
                <div key={i} className="p-10 flex gap-10 items-center border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                  <div className="text-blue-600 font-mono font-black text-lg w-24 text-center">{log.date}</div>
                  <div>
                    <div className="text-slate-900 text-xl font-black mb-2">{log.client}</div>
                    <div className="text-slate-500 leading-relaxed text-sm">{log.content}</div>
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