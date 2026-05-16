// @ts-nocheck
'use client';
import { useEffect, useState, useMemo } from 'react';
import { ArrowLeft, Activity, Calculator, TrendingUp, Calendar, Rocket, Leaf, MessageSquare, Clock, Bot, ThumbsUp, AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Bar, Line, ComposedChart, Legend } from 'recharts';

export default function DashboardPage({ params }: { params: { id: string } }) {
  const [data, setData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('logistics');
  const [displayMode, setDisplayMode] = useState<'daily' | 'weekly'>('daily');
  const [selectedWeek, setSelectedWeek] = useState<number>(0);

  // 💥 【CodePen同期】セレクトボックス用の選択State
  const [selectedCenter, setSelectedCenter] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<string>('');

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
        setData(json);
        
        // 💥 【CodePen同期】初期データロード時に利用可能な拠点と月をセット
        const mItems = json.monthlyRawData || [];
        if (mItems.length > 1) {
          const centers = [...new Set(mItems.slice(1).map(r => r[0]))].filter(Boolean);
          if (centers.length > 0) {
            setSelectedCenter(centers[0]);
            const months = [...new Set(mItems.filter(r => r[0] === centers[0]).map(r => r[1]))].filter(Boolean);
            if (months.length > 0) {
              setSelectedMonth(months[0]);
            }
          }
        }
      });
  }, []);

  // 💥 【CodePen同期】拠点が切り替わったら選択可能な月リストを自動更新
  useEffect(() => {
    if (!data) return;
    const mItems = data.monthlyRawData || [];
    const months = [...new Set(mItems.filter(r => r[0] === selectedCenter).map(r => r[1]))].filter(Boolean);
    if (months.length > 0 && !months.includes(selectedMonth)) {
      setSelectedMonth(months[0]);
    }
  }, [selectedCenter, data]);

  if (!data) return <div className="h-screen bg-slate-950 flex items-center justify-center text-blue-400 font-mono animate-pulse uppercase tracking-[0.4em]">SYNCING_MANAGEMENT_BRAIN...</div>;

  const currentTab = tabs.find(t => t.id === activeTab) || tabs[1];
  const lowIsBetterMetrics = ["労務費", "タイミー", "外注費", "社会保険", "雇用保険", "有給", "交通費", "工数"];
  const totalMetricsKeywords = ["売上", "原価", "費", "工数", "物量", "タイミー", "有給", "交通費"];

  // 数値化安全処理
  const n = (val) => {
    if (!val) return 0;
    return parseFloat(val.toString().replace(/[^0-9.-]/g, '')) || 0;
  };

  // 週のグルーピングロジック
  const getWeeklyGroups = (labels: string[]) => {
    const groups: { weekNum: number; label: string; indices: number[] }[] = [];
    if (!labels || labels.length === 0) return groups;
    let currentWeekIndices: number[] = [];
    let weekCount = 1;
    let startLabel = labels[0];
    labels.forEach((label, idx) => {
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

  const baseLabels = data.labels || ["4/1", "4/2"];
  const weeklyGroups = getWeeklyGroups(baseLabels);

  const getCombinedMetrics = () => {
    let allItems = data[`${currentTab.id}Data`] || [];
    const combinedMap = new Map();
    allItems.forEach(item => {
      const normalizedTitle = item.title.replace('＿', '_');
      let rawTitle = normalizedTitle.replace('実績_', '').replace('予測_', '').replace('予算_', '').replace('目標_', '');
      let cleanTitle = item.title.includes('社会保険') ? '社会保険' : rawTitle;
      if (!combinedMap.has(cleanTitle)) {
        combinedMap.set(cleanTitle, { title: cleanTitle, labels: item.labels || baseLabels, actual: [], forecast: [], forecastType: '予測' });
      }
      const entry = combinedMap.get(cleanTitle);
      if (item.title.startsWith('実績_') || item.title.startsWith('実績＿')) entry.actual = item.values;
      else { entry.forecast = item.values; entry.forecastType = normalizedTitle.split('_')[0]; }
    });
    return Array.from(combinedMap.values());
  };

  const allMetrics = getCombinedMetrics();

  const getAiCorporateEvaluation = (title, actual, forecast, mode, isTotal) => {
    const isLowBetter = lowIsBetterMetrics.some(keyword => title.includes(keyword));
    const ratio = forecast > 0 ? (actual / forecast) * 100 : 0;
    const modeText = mode === 'daily' ? '直近' : `当週${isTotal ? '合計' : '平均'}`;

    let comment = "";
    let color = 'text-slate-700 bg-slate-50 border-slate-200';
    let icon = <Bot size={14} className="text-slate-600" />;

    if (isLowBetter) {
      if (ratio <= 92) {
        color = 'text-emerald-700 bg-emerald-50 border-emerald-200';
        icon = <CheckCircle2 size={14} className="text-emerald-600" />;
        comment = `【経営財務診断】『${title}』は${modeText}で予算比${ratio.toFixed(1)}%と大幅なコスト抑制に成功。ROI向上に貢献しています。`;
      } else if (ratio > 103) {
        color = 'text-rose-700 bg-rose-50 border-rose-200';
        icon = <ShieldAlert size={14} className="text-rose-600" />;
        comment = `【経営財務診断】『${title}』の${modeText}が計画比${(ratio - 100).toFixed(1)}%超過し利益圧迫要因となっています。`;
      } else {
        comment = `【経営財務診断】『${title}』は${modeText}の執行率${ratio.toFixed(1)}%と適正な予算枠内で着地。財務計画通りです。`;
      }
    } else {
      if (ratio >= 105) {
        color = 'text-emerald-700 bg-emerald-50 border-emerald-200';
        icon = <ThumbsUp size={14} className="text-emerald-600" />;
        comment = `【経営財務診断】『${title}』は${modeText}で目標比${ratio.toFixed(1)}%の大幅プラス着地。限界利益の積み上げに多大に貢献しています。`;
      } else if (ratio < 95) {
        color = 'text-rose-700 bg-rose-50 border-rose-200';
        icon = <AlertTriangle size={14} className="text-rose-600" />;
        comment = `【経営財務診断】『${title}』の${modeText}が計画の${ratio.toFixed(1)}%に留まり赤信号。即座のテコ入れが必要です。`;
      } else {
        comment = `【経営財務診断】『${title}』は${modeText}達成率${ratio.toFixed(1)}%と手堅く推移。順調な利益水準を確保できています。`;
      }
    }
    return { color, icon, comment, ratio: ratio.toFixed(1) };
  };

  // 💥 【CodePen同期】本番のGAS側スプレッドシートデータから月次抽出＆逆算計算を行うリアクティブエンジン
  const monthlyMetrics = useMemo(() => {
    if (!data || !selectedCenter || !selectedMonth) return null;
    const rows = data.monthlyRawData || [];
    
    // 選択拠点と月でフィルタリング
    const filteredRows = rows.filter(r => r[0] === selectedCenter && r[1] === selectedMonth);
    
    const budget = filteredRows.find(r => r[2] === '予算');
    const actual = filteredRows.find(r => r[2] === '実績');
    const kgiRow = filteredRows.find(r => r[2] && r[2].includes('目標ＫＧＩ'));

    if (!budget || !actual) {
      // 万が一データが存在しない時のフォールバック用のダミー構造
      return {
        actRev: 53290000, budRev: 55000000, rRev: '96.9%',
        actCost: 21400000, budCost: 23000000,
        actHrs: 2840, budHrs: 3000,
        actSales: 14500, budSales: 14000, targetSalesKGI: 2445,
        actWork: 48.5, budWork: 46.0, targetWorkKGI: 47.25,
        actWage: 1250, ratio: '25.0%', targetRatio: '63.0%',
        revGap: 0, hrsGap: 0, gapMoney: 0
      };
    }

    const actRev = n(actual[3]);
    const actHrs = n(actual[5]);
    const targetSalesKGI = kgiRow ? n(kgiRow[6]) : 2445;
    const targetWorkKGI = kgiRow ? n(kgiRow[7]) : 47.25;
    const targetRatio = budget[8] || "63.0%";

    const revGap = (targetSalesKGI * actHrs) - actRev;
    const hrsGap = actHrs - (actRev / targetSalesKGI);
    const gapMoney = Math.ceil(Math.abs(revGap));
    const rRev = ((actRev / n(budget[3])) * 100).toFixed(1) + '%';
    const ratio = actual[8] || "0%";

    return {
      actRev: actual[3], budRev: budget[3], rRev,
      actCost: actual[4], budCost: budget[4],
      actHrs: actual[5], budHrs: budget[5],
      actSales: actual[6], budSales: budget[6], targetSalesKGI,
      actWork: actual[7], budWork: budget[7], targetWorkKGI,
      actWage: actual[9], ratio, targetRatio,
      revGap, hrsGap, gapMoney,
      rawActRev: actRev, rawBudRev: n(budget[3]),
      rawActCost: n(actual[4]), rawBudCost: n(budget[4])
    };
  }, [data, selectedCenter, selectedMonth]);

  // 💥 セレクター用のユニーク値リスト
  const centerOptions = useMemo(() => {
    if (!data) return [];
    return [...new Set((data.monthlyRawData || []).slice(1).map(r => r[0]))].filter(Boolean);
  }, [data]);

  const monthOptions = useMemo(() => {
    if (!data || !selectedCenter) return [];
    return [...new Set((data.monthlyRawData || []).filter(r => r[0] === selectedCenter).map(r => r[1]))].filter(Boolean);
  }, [data, selectedCenter]);


  // 💥 判定用スタイル生成ヘルパー
  const getValueClass = (id, act, bud, kgi, type) => {
    let classes = (id === 'hours' || id === 'wage') ? 'text-2xl lg:text-3xl font-black font-mono tracking-tight text-white ' : 'text-4xl font-black font-mono tracking-tighter text-white ';
    const aVal = n(act);
    if (kgi && aVal >= kgi) {
      return classes + 'bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-500 bg-clip-text text-transparent animate-pulse'; // CodePenのkgi-clear
    }
    if (type === 'none') return classes;
    const bVal = n(bud);
    if (type === 'more') {
      return classes + (aVal >= bVal ? 'text-blue-400' : 'text-rose-400');
    } else {
      return classes + (aVal <= bVal ? 'text-blue-400' : 'text-rose-400');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-20 relative">
      
      {/* 💥 【CodePen同期】お兄ちゃん秘伝のCSSアニメーションキーフレームの注入 */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes shine {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-shine-text {
          background: linear-gradient(90deg, #fbbf24, #f59e0b, #fff, #f59e0b, #fbbf24);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shine 3s linear infinite;
        }
      `}} />

      <header className="h-20 bg-white border-b border-slate-200 px-10 flex justify-between items-center sticky top-0 z-40 backdrop-blur-md bg-white/80">
        <Link href="/" className="flex items-center gap-2 text-slate-400 no-underline font-black hover:text-blue-600">
          <ArrowLeft size={16} /> <span className="text-xs">ポータルへ戻る</span>
        </Link>
        <div className="text-center">
          <h1 className="text-lg font-black italic tracking-tighter uppercase text-slate-800">経営ダッシュボード : 昭和冷蔵</h1>
          <p className="text-[9px] font-bold text-blue-600 tracking-[0.2em] uppercase">{activeTab === 'monthly' ? 'MONTHLY MATRIX' : 'DAILY & WEEKLY'} ANALYTICS</p>
        </div>
        {activeTab !== 'monthly' && (
          <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 gap-1">
            <button onClick={() => setDisplayMode('daily')} className={`px-4 py-1.5 rounded-xl text-[10px] font-black transition-all ${displayMode === 'daily' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}>日次</button>
            <button onClick={() => setDisplayMode('weekly')} className={`px-4 py-1.5 rounded-xl text-[10px] font-black transition-all ${displayMode === 'weekly' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}>週次</button>
          </div>
        )}
      </header>

      <main className="p-10 max-w-[1800px] mx-auto space-y-8 relative z-10">
        
        {/* タブエリア */}
        <div className="flex flex-wrap gap-2.5">
          {tabs.map((t) => (
            <button key={t.id} onClick={() => { setActiveTab(t.id); if (t.id === 'monthly') setDisplayMode('daily'); }} className={`px-6 py-3 rounded-2xl transition-all font-black text-xs ${activeTab === t.id ? `bg-slate-900 text-white shadow-lg` : 'bg-white border text-slate-500 hover:bg-slate-50'}`}>{t.label}</button>
          ))}
        </div>

        {/* 📅 週次モードのフィルター */}
        {displayMode === 'weekly' && activeTab !== 'monthly' && (
          <div className="bg-white border border-slate-200 p-4 rounded-3xl shadow-sm flex flex-wrap gap-2 items-center">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider mr-2 ml-1">週選択:</span>
            {weeklyGroups.map((g, idx) => (
              <button key={idx} onClick={() => setSelectedWeek(idx)} className={`px-5 py-2.5 rounded-xl font-black text-xs transition-all ${selectedWeek === idx ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}>{g.label}</button>
            ))}
          </div>
        )}

        {/* ========================================================================================= */}
        {/* 🌟 4. 月次タブ：CodePenの「実績ダッシュボード」×本番用スプレッドシートデータ完全同期型 */}
        {/* ========================================================================================= */}
        {activeTab === 'monthly' && monthlyMetrics ? (
          <div className="bg-slate-950/90 backdrop-filter backdrop-blur-[20px] p-8 rounded-[3rem] border border-white/10 text-white shadow-2xl space-y-8 animate-in fade-in duration-500">
            
            {/* トップヘッダー ＆ ドロップダウンセレクター */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-white/10 pb-6 gap-4">
              <div>
                <h2 className="text-2xl font-black tracking-tight text-white uppercase flex items-center gap-2">
                  <span className="w-2 h-6 bg-blue-500 rounded-full inline-block"></span> 実績ダッシュボード
                </h2>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Cross-Center Monthly Performance Review</p>
              </div>
              
              {/* 💥 【CodePen同期】スプレッドシートから引っ張ったマスタで動くセレクトボックス */}
              <div className="flex gap-3 w-full sm:w-auto">
                <select 
                  value={selectedCenter} 
                  onChange={(e) => setSelectedCenter(e.target.value)}
                  className="flex-1 sm:flex-none px-4 py-3 rounded-xl border-2 border-white/20 bg-slate-900 text-white font-bold text-xs cursor-pointer backdrop-blur-md outline-none"
                >
                  {centerOptions.map(c => <option key={c} value={c} className="bg-slate-800">{c}</option>)}
                </select>
                <select 
                  value={selectedMonth} 
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="flex-1 sm:flex-none px-4 py-3 rounded-xl border-2 border-white/20 bg-slate-900 text-white font-bold text-xs cursor-pointer backdrop-blur-md outline-none"
                >
                  {monthOptions.map(m => <option key={m} value={m} className="bg-slate-800">{m}</option>)}
                </select>
              </div>
            </div>

            {/* CodePen完全移植グリッド */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              
              {/* カード：売上高 */}
              <div className="bg-slate-900/82 backdrop-blur-[20px] border border-white/10 p-6 rounded-[28px] shadow-lg flex flex-col justify-between relative group">
                <span className="text-xs font-black text-slate-400 uppercase tracking-wider mb-4">売上高</span>
                <div className="my-2 relative inline-block w-fit">
                  <div className={getValueClass('rev', monthlyMetrics.actRev, monthlyMetrics.budRev, null, 'more')}>
                    {monthlyMetrics.actRev}
                  </div>
                  {/* KGI達成時または好調時のキラキラエフェクト連動 */}
                  <span className="absolute -top-3 -right-8 text-2xl opacity-100 transition-opacity animate-bounce">✨</span>
                </div>
                <div className="flex gap-2 mt-4 pt-3 border-t border-white/5">
                  <div className="bg-white/10 px-3 py-1 rounded-xl text-[10px] text-slate-400 font-bold">予算: {monthlyMetrics.budRev}</div>
                  <div className="bg-blue-950/40 border border-blue-900/40 px-3 py-1 rounded-xl text-[10px] text-blue-400 font-black">達成率: {monthlyMetrics.rRev}</div>
                </div>
              </div>

              {/* 中央パネルカード：労務比率 (リングメーター) */}
              <div className="bg-slate-900/82 backdrop-blur-[20px] border border-white/10 p-6 rounded-[28px] shadow-lg flex flex-col items-center justify-center text-center col-span-1 md:col-span-2 row-span-2 bg-gradient-to-b from-slate-900/90 to-slate-950/90">
                <span className="text-xs font-black text-slate-400 uppercase tracking-wider mb-6 block w-full text-left tracking-[2px]">労務比率</span>
                <div className="relative w-48 h-44">
                  <svg viewBox="0 0 200 200" className="w-full h-full transform -rotate-90">
                    <circle className="stroke-white/10 fill-none" cx="100" cy="100" r="90" strokeWidth="16" />
                    <circle 
                      className="stroke-blue-500 fill-none transition-all duration-1000 ease-out" 
                      cx="100" cy="100" r="90" 
                      strokeWidth="16" 
                      strokeLinecap="round"
                      strokeDasharray={565}
                      strokeDashoffset={565 - (n(monthlyMetrics.ratio) / 100) * 565}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="text-4xl font-black font-mono tracking-tighter text-white">{monthlyMetrics.ratio}</div>
                    <div className="text-xs text-slate-400 font-bold mt-1" id="t-ratio">目標: {monthlyMetrics.targetRatio}</div>
                  </div>
                </div>
                <p className="text-[10px] text-slate-500 font-bold mt-6 tracking-wide uppercase">Operational Labor Cost Ratio Tracking</p>
              </div>

              {/* カード：原価 */}
              <div className="bg-slate-900/82 backdrop-blur-[20px] border border-white/10 p-6 rounded-[28px] shadow-lg flex flex-col justify-between relative">
                <span className="text-xs font-black text-slate-400 uppercase tracking-wider mb-4">原価</span>
                <div className="my-2 relative">
                  <div className={getValueClass('cost', monthlyMetrics.actCost, monthlyMetrics.budCost, null, 'less')}>
                    {monthlyMetrics.actCost}
                  </div>
                  <span className="absolute -top-3 -right-8 text-2xl opacity-80">✨</span>
                </div>
                <div className="mt-4 pt-3 border-t border-white/5">
                  <div className="bg-white/10 px-3 py-1 rounded-xl text-[10px] text-slate-400 font-bold inline-block">予算: {monthlyMetrics.budCost}</div>
                </div>
              </div>

              {/* 🌟 逆算シミュレーションカード */}
              <div className="bg-slate-900/82 backdrop-blur-[20px] border border-white/10 border-l-[10px] border-l-amber-400 p-6 rounded-[28px] shadow-lg xl:col-span-2 space-y-3">
                <span className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5 tracking-[2px]">
                  KGIギャップ分析・目標への逆算
                </span>
                <div className="divide-y divide-white/5 font-medium">
                  <div className="flex justify-between items-center py-3">
                    <span className="text-xs font-bold text-slate-300">目標達成に必要な「追加売上」</span>
                    <span className="text-lg font-black font-mono" style={{ color: monthlyMetrics.revGap <= 0 ? '#3b82f6' : '#fb7185' }}>
                      {monthlyMetrics.revGap <= 0 ? "達成済み" : `+ ¥${Math.ceil(monthlyMetrics.revGap).toLocaleString()}`}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-3">
                    <span className="text-xs font-bold text-slate-300">目標達成に必要な「削減工数」</span>
                    <span className="text-lg font-black font-mono" style={{ color: monthlyMetrics.hrsGap <= 0 ? '#3b82f6' : '#fb7185' }}>
                      {monthlyMetrics.hrsGap <= 0 ? "効率クリア" : `- ${monthly