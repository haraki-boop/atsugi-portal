// @ts-nocheck
'use client';
import { useEffect, useState } from 'react';
import { ArrowLeft, Activity, Calculator, TrendingUp, Calendar, Rocket, Leaf, MessageSquare, Clock, Bot, ThumbsUp, AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Bar, Line, ComposedChart, Legend } from 'recharts';

export default function DashboardPage({ params }: { params: { id: string } }) {
  const [data, setData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('logistics');

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

  if (!data) return <div className="h-screen bg-slate-950 flex items-center justify-center text-blue-400 font-mono animate-pulse uppercase tracking-[0.4em]">SYNCING_MANAGEMENT_BRAIN...</div>;

  const currentTab = tabs.find(t => t.id === activeTab) || tabs[1];
  const lowIsBetterMetrics = ["労務費", "タイミー", "外注費", "社会保険", "雇用保険", "有給", "交通費", "工数"];

  const getCombinedMetrics = () => {
    let allItems = data[`${currentTab.id}Data`] || [];
    const combinedMap = new Map();

    allItems.forEach(item => {
      // 先頭の文字を削る
      const rawTitle = item.title.replace('実績_', '').replace('予測_', '').replace('予算_', '').replace('目標_', '');
      
      // ①【お兄ちゃん救済】もしシートの打ち間違え等で「ソ」になっていたら「社会保険」に自動補正する
      const cleanTitle = rawTitle === 'ソ' ? '社会保険' : rawTitle;

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

  // ② AI診断：経営のエキスパートとして、純粋に数字と財務・予算管理の評価に特化
  const getAiCorporateEvaluation = (metric) => {
    const latestActual = metric.actual[metric.actual.length - 1] || 0;
    const latestForecast = metric.forecast[metric.forecast.length - 1] || 1;
    const isLowBetter = lowIsBetterMetrics.some(keyword => metric.title.includes(keyword));
    const ratio = (latestActual / latestForecast) * 100;

    let status = 'STABLE';
    let color = 'text-slate-700 bg-slate-50 border-slate-200';
    let icon = <Bot size={14} className="text-slate-600" />;
    let comment = "";

    if (isLowBetter) {
      if (ratio <= 92) {
        status = 'EXCELLENT';
        color = 'text-emerald-700 bg-emerald-50 border-emerald-200';
        icon = <CheckCircle2 size={14} className="text-emerald-600" />;
        comment = `【経営財務診断：利益上振れ】『${metric.title}』は予算比${ratio.toFixed(1)}%と大幅なコスト抑制に成功。投下資本利益率（ROI）を引き上げる好材料です。このまま固定費・流動費のコントロールを維持し、当期の経常利益目標の達成確度を高めてください。`;
      } else if (ratio > 92 && ratio <= 103) {
        status = 'STABLE';
        color = 'text-blue-700 bg-blue-50 border-blue-200';
        icon = <Bot size={14} className="text-blue-600" />;
        comment = `【経営財務診断：予算内推移】『${metric.title}』は執行率${ratio.toFixed(1)}%と適正な予算枠内で着地。財務計画との乖離はなく、事業計画上のシミュレーション通りにキャッシュフローが推移しています。現状の投資配分のまま次節へ移行可能です。`;
      } else {
        status = 'WARNING';
        color = 'text-rose-700 bg-rose-50 border-rose-200';
        icon = <ShieldAlert size={14} className="text-rose-600" />;
        comment = `【経営財務診断：予算超過アラート】『${metric.title}』が計画比${(ratio - 100).toFixed(1)}%超過し、利益圧迫要因となっています。投下コストに対するリターン（生産性）が損なわれている可能性があるため、緊急のコスト構造の見直しとリソース再配分を要します。`;
      }
    } else {
      if (ratio >= 105) {
        status = 'EXCELLENT';
        color = 'text-emerald-700 bg-emerald-50 border-emerald-200';
        icon = <ThumbsUp size={14} className="text-emerald-600" />;
        comment = `【経営財務診断：トップライン急拡大】『${metric.title}』は目標比${ratio.toFixed(1)}%の大幅プラス着地。売上損益分岐点を大きく超え、限界利益の積み上げに多大に貢献しています。この増収トレンドを維持し、全社的なシェア拡大に向けた攻めのリソース投資を推奨します。`;
      } else if (ratio >= 95 && ratio < 105) {
        status = 'STABLE';
        color = 'text-blue-700 bg-blue-50 border-blue-200';
        icon = <Bot size={14} className="text-blue-600" />;
        comment = `【経営財務診断：計画達成】『${metric.title}』は達成率${ratio.toFixed(1)}%と手堅く推移。経営マイルストーンに沿った順調なマスタ進捗であり、中期経営計画に想定された利益水準を確保できています。既存戦略を維持し、安定稼働を継続してください。`;
      } else {
        status = 'WARNING';
        color = 'text-rose-700 bg-rose-50 border-rose-200';
        icon = <AlertTriangle size={14} className="text-rose-600" />;
        comment = `【経営財務診断：未達アラート】『${metric.title}』が計画の${ratio.toFixed(1)}%に留まり、収益計画に赤信号が灯っています。この状態の長期化は通期業績予想の下方修正リスクに直結するため、即座に販売・運用チャネルのボトルネック特定とテコ入れが必要です。`;
      }
    }

    return { status, color, icon, comment, ratio: ratio.toFixed(1), latestActual, latestForecast };
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-20">
      <header className="h-20 bg-white border-b border-slate-200 px-10 flex justify-between items-center sticky top-0 z-40 backdrop-blur-md bg-white/80">
        <Link href="/" className="flex items-center gap-2 text-slate-400 no-underline font-black hover:text-blue-600 transition-all">
          <ArrowLeft size={16} /> <span className="text-xs">PORTAL</span>
        </Link>
        <div className="text-center">
          <h1 className="text-lg font-black italic tracking-tighter uppercase text-slate-800">経営ダッシュボード : 昭和冷蔵</h1>
          <p className="text-[9px] font-bold text-blue-600 tracking-[0.2em] uppercase">Daily Management Analytics Stream</p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
          <span className="px-6 py-2 bg-white shadow-sm rounded-xl text-[10px] font-black text-blue-600">DAILY MODE</span>
        </div>
      </header>

      <main className="p-10 max-w-[1800px] mx-auto space-y-8">
        <div className="flex flex-wrap gap-2.5">
          {tabs.map((t) => (
            <button key={t.id} onClick={() => setActiveTab(t.id)} className={`px-6 py-3 rounded-2xl transition-all font-black text-xs ${activeTab === t.id ? `bg-slate-900 text-white shadow-lg` : 'bg-white border text-slate-500 hover:bg-slate-50'}`}>
              {t.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {metrics.map((m, i) => {
            const evalData = getAiCorporateEvaluation(m);
            const isCost = lowIsBetterMetrics.some(k => m.title.includes(k));

            const chartData = m.labels.map((l, idx) => ({
              name: l,
              "実績": m.actual[idx] || 0,
              [m.forecastType]: m.forecast[idx] || 0
            }));

            return (
              <div key={i} className="bg-white border border-slate-200 p-8 rounded-[2.5rem] shadow-md flex flex-col gap-6">
                
                {/* グラフのタイトル＆右側KPI対比（完全固定） */}
                <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                  <div>
                    <h4 className="text-lg font-black text-slate-900 tracking-tighter uppercase">{m.title}</h4>
                    <p className="text-[10px] font-bold text-slate-400 mt-0.5 uppercase tracking-widest">vs {m.forecastType} Executive Matrix</p>
                  </div>
                  <div className="flex gap-6 text-right items-center">
                    <div className="border-r pr-4 border-slate-100">
                      <p className="text-[9px] font-bold text-slate-400 uppercase">Latest Actual</p>
                      <p className="text-xl font-black text-slate-800 tracking-tight">{evalData.latestActual.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase">Ratio</p>
                      <p className={`text-xl font-black ${Number(evalData.ratio) >= 100 ? (isCost ? 'text-rose-600' : 'text-emerald-600') : (isCost ? 'text-emerald-600' : 'text-rose-600')}`}>{evalData.ratio}%</p>
                    </div>
                  </div>
                </div>

                {/* グラフ描写エリア */}
                <div className="h-[280px] w-full bg-slate-50/50 p-4 rounded-3xl border border-slate-100">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} axisLine={false} tickLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={10} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }} />
                      
                      {/* ②【名前判明！】「実績」と「予測」をパッと判別させるための「凡例（Legend）」を完全復活！ */}
                      <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', paddingBottom: '15px' }} />
                      
                      {/* 実績：先端を丸くしたスタイリッシュなカプセルバー */}
                      <Bar 
                        name="実績" 
                        dataKey="実績" 
                        fill={currentTab.color} 
                        radius={[10, 10, 0, 0]} 
                        barSize={20} 
                      />
                      
                      {/* ③ 予測・目標：〇（ドット）を完全消去した、シャープで知的な「高貴なパープル線」 */}
                      <Line 
                        name={m.forecastType} 
                        type="monotone" 
                        dataKey={m.forecastType} 
                        stroke="#7c3aed" /* 知的なパープル */
                        strokeWidth={3} 
                        dot={false} /* 〇はいらん！を完全実現 */
                        activeDot={{ r: 6, stroke: '#7c3aed', strokeWidth: 2, fill: '#fff' }} /* ホバー時だけ丸が出る親切設計 */
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>

                {/* AI自動評価：経営・財務特化パネル */}
                <div className={`p-5 rounded-3xl border text-[11px] font-medium flex items-start gap-4 shadow-sm leading-relaxed ${evalData.color}`}>
                  <div className="p-2 bg-white rounded-xl shadow-sm shrink-0 mt-0.5">{evalData.icon}</div>
                  <p>{evalData.comment}</p>
                </div>

              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}