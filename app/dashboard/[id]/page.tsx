// @ts-nocheck
'use client';
import { useEffect, useState } from 'react';
import { ArrowLeft, Activity, Calculator, TrendingUp, Calendar, Rocket, Leaf, MessageSquare, Clock, Bot, ThumbsUp, AlertTriangle, TrendingDown, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Bar, Line, ComposedChart, Legend, Cell } from 'recharts';

export default function DashboardPage({ params }: { params: { id: string } }) {
  const [data, setData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('logistics');
  const [viewMode, setViewMode] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [selectedWeek, setSelectedWeek] = useState(1); // 週目切り替え用

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

  if (!data) return <div className="h-screen bg-slate-950 flex items-center justify-center text-blue-400 font-mono animate-pulse uppercase tracking-[0.4em]">SYNCING_STRATEGIC_UNIT...</div>;

  const currentTab = tabs.find(t => t.id === activeTab) || tabs[1];

  // ② 下振れが好調な項目のリスト
  const lowIsBetterMetrics = ["労務費", "タイミー", "外注費", "社会保険", "雇用保険", "有給", "交通費", "工数"];

  const getCombinedMetrics = () => {
    const keySuffix = currentTab.id.charAt(0).toUpperCase() + currentTab.id.slice(1);
    const baseKey = viewMode === 'weekly' ? `weekly${keySuffix}Data` : (viewMode === 'monthly' ? `monthly${keySuffix}Data` : `${currentTab.id}Data`);
    
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
          forecastType: '予測'
        });
      }
      const entry = combinedMap.get(cleanTitle);
      if (item.title.startsWith('実績_')) entry.actual = item.values;
      else {
        entry.forecast = item.values;
        entry.forecastType = item.title.split('_')[0];
      }
    });

    return Array.from(combinedMap.values());
  };

  const metrics = getCombinedMetrics();

  // AI判定ロジック（逆転対応版）
  const getAiEvaluation = (metric) => {
    const latestActual = metric.actual[metric.actual.length - 1] || 0;
    const latestForecast = metric.forecast[metric.forecast.length - 1] || 1;
    const isLowBetter = lowIsBetterMetrics.some(keyword => metric.title.includes(keyword));
    const ratio = (latestActual / latestForecast) * 100;

    let status = 'STABLE';
    let color = 'text-blue-600 bg-blue-50 border-blue-100';
    let icon = <Bot size={14} />;
    let comment = `順調に推移しています。`;

    if (isLowBetter) {
      // コスト・工数：低いほうがいい
      if (ratio <= 95) {
        status = 'EXCELLENT';
        color = 'text-emerald-600 bg-emerald-50 border-emerald-100';
        icon = <CheckCircle2 size={14} />;
        comment = `【好調】コスト抑制が非常に良好です。`;
      } else if (ratio > 105) {
        status = 'WARNING';
        color = 'text-rose-600 bg-rose-50 border-rose-100';
        icon = <AlertTriangle size={14} />;
        comment = `【警告】予算を超過しています。抑制策を検討してください。`;
      }
    } else {
      // 売上・生産性：高いほうがいい
      if (ratio >= 105) {
        status = 'EXCELLENT';
        color = 'text-emerald-600 bg-emerald-50 border-emerald-100';
        icon = <ThumbsUp size={14} />;
        comment = `【好調】目標を大きく上回っています。`;
      } else if (ratio < 95) {
        status = 'WARNING';
        color = 'text-rose-600 bg-rose-50 border-rose-100';
        icon = <TrendingDown size={14} />;
        comment = `【注意】目標に届いていません。対策が必要です。`;
      }
    }

    return { status, color, icon, comment, ratio: ratio.toFixed(1), latestActual, latestForecast, isLowBetter };
  };

  // ④ 月次スコアシートのレンダリング
  const renderMonthlyScoreSheet = () => (
    <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-xl">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200">
            <th className="px-8 py-6 text-xs font-black uppercase tracking-widest text-slate-500">項目名</th>
            <th className="px-8 py-6 text-xs font-black uppercase tracking-widest text-slate-500 text-right">当月予測</th>
            <th className="px-8 py-6 text-xs font-black uppercase tracking-widest text-slate-500 text-right">当月実績</th>
            <th className="px-8 py-6 text-xs font-black uppercase tracking-widest text-slate-500 text-right">実績比 (%)</th>
            <th className="px-8 py-6 text-xs font-black uppercase tracking-widest text-slate-500">AI診断</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {metrics.map((m, i) => {
            const evalData = getAiEvaluation(m);
            const diff = evalData.latestActual - evalData.latestForecast;
            return (
              <tr key={i} className="hover:bg-slate-50 transition-colors">
                <td className="px-8 py-6 font-black text-slate-800 uppercase">{m.title}</td>
                <td className="px-8 py-6 text-right font-mono text-slate-500">{evalData.latestForecast.toLocaleString()}</td>
                <td className="px-8 py-6 text-right font-black text-slate-900">{evalData.latestActual.toLocaleString()}</td>
                <td className="px-8 py-6 text-right">
                  <span className={`px-3 py-1 rounded-full text-xs font-black ${evalData.color}`}>
                    {evalData.ratio}%
                  </span>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-2">
                    <div className="p-1 bg-white rounded shadow-sm">{evalData.icon}</div>
                    <span className="text-[11px] font-bold text-slate-600">{evalData.comment}</span>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-20">
      <header className="h-20 bg-white border-b border-slate-200 px-10 flex justify-between items-center sticky top-0 z-40 backdrop-blur-md bg-white/80">
        <Link href="/" className="flex items-center gap-2 text-slate-400 no-underline font-black hover:text-blue-600">
          <ArrowLeft size={16} /> <span className="text-xs">PORTAL</span>
        </Link>
        <div className="text-center">
          <h1 className="text-lg font-black italic tracking-tighter uppercase text-slate-800">経営ダッシュボード : 昭和冷蔵</h1>
          <div className="flex justify-center gap-4 text-[9px] font-bold text-blue-600 tracking-[0.2em] uppercase">
            <span>Operational Logistics Unit</span>
            <span className="text-slate-300">|</span>
            <span>{viewMode} Insight</span>
          </div>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
          {['daily', 'weekly', 'monthly'].map((v) => (
            <button key={v} onClick={() => setViewMode(v)} className={`px-6 py-2 rounded-xl text-[10px] font-black transition-all ${viewMode === v ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400 uppercase'}`}>
              {v}
            </button>
          ))}
        </div>
      </header>

      <main className="p-10 max-w-[1800px] mx-auto space-y-8">
        {/* 週次選択時のフィルター */}
        {viewMode === 'weekly' && (
          <div className="flex justify-center animate-in fade-in slide-in-from-top-2 duration-500">
            <div className="bg-white p-1.5 rounded-2xl border border-slate-200 flex shadow-sm">
              {[1, 2, 3, 4, 5].map((w) => (
                <button key={w} onClick={() => setSelectedWeek(w)} className={`px-8 py-2.5 rounded-xl text-xs font-black transition-all ${selectedWeek === w ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}>
                  {w}週目
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-2.5">
          {tabs.map((t) => (
            <button key={t.id} onClick={() => setActiveTab(t.id)} className={`px-6 py-3 rounded-2xl transition-all font-black text-xs ${activeTab === t.id ? `bg-slate-900 text-white shadow-lg` : 'bg-white border text-slate-500 hover:bg-slate-50'}`}>
              {t.label}
            </button>
          ))}
        </div>

        {viewMode === 'monthly' ? renderMonthlyScoreSheet() : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in duration-700">
            {metrics.map((m, i) => {
              const evalData = getAiEvaluation(m);
              const chartData = m.labels.map((l, idx) => ({
                name: l,
                "実績": m.actual[idx] || 0,
                [m.forecastType]: m.forecast[idx] || 0
              }));

              return (
                <div key={i} className="bg-white border border-slate-200 p-8 rounded-[2.5rem] shadow-md flex flex-col gap-6">
                  <div className="flex justify-between items-start">
                    <h4 className="text-lg font-black text-slate-900 tracking-tighter uppercase">{m.title}</h4>
                    <div className="text-right">
                      <p className="text-[9px] font-bold text-slate-400 uppercase">Ratio vs {m.forecastType}</p>
                      <p className={`text-xl font-black ${evalData.color.split(' ')[0]}`}>{evalData.ratio}%</p>
                    </div>
                  </div>

                  <div className="h-[280px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                        <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} axisLine={false} tickLine={false} />
                        <YAxis hide />
                        <Tooltip contentStyle={{borderRadius: '16px', border: 'none'}} />
                        <Bar name="実績" dataKey="実績" fill={currentTab.color} radius={[4, 4, 0, 0]} barSize={24} />
                        {/* ① 線グラフの色をオレンジ〜赤（#ff4d00）に変更 */}
                        <Line 
                          name={m.forecastType} 
                          type="monotone" 
                          dataKey={m.forecastType} 
                          stroke="#ff4d00" 
                          strokeWidth={4} 
                          dot={{ r: 5, fill: '#fff', stroke: '#ff4d00', strokeWidth: 2 }} 
                          activeDot={{ r: 8, stroke: '#ff4d00' }}
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>

                  <div className={`p-4 rounded-2xl border text-[11px] font-bold flex items-center gap-3 ${evalData.color}`}>
                    <div className="p-1.5 bg-white rounded-lg shadow-sm">{evalData.icon}</div>
                    <p>{evalData.comment}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}