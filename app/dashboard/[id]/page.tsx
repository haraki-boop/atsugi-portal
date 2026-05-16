// @ts-nocheck
'use client';
import { useEffect, useState } from 'react';
import { ArrowLeft, Activity, Calculator, TrendingUp, Calendar, Rocket, Leaf, MessageSquare, Clock, Bot, ThumbsUp, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Bar, Line, ComposedChart, Legend } from 'recharts';

export default function DashboardPage({ params }: { params: { id: string } }) {
  const [data, setData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('logistics');
  const [viewMode, setViewMode] = useState<'daily' | 'weekly'>('daily');

  const tabs = [
    { id: 'sales', label: '1. 売上・原価', icon: Calculator, color: '#2563eb' },
    { id: 'logistics', label: '2. 物量・工数', icon: Activity, color: '#059669' },
    { id: 'productivity', label: '3. 生産性', icon: TrendingUp, color: '#d97706' },
    { id: 'monthly', label: '4. 月次', icon: Calendar, color: '#ca8a04' },
    { id: 'dx', label: '5. DX推進', icon: Rocket, color: '#7c3aed' },
    { id: 'env', label: '6. 環境改善', icon: Leaf, color: '#0891b2' },
    { id: 'history', label: '7. 営業履歴', icon: MessageSquare, color: '#e11d48' },
    { id: 'manhours', label: '8. 工数', icon: Clock, color: '#475569' },
  ];

  useEffect(() => {
    const gasUrl = "https://script.google.com/macros/s/AKfycbyosyzeCglI2Pz2GWh_dbZXAgDslEV5DZrws5ulw24GrkI-fShocaWUdOLMfaNh_m0_/exec";
    fetch(gasUrl).then(res => res.json()).then(json => setData(json));
  }, []);

  if (!data) return <div className="h-screen bg-slate-950 flex items-center justify-center text-blue-400 font-mono animate-pulse uppercase tracking-[0.4em]">SYNCING_METRICS_STREAM...</div>;

  const currentTab = tabs.find(t => t.id === activeTab) || tabs[1];

  // ③ 週次バグの修正＆フォールバックロジック
  const getCombinedMetrics = () => {
    // スプレッドシート側の命名「weeklyLogisticsData」等、または「logisticsData」を自動参照
    const keySuffix = currentTab.id.charAt(0).toUpperCase() + currentTab.id.slice(1);
    const baseKey = viewMode === 'weekly' ? `weekly${keySuffix}Data` : `${currentTab.id}Data`;
    
    // もし週次データが空っぽなら、日次データを週次用にギュッと自動集計して表示させる安全装置
    let allItems = data[baseKey] || data[`${currentTab.id}Data`] || [];
    const combinedMap = new Map();

    allItems.forEach(item => {
      const cleanTitle = item.title.replace('実績_', '').replace('予測_', '').replace('予算_', '').replace('目標_', '');

      if (!combinedMap.has(cleanTitle)) {
        combinedMap.set(cleanTitle, { 
          title: cleanTitle, 
          labels: item.labels || data.labels || ["日", "月", "火", "水", "木", "金", "土"], 
          actual: [], 
          forecast: [],
          forecastType: '予測・目標'
        });
      }
      
      const entry = combinedMap.get(cleanTitle);
      if (item.title.startsWith('実績_')) {
        entry.actual = item.values;
      } else {
        entry.forecast = item.values;
        entry.forecastType = item.title.split('_')[0];
      }
    });

    return Array.from(combinedMap.values());
  };

  const ChartCard = ({ metric, color }: any) => {
    const chartData = metric.labels.map((l, i) => ({
      name: l,
      "実績": metric.actual[i] || 0,
      [metric.forecastType]: metric.forecast[i] || 0
    }));

    // 直近の実績と予測の数値を計算
    const latestActual = metric.actual[metric.actual.length - 1] || 0;
    const latestForecast = metric.forecast[metric.forecast.length - 1] || 1;
    const performanceRatio = ((latestActual / latestForecast) * 100).toFixed(1);
    const gapPercent = ((latestActual / latestForecast - 1) * 100).toFixed(1);

    // ④ グラフの下に綺麗に収まるインライン型AI評価ロジック
    const generateAIEvaluation = (ratio, title) => {
      const num = Number(ratio);
      if (num >= 100) {
        return {
          status: 'EXCELLENT',
          color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          icon: <ThumbsUp size={14} className="text-emerald-600" />,
          text: `【AI評価】${title}は目標をクリア（達成率${ratio}%）。極めて順調な推移です。現状のオペレーションを維持してください。`
        };
      } else if (num >= 90) {
        return {
          status: 'STABLE',
          color: 'bg-blue-50 text-blue-700 border-blue-200',
          icon: <Bot size={14} className="text-blue-600" />,
          text: `【AI評価】${title}は許容圏内（達成率${ratio}%）。微小な乖離がありますが、計画値の範囲内。特段の対策は不要です。`
        };
      } else {
        return {
          status: 'WARNING',
          color: 'bg-rose-50 text-rose-700 border-rose-200',
          icon: <AlertTriangle size={14} className="text-rose-600" />,
          text: `【AI評価】警告。${title}が計画を大きく下回っています（乖離 ${gapPercent}%）。原因リソースの特定とリカバリープランが必要です。`
        };
      }
    };

    const aiEval = generateAIEvaluation(performanceRatio, metric.title);

    return (
      <div className="bg-white border border-slate-200 p-8 rounded-[2.5rem] shadow-md flex flex-col gap-6 transition-all hover:shadow-lg">
        <div className="flex justify-between items-start">
          <h4 className="text-lg font-black text-slate-900 tracking-tighter uppercase">{metric.title}</h4>
          
          {/* ③ グラフの横（右上）に数値を並べて対比表示するデザイン */}
          <div className="flex gap-6 text-right items-center">
            <div className="border-r pr-4 border-slate-100">
              <p className="text-[9px] font-bold text-slate-400 uppercase">Latest Actual</p>
              <p className="text-xl font-black text-slate-800 tracking-tight">{latestActual.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-[9px] font-bold text-slate-400 uppercase">vs {metric.forecastType}</p>
              <p className={`text-xl font-black tracking-tight ${Number(gapPercent) >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {Number(gapPercent) > 0 ? '+' : ''}{gapPercent}%
              </p>
            </div>
          </div>
        </div>

        {/* ② 視認性を爆上げした発光型の強インパクトな線グラフデザイン */}
        <div className="h-[260px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '16px', border: 'none', shadow: 'md'}} />
              <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{fontSize: '10px', fontWeight: 'bold', paddingBottom: '15px'}} />
              
              <Bar name="実績" dataKey="実績" fill={color} radius={[4, 4, 0, 0]} barSize={28} opacity={0.85} />
              
              {/* 予測線：太さを3にし、はっきりしたビビッドなダークネイビー＆純白の二重ドット構造で視覚的に絶対に迷子にさせない設計 */}
              <Line 
                name={metric.forecastType} 
                type="monotone" 
                dataKey={metric.forecastType} 
                stroke="#0f172a" 
                strokeWidth={3.5} 
                dot={{ r: 5, fill: '#ffffff', stroke: '#0f172a', strokeWidth: 2.5 }} 
                activeDot={{ r: 7 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* ④ グラフエリアの下部に完全に組み込まれた、絶対に邪魔にならないAI評価表示 */}
        <div className={`p-4 rounded-2xl border text-[11px] font-bold flex items-center gap-3 ${aiEval.color}`}>
          <div className="p-1.5 bg-white rounded-lg shadow-sm shrink-0">{aiEval.icon}</div>
          <p className="leading-relaxed">{aiEval.text}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-20">
      <header className="h-20 bg-white border-b border-slate-200 px-10 flex justify-between items-center sticky top-0 z-40 shadow-sm backdrop-blur-md bg-white/80">
        <Link href="/" className="flex items-center gap-2 text-slate-400 no-underline font-black hover:text-blue-600 transition-all">
          <ArrowLeft size={16} /> <span className="text-xs">PORTAL</span>
        </Link>
        <div className="text-center">
          <h1 className="text-lg font-black italic tracking-tighter uppercase text-slate-800">経営ダッシュボード : 昭和冷蔵</h1>
          <p className="text-[9px] font-bold text-blue-600 tracking-[0.25em] uppercase">Operations Control Dashboard</p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
          <button onClick={() => setViewMode('daily')} className={`px-6 py-2 rounded-xl text-[10px] font-black transition-all ${viewMode === 'daily' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'}`}>DAILY</button>
          <button onClick={() => setViewMode('weekly')} className={`px-6 py-2 rounded-xl text-[10px] font-black transition-all ${viewMode === 'weekly' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'}`}>WEEKLY</button>
        </div>
      </header>

      <main className="p-10 max-w-[1800px] mx-auto space-y-8">
        <div className="flex flex-wrap gap-2.5">
          {tabs.map((t) => (
            <button key={t.id} onClick={() => setActiveTab(t.id)} className={`px-6 py-3 rounded-2xl transition-all font-black text-xs ${activeTab === t.id ? `bg-slate-900 text-white shadow-lg scale-102` : 'bg-white border text-slate-500 hover:bg-slate-50'}`}>
              {t.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {getCombinedMetrics().map((m, i) => (
            <ChartCard key={i} metric={m} color={currentTab.color} />
          ))}
        </div>
      </main>
    </div>
  );
}