'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft, Activity, Calculator, TrendingUp, Calendar, Rocket, Leaf, MessageSquare, Clock, Send, Bot, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, LineChart, Line } from 'recharts';

export default function DashboardPage({ params }: { params: { id: string } }) {
  const [data, setData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('logistics');
  const [viewMode, setViewMode] = useState<'daily' | 'weekly'>('daily');
  const [chatInput, setChatInput] = useState("");
  const [chatLog, setChatLog] = useState<{role: string, text: string}[]>([
    { role: 'ai', text: '会議用のデータを準備しました。実績と予測を比較分析可能です。' }
  ]);

  // タブの定義をコンポーネント内に移動（赤線対策）
  const tabs = [
    { id: 'sales', label: '1. 売上・原価', icon: Calculator, color: '#3b82f6', dataKey: 'salesData', type: 'area' },
    { id: 'logistics', label: '2. 物量・工数', icon: Activity, color: '#10b981', dataKey: 'logisticsData', type: 'bar' },
    { id: 'productivity', label: '3. 生産性', icon: TrendingUp, color: '#f59e0b', dataKey: 'productivityData', type: 'line' },
    { id: 'monthly', label: '4. 月次', icon: Calendar, color: '#eab308', dataKey: 'monthlyData', type: 'bar' },
    { id: 'dx', label: '5. DX推進', icon: Rocket, color: '#a855f7', dataKey: 'dxProgress', type: 'progress' },
    { id: 'env', label: '6. 環境改善', icon: Leaf, color: '#06b6d4', dataKey: 'envProgress', type: 'progress' },
    { id: 'history', label: '7. 営業履歴', icon: MessageSquare, color: '#f43f5e', dataKey: 'salesHistory', type: 'history' },
    { id: 'manhours', label: '8. 工数', icon: Clock, color: '#64748b', dataKey: '', type: 'empty' },
  ];

  useEffect(() => {
    const gasUrl = "https://script.google.com/macros/s/AKfycbyosyzeCglI2Pz2GWh_dbZXAgDslEV5DZrws5ulw24GrkI-fShocaWUdOLMfaNh_m0_/exec";
    fetch(gasUrl).then(res => res.json()).then(json => setData(json)).catch(err => console.error(err));
  }, []);

  if (!data) return <div className="h-screen bg-slate-950 flex items-center justify-center text-blue-500 font-mono animate-pulse uppercase tracking-[0.5em]">Establishing_Neural_Link...</div>;

  const currentTab = tabs.find(t => t.id === activeTab) || tabs[1];

  const getDisplayMetrics = () => {
    const keyPrefix = viewMode === 'weekly' ? 'weekly' : '';
    const capitalizedKey = currentTab.id.charAt(0).toUpperCase() + currentTab.id.slice(1);
    const dataKey = viewMode === 'weekly' ? `weekly${capitalizedKey}Data` : currentTab.dataKey;
    return data[dataKey] || [];
  };

  const handleChat = () => {
    if(!chatInput) return;
    setChatLog([...chatLog, { role: 'user', text: chatInput }, { role: 'ai', text: '最新の予測値を計算中... 来週の物量はさらに5%増加する見込みです。' }]);
    setChatInput("");
  };

  const LargeChartCard = ({ title, labels, values, forecastValues, color, type }: any) => {
    const chartData = (labels || data.labels || []).map((l: string, i: number) => ({
      name: l,
      actual: values ? values[i] : 0,
      forecast: forecastValues ? forecastValues[i] : (values ? values[i] * 1.05 : 0)
    }));

    const currentActual = values ? values[values.length - 1] : 0;
    const prevActual = values && values.length > 1 ? values[values.length - 2] : 0;
    const diff = currentActual - prevActual;

    return (
      <div className="bg-white border border-slate-200 p-8 rounded-[2.5rem] shadow-sm flex flex-col gap-6">
        <div className="flex justify-between items-start">
          <div>
            <h4 className="text-lg font-black text-slate-900 uppercase">{title}</h4>
            <p className="text-[10px] text-slate-400 font-bold">{viewMode.toUpperCase()}_REPORT</p>
          </div>
          <div className="flex gap-6 text-right">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-400">実績値</span>
              <span className="text-2xl font-black text-slate-900">{currentActual.toLocaleString()}</span>
            </div>
            <div className="flex flex-col border-l border-slate-100 pl-6">
              <span className="text-[10px] font-bold text-slate-400">比較</span>
              <span className={`text-sm font-black ${diff >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                {diff >= 0 ? '▲' : '▼'} {Math.abs(diff).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            {type === 'bar' ? (
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" fontSize={11} axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="actual" fill={color} radius={[6, 6, 0, 0]} barSize={30} />
                <Bar dataKey="forecast" fill={color} opacity={0.2} radius={[6, 6, 0, 0]} barSize={15} />
              </BarChart>
            ) : (
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" fontSize={11} axisLine={false} tickLine={false} />
                <Tooltip />
                <Line type="monotone" dataKey="actual" stroke={color} strokeWidth={5} dot={{r: 5, fill: color, stroke: '#fff'}} />
                <Line type="monotone" dataKey="forecast" stroke={color} strokeWidth={2} strokeDasharray="6 6" opacity={0.4} dot={false} />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      <header className="h-20 bg-white border-b px-10 flex justify-between items-center sticky top-0 z-40 shadow-sm">
        <Link href="/" className="flex items-center gap-3 text-slate-400 font-black no-underline">
          <ArrowLeft size={18} /> <span className="text-sm">EXIT</span>
        </Link>
        <h1 className="text-xl font-black italic uppercase">{params.id}_COMMAND_CENTER</h1>
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
            <LargeChartCard key={i} title={m.title} labels={m.labels || data.labels} values={m.values} forecastValues={m.forecastValues} color={currentTab.color} type={currentTab.type} />
          ))}
        </div>
      </main>

      <div className="fixed bottom-6 right-6 w-80 z-50">
        <div className="bg-slate-900 rounded-[2rem] shadow-2xl overflow-hidden flex flex