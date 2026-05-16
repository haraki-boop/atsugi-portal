// @ts-nocheck
'use client';
import { useEffect, useState, useMemo } from 'react';
import { ArrowLeft, Activity, Calculator, TrendingUp, Calendar, Rocket, Leaf, MessageSquare, Clock, Bot } from 'lucide-react';
import Link from 'next/link';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Bar, Line, ComposedChart, Legend } from 'recharts';

export default function DashboardPage({ params }: { params: { id: string } }) {
  const [data, setData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('logistics');
  const [displayMode, setDisplayMode] = useState<'daily' | 'weekly'>('daily');
  const [selectedWeek, setSelectedWeek] = useState<number>(0);
  const [selectedMonth, setSelectedMonth] = useState<string>('2026_04');

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
        // 💥 【防御1】届いたデータが壊れていないか、最低限の配列チェック
        if (json && typeof json === 'object') {
          setData(json);
          const mItems = json?.monthlyRawData || json?.monthlyData || [];
          if (mItems && mItems.length > 1 && mItems[1]?.[0]) {
            setSelectedMonth(mItems[1][0].toString());
          }
        } else {
          // ゴミデータが来たらダミーの殻を作ってフリーズを防ぐ
          setData({ labels: ["データなし"] });
        }
      }).catch(e => {
        console.error("GAS Brain Offline", e);
        setData({ labels: ["通信エラー"] });
      });
  }, []);

  if (!data) return <div className="h-screen bg-slate-950 flex items-center justify-center text-blue-400 font-mono animate-pulse uppercase tracking-[0.4em]">SYNCING_MANAGEMENT_BRAIN...</div>;

  const currentTab = tabs.find(t => t.id === activeTab) || tabs[1];
  const lowIsBetterMetrics = ["労務費", "タイミー", "外注費", "社会保険", "雇用保険", "有給", "交通費", "工数", "原価", "総工数", "事故金額"];

  const n = (val) => {
    if (val === undefined || val === null || val === "") return 0;
    return parseFloat(val.toString().replace(/[^0-9.-]/g, '')) || 0;
  };

  const getWeeklyGroups = (labels: string[]) => {
    const groups: { weekNum: number; label: string; indices: number[] }[] = [];
    if (!labels || labels.length === 0 || labels[0] === "データなし" || labels[0] === "通信エラー") return groups;
    try {
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
    } catch(e) { console.error(e); }
    return groups;
  };

  const baseLabels = data?.labels || ["データなし"];
  const weeklyGroups = getWeeklyGroups(baseLabels);

  const getCombinedMetrics = () => {
    let allItems = data ? data[`${currentTab.id}Data`] || [] : [];
    const combinedMap = new Map();
    if (!Array.isArray(allItems)) return [];
    
    allItems.forEach(item => {
      if (!item || !item.title) return;
      const normalizedTitle = item.title.replace('＿', '_');
      let rawTitle = normalizedTitle.replace('実績_', '').replace('予測_', '').replace('予算_', '').replace('目標_', '');
      let cleanTitle = item.title.includes('社会保険') ? '社会保険' : rawTitle;
      if (!combinedMap.has(cleanTitle)) {
        combinedMap.set(cleanTitle, { title: cleanTitle, labels: item.labels || baseLabels, actual: item.values || [], forecast: [], forecastType: '予測' });
      }
      const entry = combinedMap.get(cleanTitle);
      if (item.title.startsWith('実績_') || item.title.startsWith('実績＿')) entry.actual = item.values || [];
      else { entry.forecast = item.values || []; entry.forecastType = normalizedTitle.split('_')[0]; }
    });
    return Array.from(combinedMap.values());
  };

  const allMetrics = getCombinedMetrics();

  const getAiCorporateEvaluation = (title, actual, forecast) => {
    const isLowBetter = lowIsBetterMetrics.some(keyword => title.includes(keyword));
    const ratio = forecast > 0 ? (actual / forecast) * 100 : 0;
    let comment = "【診断中】データを解析しています。";
    let color = 'text-slate-700 bg-slate-50 border-slate-200';

    if (isLowBetter) {
      if (ratio <= 92) { color = 'text-emerald-700 bg-emerald-50 border-emerald-200'; comment = `【経営財務診断】『${title}』は予測比${ratio.toFixed(1)}%と大幅なコスト抑制に成功しています。`; }
      else if (ratio > 103) { color = 'text-rose-700 bg-rose-50 border-rose-200'; comment = `【経営財務診断】『${title}』の月次着地が計画比${(ratio - 100).toFixed(1)}%超過し利益圧迫要因となっています。`; }
      else { comment = `【経営財務診断】『${title}』は執行率${ratio.toFixed(1)}%と適正な予測枠内で着地。計画通りです。`; }
    } else {
      if (ratio >= 105) { color = 'text-emerald-700 bg-emerald-50 border-emerald-200'; comment = `【経営財務診断】『${title}』は目標比${ratio.toFixed(1)}%の大幅プラス着地。限界利益の積み上げに多大に貢献しています。`; }
      else if (ratio < 95) { color = 'text-rose-700 bg-rose-50 border-rose-200'; comment = `【経営財務診断】『${title}』が計画の${ratio.toFixed(1)}%に留まり、即座のテコ入れが必要です。`; }
      else { comment = `【経営財務診断】『${title}』は達成率${ratio.toFixed(1)}%と手堅く推移。順調な利益水準を確保できています。`; }
    }
    return { color, comment };
  };

  // 💥 【究極防衛】データが無くても絶対にクラッシュしないメモライザ
  const dynamicMonthlyData = useMemo(() => {
    const compareMap = new Map();
    const singleItems = [];
    const rows = data?.monthlyRawData || data?.monthlyData || [];
    if (!Array.isArray(rows) || rows.length < 2) return { compareItems: [], singleItems: [] };

    const headers = rows[0] || []; 
    const dataRows = rows.slice(1);     

    const targetRow = dataRows.find(r => r && r[0]?.toString() === selectedMonth) || dataRows[0];
    if (!targetRow) return { compareItems: [], singleItems: [] };

    headers.forEach((headerName, index) => {
      if (index === 0 || !headerName) return; 
      const rawValue = targetRow[index] !== undefined ? targetRow[index] : "0";
      const normalizedKey = headerName.toString().replace('＿', '_').replace('予算_', '予測_'); 

      if (normalizedKey.startsWith('実績_') || normalizedKey.startsWith('予測_')) {
        const cleanTitle = normalizedKey.replace('実績_', '').replace('予測_', '');
        if (!compareMap.has(cleanTitle)) {
          compareMap.set(cleanTitle, { title: cleanTitle, actual: "0", forecast: "0" });
        }
        const item = compareMap.get(cleanTitle);
        if (normalizedKey.startsWith('実績_')) item.actual = rawValue;
        if (normalizedKey.startsWith('予測_')) item.forecast = rawValue;
      } else {
        singleItems.push({ title: headerName, value: rawValue });
      }
    });

    return { compareItems: Array.from(compareMap.values()), singleItems };
  }, [data, selectedMonth]);

  const monthOptions = useMemo(() => {
    const rows = data?.monthlyRawData || data?.monthlyData || [];
    if (!Array.isArray(rows) || rows.length < 2) return ["データ行なし"];
    return [...new Set(rows.slice(1).map((r: any) => r && r[0]?.toString()))].filter(Boolean);
  }, [data]);

  const formatDisplay = (valStr, title) => {
    if (valStr === undefined || valStr === null || valStr === "") return "0";
    if (valStr.toString().includes('%')) return valStr;
    const parsed = n(valStr);
    const isRatio = title.includes('%') || title.includes('率') || title.includes('生産性');
    if (isRatio) return parsed.toLocaleString(undefined, { maximumFractionDigits: 1 }) + '%';
    if (parsed > 1000) return `¥${Math.round(parsed).toLocaleString()}`;
    return valStr.toString();
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

        {displayMode === 'weekly' && activeTab !== 'monthly' && weeklyGroups.length > 0 && (
          <div className="bg-white border border-slate-200 p-4 rounded-3xl shadow-sm flex flex-wrap gap-2 items-center">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider mr-2 ml-1">週選択:</span>
            {weeklyGroups.map((g, idx) => (
              <button key={idx} onClick={() => setSelectedWeek(idx)} className={`px-5 py-2.5 rounded-xl font-black text-xs transition-all ${selectedWeek === idx ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}>{g.label}</button>
            ))}
          </div>
        )}

        {activeTab === 'monthly' ? (
          <div className="bg-slate-950/90 backdrop-filter backdrop-blur-[20px] p-8 rounded-[3rem] border border-white/10 text-white shadow-2xl space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center border-b border-white/10 pb-6 gap-6">
              <div>
                <h2 className="text-2xl font-black tracking-tight text-white uppercase flex items-center gap-2">
                  <span className="w-2 h-6 bg-blue-500 rounded-full inline-block"></span> 月次データコックピット
                </h2>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Horizontal Matrix Mirroring</p>
              </div>
              <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
                <div className="flex bg-slate-900 p-1 rounded-xl border border-white/10 gap-1 overflow-x-auto max-w-full">
                  {monthOptions.map(m => (
                    <button key={m} onClick={() => setSelectedMonth(m)} className={`px-4 py-1.5 rounded-lg text-xs font-black whitespace-nowrap transition-all ${selectedMonth === m ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}>{m}</button>
                  ))}
                </div>
              </div>
            </div>

            {dynamicMonthlyData.compareItems.length > 0 ? (
              <div className="space-y-4">
                <h3 className="text-xs font-black text-blue-400 uppercase tracking-[0.2em]">⚖️ シート直結 予算実績比較</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {dynamicMonthlyData.compareItems.map((item, idx) => {
                    const actVal = n(item.actual); const fctVal = n(item.forecast);
                    const ratio = fctVal > 0 ? (actVal / fctVal) * 100 : 0;
                    const isCost = lowIsBetterMetrics.some(k => item.title.includes(k));
                    const evalData = getAiCorporateEvaluation(item.title, actVal, fctVal);
                    return (
                      <div key={idx} className="bg-slate-900/82 backdrop-blur-[20px] border border-white/10 p-6 rounded-[28px] shadow-lg flex flex-col justify-between group">
                        <div>
                          <span className="text-xs font-black text-slate-400 uppercase tracking-wider block mb-2">{item.title}</span>
                          <div className="text-2xl font-black font-mono tracking-tighter text-white my-1">{formatDisplay(item.actual, item.title)}</div>
                        </div>
                        <div className="mt-4 pt-3 border-t border-white/5 flex flex-col gap-2">
                          <div className="flex justify-between items-center text-[11px]">
                            <span className="text-slate-400 font-bold">予算: {formatDisplay(item.forecast, item.title)}</span>
                            <span className={`px-2.5 py-0.5 rounded-lg font-black ${ratio >= 100 ? (isCost ? 'bg-rose-950/60 text-rose-400' : 'bg-emerald-950/60 text-emerald-400') : (isCost ? 'bg-emerald-950/60 text-emerald-400' : 'bg-rose-950/60 text-rose-400')}`}>比率: {ratio.toFixed(1)}%</span>
                          </div>
                          <p className="text-[10px] text-slate-500 leading-tight italic bg-white/5 p-2 rounded-xl border border-white/5 mt-1">{evalData.comment}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500 font-bold text-xs uppercase tracking-widest bg-slate-900/40 rounded-2xl border border-white/5">⚠️ スプレッドシート側の月次データ、または通信状態を確認してください</div>
            )}

            {dynamicMonthlyData.singleItems.length > 0 && (
              <div className="space-y-4 pt-4 border-t border-white/5">
                <h3 className="text-xs font-black text-amber-400 uppercase tracking-[0.2em]">🔢 その他シート数値インジケータ</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-4">
                  {dynamicMonthlyData.singleItems.map((item, idx) => (
                    <div key={idx} className="bg-slate-900/50 backdrop-blur-[10px] border border-white/5 p-4 rounded-2xl flex flex-col justify-between min-h-[100px]">
                      <span className="text-[10px] font-bold text-slate-400 line-clamp-1" title={item.title}>{item.title}</span>
                      <div className="text-xl font-black font-mono tracking-tight text-amber-300 mt-2">{formatDisplay(item.value, item.title)}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10">
            {allMetrics.length > 0 ? (
              allMetrics.map((m, i) => {
                const isCost = lowIsBetterMetrics.some(k => m.title.includes(k));
                const isTotalType = totalMetricsKeywords.some(k => m.title.includes(k));
                const weekIdx = weeklyGroups[selectedWeek]?.indices || [];
                let chartData = []; let dispAct = 0; let dispFct = 0;

                if (displayMode === 'daily') {
                  chartData = m.labels.map((l, idx) => ({ name: l, "実績": m.actual[idx] || 0, [m.forecastType]: m.forecast[idx] || 0 }));
                  dispAct = m.actual[m.actual.length - 1] || 0; dispFct = m.forecast[m.forecast.length - 1] || 1;
                } else if (weekIdx.length > 0) {
                  chartData = weekIdx.map(idx => ({ name: m.labels[idx], "実績": m.actual[idx] || 0, [m.forecastType]: m.forecast[idx] || 0 }));
                  const acts = weekIdx.map(idx => m.actual[idx] || 0); const fcts = weekIdx.map(idx => m.forecast[idx] || 0);
                  if (isTotalType) { dispAct = acts.reduce((a, b) => a + b, 0); dispFct = fcts.reduce((a, b) => a + b, 0); }
                  else { dispAct = acts.length ? acts.reduce((a, b) => a + b, 0) / acts.length : 0; dispFct = fcts.length ? fcts.reduce((a, b) => a + b, 0) / fcts.length : 0; }
                }

                const ratio = dispFct > 0 ? (dispAct / dispFct) * 100 : 0;
                return (
                  <div key={i} className="bg-white border border-slate-200 p-8 rounded-[2.5rem] shadow-md flex flex-col gap-6">
                    <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                      <div>
                        <h4 className="text-lg font-black text-slate-900 tracking-tighter uppercase">{m.title}</h4>
                        <p className="text-[10px] font-bold text-slate-400 mt-0.5 uppercase tracking-widest">vs {m.forecastType} Matrix</p>
                      </div>
                    </div>
                    <div className="w-full">
                      <div className="h-[280px] w-full bg-slate-50/50 p-4 rounded-3xl border border-slate-100">
                        <ResponsiveContainer width="100%" height="100%">
                          <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                            <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} axisLine={false} tickLine={false} />
                            <YAxis stroke="#94a3b8" fontSize={10} axisLine={false} tickLine={false} />
                            <Tooltip contentStyle={{ borderRadius: '16px', border: 'none' }} />
                            <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', paddingBottom: '15px' }} />
                            <Bar name="実績" dataKey="実績" fill={currentTab.color} radius={[10, 10, 0, 0]} barSize={displayMode === 'weekly' ? 60 : 20} />
                            <Line name={m.forecastType} type="monotone" dataKey={m.forecastType} stroke="#7c3aed" strokeWidth={3} dot={false} />
                          </ComposedChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-2 text-center py-12 text-slate-400 font-bold text-xs uppercase tracking-widest bg-white rounded-3xl border">⚠️ 現在選択されているデータがシートに見つかりません</div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}