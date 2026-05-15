// @ts-nocheck
'use client';

import { useEffect, useState, useRef } from 'react';
import { ArrowLeft, Activity, Calculator, TrendingUp, Calendar, Rocket, Leaf, MessageSquare, Clock, Send, Bot, Sparkles, GripVertical } from 'lucide-react';
import Link from 'next/link';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Bar, Line, ComposedChart, Legend } from 'recharts';

export default function DashboardPage({ params }: { params: { id: string } }) {
  const [data, setData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('logistics');
  const [viewMode, setViewMode] = useState<'daily' | 'weekly'>('daily');
  const [chatInput, setChatInput] = useState("");
  const [chatLog, setChatLog] = useState<{role: string, text: string}[]>([
    { role: 'ai', text: '経営ダッシュボードへようこそ。昭和冷蔵のデータを同期中...' }
  ]);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [position, setPosition] = useState({ x: 24, y: 24 });
  const [isDragging, setIsDragging] = useState(false);

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

  useEffect(() => {
    const gasUrl = "https://script.google.com/macros/s/AKfycbyosyzeCglI2Pz2GWh_dbZXAgDslEV5DZrws5ulw24GrkI-fShocaWUdOLMfaNh_m0_/exec";
    fetch(gasUrl).then(res => res.json()).then(json => {
      setData(json);
      setChatLog([{ role: 'ai', text: '昭和冷蔵の戦略データ接続完了。参謀AI、待機中。' }]);
    }).catch(err => console.error(err));
  }, []);

  const askAI = async () => {
    if (!chatInput || isAiThinking) return;
    const userMsg = chatInput;
    setChatInput("");
    setChatLog(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsAiThinking(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg, dashboardData: data })
      });
      const result = await res.json();
      setChatLog(prev => [...prev, { role: 'ai', text: result.text }]);
    } catch (e) {
      setChatLog(prev => [...prev, { role: 'ai', text: '通信途絶。API設定を確認してください。' }]);
    } finally {
      setIsAiThinking(false);
    }
  };

  const onMouseDown = () => setIsDragging(true);
  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      setPosition({ x: window.innerWidth - e.clientX - 160, y: window.innerHeight - e.clientY - 40 });
    };
    const onMouseUp = () => setIsDragging(false);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [isDragging]);

  if (!data) return <div className="h-screen bg-slate-950 flex items-center justify-center text-lime-400 font-mono animate-pulse uppercase tracking-[0.5em]">Establishing_Neural_Link...</div>;

  const currentTab = tabs.find(t => t.id === activeTab) || tabs[1];

  const getDisplayMetrics = () => {
    const id = currentTab.id;
    const capitalizedKey = id.charAt(0).toUpperCase() + id.slice(1);
    const dataKey = viewMode === 'weekly' ? `weekly${capitalizedKey}Data` : currentTab.dataKey;
    return data[dataKey] || data[currentTab.dataKey] || [];
  };

  // ★ 実績（棒）と予測（線）を合体させるコンポーネント
  const CombinedChartCard = ({ metric, color }: any) => {
    const chartData = (metric.labels || data.labels || []).map((l: string, i: number) => ({
      name: l,
      "実績": metric.values ? metric.values[i] : 0,
      "予測": metric.forecastValues ? metric.forecastValues[i] : 0
    }));

    const actual = metric.values?.[metric.values.length - 1] || 0;
    const forecast = metric.forecastValues?.[metric.forecastValues.length - 1] || 1;
    const diff = ((actual / forecast - 1) * 100).toFixed(1);

    return (
      <div className="bg-white border border-slate-200 p-8 rounded-[2.5rem] shadow-sm flex flex-col gap-6">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <h4 className="text-lg font-black text-slate-900 uppercase tracking-tighter">{metric.title}</h4>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{viewMode} ANALYSIS</p>
          </div>
          <div className="text-right">
             <span className={`text-2xl font-black ${Number(diff) >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                {Number(diff) > 0 ? '+' : ''}{diff}%
             </span>
             <p className="text-[9px] font-bold text-slate-400 uppercase">vs Forecast</p>
          </div>
        </div>

        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} axisLine={false} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} axisLine={false} tickLine={false} />
              <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '16px', border: 'none'}} />
              <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{fontSize: '10px', fontWeight: 'bold', paddingBottom: '20px'}} />
              <Bar name="実績" dataKey="実績" fill={color} radius={[4, 4, 0, 0]} barSize={viewMode === 'daily' ? 24 : 48} />
              <Line name="予測" type="monotone" dataKey="予測" stroke="#94a3b8" strokeWidth={3} strokeDasharray="6 4" dot={{r: 4, fill: '#fff', stroke: '#94a3b8', strokeWidth: 2}} />
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
          <ArrowLeft size={18} /> <span className="text-sm">BACK</span>
        </Link>
        <div className="text-center">
          <h1 className="text-xl font-black italic tracking-tighter uppercase text-slate-800">経営ダッシュボード : 昭和冷蔵</h1>
          <p className="text-[9px] font-bold text-blue-500 tracking-[0.3em] uppercase">Strategic Command Unit</p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
          <button onClick={() => setViewMode('daily')} className={`px-6 py-2 rounded-xl text-[10px] font-black transition-all ${viewMode === 'daily' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'}`}>DAILY</button>
          <button onClick={() => setViewMode('weekly')} className={`px-6 py-2 rounded-xl text-[10px] font-black transition-all ${viewMode === 'weekly' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'}`}>WEEKLY</button>
        </div>
      </header>

      <main className="p-10 max-w-[1800px] mx-auto space-y-10">
        <div className="flex flex-wrap gap-3">
          {tabs.map((t) => (
            <button key={t.id} onClick={() => setActiveTab(t.id)} className={`flex items-center gap-3 px-6 py-3 rounded-2xl transition-all font-black text-xs ${activeTab === t.id ? `bg-slate-900 text-white shadow-xl scale-105` : 'bg-white border text-slate-500 hover:bg-slate-50'}`}>
              <t.icon size={16} style={{color: activeTab === t.id ? '#fff' : t.color}} /> {t.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {getDisplayMetrics().map((m: any, i: number) => (
            <CombinedChartCard key={i} metric={m} color={currentTab.color} />
          ))}
        </div>
      </main>

      <div style={{ bottom: position.y, right: position.x }} className="fixed w-80 z-50">
        <div className="bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col border border-slate-800">
          <div onMouseDown={onMouseDown} className="p-4 bg-gradient-to-r from-blue-600 to-blue-500 flex items-center justify-between cursor-move active:cursor-grabbing">
            <div className="flex items-center gap-3"><Bot size={18} className="text-white" /><div className="text-white font-black text-[10px]">STRATEGIC_AI</div></div>
            <GripVertical size={16} className="text-white/50" />
          </div>
          <div className="h-48 overflow-y-auto p-5 space-y-4 bg-slate-900 scrollbar-hide">
            {chatLog.map((msg, i) => (
              <div key={i} className={`${msg.role === 'ai' ? 'bg-slate-800 text-slate-200' : 'bg-blue-600 text-white ml-auto'} p-3 rounded-2xl text-[10px] font-medium leading-relaxed`}>{msg.text}</div>
            ))}
            {isAiThinking && <div className="text-blue-400 text-[10px] animate-pulse font-bold tracking-widest">ANALYZING...</div>}
          </div>
          <div className="p-3 bg-slate-800 flex gap-2">
            <input value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="司令官、指示を..." className="bg-slate-700 border-none rounded-xl px-4 py-2 text-[10px] text-white focus:outline-none flex-grow" onKeyDown={(e) => e.key === 'Enter' && askAI()} />
            <button onClick={askAI} className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-500 transition-colors"><Send size={14} /></button>
          </div>
        </div>
      </div>
    </div>
  );
}