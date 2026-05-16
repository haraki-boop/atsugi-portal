// @ts-nocheck
'use client';
import { useEffect, useState } from 'react';
import { ArrowLeft, Activity, Calculator, TrendingUp, Calendar, Rocket, Leaf, MessageSquare, Clock, Bot, ThumbsUp, AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Bar, Line, ComposedChart, Legend } from 'recharts';

export default function DashboardPage({ params }: { params: { id: string } }) {
  const [data, setData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('logistics');
  const [displayMode, setDisplayMode] = useState<'daily' | 'weekly'>('weekly'); // 初期値を週次に
  const [selectedWeek, setSelectedWeek] = useState<number>(0); // 選択された週のインデックス

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
  const totalMetricsKeywords = ["売上", "原価", "費", "工数", "物量", "タイミー", "有給", "交通費"];

  // 📅 日付ラベルからカレンダー基準（日曜日切り替え）で週をグルーピングするインテリジェンスロジック
  const getWeeklyGroups = (labels: string[]) => {
    const groups: { weekNum: number; label: string; indices: number[] }[] = [];
    if (!labels || labels.length === 0) return groups;

    let currentWeekIndices: number[] = [];
    let weekCount = 1;
    let startLabel = labels[0];

    labels.forEach((label, idx) => {
      // 4/1 などの形式から2026年（現在のシステム想定年）のDateオブジェクトを生成して曜日を判定
      // ※GAS側のデータに合わせて適宜補正。ここでは簡易的にお兄ちゃんの4/1（水）～基準で曜日判定
      const parts = label.split('/');
      const month = parseInt(parts[0], 10);
      const day = parseInt(parts[1], 10);
      const date = new Date(2026, month - 1, day);
      const isSunday = date.getDay() === 0;

      // 日曜日が来たら、それまでの週を確定させて次の週へ進む（初日を除く）
      if (isSunday && currentWeekIndices.length > 0) {
        groups.push({
          weekNum: weekCount,
          label: `${weekCount}週目 (${startLabel} ～ ${labels[idx - 1]})`,
          indices: currentWeekIndices
        });
        weekCount++;
        startLabel = label;
        currentWeekIndices = [];
      }
      currentWeekIndices.push(idx);
    });

    // 最後の残りの週をプッシュ
    if (currentWeekIndices.length > 0) {
      groups.push({
        weekNum: weekCount,
        label: `${weekCount}週目 (${startLabel} ～ ${labels[labels.length - 1]})`,
        indices: currentWeekIndices
      });
    }

    return groups;
  };

  // 全データの基準となる日付ラベル（共通）
  const baseLabels = data.labels || ["4/1", "4/2", "4/3", "4/4", "4/5", "4/6", "4/7"];
  const weeklyGroups = getWeeklyGroups(baseLabels);

  const getCombinedMetrics = () => {
    let allItems = data[`${currentTab.id}Data`] || [];
    const combinedMap = new Map();

    allItems.forEach(item => {
      const normalizedTitle = item.title.replace('＿', '_');
      let rawTitle = normalizedTitle.replace('実績_', '').replace('予測_', '').replace('予算_', '').replace('目標_', '');
      
      let cleanTitle = rawTitle;
      if (item.title.includes('社会保険')) {
        cleanTitle = '社会保険';
      }

      if (!combinedMap.has(cleanTitle)) {
        combinedMap.set(cleanTitle, { 
          title: cleanTitle, 
          labels: item.labels || baseLabels, 
          actual: item.values ? [...item.values] : [], 
          forecast: [],
          forecastType: '予測'
        });
      }
      const entry = combinedMap.get(cleanTitle);
      if (item.title.startsWith('実績_') || item.title.startsWith('実績＿')) {
        entry.actual = item.values;
      } else {
        entry.forecast = item.values;
        entry.forecastType = normalizedTitle.split('_')[0];
      }
    });

    return Array.from(combinedMap.values());
  };

  const allMetrics = getCombinedMetrics();

  // 📊 経営エキスパートAI（数字・財務特化評価）
  const getAiCorporateEvaluation = (title, actual, forecast) => {
    const isLowBetter = lowIsBetterMetrics.some(keyword => title.includes(keyword));
    const ratio = forecast > 0 ? (actual / forecast) * 100 : 0;

    let status = 'STABLE';
    let color = 'text-slate-700 bg-slate-50 border-slate-200';
    let icon = <Bot size={14} className="text-slate-600" />;
    let comment = "";

    if (isLowBetter) {
      if (ratio <= 92) {
        status = 'EXCELLENT';
        color = 'text-emerald-700 bg-emerald-50 border-emerald-200';
        icon = <CheckCircle2 size={14} className="text-emerald-600" />;
        comment = `【財務診断】『${title}』は想定比${ratio.toFixed(1)}%と大幅なコスト抑制に成功。投下資本利益率（ROI）を引き上げる好材料です。`;
      } else if (ratio > 92 && ratio <= 103) {
        status = 'STABLE';
        color = 'text-blue-700 bg-blue-50 border-blue-200';
        icon = <Bot size={14} className="text-blue-600" />;
        comment = `【財務診断】『${title}』は執行率${ratio.toFixed(1)}%と適正な予算枠内で着地。キャッシュフローはシミュレーション通りに推移しています。`;
      } else {
        status = 'WARNING';
        color = 'text-rose-700 bg-rose-50 border-rose-200';
        icon = <ShieldAlert size={14} className="text-rose-600" />;
        comment = `【財務アラート】『${title}』が計画比${(ratio - 100).toFixed(1)}%超過。利益圧迫要因となっているため、リソース再配分を要します。`;
      }
    } else {
      if (ratio >= 105) {
        status = 'EXCELLENT';
        color = 'text-emerald-700 bg-emerald-50 border-emerald-200';
        icon = <ThumbsUp size={14} className="text-emerald-600" />;
        comment = `【収益診断】『${title}』は目標比${ratio.toFixed(1)}%の大幅プラス着地。限界利益の積み上げに多大に貢献しています。`;
      } else if (ratio >= 95 && ratio < 105) {
        status = 'STABLE';
        color = 'text-blue-700 bg-blue-50 border-blue-200';
        icon = <Bot size={14} className="text-blue-600" />;
        comment = `【収益診断】『${title}』は達成率${ratio.toFixed(1)}%と手堅く推移。中期経営計画に想定された安定水準を確保できています。`;
      } else {
        status = 'WARNING';
        color = 'text-rose-700 bg-rose-50 border-rose-200';
        icon = <AlertTriangle size={14} className="text-rose-600" />;
        comment = `【業績アラート】『${title}』が計画の${ratio.toFixed(1)}%に留まり赤信号。即座にボトルネック特定とテコ入れが必要です。`;
      }
    }

    return { status, color, icon, comment, ratio: ratio.toFixed(1) };
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-20">
      <header className="h-20 bg-white border-b border-slate-200 px-10 flex justify-between items-center sticky top-0 z-40 backdrop-blur-md bg-white/80">
        <Link href="/" className="flex items-center gap-2 text-slate-400 no-underline font-black hover:text-blue-600 transition-all">
          <ArrowLeft size={16} /> <span className="text-xs">ポータルへ戻る</span>
        </Link>
        <div className="text-center">
          <h1 className="text-lg font-black italic tracking-tighter uppercase text-slate-800">経営ダッシュボード : 昭和冷蔵</h1>
          <p className="text-[9px] font-bold text-blue-600 tracking-[0.2em] uppercase">Daily & Weekly Executive Stream</p>
        </div>
        
        {/* 🔄 日次・週次 モード切り替えスイッチ */}
        <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 gap-1">
          <button onClick={() => setDisplayMode('daily')} className={`px-4 py-1.5 rounded-xl text-[10px] font-black transition-all ${displayMode === 'daily' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
            日次モード
          </button>
          <button onClick={() => setDisplayMode('weekly')} className={`px-4 py-1.5 rounded-xl text-[10px] font-black transition-all ${displayMode === 'weekly' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
            週次モード
          </button>
        </div>
      </header>

      <main className="p-10 max-w-[1800px] mx-auto space-y-8">
        {/* 1～8番のカテゴリータブ */}
        <div className="flex flex-wrap gap-2.5">
          {tabs.map((t) => (
            <button key={t.id} onClick={() => setActiveTab(t.id)} className={`px-6 py-3 rounded-2xl transition-all font-black text-xs ${activeTab === t.id ? `bg-slate-900 text-white shadow-lg` : 'bg-white border text-slate-500 hover:bg-slate-50'}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* 📅 週次モードの時だけ出現する「動的カレンダー週切り替えタブ」 */}
        {displayMode === 'weekly' && weeklyGroups.length > 0 && (
          <div className="bg-white border border-slate-200 p-4 rounded-3xl shadow-sm flex flex-wrap gap-2 items-center">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider mr-2 ml-1">週選択フィルター :</span>
            {weeklyGroups.map((group, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedWeek(idx)}
                className={`px-5 py-2.5 rounded-xl font-black text-xs transition-all ${selectedWeek === idx ? 'bg-blue-600 text-white shadow-md shadow-blue-100' : 'bg-slate-50 border text-slate-600 hover:bg-slate-100'}`}
              >
                {group.label}
              </button>
            ))}
          </div>
        )}

        {/* メインダッシュボードカード展開 */}
        <div className="grid grid-cols-1 gap-8">
          {allMetrics.map((m, i) => {
            const isCost = lowIsBetterMetrics.some(k => m.title.includes(k));
            const isTotalType = totalMetricsKeywords.some(k => m.title.includes(k));
            const currentWeekIndices = weeklyGroups[selectedWeek]?.indices || [];

            // 1. 表示用データの加工（日次 or 週次）
            let chartData = [];
            let displayActualVal = 0;
            let displayForecastVal = 0;

            if (displayMode === 'daily') {
              // 日次の場合は通常通り全日程展開
              chartData = m.labels.map((l, idx) => ({
                name: l,
                "実績": m.actual[idx] || 0,
                [m.forecastType]: m.forecast[idx] || 0
              }));
              displayActualVal = m.actual[m.actual.length - 1] || 0;
              displayForecastVal = m.forecast[m.forecast.length - 1] || 0;
            } else {
              // 週次の場合は選択された週の日程だけをグラフ用に切り出し
              chartData = currentWeekIndices.map(idx => ({
                name: m.labels[idx],
                "実績": m.actual[idx] || 0,
                [m.forecastType]: m.forecast[idx] || 0
              }));

              // 💥 横に数字だけで見せるための「週合計 or 週平均」を算出
              const weekActuals = currentWeekIndices.map(idx => m.actual[idx] || 0);
              const weekForecasts = currentWeekIndices.map(idx => m.forecast[idx] || 0);

              if (isTotalType) {
                // 売上・コスト・物量などは【合計値】
                displayActualVal = weekActuals.reduce((a, b) => a + b, 0);
                displayForecastVal = weekForecasts.reduce((a, b) => a + b, 0);
              } else {
                // 生産性などは【平均値】
                displayActualVal = weekActuals.length > 0 ? (weekActuals.reduce((a, b) => a + b, 0) / weekActuals.length) : 0;
                displayForecastVal = weekForecasts.length > 0 ? (weekForecasts.reduce((a, b) => a + b, 0) / weekForecasts.length) : 0;
              }
            }

            const evalData = getAiCorporateEvaluation(m.title, displayActualVal, displayForecastVal);
            const calcRatio = displayForecastVal > 0 ? (displayActualVal / displayForecastVal) * 100 : 0;

            return (
              <div key={i} className="bg-white border border-slate-200 p-8 rounded-[2.5rem] shadow-md flex flex-col gap-6">
                
                {/* 1. タイトル＆ヘッダー */}
                <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                  <div>
                    <h4 className="text-lg font-black text-slate-900 tracking-tighter uppercase">
                      {m.title} <span className="text-xs text-slate-400 font-bold ml-2">[{displayMode === 'daily' ? '日次推移' : '週次選択範囲'}]</span>
                    </h4>
                    <p className="text-[10px] font-bold text-slate-400 mt-0.5 uppercase tracking-widest">vs {m.forecastType} Executive Matrix</p>
                  </div>
                </div>

                {/* 2. 🌟 グラフ(左) と デジタル数値表(右) の2カラム大改造レイアウト */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
                  
                  {/* 【左側：2カラム分使用】スタイリッシュグラフエリア */}
                  <div className="xl:col-span-2 h-[280px] w-full bg-slate-50/50 p-4 rounded-3xl border border-slate-100">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                        <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} axisLine={false} tickLine={false} />
                        <YAxis stroke="#94a3b8" fontSize={10} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }} />
                        <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', paddingBottom: '15px' }} />
                        
                        <Bar name="実績" dataKey="実績" fill={currentTab.color} radius={[10, 10, 0, 0]} barSize={20} />
                        <Line name={m.forecastType} type="monotone" dataKey={m.forecastType} stroke="#7c3aed" strokeWidth={3} dot={false} activeDot={{ r: 6, stroke: '#7c3aed', strokeWidth: 2, fill: '#fff' }} />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>

                  {/* 【右側：1カラム使用】🌟 お兄ちゃんリクエストの「数字だけで見せる別表」 */}
                  <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-inner h-[280px] flex flex-col justify-between">
                    <div className="border-b border-slate-800 pb-2">
                      <p className="text-[10px] font-black tracking-widest text-blue-400 uppercase">
                        {displayMode === 'daily' ? '当日データ確認' : `当週${isTotalType ? '合計' : '平均'}確認パネル`}
                      </p>
                    </div>

                    <div className="space-y-4 my-auto">
                      {/* 実績値 */}
                      <div className="flex justify-between items-baseline">
                        <span className="text-xs font-bold text-slate-400">{displayMode === 'daily' ? '直近の実績' : `当週の${isTotalType ? '合計実績' : '平均実績'}`}</span>
                        <span className="text-2xl font-black tracking-tight text-white">{Math.round(displayActualVal).toLocaleString()}</span>
                      </div>

                      {/* 予測・予算値 */}
                      <div className="flex justify-between items-baseline">
                        <span className="text-xs font-bold text-slate-400">{displayMode === 'daily' ? m.forecastType : `当週の${isTotalType ? `合計${m.forecastType}` : `平均${m.forecastType}`}`}</span>
                        <span className="text-xl font-bold tracking-tight text-slate-300">{Math.round(displayForecastVal).toLocaleString()}</span>
                      </div>

                      {/* 達成率・予算比 */}
                      <div className="flex justify-between items-baseline border-t border-slate-800 pt-3">
                        <span className="text-xs font-black text-blue-400">{m.forecastType}比 (達成率)</span>
                        <span className={`text-3xl font-black tracking-tighter ${calcRatio >= 100 ? (isCost ? 'text-rose-400' : 'text-emerald-400') : (isCost ? 'text-emerald-400' : 'text-rose-400')}`}>
                          {calcRatio.toFixed(1)}%
                        </span>
                      </div>
                    </div>

                    <div className="text-[9px] text-slate-500 font-bold text-center uppercase tracking-wider">
                      昭和冷蔵 Executive Management DB
                    </div>
                  </div>

                </div>

                {/* 3. 経営エキスパートAI診断パネル */}
                <div className={`p-5 rounded-3xl border text-[11px] font-medium flex items-start gap-4 shadow-sm leading-relaxed ${evalData.color}`}>
                  <div className="p-2 bg-white rounded-xl shadow-sm shrink-0 mt-0.5">{evalData.icon}</div>
                  <p>{evalData.comment} <span className="font-bold underline">※当選択範囲の{isTotalType ? '合計' : '平均'}データに基づく診断です。</span></p>
                </div>

              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}