// @ts-nocheck
'use client';
import { useEffect, useState } from 'react';
import { ArrowLeft, Activity, Calculator, TrendingUp, Calendar, Rocket, Leaf, MessageSquare, Clock, Bot, ThumbsUp, AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Bar, Line, ComposedChart, Legend } from 'recharts';

export default function DashboardPage({ params }: { params: { id: string } }) {
  const [data, setData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('logistics');
  const [displayMode, setDisplayMode] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [selectedWeek, setSelectedWeek] = useState<number>(0);
  const [globalSelectedMonth, setGlobalSelectedMonth] = useState<string>(''); // 💥 全モード共通の選択月

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
    fetch(gasUrl).then(res => res.json()).then(json => {
      setData(json);
      // 初期ロード時に最初の月（例: "4"）を自動セット
      if (json && json.labels && json.labels.length > 0) {
        const firstLabel = json.labels[0];
        if (typeof firstLabel === 'string' && firstLabel.includes('/')) {
          setGlobalSelectedMonth(firstLabel.split('/')[0]);
        }
      }
    });
  }, []);

  // 「4. 月次」タブがクリックされたら、表示モードを 'monthly' に自動変形
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    if (tabId === 'monthly') {
      setDisplayMode('monthly');
    } else if (displayMode === 'monthly') {
      setDisplayMode('daily');
    }
  };

  if (!data) return <div className="h-screen bg-slate-950 flex items-center justify-center text-blue-400 font-mono animate-pulse uppercase tracking-[0.4em]">SYNCING_MANAGEMENT_BRAIN...</div>;

  const currentTab = tabs.find(t => t.id === activeTab) || tabs[1];
  const lowIsBetterMetrics = ["労務費", "タイミー", "外注費", "社会保険", "雇用保険", "有給", "交通費", "工数"];
  const totalMetricsKeywords = ["売上", "原価", "費", "工数", "物量", "タイミー", "有給", "交通費"];

  const n = (val: any) => {
    if (val === undefined || val === null || val === "") return 0;
    return parseFloat(val.toString().replace(/[^0-9.-]/g, '')) || 0;
  };

  // 💥 お兄ちゃん指定：A列の日付（labels）から存在する「月」を全自動抽出
  const getAvailableMonths = (labels: string[]) => {
    const monthsSet = new Set<string>();
    labels.forEach(label => {
      if (typeof label === 'string' && label.includes('/')) {
        const month = label.split('/')[0];
        if (month) monthsSet.add(month);
      }
    });
    return Array.from(monthsSet).sort((a, b) => n(a) - n(b));
  };

  const baseLabels = data.labels || ["4/1", "4/2"];
  const availableMonths = getAvailableMonths(baseLabels);

  // 💥 【重要】選択された月（globalSelectedMonth）のデータ位置（インデックス）だけを全モード共通で絞り込むガード
  const getFilteredMonthIndices = (labels: string[]) => {
    return labels.map((l, idx) => (typeof l === 'string' && l.split('/')[0] === globalSelectedMonth) ? idx : -1).filter(idx => idx !== -1);
  };

  const currentMonthIndices = getFilteredMonthIndices(baseLabels);

  // 💥 週のグルーピングロジック（選択された「月」の範囲内だけで週を区切るように進化！）
  const getWeeklyGroupsForCurrentMonth = (labels: string[], allowedIndices: number[]) => {
    const groups: { weekNum: number; label: string; indices: number[] }[] = [];
    if (!allowedIndices || allowedIndices.length === 0) return groups;
    
    let currentWeekIndices: number[] = [];
    let weekCount = 1;
    let startLabel = labels[allowedIndices[0]];

    allowedIndices.forEach((idx) => {
      const label = labels[idx];
      if (!label || typeof label !== 'string' || !label.includes('/')) {
        currentWeekIndices.push(idx);
        return;
      }
      const parts = label.split('/');
      const date = new Date(2026, parseInt(parts[0], 10) - 1, parseInt(parts[1], 10));
      
      // 日曜日が来たらそこで1週間区切り（ただし今選択されている月の中だけ）
      if (date.getDay() === 0 && currentWeekIndices.length > 0) {
        groups.push({ weekNum: weekCount, label: `${globalSelectedMonth}月度 ${weekCount}週目 (${startLabel} ～ ${labels[idx - 1]})`, indices: currentWeekIndices });
        weekCount++;
        startLabel = label;
        currentWeekIndices = [];
      }
      currentWeekIndices.push(idx);
    });

    if (currentWeekIndices.length > 0) {
      groups.push({ weekNum: weekCount, label: `${globalSelectedMonth}月度 ${weekCount}週目 (${startLabel} ～ ${labels[allowedIndices[allowedIndices.length - 1]]})`, indices: currentWeekIndices });
    }
    return groups;
  };

  const weeklyGroups = getWeeklyGroupsForCurrentMonth(baseLabels, currentMonthIndices);

  // データ結合ロジック
  const getCombinedMetrics = () => {
    const targetTabId = activeTab === 'monthly' ? 'sales' : currentTab.id;
    let allItems = data[`${targetTabId}Data`] || [];
    
    const combinedMap = new Map();
    allItems.forEach(item => {
      if (!item || !item.title || !item.values || !Array.isArray(item.values)) return;
      const normalizedTitle = item.title.replace('＿', '_');
      let rawTitle = normalizedTitle.replace('実績_', '').replace('予測_', '').replace('予算_', '').replace('目標_', '');
      let cleanTitle = item.title.includes('社会保険') ? '社会保険' : rawTitle;
      if (!combinedMap.has(cleanTitle)) {
        combinedMap.set(cleanTitle, { title: cleanTitle, labels: item.labels || baseLabels, actual: [], forecast: [], forecastType: '予測' });
      }
      const entry = combinedMap.get(cleanTitle);
      if (item.title.startsWith('実績_') || item.title.startsWith('実績＿')) entry.actual = item.values;
      else { entry.forecast = item.values; entry.forecastType = normalizedTitle.split('_')[0] || '予測'; }
    });
    return Array.from(combinedMap.values());
  };

  const allMetrics = getCombinedMetrics();

  const getAiCorporateEvaluation = (title, actual, forecast, mode, isTotal, currentRatio) => {
    const isLowBetter = lowIsBetterMetrics.some(keyword => title.includes(keyword));
    const ratio = currentRatio;
    
    let modeText = '直近';
    if (mode === 'weekly') modeText = `当週${isTotal ? '合計' : '平均'}`;
    if (mode === 'monthly') modeText = `当月${isTotal ? '合計' : '平均'}`;

    let status = 'STABLE';
    let color = 'text-slate-700 bg-slate-50 border-slate-200';
    let icon = <Bot size={14} className="text-slate-600" />;
    let comment = "";

    if (isLowBetter) {
      if (ratio <= 92) {
        status = 'EXCELLENT';
        color = 'text-emerald-700 bg-emerald-50 border-emerald-200';
        icon = <CheckCircle2 size={14} className="text-emerald-600" />;
        comment = `【経営財務診断：利益上振れ】『${title}』は${modeText}で予算比${ratio.toFixed(1)}%と大幅なコスト抑制に成功。ROI向上に貢献しています。このままコントロールを維持してください。`;
      } else if (ratio > 103) {
        status = 'WARNING';
        color = 'text-rose-700 bg-rose-50 border-rose-200';
        icon = <ShieldAlert size={14} className="text-rose-600" />;
        comment = `【経営財務診断：予算超過】『${title}』の${modeText}が計画比${(ratio - 100).toFixed(1)}%超過し利益圧迫要因となっています。緊急のコスト構造見直しを推奨します。`;
      } else {
        comment = `【経営財務診断：予算内推移】『${title}』は${modeText}の執行率${ratio.toFixed(1)}%と適正な予算枠内で着地。財務計画との乖離はなくシミュレーション通りです。`;
      }
    } else {
      if (ratio >= 105) {
        status = 'EXCELLENT';
        color = 'text-emerald-700 bg-emerald-50 border-emerald-200';
        icon = <ThumbsUp size={14} className="text-emerald-600" />;
        comment = `【経営財務診断：収益拡大】『${title}』は${modeText}で目標比${ratio.toFixed(1)}%の大幅プラス着地。売上損分岐を超え、限界利益の積み上げに多大に貢献しています。`;
      } else if (ratio < 95) {
        status = 'WARNING';
        color = 'text-rose-700 bg-rose-50 border-rose-200';
        icon = <AlertTriangle size={14} className="text-rose-600" />;
        comment = `【経営財務診断：未達アラート】『${title}』の${modeText}が計画の${ratio.toFixed(1)}%に留まり赤信号。長期化は業績リスクに直計するため、即座のテコ入れが必要です。`;
      } else {
        comment = `【経営財務診断：計画達成】『${title}』は${modeText}達成率${ratio.toFixed(1)}%と手堅く推移。経営計画に想定された順調な利益水準を確保できています。`;
      }
    }
    return { status, color, icon, comment, ratio: ratio.toFixed(1) };
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-20">
      <header className="h-20 bg-white border-b border-slate-200 px-10 flex justify-between items-center sticky top-0 z-40 backdrop-blur-md bg-white/80">
        <Link href="/" className="flex items-center gap-2 text-slate-400 no-underline font-black hover:text-blue-600">
          <ArrowLeft size={16} /> <span className="text-xs">ポータルへ戻る</span>
        </Link>
        <div className="text-center">
          <h1 className="text-lg font-black italic tracking-tighter uppercase text-slate-800">経営ダッシュボード : 昭和冷蔵</h1>
          <p className="text-[9px] font-bold text-blue-600 tracking-[0.2em] uppercase">
            {displayMode === 'daily' ? 'DAILY' : (displayMode === 'weekly' ? 'WEEKLY' : 'MONTHLY')} ANALYTICS MODE ({globalSelectedMonth}月)
          </p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 gap-1">
          <button disabled={activeTab === 'monthly'} onClick={() => setDisplayMode('daily')} className={`px-4 py-1.5 rounded-xl text-[10px] font-black transition-all ${displayMode === 'daily' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 disabled:opacity-30'}`}>日次</button>
          <button disabled={activeTab === 'monthly'} onClick={() => setDisplayMode('weekly')} className={`px-4 py-1.5 rounded-xl text-[10px] font-black transition-all ${displayMode === 'weekly' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 disabled:opacity-30'}`}>週次</button>
          <button disabled={activeTab !== 'monthly'} className={`px-4 py-1.5 rounded-xl text-[10px] font-black transition-all ${displayMode === 'monthly' ? 'bg-amber-500 text-white shadow-sm' : 'hidden'}`}>月次確定</button>
        </div>
      </header>

      <main className="p-10 max-w-[1800px] mx-auto space-y-8">
        
        {/* 💥 【新設】画面の最上部に配置された「全モード共通の月選択マスターバー」 */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-5 rounded-[2rem] shadow-lg flex flex-wrap gap-3 items-center justify-between">
          <div className="flex items-center gap-2 ml-2">
            <Calendar size={18} className="text-amber-400" />
            <span className="text-xs font-black uppercase tracking-widest text-slate-300">表示対象月マスター選択 (A列自動解析) :</span>
          </div>
          <div className="flex gap-2">
            {availableMonths.map((m, idx) => (
              <button key={idx} onClick={() => { setGlobalSelectedMonth(m); setSelectedWeek(0); }} className={`px-6 py-2.5 rounded-xl font-black text-xs transition-all ${globalSelectedMonth === m ? 'bg-amber-500 text-slate-950 shadow-md transform scale-105' : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'}`}>{m}月度を表示</button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-2.5">
          {tabs.map((t) => (
            <button key={t.id} onClick={() => handleTabChange(t.id)} className={`px-6 py-3 rounded-2xl transition-all font-black text-xs ${activeTab === t.id ? `bg-slate-900 text-white shadow-lg` : 'bg-white border text-slate-500 hover:bg-slate-50'}`}>{t.label}</button>
          ))}
        </div>

        {/* 📅 週次モードの時の週選択バー（選択月の中の週だけがスマートに登場！） */}
        {displayMode === 'weekly' && activeTab !== 'monthly' && (
          <div className="bg-white border border-slate-200 p-4 rounded-3xl shadow-sm flex flex-wrap gap-2 items-center">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider mr-2 ml-1">{globalSelectedMonth}月の週選択:</span>
            {weeklyGroups.map((g, idx) => (
              <button key={idx} onClick={() => setSelectedWeek(idx)} className={`px-5 py-2.5 rounded-xl font-black text-xs transition-all ${selectedWeek === idx ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}>{g.label}</button>
            ))}
            {weeklyGroups.length === 0 && <span className="text-xs font-bold text-rose-500 ml-2">※選択された月の週次データが見つかりません</span>}
          </div>
        )}

        {/* 📊 メイン表示エリア */}
        <div className={`grid grid-cols-1 ${displayMode === 'daily' ? 'lg:grid-cols-2' : ''} gap-8`}>
          {allMetrics.map((m, i) => {
            const isCost = lowIsBetterMetrics.some(k => m.title.includes(k));
            
            // 生産性指標・売上合計仕分けロジック（完全ホールド固定）
            const isProductivityRatio = m.title.includes("生産性") || activeTab === 'productivity';
            const isTotalType = totalMetricsKeywords.some(k => m.title.includes(k)) && !isProductivityRatio;
            
            // 週次で選ばれているインデックス群
            const weekIdx = weeklyGroups[selectedWeek]?.indices || [];
            
            let chartData = [];
            let dispAct = 0; let dispFct = 0;

            if (displayMode === 'daily') {
              // 💥 日次モードも、選択された月のデータ（currentMonthIndices）だけでグラフとパネルを構築！
              chartData = currentMonthIndices.map(idx => ({ name: m.labels[idx], "実績": n(m.actual[idx]), [m.forecastType]: n(m.forecast[idx]) }));
              dispAct = currentMonthIndices.length ? n(m.actual[currentMonthIndices[currentMonthIndices.length - 1]]) : 0;
              dispFct = currentMonthIndices.length ? (n(m.forecast[currentMonthIndices[currentMonthIndices.length - 1]]) || 1) : 1;
            } 
            else if (displayMode === 'weekly') {
              // 🌟 週次ロジック（完全ホールド固定）
              chartData = weekIdx.map(idx => ({ name: m.labels[idx], "実績": n(m.actual[idx]), [m.forecastType]: n(m.forecast[idx]) }));
              const acts = weekIdx.map(idx => n(m.actual[idx])); const fcts = weekIdx.map(idx => n(m.forecast[idx]));
              
              if (isProductivityRatio) {
                dispAct = acts.length ? acts.reduce((a, b) => a + b, 0) / acts.length : 0;
                dispFct = fcts.length ? fcts.reduce((a, b) => a + b, 0) / fcts.length : 0;
              } else if (isTotalType) { 
                dispAct = acts.reduce((a, b) => a + b, 0); 
                dispFct = fcts.reduce((a, b) => a + b, 0); 
              } else { 
                dispAct = acts.length ? acts.reduce((a, b) => a + b, 0) / acts.length : 0; 
                dispFct = fcts.length ? fcts.reduce((a, b) => a + b, 0) / fcts.length : 0; 
              }
            } 
            else if (displayMode === 'monthly') {
              // 🌟 月次ロジック（完全ホールド固定）
              chartData = currentMonthIndices.map(idx => ({ name: m.labels[idx], "実績": n(m.actual[idx]), [m.forecastType]: n(m.forecast[idx]) }));
              const acts = currentMonthIndices.map(idx => n(m.actual[idx])); const fcts = currentMonthIndices.map(idx => n(m.forecast[idx]));
              
              if (isProductivityRatio) {
                dispAct = acts.length ? acts.reduce((a, b) => a + b, 0) / acts.length : 0;
                dispFct = fcts.length ? fcts.reduce((a, b) => a + b, 0) / fcts.length : 0;
              } else if (isTotalType) {
                dispAct = acts.reduce((a, b) => a + b, 0);
                dispFct = fcts.reduce((a, b) => a + b, 0);
              } else {
                dispAct = acts.length ? acts.reduce((a, b) => a + b, 0) / acts.length : 0;
                dispFct = fcts.length ? fcts.reduce((a, b) => a + b, 0) / fcts.length : 0;
              }
            }

            // パネル内の最終数字からその場で割り戻す100%リアルタイム連動％（完全ホールド固定）
            const currentRatio = dispFct > 0 ? (dispAct / dispFct) * 100 : 0;
            const evalData = getAiCorporateEvaluation(m.title, dispAct, dispFct, displayMode, isTotalType, currentRatio);

            return (
              <div key={i} className="bg-white border border-slate-200 p-8 rounded-[2.5rem] shadow-md flex flex-col gap-6">
                
                <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                  <div>
                    <h4 className="text-lg font-black text-slate-900 tracking-tighter uppercase">{m.title}</h4>
                    <p className="text-[10px] font-bold text-slate-400 mt-0.5 uppercase tracking-widest">vs {m.forecastType} Matrix</p>
                  </div>
                  {displayMode === 'daily' && (
                    <div className="flex gap-6 text-right items-center">
                      <div className="border-r pr-4 border-slate-100">
                        <p className="text-[9px] font-bold text-slate-400 uppercase">{globalSelectedMonth}月 直近の実績</p>
                        <p className="text-xl font-black text-slate-800 tracking-tight">{Math.round(dispAct).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-bold text-slate-400 uppercase">{m.forecastType}比</p>
                        <p className={`text-xl font-black ${currentRatio >= 100 ? (isCost ? 'text-rose-600' : 'text-emerald-600') : (isCost ? 'text-emerald-600' : 'text-rose-600')}`}>{currentRatio.toFixed(1)}%</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className={displayMode !== 'daily' ? 'grid grid-cols-1 xl:grid-cols-3 gap-8 items-start' : 'w-full'}>
                  <div className={displayMode !== 'daily' ? 'xl:col-span-2 h-[320px] bg-slate-50/50 p-4 rounded-3xl border border-slate-100' : 'h-[280px] w-full bg-slate-50/50 p-4 rounded-3xl border border-slate-100'}>
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                        <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} axisLine={false} tickLine={false} />
                        <YAxis stroke="#94a3b8" fontSize={10} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{ borderRadius: '16px', border: 'none' }} />
                        <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', paddingBottom: '15px' }} />
                        <Bar name="実績" dataKey="実績" fill={displayMode === 'monthly' ? '#ca8a04' : currentTab.color} radius={[10, 10, 0, 0]} barSize={displayMode === 'daily' ? 20 : (displayMode === 'weekly' ? 60 : 12)} />
                        <Line name={m.forecastType} type="monotone" dataKey={m.forecastType} stroke="#7c3aed" strokeWidth={3} dot={false} activeDot={{ r: 6, stroke: '#7c3aed', strokeWidth: 2, fill: '#fff' }} />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>

                  {displayMode !== 'daily' && (
                    <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-inner h-[320px] flex flex-col justify-between">
                      <div className="border-b border-slate-800 pb-2">
                        <p className="text-[10px] font-black tracking-widest text-blue-400 uppercase">
                          当{displayMode === 'weekly' ? '週' : '月'}{isProductivityRatio ? '平均' : (isTotalType ? '合計' : '平均')}確認パネル
                        </p>
                      </div>
                      <div className="space-y-4 my-auto">
                        <div className="flex justify-between items-baseline">
                          <span className="text-xs font-bold text-slate-400">
                            {isProductivityRatio ? '平均実績' : (isTotalType ? `${displayMode === 'weekly' ? '合計実績' : '当月合計実績'}` : '平均実績')}
                          </span>
                          <span className="text-2xl font-black tracking-tight text-white">{Math.round(dispAct).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-baseline">
                          <span className="text-xs font-bold text-slate-400">
                            {isProductivityRatio ? `平均${m.forecastType}` : (isTotalType ? `${displayMode === 'weekly' ? '合計' : '当月合計'}${m.forecastType}` : `平均${m.forecastType}`)}
                          </span>
                          <span className="text-xl font-bold tracking-tight text-slate-300">{Math.round(dispFct).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-baseline border-t border-slate-800 pt-3">
                          <span className="text-xs font-black text-blue-400">達成率 ({m.forecastType}比)</span>
                          <span className={`text-3xl font-black tracking-tighter ${currentRatio >= 100 ? (isCost ? 'text-rose-400' : 'text-emerald-400') : (isCost ? 'text-emerald-400' : 'text-rose-400')}`}>{currentRatio.toFixed(1)}%</span>
                        </div>
                      </div>
                      <div className="text-[9px] text-slate-500 font-bold text-center uppercase tracking-wider">Executive Management DB</div>
                    </div>
                  )}
                </div>

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