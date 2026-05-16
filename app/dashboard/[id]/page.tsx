// @ts-nocheck
'use client';
import { useEffect, useState } from 'react';
import { ArrowLeft, Activity, Calculator, TrendingUp, Calendar, Rocket, Leaf, MessageSquare, Clock, Bot } from 'lucide-react';
import Link from 'next/link';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Bar, Line, ComposedChart, Legend } from 'recharts';

export default function DashboardPage({ params }: { params: { id: string } }) {
  const [data, setData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('logistics');
  const [viewMode, setViewMode] = useState<'daily' | 'weekly'>('daily');

  // タブを1〜8まですべて完全復旧
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
    fetch(gasUrl).then(res => res.json()).then(json => setData(json));
  }, []);

  if (!data) return <div className="h-screen bg-slate-950 flex items-center justify-center text-blue-400 font-mono animate-pulse uppercase tracking-[0.5em]">Establishing_Neural_Link...</div>;

  const currentTab = tabs.find(t => t.id === activeTab) || tabs[1];

  // ★「実績_」に対して「予算_」「予測_」「目標_」をすべて自動合体させる最強ロジック
  const getCombinedMetrics = () => {
    const baseKey = viewMode === 'weekly' ? `weekly${currentTab.id.charAt(0).toUpperCase() + currentTab.id.slice(1)}Data` : currentTab.dataKey;
    const allItems = data[baseKey] || [];
    const combinedMap = new Map();

    allItems.forEach(item => {
      // 先頭の「実績_」「予測_」「予算_」「目標_」をすべてきれいに取り除いて共通の名前を作る
      const cleanTitle = item.title.replace('実績_', '').replace('予測_', '').replace('予算_', '').replace('目標_', '');

      if (!combinedMap.has(cleanTitle)) {
        combinedMap.set(cleanTitle, { 
          title: cleanTitle, 
          labels: item.labels || data.labels, 
          actual: [], 
          forecast: [],
          forecastType: '予測' // 凡例用のデフォルト文字
        });
      }
      
      const entry = combinedMap.get(cleanTitle);
      
      if (item.title.startsWith('実績_')) {
        entry.actual = item.values;
      } else if (item.title.startsWith('予測_') || item.title.startsWith('予算_') || item.title.startsWith('目標_')) {
        entry.forecast = item.values;
        // スプレッドシートで使われている言葉（予算/予測/目標）をそのままグラフの凡例にする
        entry.forecastType = item.title.split('_')[0]; 
      }
    });

    return Array.from(combinedMap.values());
  };

  const ChartCard = ({ metric, color }: any) => {
    // Recharts用にデータを整形（凡例の名前を動的に変更）
    const chartData = metric.labels.map((l, i) => ({
      name: l,
      "実績": metric.actual[i] || 0,
      [metric.forecastType]: metric.forecast[i] || 0
    }));

    return (
      <div className="bg-white border border-slate-200 p-8 rounded-[2.5rem] shadow-sm flex flex-col gap-6">
        <h4 className="text-lg font-black text-slate-900 uppercase tracking-tighter">{metric.title}</h4>
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '16px', border: 'none'}} />
              <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{fontSize: '10px', fontWeight: 'bold', paddingBottom: '20px'}} />
              
              {/* 実績＝棒グラフ */}
              <Bar name="実績" dataKey="実績" fill={color} radius={[4, 4, 0, 0]} barSize={24} />
              
              {/* 予算・予測・目標＝自動で判定された名前で折れ線（点線）を重ねる */}
              <Line name={metric.forecastType} type="monotone" dataKey={metric.forecastType} stroke="#94a3b8" strokeWidth={3} strokeDasharray="5 5" dot={{ r: 4, fill: '#fff', stroke: '#94a3b8' }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-20">
      <header className="h-20 bg-white border-b border-slate-200 px-10 flex justify-between items-center sticky top-0 z-40 shadow-sm">
        <Link href="/" className="flex items-center gap-3 text-slate-400 no-underline font-black hover:text-blue-600 transition-all">
          <ArrowLeft size={18} /> <span className="text-sm">BACK</span>
        </Link>
        <div className="text-center">
          <h1 className="text-xl font-black italic tracking-tighter uppercase text-slate-800">経営ダッシュボード : 昭和冷蔵</h1>
          <p className="text-[9px] font-bold text-blue-500 tracking-[0.2em] uppercase">Strategic Command Unit</p>
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
              {t.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {getCombinedMetrics().map((m, i) => (
            <ChartCard key={i} metric={m} color={currentTab.color} />
          ))}
        </div>
      </main>
    </div>
  );
}