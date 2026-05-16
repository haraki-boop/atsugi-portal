// @ts-nocheck
'use client';
import { useEffect, useState } from 'react';
import { ArrowLeft, Activity, Calculator, TrendingUp, Calendar, Rocket, Leaf, MessageSquare, Clock } from 'lucide-react';
import Link from 'next/link';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Bar, Line, ComposedChart, Legend } from 'recharts';

export default function DashboardPage({ params }: { params: { id: string } }) {
  const [data, setData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('logistics');
  const [displayMode, setDisplayMode] = useState<'daily' | 'weekly'>('daily');
  const [selectedWeek, setSelectedWeek] = useState<number>(0);

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
    fetch(gasUrl)
      .then(res => res.json())
      .then(json => {
        if (json && typeof json === 'object') {
          setData(json);
        }
      }).catch(e => console.error("GAS fetch error", e));
  }, []);

  if (!data) return <div className="h-screen bg-slate-950 flex items-center justify-center text-blue-400 font-mono animate-pulse uppercase tracking-[0.4em]">SYNCING_MANAGEMENT_BRAIN...</div>;

  const currentTab = tabs.find(t => t.id === activeTab) || tabs[1];
  const lowIsBetterMetrics = ["労務費", "タイミー", "外注費", "社会保険", "雇用保険", "有給", "交通費", "工数", "原価", "総工数", "事故金額"];
  const totalMetricsKeywords = ["売上", "原価", "費", "工数", "物量", "タイミー", "有給", "交通費"];

  const n = (val: any) => {
    if (val === undefined || val === null || val === "") return 0;
    const parsed = parseFloat(val.toString().replace(/[^0-9.-]/g, ''));
    return isNaN(parsed) ? 0 : parsed;
  };

  const getWeeklyGroups = (labels: string[]) => {
    const groups: { weekNum: number; label: string; indices: number[] }[] = [];
    if (!labels || labels.length === 0) return groups;
    let currentWeekIndices: number[] = [];
    let weekCount = 1;
    let startLabel = labels[0];
    labels.forEach((label, idx) => {
      if (!label || !label.includes('/')) { currentWeekIndices.push(idx); return; }
      const parts = label.split('/');
      const date = new Date(2026, parseInt(parts[0], 10) - 1, parseInt(parts[1], 10));
      if (date.getDay() === 0 && currentWeekIndices.length > 0) {
        groups.push({ weekNum: weekCount, label: `${weekCount}週目 (${startLabel} ～ ${labels[idx - 1]})`, indices: currentWeekIndices });
        weekCount++;
        startLabel = label;
        currentWeekIndices = [];
      }
      currentWeekIndices.push(idx);
    });
    if (currentWeekIndices.length > 0) groups.push({ weekNum: weekCount, label: `${weekCount}週目 (${startLabel} ～ ${labels[labels.length - 1]})`, indices: currentWeekIndices });
    return groups;
  };

  const baseLabels = data.labels || ["4/1"];
  const weeklyGroups = getWeeklyGroups(baseLabels);

  const getCombinedMetrics = () => {
    let allItems = data[`${currentTab.id}Data`] || [];
    const combinedMap = new Map();
    if (!Array.isArray(allItems)) return [];

    allItems.forEach(item => {
      if (!item || !item.title) return;
      if (!item.values || !Array.isArray(item.values)) return;

      const normalizedTitle = item.title.replace('＿', '_');
      let rawTitle = normalizedTitle.replace('実績_', '').replace('予測_', '').replace('予算_', '').replace('目標_', '');
      let cleanTitle = item.title.includes('社会保険') ? '社会保険' : rawTitle;
      if (!combinedMap.has(cleanTitle)) {
        combinedMap.set(cleanTitle, { title: cleanTitle, labels: item.labels || baseLabels, actual: [], forecast: [], forecastType: '予測' });
      }
      const entry = combinedMap.get(cleanTitle);
      if (item.title.startsWith('実績_') || item.title.startsWith('実績＿')) entry.actual = item.values || [];
      else { entry.forecast = item.values || []; entry.forecastType = normalizedTitle.split('_')[0] || '予測'; }
    });
    return Array.from(combinedMap.values());
  };

  const allMetrics = getCombinedMetrics();

  const getAiCorporateEvaluation = (title: string, actual: number, forecast: number, mode: string, isTotal: boolean) => {
    const isLowBetter = lowIsBetterMetrics.some(keyword => title.includes(keyword));
    const ratio = forecast > 0 ? (actual / forecast) * 100 : 0;
    const modeText = mode === 'daily' ? '直近' : `当週${isTotal ? '合計' : '平均'}`;
    let comment = "";
    let color = 'text-slate-700 bg-slate-50 border-slate-200';

    if (isLowBetter) {
      if (ratio <= 92) { color = 'text-emerald-700 bg-emerald-50 border-emerald-200'; comment = `【経営財務診断】『${title}』は${modeText}で予測比${ratio.toFixed(1)}%と大幅なコスト抑制に成功しています。`; }
      else if (ratio > 103) { color = 'text-rose-700 bg-rose-50 border-rose-200'; comment = `【経営財務診断】『${title}』の${modeText}が計画比${(ratio - 100).toFixed(1)}%超過し利益圧迫要因となっています。`; }
      else { comment = `【経営財務診断】『${title}』は${modeText}の執行率${ratio.toFixed(1)}%と適正な予測枠内で着地。計画通りです。`; }
    } else {
      if (ratio >= 105) { color = 'text-emerald-700 bg-emerald-50 border-emerald-200'; comment = `『${title}』は${modeText}で目標比${ratio.toFixed(1)}%の大幅プラス着地。限界利益の積み上げに多大に貢献しています。`; }
      else if (ratio < 95) { color = 'text-rose-700 bg-rose-50 border-rose-200'; comment = `【経営財務診断】『${title}』の${modeText}が計画の${ratio.toFixed(1)}%に留まり、即座のテコ入れが必要です。`; }
      else { comment = `【経営財務診断】『${title}』は${modeText}達成率${ratio.toFixed(1)}%と手堅く推移。順調な利益水準を確保できています。`; }
    }
    return { color, comment };
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-20 relative">
      <header className="h-20 bg-white border-b border-slate-200 px-10 flex justify-between items-center sticky top-0 z-40 backdrop-blur-md bg-white/80">
        <Link href="/" className="flex items-center gap-2 text-slate-400 no-underline font-black hover:text-blue-600">
          <ArrowLeft size={16} /> <span className="text-xs">ポータルへ戻る</span>
        </Link>
        <div className="text-center">
          <h1 className="text-lg font-black italic tracking-tighter uppercase text-slate-800">経営ダッシュボード : 昭和冷蔵</h1>
          <p className="text-[9px] font-bold text-blue-600 tracking-[0.2em] uppercase">{displayMode === 'daily' ? 'DAILY' : 'WEEKLY'} ANALYTICS</p>
        </div>
        {activeTab !== 'monthly' && (
          <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 gap-1">
            <button onClick={() => setDisplayMode('daily')} className={`px-4 py-1.5 rounded-xl text-[10px] font-black transition-all ${displayMode === 'daily' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}>日次</button>
            <button onClick={() => setDisplayMode('weekly')} className={`px-4 py-1.5 rounded-xl text-[10px] font-black transition-all ${displayMode === 'weekly' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}>週次</button>
          </div>
        )}
      </header>

      <main className="p-10 max-w-[1800px] mx-auto space-y-8 relative z-10">
        <div className="flex flex-wrap gap-2.5">
          {tabs.map((t) => (
            <button key={t.id} onClick={() => { setActiveTab(t.id); if (t.id === 'monthly') setDisplayMode('daily'); }} className={`px-6 py-3 rounded-2xl transition-all font-black text-xs ${activeTab === t.id ? `bg-slate-900 text-white shadow-lg` : 'bg-white border text-slate-500 hover:bg-slate-50'}`}>{t.label}</button>
          ))}
        </div>

        {displayMode === 'weekly' && activeTab !== 'monthly' && (
          <div className="bg-white border border-slate-200 p-4 rounded-3xl shadow-sm flex flex-wrap gap-2 items-center">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider mr-2 ml-1">週選択:</span>
            {weeklyGroups.map((g, idx) => (
              <button onClick={() => setSelectedWeek(idx)} className={`px-5 py-2.5 rounded-xl font-black text-xs transition-all ${selectedWeek === idx ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}>{g.label}</button>
            ))}
          </div>
        )}

        {/* 🌟 4. 月次タブ（調整用空スペース） */}
        {activeTab === 'monthly' ? (
          <div className="bg-slate-950 p-12 rounded-[3rem] border border-white/10 text-center text-slate-400 space-y-4">
            <p className="text-xl font-black text-amber-400 tracking-wider">🛠️ 月次データ表示エリア（指示待ち調整中）</p>
            <p className="text-xs text-slate-500">日次・週次の安全確認のため、月次のパースロジックは一度完全に停止しています。</p>
          </div>
        ) : (
          /* 📅 1〜3, 5〜8番タブ：【日次はそのまま、週次だけ2カラム横並び】に完全制御！ */
          <div className="space-y-8 relative z-10">
            {allMetrics.map((m: any, i: number) => {
              const isCost = lowIsBetterMetrics.some(keyword => m.title.includes(keyword));
              const isTotalType = totalMetricsKeywords.some(keyword => m.title.includes(keyword));
              const weekIdx = weeklyGroups[selectedWeek]?.indices || [];
              let chartData: any[] = []; let dispAct = 0; let dispFct = 0;

              if (displayMode === 'daily') {
                chartData = m.labels.map((l: string, idx: number) => ({
                  name: l,
                  "実績": m.actual[idx] || 0,
                  "予測データ": m.forecast[idx] || 0
                }));
                dispAct = m.actual[m.actual.length - 1] || 0; dispFct = m.forecast[m.forecast.length - 1] || 1;
              } else {
                chartData = weekIdx.map((idx: number) => ({
                  name: m.labels[idx],
                  "実績": m.actual[idx] || 0,
                  "予測データ": m.forecast[idx] || 0
                }));
                const acts = weekIdx.map((idx: number) => m.actual[idx] || 0); const fcts = weekIdx.map((idx: number) => m.forecast[idx] || 0);
                if (isTotalType) { dispAct = acts.reduce((a, b) => a + b, 0); dispFct = fcts.reduce((a, b) => a + b, 0); }
                else { dispAct = acts.length ? acts.reduce((a, b) => a + b, 0) / acts.length : 0; dispFct = fcts.length ? fcts.reduce((a, b) => a + b, 0) / fcts.length : 0; }
              }

              const evalData = getAiCorporateEvaluation(m.title, dispAct, dispFct, displayMode, isTotalType);
              const ratio = dispFct > 0 ? (dispAct / dispFct) * 100 : 0;

              return (
                <div key={i} className="bg-white border border-slate-200 p-8 rounded-[3rem] shadow-sm flex flex-col gap-6">
                  <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                    <div>
                      <h4 className="text-xl font-black text-slate-900 tracking-tighter uppercase">{m.title}</h4>
                      <p className="text-[10px] font-bold text-slate-400 mt-0.5 uppercase tracking-widest">vs {m.forecastType || '予測'}</p>
                    </div>
                    {/* 💥 お兄ちゃん指定：日次モードの時は右上のシンプルな実績表示をそのまま維持！ */}
                    {displayMode === 'daily' && (
                      <div className="flex gap-6 text-right items-center">
                        <div className="border-r pr-4 border-slate-100">
                          <p className="text-[9px] font-bold text-slate-400 uppercase">直近の実績</p>
                          <p className="text-xl font-black text-slate-800 tracking-tight">{dispAct.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-[9px] font-bold text-slate-400 uppercase">{(m.forecastType || '予測')}比</p>
                          <p className={`text-xl font-black ${ratio >= 100 ? (isCost ? 'text-rose-600' : 'text-emerald-600') : (isCost ? 'text-emerald-600' : 'text-rose-600')}`}>{ratio.toFixed(1)}%</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 💥 表示モードでレイアウトを動的にスイッチ！ */}
                  {displayMode === 'daily' ? (
                    /* 📅 【日次モード】：お兄ちゃんお気に入りの1列フルワイド仕様（そのまま固定） */
                    <div className="space-y-6">
                      <div className="bg-slate-50/50 p-6 rounded-[2.5rem] border border-slate-100 h-[340px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                            <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} axisLine={false} tickLine={false} />
                            <YAxis stroke="#94a3b8" fontSize={10} axisLine={false} tickLine={false} />
                            <Tooltip contentStyle={{ borderRadius: '16px', border: 'none' }} />
                            <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', paddingBottom: '15px' }} />
                            <Bar name="実績" dataKey="実績" fill={currentTab.color} radius={[10, 10, 0, 0]} barSize={18} />
                            <Line name={m.forecastType || '予測'} type="monotone" dataKey="予測データ" stroke="#7c3aed" strokeWidth={3} dot={false} activeDot={{ r: 6, stroke: '#7c3aed', strokeWidth: 2, fill: '#fff' }} />
                          </ComposedChart>
                        </ResponsiveContainer>
                      </div>
                      <div className={`p-5 rounded-2xl border text-xs font-bold leading-relaxed shadow-sm ${evalData.color}`}>
                        <p>{evalData.comment}</p>
                      </div>
                    </div>
                  ) : (
                    /* 📅 【週次モード】：グラフの横に指標とAIコメントが並ぶ【完璧な2カラム横並び】に完全変形！ */
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-stretch">
                      {/* 左側：グラフエリア */}
                      <div className="xl:col-span-2 bg-slate-50/50 p-6 rounded-[2.5rem] border border-slate-100 h-[340px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                            <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} axisLine={false} tickLine={false} />
                            <YAxis stroke="#94a3b8" fontSize={10} axisLine={false} tickLine={false} />
                            <Tooltip contentStyle={{ borderRadius: '16px', border: 'none' }} />
                            <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', paddingBottom: '15px' }} />
                            <Bar name="実績" dataKey="実績" fill={currentTab.color} radius={[10, 10, 0, 0]} barSize={50} />
                            <Line name={m.forecastType || '予測'} type="monotone" dataKey="予測データ" stroke="#7c3aed" strokeWidth={3} dot={false} activeDot={{ r: 6, stroke: '#7c3aed', strokeWidth: 2, fill: '#fff' }} />
                          </ComposedChart>
                        </ResponsiveContainer>
                      </div>

                      {/* 右側：週次専用サイドバー（数値パネル＋AI診断） */}
                      <div className="flex flex-col justify-between gap-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-slate-900 text-white p-5 rounded-2xl flex flex-col justify-between shadow-sm">
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{isTotalType ? '当週合計実績' : '当週平均実績'}</span>
                            <p className="text-xl font-black font-mono tracking-tight mt-2">{Math.round(dispAct).toLocaleString()}</p>
                          </div>
                          <div className="bg-slate-50 border p-5 rounded-2xl flex flex-col justify-between shadow-sm">
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{(m.forecastType || '予測')}比達成率</span>
                            <p className={`text-xl font-black font-mono tracking-tight mt-2 ${ratio >= 100 ? (isCost ? 'text-rose-600' : 'text-emerald-600') : (isCost ? 'text-emerald-600' : 'text-rose-600')}`}>{ratio.toFixed(1)}%</p>
                          </div>
                        </div>

                        <div className={`p-5 rounded-2xl border text-xs font-bold leading-relaxed flex-1 flex items-center shadow-sm ${evalData.color}`}>
                          <p>{evalData.comment}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}