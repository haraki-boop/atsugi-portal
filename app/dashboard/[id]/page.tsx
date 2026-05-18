// @ts-nocheck
'use client';
import { useEffect, useState } from 'react';
import { ArrowLeft, Activity, Calculator, TrendingUp, Calendar, Rocket, Leaf, MessageSquare, Clock, Bot, ThumbsUp, AlertTriangle, CheckCircle2, ShieldAlert, ChevronRight, Building2, Plus, X, Edit2 } from 'lucide-react';
import Link from 'next/link';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Bar, Line, ComposedChart, Legend, PieChart, Pie, Cell } from 'recharts';

export default function DashboardPage({ params }: { params: { id: string } }) {
  const [data, setData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('logistics');
  const [displayMode, setDisplayMode] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [selectedWeek, setSelectedWeek] = useState<number>(0);
  const [globalSelectedMonth, setGlobalSelectedMonth] = useState<string>('');

  // 画面入力・編集用のローカルステート
  const [dxItems, setDxItems] = useState<any[]>([]);
  const [envItems, setEnvItems] = useState<any[]>([]);
  const [historyItems, setHistoryItems] = useState<any[]>([]); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  // 入力フォーム用の一時共通ステート
  const [newItem, setNewItem] = useState({
    name: '',
    effect: '',
    startDate: '',
    endDate: '',
    customerRelated: false,
    ratio: 0,
    client: '',
    proposal: '',
    detail: '',
    result: '●'
  });

  const tabs = [
    { id: 'sales', label: '1. 売上・原価', icon: Calculator, color: '#2563eb' },
    { id: 'logistics', label: '2. 物量・工数', icon: Activity, color: '#059669' },
    { id: 'productivity', label: '3. 生産性', icon: TrendingUp, color: '#d97706' },
    { id: 'monthly', label: '4. 月次', icon: Calendar, color: '#ca8a04' },
    { id: 'dx', label: '5. DX推進', icon: Rocket, color: '#7c3aed' },
    { id: 'env', label: '6. 現場改善', icon: Leaf, color: '#10b981' }, 
    { id: 'history', label: '7. 営業履歴', icon: MessageSquare, color: '#e11d48' },
    { id: 'manhours', label: '8. 工数', icon: Clock, color: '#475569' },
  ];

  useEffect(() => {
    const savedDx = localStorage.getItem(`dx_${params.id}`);
    const savedEnv = localStorage.getItem(`env_${params.id}`);
    const savedHistory = localStorage.getItem(`history_${params.id}`);
    if (savedDx) setDxItems(JSON.parse(savedDx));
    if (savedEnv) setEnvItems(JSON.parse(savedEnv));
    if (savedHistory) setHistoryItems(JSON.parse(savedHistory));

    const gasUrl = "https://script.google.com/macros/s/AKfycbyosyzeCglI2Pz2GWh_dbZXAgDslEV5DZrws5ulw24GrkI-fShocaWUdOLMfaNh_m0_/exec";
    fetch(gasUrl).then(res => res.json()).then(json => {
      setData(json);
      if (json && json.labels && json.labels.length > 0) {
        const firstLabel = json.labels[0];
        if (typeof firstLabel === 'string' && firstLabel.includes('/')) {
          setGlobalSelectedMonth(firstLabel.split('/')[0]);
        }
      }
    });
  }, [params.id]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    if (tabId === 'monthly') {
      setDisplayMode('monthly');
    } else if (['dx', 'env', 'history', 'manhours'].includes(tabId)) {
      // 特殊画面
    } else if (displayMode === 'monthly') {
      setDisplayMode('daily');
    }
  };

  const handleOpenAddModal = () => {
    setEditingIndex(null);
    setNewItem({ name: '', effect: '', startDate: '', endDate: '', customerRelated: false, ratio: 0, client: '', proposal: '', detail: '', result: '●' });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (index: number) => {
    setEditingIndex(index);
    if (activeTab === 'history') {
      const item = historyItems[index];
      setNewItem({
        startDate: item.date ? item.date.replace(/\//g, '-') : '',
        client: item.client || '',
        proposal: item.proposal || '',
        detail: item.detail || '',
        result: item.result || '●'
      });
    } else {
      const targetList = activeTab === 'dx' ? dxItems : envItems;
      const item = targetList[index];
      setNewItem({
        name: item.name || '',
        effect: item.effect === '未入力' ? '' : (item.effect || ''),
        startDate: item.startDate ? item.startDate.replace(/\//g, '-') : '',
        endDate: item.endDate ? item.endDate.replace(/\//g, '-') : '',
        customerRelated: item.customerRelated === 'あり',
        ratio: item.ratio || 0
      });
    }
    setIsModalOpen(true);
  };

  const handleSaveItem = () => {
    let updatedList = [];
    if (activeTab === 'history') {
      if (!newItem.client || !newItem.proposal) {
        alert("日付、誰に、何をは必須入力です！");
        return;
      }
      const formattedHistory = {
        date: newItem.startDate ? newItem.startDate.replace(/-/g, '/') : '',
        client: newItem.client,
        proposal: newItem.proposal,
        detail: newItem.detail || '',
        result: newItem.result
      };
      if (editingIndex !== null) {
        updatedList = [...historyItems];
        updatedList[editingIndex] = formattedHistory;
      } else {
        updatedList = [...historyItems, formattedHistory];
      }
      setHistoryItems(updatedList);
      localStorage.setItem(`history_${params.id}`, JSON.stringify(updatedList));
    } else {
      if (!newItem.name) {
        alert("項目名を入力してください！");
        return;
      }
      const formattedItem = {
        name: newItem.name,
        effect: newItem.effect || '未入力',
        startDate: newItem.startDate ? newItem.startDate.replace(/-/g, '/') : '',
        endDate: newItem.endDate ? newItem.endDate.replace(/-/g, '/') : '',
        customerRelated: newItem.customerRelated ? 'あり' : 'なし',
        ratio: Number(newItem.ratio)
      };
      if (activeTab === 'dx') {
        if (editingIndex !== null) {
          updatedList = [...dxItems];
          updatedList[editingIndex] = formattedItem;
        } else {
          updatedList = [...dxItems, formattedItem];
        }
        setDxItems(updatedList);
        localStorage.setItem(`dx_${params.id}`, JSON.stringify(updatedList));
      } else {
        if (editingIndex !== null) {
          updatedList = [...envItems];
          updatedList[editingIndex] = formattedItem;
        } else {
          updatedList = [...envItems, formattedItem];
        }
        setEnvItems(updatedList);
        localStorage.setItem(`env_${params.id}`, JSON.stringify(updatedList));
      }
    }
    setIsModalOpen(false);
  };

  const handleDeleteItem = (indexToDelete: number) => {
    let updated = [];
    if (activeTab === 'history') {
      updated = historyItems.filter((_, idx) => idx !== indexToDelete);
      setHistoryItems(updated);
      localStorage.setItem(`history_${params.id}`, JSON.stringify(updated));
    } else if (activeTab === 'dx') {
      updated = dxItems.filter((_, idx) => idx !== indexToDelete);
      setDxItems(updated);
      localStorage.setItem(`dx_${params.id}`, JSON.stringify(updated));
    } else {
      updated = envItems.filter((_, idx) => idx !== indexToDelete);
      setEnvItems(updated);
      localStorage.setItem(`env_${params.id}`, JSON.stringify(updated));
    }
  };

  if (!data) return <div className="h-screen bg-slate-950 flex items-center justify-center text-blue-400 font-mono animate-pulse uppercase tracking-[0.4em]">SYNCING_MANAGEMENT_BRAIN...</div>;

  const currentTab = tabs.find(t => t.id === activeTab) || tabs[1];
  const lowIsBetterMetrics = ["労務費", "タイミー", "外注費", "社会保険", "雇用保険", "有給", "交通費", "工数"];
  const totalMetricsKeywords = ["売上", "原価", "費", "工数", "物量", "タイミー", "有給", "交通費"];

  const n = (val: any) => {
    if (val === undefined || val === null || val === "") return 0;
    const clean = val.toString().replace(/[^0-9.-]/g, '');
    const num = parseFloat(clean);
    return isNaN(num) ? 0 : num;
  };

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

  const getFilteredMonthIndices = (labels: string[]) => {
    return labels.map((l, idx) => (typeof l === 'string' && l.split('/')[0] === globalSelectedMonth) ? idx : -1).filter(idx => idx !== -1);
  };

  const currentMonthIndices = getFilteredMonthIndices(baseLabels);

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
      
      if (date.getDay() === 0 && currentWeekIndices.length > 0) {
        groups.push({ weekNum: weekCount, label: `${globalSelectedMonth}月度 ${weekCount}週目 (${startLabel} ～ ${labels[idx - 1]})`, indices: currentWeekIndices });
        weekCount++;
        startLabel = label;
        currentWeekIndices = [];
      }
      currentWeekIndices.push(idx);
    });

    if (currentWeekIndices.length > 0) {
      groups.push({ weekNum: weekCount, label: `${weekCount}週目 (${startLabel} ～ ${labels[allowedIndices[allowedIndices.length - 1]]})`, indices: currentWeekIndices });
    }
    return groups;
  };

  const weeklyGroups = getWeeklyGroupsForCurrentMonth(baseLabels, currentMonthIndices);

  const getCombinedMetrics = () => {
    const targetTabId = activeTab === 'monthly' ? 'sales' : currentTab.id;
    let allItems = data[`${targetTabId}Data`] || [];
    
    const combinedMap = new Map();
    allItems.forEach(item => {
      if (!item || !item.title || !item.values || !Array.isArray(item.values)) return;
      
      const normalizedTitle = item.title.replace('＿', '_');
      let cleanTitle = normalizedTitle
        .replace('実績_', '').replace('予測_', '').replace('予算_', '').replace('目標_', '')
        .replace('実績', '').replace('予測', '').replace('予算', '').replace('目標', '');
      
      if (item.title.includes('社会保険')) cleanTitle = '社会保険';

      if (!combinedMap.has(cleanTitle)) {
        combinedMap.set(cleanTitle, { 
          title: cleanTitle, 
          labels: item.labels || baseLabels, 
          actual: new Array(baseLabels.length).fill(0), 
          forecast: new Array(baseLabels.length).fill(0), 
          forecastType: '予測' 
        });
      }
      
      const entry = combinedMap.get(cleanTitle);
      entry.actual = item.values;
      
      if (item.forecastValues && Array.isArray(item.forecastValues)) {
        entry.forecast = item.forecastValues;
      } else if (item.forecast && Array.isArray(item.forecast)) {
        entry.forecast = item.forecast;
      } else {
        entry.forecast = item.values.map(v => n(v) * 1.02);
      }

      const detectedType = normalizedTitle.split('_')[0];
      if (detectedType && detectedType !== normalizedTitle) {
        entry.forecastType = detectedType;
      } else if (normalizedTitle.includes('予算')) {
        entry.forecastType = '予算';
      } else if (normalizedTitle.includes('目標')) {
        entry.forecastType = '目標';
      } else {
        entry.forecastType = '予測';
      }
    });
    return Array.from(combinedMap.values());
  };

  const allMetrics = getCombinedMetrics();

  const getAiCorporateEvaluation = (title, actual, forecast, mode, isTotal, currentRatio, rawForecastArray, currentIndices) => {
    const isLowBetter = lowIsBetterMetrics.some(keyword => title.includes(keyword));
    const ratio = currentRatio;
    
    let modeText = '直近';
    if (mode === 'daily') modeText = '今日までの累計進捗';
    if (mode === 'weekly') modeText = `当週${isTotal ? '合計' : '平均'}`;
    if (mode === 'monthly') modeText = `当月${isTotal ? '合計' : '平均'}`;

    const totalMonthForecast = currentIndices.reduce((sum, idx) => sum + n(rawForecastArray[idx]), 0);
    const projectedEndResult = totalMonthForecast * (ratio / 100);
    const deviationAmount = Math.abs(projectedEndResult - totalMonthForecast);

    let status = 'STABLE';
    let color = 'text-slate-700 bg-slate-50 border-slate-200';
    let icon = <Bot size={14} className="text-slate-600" />;
    let comment = "";

    const formatVal = (val) => title.includes("%") || title.includes("率") ? `${val.toFixed(1)}%` : `¥${Math.round(val).toLocaleString()}`;

    if (isLowBetter) {
      if (ratio <= 92) {
        status = 'EXCELLENT';
        color = 'text-emerald-700 bg-emerald-50 border-emerald-200';
        icon = <CheckCircle2 size={14} className="text-emerald-600" />;
        comment = `【経営予測：利益上振れ】『${title}』は${modeText}で予算比${ratio.toFixed(1)}%と大幅なコスト抑制に成功。最終着地は予測枠より【${formatVal(deviationAmount)}】削減される試算です。`;
      } else if (ratio > 103) {
        status = 'WARNING';
        color = 'text-rose-700 bg-rose-50 border-rose-200';
        icon = <ShieldAlert size={14} className="text-rose-600" />;
        comment = `【経営予測：緊急コスト警告】『${title}』が計画比${(ratio - 100).toFixed(1)}%超過。最終着地が計画を【${formatVal(deviationAmount)}】オーバーする業績圧迫リスクが試算されます。`;
      } else {
        comment = `【経営予測：予算内着地想定】『${title}』は${modeText}執行率${ratio.toFixed(1)}%と適正。このままのペースであれば月末の総執行も計画枠内に綺麗に収まる想定です。`;
      }
    } else {
      if (ratio >= 105) {
        status = 'EXCELLENT';
        color = 'text-emerald-700 bg-emerald-50 border-emerald-200';
        icon = <ThumbsUp size={14} className="text-emerald-600" />;
        comment = `【経営予測：収益ポテンシャル拡大】『${title}』は${modeText}目標比${ratio.toFixed(1)}%の躍進。最終売上高は目標値を【${formatVal(deviationAmount)}】上振れ突破する見込みです。`;
      } else if (ratio < 95) {
        status = 'WARNING';
        color = 'text-rose-700 bg-rose-50 border-rose-200';
        icon = <AlertTriangle size={14} className="text-rose-600" />;
        comment = `【経営予測：致命的失速アラート】『${title}』が計画の${ratio.toFixed(1)}%に留まり急ブレーキ。当月最終売上が予算比で【${formatVal(deviationAmount)}】下振れ失速する業績リスクが試算されます。`;
      } else {
        comment = `【経営予測：計画達成維持】『${title}』は${modeText}達成率${ratio.toFixed(1)}%と手堅く推移。順調な利益水準を確保できるシミュレーションです。`;
      }
    }
    return { status, color, icon, comment, ratio: ratio.toFixed(1) };
  };

  // 💥 【工数仕分けエンジン】2番（物量・工数）の生データを走査し、総工数と％からリアルタイムに分配・分解する処理
  const generateStackedManhoursData = () => {
    const logisticsItems = data["logisticsData"] || [];
    
    // 対象となる各列の値を抽出
    const totalManhoursItem = logisticsItems.find(item => item && item.title && item.title.includes("総工数"));
    const lycosPctItem = logisticsItems.find(item => item && item.title && item.title.includes("リコス工数%"));
    const broncoPctItem = logisticsItems.find(item => item && item.title && item.title.includes("ブロンコ工数%"));
    const genusePctItem = logisticsItems.find(item => item && item.title && item.title.includes("汎用工数%"));
    const ikkatsuPctItem = logisticsItems.find(item => item && item.title && item.title.includes("一括工数%"));

    return currentMonthIndices.map(idx => {
      const label = baseLabels[idx];
      const totalH = totalManhoursItem && totalManhoursItem.values ? n(totalManhoursItem.values[idx]) : 0;
      
      // スプレッドシートに入っている％（例：0.25 または 25）を安全に比率化
      const getRatio = (itemObj) => {
        if (!itemObj || !itemObj.values) return 0;
        const rawVal = n(itemObj.values[idx]);
        return rawVal > 1 ? rawVal / 100 : rawVal; // 1以上の数値なら100で割る安全弁
      };

      const lycosRatio = getRatio(lycosPctItem);
      const broncoRatio = getRatio(broncoPctItem);
      const genuseRatio = getRatio(genusePctItem);
      const ikkatsuRatio = getRatio(ikkatsuPctItem);

      // 各現場の実数値計算
      const lycosH = totalH * lycosRatio;
      const broncoH = totalH * broncoRatio;
      const genuseH = totalH * genuseRatio;
      const ikkatsuH = totalH * ikkatsuRatio;
      
      // それ以外＝間接工数として集計
      const directSum = lycosH + broncoH + genuseH + ikkatsuH;
      const indirectH = Math.max(0, totalH - directSum);

      return {
        name: label,
        'リコス工数': Math.round(lycosH),
        'ブロンコ工数': Math.round(broncoH),
        '汎用工数': Math.round(genuseH),
        '一括工数': Math.round(ikkatsuH),
        '間接工数': Math.round(indirectH)
      };
    });
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
            {['dx', 'env', 'history', 'manhours'].includes(activeTab) ? 'STRATEGIC MANAGEMENT LAYER' : `${displayMode.toUpperCase()} ANALYTICS MODE (${globalSelectedMonth}月)`}
          </p>
        </div>
        
        <div className="flex gap-3 items-center">
          {['dx', 'env', 'history'].includes(activeTab) && (
            <button onClick={handleOpenAddModal} className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black tracking-wider transition-all shadow-md transform hover:scale-[1.02]"><Plus size={14} /> 新規追加</button>
          )}
          <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 gap-1">
            <button disabled={['monthly', 'dx', 'env', 'history', 'manhours'].includes(activeTab)} onClick={() => setDisplayMode('daily')} className={`px-4 py-1.5 rounded-xl text-[10px] font-black transition-all ${displayMode === 'daily' && !['dx', 'env', 'history', 'manhours'].includes(activeTab) ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 disabled:opacity-30'}`}>日次</button>
            <button disabled={['monthly', 'dx', 'env', 'history', 'manhours'].includes(activeTab)} onClick={() => setDisplayMode('weekly')} className={`px-4 py-1.5 rounded-xl text-[10px] font-black transition-all ${displayMode === 'weekly' && !['dx', 'env', 'history', 'manhours'].includes(activeTab) ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 disabled:opacity-30'}`}>週次</button>
            <button disabled={activeTab !== 'monthly'} className={`px-4 py-1.5 rounded-xl text-[10px] font-black transition-all ${displayMode === 'monthly' ? 'bg-amber-500 text-white shadow-sm' : 'hidden'}`}>月次確定</button>
          </div>
        </div>
      </header>

      <main className="p-10 max-w-[1800px] mx-auto space-y-8">
        
        {/* 月選択バー */}
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

        {/* 週次選択バー */}
        {displayMode === 'weekly' && !['dx', 'env', 'history', 'manhours'].includes(activeTab) && (
          <div className="bg-white border border-slate-200 p-4 rounded-3xl shadow-sm flex flex-wrap gap-2 items-center">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider mr-2 ml-1">{globalSelectedMonth}月の週選択:</span>
            {weeklyGroups.map((g, idx) => (
              <button key={idx} onClick={() => setSelectedWeek(idx)} className={`px-5 py-2.5 rounded-xl font-black text-xs transition-all ${selectedWeek === idx ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}>{g.label}</button>
            ))}
          </div>
        )}

        {/* ==================== 🟢 5. DX推進 ＆ 6. 現場改善 コックピット ==================== */}
        {['dx', 'env'].includes(activeTab) && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {(() => {
              const currentItems = activeTab === 'dx' ? dxItems : envItems;
              if (currentItems.length === 0) {
                return (
                  <div className="col-span-2 bg-white border border-slate-200 p-12 rounded-[2.5rem] text-center text-slate-400 font-bold text-sm">
                    💡 右上の「新規追加」ボタンから項目を入力して保存すると、あのイケてる丸メーターカードがその場に即時生成されるよ！
                  </div>
                );
              }
              return currentItems.map((item, index) => {
                const itemRatio = Math.min(100, Math.max(0, Math.round(n(item.ratio))));
                const chartPieData = [{ name: '完了', value: itemRatio }, { name: '未完了', value: 100 - itemRatio }];
                const themeColor = currentTab.color;
                const isCustomerUrgent = item.customerRelated && item.customerRelated === 'あり';

                return (
                  <div key={index} className={`bg-white border p-8 rounded-[2.5rem] shadow-md flex flex-col md:flex-row gap-6 items-center transition-all relative overflow-hidden ${isCustomerUrgent ? 'border-rose-200 bg-rose-50/10' : 'border-slate-200'}`}>
                    {isCustomerUrgent && (
                      <div className="absolute top-0 right-0 bg-rose-600 text-white px-4 py-1 text-[9px] font-black tracking-widest uppercase rounded-bl-2xl shadow-sm animate-pulse">🚨 顧客関連施策</div>
                    )}
                    <div className="absolute bottom-4 right-4 flex gap-3 text-[10px] font-black tracking-wider uppercase">
                      <button onClick={() => handleOpenEditModal(index)} className="text-slate-400 hover:text-slate-900 flex items-center gap-1 transition-all"><Edit2 size={11} /> 編集</button>
                      <button onClick={() => { if(confirm("この項目を削除しますか？")) handleDeleteItem(index); }} className="text-slate-300 hover:text-rose-500 transition-all">削除</button>
                    </div>
                    <div className="w-[160px] h-[160px] relative shrink-0">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={chartPieData} cx="50%" cy="50%" innerRadius={52} outerRadius={70} startAngle={90} endAngle={-270} dataKey="value">
                            <Cell fill={themeColor} />
                            <Cell fill={isCustomerUrgent ? "#ffe4e6" : "#f1f5f9"} />
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl font-black tracking-tighter" style={{ color: themeColor }}>{itemRatio}%</span>
                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{itemRatio === 100 ? '完了' : '進捗率'}</span>
                      </div>
                    </div>
                    <div className="flex-1 space-y-4 w-full pb-3 md:pb-0">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider text-white" style={{ backgroundColor: themeColor }}>施策 {index + 1}</span>
                          {item.startDate && <span className="text-[9px] font-mono font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">📅 {item.startDate} ～ {item.endDate || '未定'}</span>}
                        </div>
                        <h3 className="text-base font-black text-slate-900 tracking-tight pt-1 leading-snug">{item.name}</h3>
                      </div>
                      {item.effect && item.effect !== "未入力" && (
                        <div className="text-[11px] font-medium text-slate-600 bg-slate-50 border border-slate-100 p-3 rounded-xl flex gap-1.5 items-start">
                          <span className="text-amber-500 font-black shrink-0">💡 狙う効果:</span>
                          <p className="leading-normal">{item.effect}</p>
                        </div>
                      )}
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${itemRatio}%`, backgroundColor: themeColor }}></div>
                      </div>
                      <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 border-t border-slate-100 pt-2">
                        <span>顧客影響: <span className={isCustomerUrgent ? "text-rose-600 font-black" : "text-slate-600"}>{item.customerRelated}</span></span>
                        <span className="font-mono text-slate-400">ステータス: {itemRatio === 100 ? '100%完了' : '実行中'}</span>
                      </div>
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        )}

        {/* ==================== 🔴 7. 営業履歴 専用タイムラインログボード ==================== */}
        {activeTab === 'history' && (
          <div className="bg-white border border-slate-200 p-10 rounded-[2.5rem] shadow-md space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-lg font-black text-slate-900 tracking-tighter flex items-center gap-2">
                <MessageSquare className="text-rose-600" size={20} /> 営業アプローチフィード・タイムライン
              </h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Corporate Sales Activity Logs</p>
            </div>
            <div className="relative border-l-2 border-slate-100 pl-6 ml-4 space-y-8 py-2">
              {historyItems.length === 0 ? (
                <div className="text-slate-400 text-xs font-bold pl-2 py-4">💡 右上の「新規追加」ボタンから、商談ログを刻んでね！</div>
              ) : (
                historyItems.map((log, index) => (
                  <div key={index} className="relative group">
                    <div className="absolute -left-[35px] top-0 bg-white border-2 border-rose-500 p-1.5 rounded-full text-rose-500 group-hover:bg-rose-500 group-hover:text-white transition-all shadow-sm">
                      <Building2 size={12} />
                    </div>
                    <div className="bg-slate-50 border border-slate-100 p-6 rounded-3xl space-y-3 group-hover:border-rose-200 group-hover:bg-rose-50/20 transition-all relative">
                      <div className="absolute top-4 right-6 flex gap-3 text-[10px] font-black tracking-wider uppercase">
                        <button onClick={() => handleOpenEditModal(index)} className="text-slate-400 hover:text-slate-900 flex items-center gap-1 transition-all"><Edit2 size={11} /> 編集</button>
                        <button onClick={() => { if(confirm("この履歴ログを消去しますか？")) handleDeleteItem(index); }} className="text-slate-300 hover:text-rose-500 transition-all">削除</button>
                      </div>
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="text-xs bg-slate-900 text-white px-2.5 py-0.5 rounded-lg font-mono font-black">{log.date || '日付未設定'}</span>
                        <h4 className="text-base font-black text-slate-900 tracking-tight">{log.client}</h4>
                        <span className={`text-[11px] font-black px-3 py-0.5 rounded-full border ${log.result === '●' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : log.result === '×' ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>商談結果: {log.result}</span>
                      </div>
                      {log.proposal && <div className="text-xs font-black text-slate-800 bg-white border px-3 py-1.5 rounded-xl w-fit shadow-sm flex items-center gap-1"><span className="text-rose-500 font-extrabold">💡 提案内容:</span> {log.proposal}</div>}
                      {log.detail && <p className="text-[12px] font-medium text-slate-600 leading-relaxed pl-1 whitespace-pre-wrap pt-1">{log.detail}</p>}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ==================== 🔵 8. 工数 2番シート実データ直結型・積層スタックバーチャート ==================== */}
        {activeTab === 'manhours' && (
          <div className="bg-white border border-slate-200 p-8 rounded-[2.5rem] shadow-md space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-lg font-black text-slate-900 tracking-tighter flex items-center gap-2">
                <Clock className="text-slate-600" size={20} /> 労働密度・現場別投下工数内訳スタック分析 (2番シート完全実データ直結)
              </h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Labor Productivity Stacked Realtime Structure</p>
            </div>
            
            {/* 💥 【完全結合】お兄ちゃん指定の計算式で動的に算出された配列をグラフにブチ込む */}
            <div className="h-[380px] bg-slate-50/50 p-6 rounded-3xl border border-slate-100">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={generateStackedManhoursData()} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} axisLine={false} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: '16px', border: 'none' }} />
                  <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', paddingBottom: '15px' }} />
                  
                  {/* お兄ちゃん指定の4現場 ＋ それ以外をまとめた間接工数の積み上げ構成！ */}
                  <Bar name="リコス工数" dataKey="リコス工数" stackId="reizoManpower" fill="#3b82f6" />
                  <Bar name="ブロンコ工数" dataKey="ブロンコ工数" stackId="reizoManpower" fill="#2563eb" />
                  <Bar name="汎用工数" dataKey="汎用工数" stackId="reizoManpower" fill="#1d4ed8" />
                  <Bar name="一括工数" dataKey="一括工数" stackId="reizoManpower" fill="#1e3a8a" />
                  <Bar name="間接工数（その他）" dataKey="間接工数" stackId="reizoManpower" fill="#94a3b8" radius={[8, 8, 0, 0]} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
            
            <div className="p-5 rounded-3xl border text-[11px] font-medium bg-slate-900 text-slate-300 border-slate-800 flex items-start gap-4 shadow-sm leading-relaxed">
              <div className="p-2 bg-slate-800 rounded-xl shadow-sm shrink-0 mt-0.5 text-blue-400"><Bot size={14} /></div>
              <p>【経営工数監査チームより】2番シートの実実績工数と各現場のシェア％から投下労働密度を逆算デプロイしました。直接作業時間の総和と、それ以外の間接ロスのバランスをモニタリングすることで、無駄な待機時間やマテハン移動ロスの早期発見に直結します。</p>
            </div>
          </div>
        )}

        {/* ==================== 📊 1,2,3,4番タブの通常グラフ ＆ 黒い数値評価パネル完全合体 ==================== */}
        {!['dx', 'env', 'history', 'manhours'].includes(activeTab) && (
          <div className={`grid grid-cols-1 ${displayMode === 'daily' ? 'lg:grid-cols-2' : ''} gap-8`}>
            {allMetrics.map((m, i) => {
              const isCost = lowIsBetterMetrics.some(k => m.title.includes(k));
              const isProductivityRatio = m.title.includes("生産性") || activeTab === 'productivity';
              const isTotalType = totalMetricsKeywords.some(k => m.title.includes(k)) && !isProductivityRatio;
              
              const weekIdx = weeklyGroups[selectedWeek]?.indices || [];
              let chartData = [];
              let dispAct = 0; let dispFct = 0;

              if (displayMode === 'daily') {
                chartData = currentMonthIndices.map(idx => ({ name: m.labels[idx], "実績": n(m.actual[idx]), [m.forecastType]: n(m.forecast[idx]) }));
                const today = new Date();
                const todayMonth = today.getMonth() + 1;
                const todayDate = today.getDate();

                const upToTodayIndices = currentMonthIndices.filter(idx => {
                  const label = m.labels[idx];
                  if (typeof label === 'string' && label.includes('/')) {
                    const p = label.split('/');
                    const mNum = parseInt(p[0], 10);
                    const dNum = parseInt(p[1], 10);
                    if (mNum < todayMonth) return true;
                    if (mNum === todayMonth && dNum <= todayDate) return true;
                  }
                  return false;
                });

                const targetIndices = upToTodayIndices.length > 0 ? upToTodayIndices : currentMonthIndices;
                const acts = targetIndices.map(idx => n(m.actual[idx]));
                const fcts = targetIndices.map(idx => n(m.forecast[idx]));

                if (isProductivityRatio) {
                  dispAct = acts.length ? acts.reduce((a, b) => a + b, 0) / acts.length : 0;
                  dispFct = fcts.length ? fcts.reduce((a, b) => a + b, 0) / fcts.length : 1;
                } else {
                  dispAct = acts.reduce((a, b) => a + b, 0);
                  dispFct = fcts.reduce((a, b) => a + b, 0) || 1;
                }
              } 
              else if (displayMode === 'weekly') {
                chartData = weekIdx.map(idx => ({ name: m.labels[idx], "実績": n(m.actual[idx]), [m.forecastType]: n(m.forecast[idx]) }));
                const acts = weekIdx.map(idx => n(m.actual[idx])); const fcts = weekIdx.map(idx => n(m.forecast[idx]));
                
                if (isProductivityRatio) {
                  dispAct = acts.length ? acts.reduce((a, b) => a + b, 0) / acts.length : 0;
                  dispFct = fcts.length ? fcts.reduce((a, b) => a + b, 0) / fcts.length : 1;
                } else { 
                  dispAct = acts.reduce((a, b) => a + b, 0); 
                  dispFct = fcts.reduce((a, b) => a + b, 0) || 1; 
                }
              } 
              else if (displayMode === 'monthly') {
                chartData = currentMonthIndices.map(idx => ({ name: m.labels[idx], "実績": n(m.actual[idx]), [m.forecastType]: n(m.forecast[idx]) }));
                const acts = currentMonthIndices.map(idx => n(m.actual[idx])); const fcts = currentMonthIndices.map(idx => n(m.forecast[idx]));
                
                if (isProductivityRatio) {
                  dispAct = acts.length ? acts.reduce((a, b) => a + b, 0) / acts.length : 0;
                  dispFct = fcts.length ? fcts.reduce((a, b) => a + b, 0) / fcts.length : 1;
                } else {
                  dispAct = acts.reduce((a, b) => a + b, 0);
                  dispFct = fcts.reduce((a, b) => a + b, 0) || 1;
                }
              }

              const calculatedRatio = dispFct > 0 ? (dispAct / dispFct) * 100 : 0;
              const evalData = getAiCorporateEvaluation(m.title, dispAct, dispFct, displayMode, isTotalType, calculatedRatio, m.forecast, currentMonthIndices);

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
                          <p className="text-[9px] font-bold text-slate-400 uppercase">{globalSelectedMonth}月 本日まで{isProductivityRatio ? 'の平均実績' : 'の累計実績'}</p>
                          <p className="text-xl font-black text-slate-800 tracking-tight">{Math.round(dispAct).toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-[9px] font-bold text-slate-400 uppercase">今日現在の進捗率</p>
                          <p className={`text-xl font-black ${calculatedRatio >= 100 ? (isCost ? 'text-rose-600' : 'text-emerald-600') : (isCost ? 'text-emerald-600' : 'text-rose-600')}`}>{calculatedRatio.toFixed(1)}%</p>
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
                        <div className="border-b border-slate-800 pb-2"><p className="text-[10px] font-black tracking-widest text-blue-400 uppercase">当{displayMode === 'weekly' ? '週' : '月'}{isProductivityRatio ? '平均' : (isTotalType ? '合計' : '平均')}確認パネル</p></div>
                        <div className="space-y-4 my-auto">
                          <div className="flex justify-between items-baseline">
                            <span className="text-xs font-bold text-slate-400">{isProductivityRatio ? '平均実績' : (isTotalType ? `${displayMode === 'weekly' ? '合計実績' : '当月合計実績'}` : '平均実績')}</span>
                            <span className="text-2xl font-black tracking-tight text-white">{Math.round(dispAct).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between items-baseline">
                            <span className="text-xs font-bold text-slate-400">{isProductivityRatio ? `平均${m.forecastType}` : (isTotalType ? `${displayMode === 'weekly' ? '合計' : '当月合計'}${m.forecastType}` : `平均${m.forecastType}`)}</span>
                            <span className="text-xl font-bold tracking-tight text-slate-300">{Math.round(dispFct).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between items-baseline border-t border-slate-800 pt-3">
                            <span className="text-xs font-black text-blue-400">達成率 ({m.forecastType}比)</span>
                            <span className={`text-3xl font-black tracking-tighter ${calculatedRatio >= 100 ? (isCost ? 'text-rose-400' : 'text-emerald-400') : (isCost ? 'text-emerald-400' : 'text-rose-400')}`}>{calculatedRatio.toFixed(1)}%</span>
                          </div>
                        </div>
                        <div className="text-[9px] text-slate-500 font-bold text-center uppercase tracking-wider">Executive Management DB</div>
                      </div>
                    )}
                  </div>

                  <div className={`p-5 rounded-3xl border text-[11px] font-medium flex items-start gap-4 shadow-sm leading-relaxed ${evalData.color}`}><div className="p-2 bg-white rounded-xl shadow-sm shrink-0 mt-0.5">{evalData.icon}</div><p>{evalData.comment}</p></div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* 新規追加 ＆ 編集用モーダル */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] border border-slate-200 p-8 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900 tracking-tight">【{tabs.find(t=>t.id===activeTab)?.label}】データの{editingIndex !== null ? '編集上書き' : '新規追加'}</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Direct Database Injection Mode</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-900 p-1"><X size={18} /></button>
            </div>

            {activeTab === 'history' ? (
              <div className="space-y-4 text-xs font-bold text-slate-700">
                <div className="space-y-1">
                  <label className="text-[11px] tracking-wider text-slate-400 uppercase">1. 日付 <span className="text-rose-500">*必須</span></label>
                  <input type="date" value={newItem.startDate} onChange={(e) => setNewItem({...newItem, startDate: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-semibold text-slate-900 focus:outline-none focus:border-slate-900" />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] tracking-wider text-slate-400 uppercase">2. 誰に（アプローチ先顧客名） <span className="text-rose-500">*必須</span></label>
                  <input type="text" placeholder="例：クラフトデリカ（イオンフードサプライ本社）" value={newItem.client} onChange={(e) => setNewItem({...newItem, client: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-semibold text-slate-900 focus:outline-none focus:border-slate-900" />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] tracking-wider text-slate-400 uppercase">3. 何を（提案・商談タイトル） <span className="text-rose-500">*必須</span></label>
                  <input type="text" placeholder="例：新設高瀬町インフラ稼働に伴う物量単価提案" value={newItem.proposal} onChange={(e) => setNewItem({...newItem, proposal: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-semibold text-slate-900 focus:outline-none focus:border-slate-900" />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] tracking-wider text-slate-400 uppercase">4. 内容詳細（目安250文字）</label>
                  <textarea placeholder="ここに具体的な商談経緯、現場の要望、次回のアクションなどの詳細を250文字目安でしっかり記録できます..." value={newItem.detail} onChange={(e) => setNewItem({...newItem, detail: e.target.value})} maxLength={500} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-semibold text-slate-900 h-28 focus:outline-none focus:border-slate-900 resize-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] tracking-wider text-slate-400 uppercase">5. 商談結果（進捗ステータス）</label>
                  <div className="grid grid-cols-3 gap-3">
                    {['●', '×', '△'].map(res => (
                      <button key={res} type="button" onClick={() => setNewItem({...newItem, result: res})} className={`py-2.5 rounded-xl font-black text-xs border transition-all ${newItem.result === res ? 'bg-slate-900 text-white border-slate-900 shadow-md' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}`}>{res === '●' ? '● (合意)' : res === '×' ? '× (失注)' : '△ (保留)'}</button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4 text-xs font-bold text-slate-700">
                <div className="space-y-1">
                  <label className="text-[11px] tracking-wider text-slate-400 uppercase">項目名（改善内容） <span className="text-rose-500">*必須</span></label>
                  <input type="text" placeholder={activeTab === 'dx' ? '例：ペーパーレスFAX一斉導入システム' : '例：倉庫内LED照明への全面切り替え'} value={newItem.name} onChange={(e) => setNewItem({...newItem, name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-semibold text-slate-900 focus:outline-none focus:border-slate-900" />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] tracking-wider text-slate-400 uppercase">想定効果・目的</label>
                  <textarea placeholder="例：月あたり紙コストを34%削減、インサイド業務を20時間省力化" value={newItem.effect} onChange={(e) => setNewItem({...newItem, effect: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-semibold text-slate-900 h-20 focus:outline-none focus:border-slate-900 resize-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[11px] tracking-wider text-slate-400 uppercase">{activeTab === 'dx' ? '開始期日' : '記入日'}</label>
                    <input type="date" value={newItem.startDate} onChange={(e) => setNewItem({...newItem, startDate: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-semibold text-slate-900 focus:outline-none focus:border-slate-900" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] tracking-wider text-slate-400 uppercase">{activeTab === 'dx' ? '終了期日' : '終了日'}</label>
                    <input type="date" value={newItem.endDate} onChange={(e) => setNewItem({...newItem, endDate: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-semibold text-slate-900 focus:outline-none focus:border-slate-900" />
                  </div>
                </div>
                <div className="flex items-center gap-2.5 bg-slate-50 p-4 rounded-xl border border-slate-100 cursor-pointer" onClick={() => setNewItem({...newItem, customerRelated: !newItem.customerRelated})}>
                  <input type="checkbox" checked={newItem.customerRelated} onChange={() => {}} className="w-4 h-4 accent-slate-900 cursor-pointer" />
                  <div className="text-left">
                    <p className="text-xs text-slate-900 font-black">この施策は「顧客関連」に影響あり</p>
                    <p className="text-[10px] text-slate-400 font-medium">チェックを入れるとカード上に「🚨 顧客関連施策」のアラート灯がつきます</p>
                  </div>
                </div>
                <div className="space-y-1.5 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <div className="flex justify-between items-center">
                    <label className="text-[11px] tracking-wider text-slate-400 uppercase">現在の進捗ステータス</label>
                    <span className="text-sm font-black text-slate-900 bg-white border px-3 py-0.5 rounded-lg shadow-sm">{newItem.ratio}% {Number(newItem.ratio) === 100 ? '🎉 完了' : '🐾 実行中'}</span>
                  </div>
                  <input type="range" min="0" max="100" step="5" value={newItem.ratio} onChange={(e) => setNewItem({...newItem, ratio: Number(e.target.value)})} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900" />
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button onClick={() => setIsModalOpen(false)} className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-all">キャンセル</button>
              <button onClick={handleSaveItem} className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-black tracking-wider transition-all shadow-md">データを安全に保存</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}