// @ts-nocheck
'use client';

import { useEffect, useState, useRef } from 'react';
import { ArrowLeft, Activity, Calculator, TrendingUp, Calendar, Rocket, Leaf, MessageSquare, Clock, Send, Bot, Sparkles, GripVertical } from 'lucide-react';
import Link from 'next/link';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, LineChart, Line, ComposedChart } from 'recharts';

export default function DashboardPage({ params }: { params: { id: string } }) {
  const [data, setData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('logistics');
  const [viewMode, setViewMode] = useState<'daily' | 'weekly'>('daily');
  const [chatInput, setChatInput] = useState("");
  const [chatLog, setChatLog] = useState<{role: string, text: string}[]>([
    { role: 'ai', text: '実績を棒グラフ、予測を線グラフで表示しました。乖離状況を確認してください。' }
  ]);

  // AI位置移動用のステート
  const [position, setPosition] = useState({ x: 24, y: 24 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef(null);

  useEffect(() => {
    const gasUrl = "https://script.google.com/macros/s/AKfycbyosyzeCglI2Pz2GWh_dbZXAgDslEV5DZrws5ulw24GrkI-fShocaWUdOLMfaNh_m0_/exec";
    fetch(gasUrl).then(res => res.json()).then(json => setData(json)).catch(err => console.error(err));
  }, []);

  // ドラッグハンドラー
  const onMouseDown = (e) => {
    setIsDragging(true);
  };

  useEffect(() => {
    const onMouseMove = (e) => {
      if (!isDragging) return;
      setPosition({
        x: window.innerWidth - e.clientX - 160, // 右端からの距離を調整
        y: window.innerHeight - e.clientY - 40
      });
    };
    const onMouseUp = () => setIsDragging(false);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [isDragging]);

  if (!data) return <div className="h-screen bg-slate-950 flex items-center justify-center text-blue-500 font-mono animate-pulse uppercase tracking-[0.5em]">UPDATING_COMMAND_LOGIC...</div>;

  const tabs = [
    { id: 'sales', label: '1. 売上・原価', icon: Calculator, color: '#3b82f6', dataKey: 'salesData' },
    { id: 'logistics', label: '2. 物量・工数', icon: Activity, color: '#10b981', dataKey: 'logisticsData' },
    { id: 'productivity', label: '3. 生産性', icon: TrendingUp, color: '#f59e0b', dataKey: 'productivityData' },
    { id: 'monthly', label: '4. 月次', icon: Calendar, color: '#eab308', dataKey: 'monthlyData' },
  ];

  const currentTab = tabs.find(t => t.id === activeTab) || tabs[1];

  const getDisplayMetrics = () => {
    const id = currentTab.id;
    const capitalizedKey = id.charAt(0).toUpperCase() + id.slice(1);
    const dataKey = viewMode === 'weekly' ? `weekly${capitalizedKey}Data` : currentTab.dataKey;
    return data[dataKey] || data[currentTab.dataKey] || [];
  };

  const LargeChartCard = ({ title, labels, values, forecastValues, color }: any) => {
    const chartData = (labels || data.labels || []).map((l: string, i: number) => ({
      name: l,
      actual: values ? values[i] : 0,
      forecast: forecastValues ? forecastValues[i] : (values ? values[i] * 1.05 : 0)
    }));

    const currentActual = values ? values[values.length - 1] : 0;
    const currentForecast = forecastValues ? forecastValues[forecastValues.length - 1] : currentActual * 1.05;
    const diffPercent = ((currentActual / currentForecast - 1) * 100).toFixed(1);

    return (
      <div className="bg-white border border-slate-200 p-8 rounded-[2.5rem] shadow-sm flex flex-col gap-6">
        <div className="flex justify-between items-start">
          <div>
            <h4 className="text-lg font-black text-slate-900 uppercase tracking-tighter">{title}</h4>
            <p className="text-[10px] text-slate-400 font-bold">{viewMode.toUpperCase()}_REPORT</p>
          </div>
          
          <div className="flex gap-4">
            <div className="flex flex-col items-end">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Performance</span>
              <div className="flex items-center gap-2">
                <span className={`text-2xl font-black ${Number(diffPercent) >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                   {Number(diffPercent) > 0 ? '+' : ''}{diffPercent}%
                </span>
                <span className="text-[10px] font-bold text-slate-400">vs 予測</span>
              </div>
            </div>
          </div>
        </div>

        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} axisLine={false} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} axisLine={false} tickLine={false} hide />
              <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '16px', border: 'none'}} />
              {/* 実績は棒 */}
              <Bar dataKey="actual" fill={color} radius={[4, 4, 0, 0]} barSize={viewMode === 'daily' ? 20 : 40} />
              {/* 予測は線 */}
              <Line type="monotone" dataKey="forecast" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-20">
      <header className="h-20 bg-white border-b border-slate-200 px-10 flex justify-between items-center sticky top-0 z-40 shadow-sm">
        <Link href="/" className="flex items-center gap-3 text-slate-400 no-underline font-black hover:text-blue-600">
          <ArrowLeft size={18} /> <span className="text-sm uppercase tracking-widest">Back</span>
        </Link>
        <h1 className="text-xl font-black italic tracking-tighter uppercase text-slate-800">{params.id}_STRATEGIC_VIEW</h1>
        <div className="flex bg-slate-100 p-1 rounded-2xl border">
          <button onClick={() => setViewMode('daily')} className={`px-6 py-2 rounded-xl text-[10px] font-black transition-all ${viewMode === 'daily' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'}`}>DAILY</button>
          <button onClick={() => setViewMode('weekly')} className={`px-6 py-2 rounded-xl text-[10px] font-black transition-all ${viewMode === 'weekly' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'}`}>WEEKLY</button>
        </div>
      </header>

      <main className="p-10 max-w-[1800px] mx-auto space-y-10">
        <div className="flex flex-wrap gap-3">
          {tabs.map((t) => (
            <button key={t.id} onClick={() => setActiveTab(t.id)} className={`flex items-center gap-3 px-6 py-3 rounded-2xl transition-all font-black text-xs ${activeTab === t.id ? `bg-slate-900 text-white shadow-xl` : 'bg-white border text-slate-500 hover:bg-slate-50'}`}>
              <t.icon size={16} style={{color: activeTab === t.id ? '#fff' : t.color}} /> {t.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {getDisplayMetrics().map((m: any, i: number) => (
            <LargeChartCard key={i} title={m.title} labels={m.labels || data.labels} values={m.values} forecastValues={m.forecastValues} color={currentTab.color} />
          ))}
        </div>
      </main>

      {/* ドラッグ可能なAIチャット */}
      <div 
        style={{ bottom: position.y, right: position.x }}
        className="fixed w-80 z-50 transition-shadow duration-200"
      >
        <div className="bg-slate-900 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col border border-slate-800">
          <div 
            onMouseDown={onMouseDown}
            className="p-4 bg-gradient-to-r from-blue-600 to-blue-500 flex items-center justify-between cursor-move active:cursor-grabbing"
          >
            <div className="flex items-center gap-3">
              <Bot size={18} className="text-white" />
              <div className="text-white font-black text-[10px] uppercase tracking-tighter">AI_COMMANDER</div>
            </div>
            <GripVertical size={16} className="text-white/50" />
          </div>
          <div className="h-48 overflow-y-auto p-5 space-y-4 bg-slate-900 scrollbar-hide">
            {chatLog.map((msg, i) => (
              <div key={i} className={`${msg.role === 'ai' ? 'bg-slate-800 text-slate-200' : 'bg-blue-600 text-white ml-auto'} p-3 rounded-2xl text-[10px] font-medium`}>{msg.text}</div>
            ))}
          </div>
          <div className="p-3 bg-slate-800 flex gap-2">
            <input value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="分析を指示..." className="bg-slate-700 border-none rounded-xl px-4 py-2 text-[10px] text-white focus:outline-none flex-grow" />
            <button className="p-2 bg-blue-600 text-white rounded-xl"><Send size={14} /></button>
          </div>
        </div>
      </div>
    </div>
  );
}