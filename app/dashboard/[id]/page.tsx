// @ts-nocheck
'use client';

import { useEffect, useState, useRef } from 'react';
import { ArrowLeft, Activity, Calculator, TrendingUp, Bot, GripVertical, Send } from 'lucide-react';
import Link from 'next/link';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Bar, Line, ComposedChart, Legend } from 'recharts';

export default function DashboardPage({ params }: { params: { id: string } }) {
  const [data, setData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('logistics');
  const [viewMode, setViewMode] = useState<'daily' | 'weekly'>('daily');
  const [position, setPosition] = useState({ x: 24, y: 24 });
  const [isDragging, setIsDragging] = useState(false);

  const tabs = [
    { id: 'sales', label: '1. 売上・原価', icon: Calculator, color: '#3b82f6', dataKey: 'salesData' },
    { id: 'logistics', label: '2. 物量・工数', icon: Activity, color: '#10b981', dataKey: 'logisticsData' },
    { id: 'productivity', label: '3. 生産性', icon: TrendingUp, color: '#f59e0b', dataKey: 'productivityData' },
  ];

  useEffect(() => {
    const gasUrl = "https://script.google.com/macros/s/AKfycbyosyzeCglI2Pz2GWh_dbZXAgDslEV5DZrws5ulw24GrkI-fShocaWUdOLMfaNh_m0_/exec";
    fetch(gasUrl).then(res => res.json()).then(json => setData(json)).catch(err => console.error(err));
  }, []);

  if (!data) return <div className="h-screen bg-black flex items-center justify-center text-blue-500 font-mono animate-pulse">LOADING_STRATEGIC_DATA...</div>;

  const currentTab = tabs.find(t => t.id === activeTab) || tabs[1];

  // ★ グラフの合体ロジック
  const getCombinedMetrics = () => {
    const baseKey = viewMode === 'weekly' ? `weekly${currentTab.id.charAt(0).toUpperCase() + currentTab.id.slice(1)}Data` : currentTab.dataKey;
    const forecastKey = `${baseKey}Forecast`; // GAS側の予測データキーを想定

    const actuals = data[baseKey] || [];
    const forecasts = data[forecastKey] || [];

    // 実績と予測を「タイトル」で紐付け
    return actuals.map(actual => {
      const forecast = forecasts.find(f => f.title === actual.title);
      return {
        ...actual,
        forecastValues: forecast ? forecast.values : actual.values.map(v => v * 1.05) // 予測がなければ仮の値を表示
      };
    });
  };

  const CombinedChartCard = ({ metric, color }: any) => {
    const chartData = (metric.labels || data.labels || []).map((l: string, i: number) => ({
      name: l,
      "実績値": metric.values ? metric.values[i] : 0,
      "予測値": metric.forecastValues ? metric.forecastValues[i] : 0
    }));

    return (
      <div className="bg-white border border-slate-200 p-8 rounded-[2.5rem] shadow-sm">
        <div className="flex justify-between items-start mb-6">
          <h4 className="text-lg font-black text-slate-900 uppercase tracking-tighter">{metric.title}</h4>
          <div className="flex gap-4 text-[10px] font-bold">
            <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-sm" style={{backgroundColor: color}}></div>実績</div>
            <div className="flex items-center gap-1"><div className="w-3 h-[2px] bg-slate-400"></div>予測</div>
          </div>
        </div>
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '16px', border: 'none'}} />
              <Bar dataKey="実績値" fill={color} radius={[4, 4, 0, 0]} barSize={32} />
              <Line type="monotone" dataKey="予測値" stroke="#94a3b8" strokeWidth={3} strokeDasharray="5 5" dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      <header className="h-20 bg-white border-b border-slate-200 px-10 flex justify-between items-center sticky top-0 z-40">
        <Link href="/" className="text-slate-400 font-black flex items-center gap-2"><ArrowLeft size={18}/> BACK</Link>
        <h1 className="text-xl font-black italic tracking-tighter uppercase">経営ダッシュボード : 昭和冷蔵</h1>
        <div className="flex bg-slate-100 p-1 rounded-2xl border">
          <button onClick={() => setViewMode('daily')} className={`px-6 py-2 rounded-xl text-[10px] font-black ${viewMode === 'daily' ? 'bg-white shadow text-blue-600' : 'text-slate-400'}`}>DAILY</button>
          <button onClick={() => setViewMode('weekly')} className={`px-6 py-2 rounded-xl text-[10px] font-black ${viewMode === 'weekly' ? 'bg-white shadow text-blue-600' : 'text-slate-400'}`}>WEEKLY</button>
        </div>
      </header>

      <main className="p-10 max-w-[1800px] mx-auto space-y-10">
        <div className="flex flex-wrap gap-3">
          {tabs.map((t) => (
            <button key={t.id} onClick={() => setActiveTab(t.id)} className={`px-6 py-3 rounded-2xl font-black text-xs ${activeTab === t.id ? 'bg-slate-900 text-white shadow-xl' : 'bg-white border text-slate-500 hover:bg-slate-50'}`}>
              {t.label}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {getCombinedMetrics().map((m, i) => (
            <CombinedChartCard key={i} metric={m} color={currentTab.color} />
          ))}
        </div>
      </main>

      {/* AIチャット（ドラッグ対応） */}
      <div 
        style={{ bottom: position.y, right: position.x }} 
        className="fixed w-80 z-50 bg-slate-900 rounded-[2rem] shadow-2xl border border-slate-800 overflow-hidden"
      >
        <div 
          onMouseDown={() => setIsDragging(true)} 
          className="p-4 bg-blue-600 flex justify-between items-center cursor-move"
        >
          <div className="flex items-center gap-2 font-black text-[10px]"><Bot size={16}/> STRATEGIC_AI</div>
          <GripVertical size={14} className="opacity-50"/>
        </div>
        <div className="h-40 p-4 text-[10px] text-slate-300 font-medium leading-relaxed">
          昭和冷蔵の最新データを解析中... 予測に対する乖離を監視しています。
        </div>
      </div>
    </div>
  );
}