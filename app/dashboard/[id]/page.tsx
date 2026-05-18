// @ts-nocheck
'use client';
import { useEffect, useState } from 'react';
import { ArrowLeft, Activity, Calculator, TrendingUp, Calendar, Rocket, Leaf, MessageSquare, Clock, Bot, ThumbsUp, AlertTriangle, CheckCircle2, ShieldAlert, Edit2, Plus, X } from 'lucide-react';
import Link from 'next/link';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Bar, Line, ComposedChart, Legend } from 'recharts';

export default function DashboardPage({ params }: { params: { id: string } }) {
  const [data, setData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('logistics');
  const [displayMode, setDisplayMode] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [selectedWeek, setSelectedWeek] = useState<number>(0);
  const [globalSelectedMonth, setGlobalSelectedMonth] = useState<string>('');

  // ローカルストレージ（5, 6, 7番タブ）用ステート
  const [dxItems, setDxItems] = useState<any[]>([]);
  const [envItems, setEnvItems] = useState<any[]>([]);
  const [historyItems, setHistoryItems] = useState<any[]>([]); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  // モーダル入力フォーム用ステート
  const [newItem, setNewItem] = useState({
    name: '', effect: '', startDate: '', endDate: '', customerRelated: false, ratio: 0,
    client: '', proposal: '', detail: '', result: '●'
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
        client: item.client || '', proposal: item.proposal || '', detail: item.detail || '', result: item.result || '●'
      });
    } else {
      const targetList = activeTab === 'dx' ? dxItems : envItems;
      const item = targetList[index];
      setNewItem({
        name: item.name || '', effect: item.effect === '未入力' ? '' : (item.effect || ''),
        startDate: item.startDate ? item.startDate.replace(/\//g, '-') : '',
        endDate: item.endDate ? item.endDate.replace(/\//g, '-') : '',
        customerRelated: item.customerRelated === 'あり', ratio: item.ratio || 0
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
        client: newItem.client, proposal: newItem.proposal, detail: newItem.detail || '', result: newItem.result
      };
      if (editingIndex !== null) {
        updatedList = [...historyItems]; updatedList[editingIndex] = formattedHistory;
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
        name: newItem.name, effect: newItem.effect || '未入力',
        startDate: newItem.startDate ? newItem.startDate.replace(/-/g, '/') : '',
        endDate: newItem.endDate ? newItem.endDate.replace(/-/g, '/') : '',
        customerRelated: newItem.customerRelated ? 'あり' : 'なし', ratio: Number(newItem.ratio)
      };
      if (activeTab === 'dx') {
        if (editingIndex !== null) {
          updatedList = [...dxItems]; updatedList[editingIndex] = formattedItem;
        } else {
          updatedList = [...dxItems, formattedItem];
        }
        setDxItems(updatedList);
        localStorage.setItem(`dx_${params.id}`, JSON.stringify(updatedList));
      } else {
        if (editingIndex !== null) {
          updatedList = [...envItems]; updatedList[editingIndex] = formattedItem;
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
      setHistoryItems(updated); localStorage.setItem(`history_${params.id}`, JSON.stringify(updated));
    } else if (activeTab === 'dx') {
      updated = dxItems.filter((_, idx) => idx !== indexToDelete);
      setDxItems(updated); localStorage.setItem(`dx_${params.id}`, JSON.stringify(updated));
    } else {
      updated = envItems.filter((_, idx) => idx !== indexToDelete);
      setEnvItems(updated); localStorage.setItem(`env_${params.id}`, JSON.stringify(updated));
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

  const baseLabels = data.labels || ["4/1", "4/2"];
  
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

  const availableMonths = getAvailableMonths(baseLabels);
  const currentMonthIndices = baseLabels.map((l, idx) => (typeof l === 'string' && l.split('/')[0] === globalSelectedMonth) ? idx : -1).filter(idx => idx !== -1);

  const getWeeklyGroupsForCurrentMonth = (labels: string[], allowedIndices: number[]) => {
    const groups: { weekNum: number; label: string; indices: number[] }[] = [];
    if (!allowedIndices || allowedIndices.length === 0) return groups;
    
    let currentWeekIndices: number[] = [];
    let weekCount = 1;
    let startLabel = labels[allowedIndices[0]];

    allowedIndices.forEach((idx) => {
      const label = labels[idx];
      if (!label || typeof label !== 'string' || !label.includes('/')) {
        currentWeekIndices.push(idx); return;
      }
      const parts = label.split('/');
      const date = new Date(2026, parseInt(parts[0], 10) - 1, parseInt(parts[1], 10));
      
      if (date.getDay() === 0 && currentWeekIndices.length > 0) {
        groups.push({ weekNum: weekCount, label: `${globalSelectedMonth}月度 ${weekCount}週目 (${startLabel} ～ ${labels[idx - 1]})`, indices: currentWeekIndices });
        weekCount++; startLabel = label; currentWeekIndices = [];
      }
      currentWeekIndices.push(idx);
    });

    if (currentWeekIndices.length > 0) {
      groups.push({ weekNum: weekCount, label: `${weekCount}週目 (${startLabel} ～ ${labels[allowedIndices[allowedIndices.length - 1]]})`, indices: currentWeekIndices });
    }
    return groups;
  };

  const weeklyGroups = getWeeklyGroupsForCurrentMonth(baseLabels, currentMonthIndices);

  // 💥 【大復活】ダミー予測％を完全に消滅させ、スプレッドシートの本物予測列（forecastValues）を100%ダイレクトに結合！
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
          title: cleanTitle, labels: item.labels || baseLabels, 
          actual: new Array(baseLabels.length).fill(0), forecast: new Array(baseLabels.length).fill(0), 
          forecastType: '予測' 
        });
      }
      
      const entry = combinedMap.get(cleanTitle);
      entry.actual = item.values;
      
      // 💥 スプレッドシート側の本物のデータをそのまま適用（ダミー計算を完全抹殺）
      if (item.forecastValues && Array.isArray(item.forecastValues)) {
        entry.forecast = item.forecastValues;
      } else if (item.forecast && Array.isArray(item.forecast)) {
        entry.forecast = item.forecast;
      } else {
        entry.forecast = new Array(baseLabels.length).fill(0);
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

  const getAiCorporateEvaluation = (title, ratio, mode) => {
    const isLowBetter = lowIsBetterMetrics.some(keyword => title.includes(keyword));
    let modeText = mode === 'daily' ? '今日までの累計進捗' : (mode === 'weekly' ? '当週' : '当月');

    let color = 'text-slate-700 bg-slate-50 border-slate-200';
    let icon = <Bot size={14} className="text-slate-600" />;
    let comment = "";

    if (isLowBetter) {
      if (ratio <= 92) {
        color = 'text-emerald-700 bg-emerald-50 border-emerald-200';
        icon = <CheckCircle2 size={14} className="text-emerald-600" />;
        comment = `【経営予測】『${title}』は${modeText}で予算比 ${ratio.toFixed(1)}% とコスト抑制に成功。`;
      } else if (ratio > 103) {
        color = 'text-rose-700 bg-rose-50 border-rose-200';
        icon = <ShieldAlert size={14} className="text-rose-600" />;
        comment = `【経営警告】『${title}』が計画比 ${(ratio - 100).toFixed(1)}% 超過。利益圧迫リスクがあります。`;
      } else {
        comment = `【経営進捗】『${title}』は${modeText}執行率 ${ratio.toFixed(1)}% と適正範囲内。計画内で推移しています。`;
      }
    } else {
      if (ratio >= 105) {
        color = 'text-emerald-700 bg-emerald-50 border-emerald-200';
        icon = <ThumbsUp size={14} className="text-emerald-600" />;
        comment = `【業績好調】『${title}』は${modeText}目標比 ${ratio.toFixed(1)}% の躍進。目標値を大きく上振れ突破する見込みです。`;
      } else if (ratio < 95) {
        color = 'text-rose-700 bg-rose-50 border-rose-200';
        icon = <AlertTriangle size={14} className="text-rose-600" />;
        comment = `【目標未達警告】『${title}』が計画の ${ratio.toFixed(1)}% に留まり失速。早急なリカバリーが必要です。`;
      } else {
        comment = `【順調】『${title}』は${modeText}達成率 ${ratio.toFixed(1)}% と手堅く計画通りに推移しています。`;
      }
    }
    return { color, icon, comment };
  };

  // 💥 【お兄ちゃん指定列完全直結】スプレッドシートの指定列（M, O, Q, S, U, V列）の実績時間からダイレクトに積み上げ！
  const generateStackedManhoursData = () => {
    const logisticsItems = data["logisticsData"] || [];
    
    const colV_Total = logisticsItems.find(item => item && item.title && (item.title.includes("総工数") || item.title.includes("実績_総工数")));
    const colM_Lycos = logisticsItems.find(item => item && item.title && (item.title.includes("リコス") && !item.title.includes("アイス") && !item.title.includes("%")));
    const colO_Ice = logisticsItems.find(item => item && item.title && item.title.includes("リコスアイス"));
    const colQ_Bronco = logisticsItems.find(item => item && item.title && item.title.includes("ブロンコビリー"));
    const colS_Genuse = logisticsItems.find(item => item && item.title && item.title.includes("汎用"));
    const colU_Ikkatsu = logisticsItems.find(item => item && item.title && item.title.includes("一括"));

    return currentMonthIndices.map(idx => {
      const label = baseLabels[idx];
      
      const totalH = colV_Total && colV_Total.values ? n(colV_Total.values[idx]) : 0;
      const lycosH = colM_Lycos && colM_Lycos.values ? n(colM_Lycos.values[idx]) : 0;
      const iceH = colO_Ice && colO_Ice.values ? n(colO_Ice.values[idx]) : 0;
      const broncoH = colQ_Bronco && colQ_Bronco.values ? n(colQ_Bronco.values[idx]) : 0;
      const genuseH = colS_Genuse && colS_Genuse.values ? n(colS_Genuse.values[idx]) : 0;
      const ikkatsuH = colU_Ikkatsu && colU_Ikkatsu.values ? n(colU_Ikkatsu.values[idx]) : 0;

      const directSum = lycosH + iceH + broncoH + genuseH + ikkatsuH;
      const indirectH = Math.max(0, totalH - directSum);

      return {
        name: label,
        'リコス': Math.round(lycosH),
        'リコスアイス': Math.round(iceH),
        'ブロンコビリー': Math.round(broncoH),
        '汎用': Math.round(genuseH),
        '一括': Math.round(ikkatsuH),
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
            <span className="text-xs font-black uppercase tracking-widest text-slate-300">表示対象月マスター選択 :</span>
          </div>
          <div className="flex gap-2">
            {availableMonths.map((m, idx) => (
              <button key={idx} onClick={() => { setGlobalSelectedMonth(m); setSelectedWeek(0); }} className={`px-6 py-2.5 rounded-xl font-black text-xs transition-all ${globalSelectedMonth === m ? 'bg-amber-500 text-slate-950 shadow-md transform scale-105' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>{m}月度を表示</button>
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
              <button key={idx} onClick={() => setSelectedWeek(idx)} className={`px-5 py-2.5 rounded-xl font-black text-xs transition-all ${selectedWeek === idx ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-50 text-slate-600'}`}>{g.label}</button>
            ))}
          </div>
        )}

        {/* ==================== 🟢 5. DX推進 ＆ 6. 現場改善 ==================== */}
        {['dx', 'env'].includes(activeTab) && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {(() => {
              const currentItems = activeTab === 'dx' ? dxItems : envItems;
              if (currentItems.length === 0) {
                return <div className="col-span-2 bg-white border p-12 rounded-[2.5rem] text-center text-slate-400 font-bold text-sm">💡 右上の「新規追加」ボタンから項目を入力・保存してください！</div>;
              }
              return currentItems.map((item, index) => {
                const itemRatio = Math.min(100, Math.max(0, Math.round(n(item.ratio))));
                return (
                  <div key={index} className={`bg-white border p-8 rounded-[2.5rem] shadow-md flex flex-col md:flex-row gap-6 items-center relative overflow-hidden ${item.customerRelated === 'あり' ? 'border-rose-200 bg-rose-50/10' : 'border-slate-200'}`}>
                    {item.customerRelated === 'あり' && <div className="absolute top-0 right-0 bg-rose-600 text-white px-4 py-1 text-[9px] font-black tracking-widest uppercase rounded-bl-2xl">🚨 顧客関連施策</div>}
                    <div className="absolute bottom-4 right-4 flex gap-3 text-[10px] font-black tracking-wider uppercase">
                      <button onClick={() => handleOpenEditModal(index)} className="text-slate-400 hover:text-slate-900 flex items-center gap-1"><Edit2 size={11} /> 編集</button>
                      <button onClick={() => { if(confirm("削除しますか？")) handleDeleteItem(index); }} className="text-slate-300 hover:text-rose-500">削除</button>
                    </div>
                    <div className="w-40 h-40 bg-slate-50 border rounded-full flex flex-col items-center justify-center border-dashed">
                      <span className="text-2xl font-black tracking-tighter" style={{ color: currentTab.color }}>{itemRatio}%</span>
                      <span className="text-[8px] font-bold text-slate-400 tracking-widest uppercase">{itemRatio === 100 ? '完了' : '進捗率'}</span>
                    </div>
                    <div className="flex-1 space-y-4 w-full">
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[9px] font-black px-2 py-0.5 rounded-md uppercase text-white" style={{ backgroundColor: currentTab.color }}>施策 {index + 1}</span>
                          {item.startDate && <span className="text-[9px] font-mono font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">📅 {item.startDate} ～ {item.endDate || '未定'}</span>}
                        </div>
                        <h3 className="text-base font-black text-slate-900 tracking-tight pt-1 leading-snug">{item.name}</h3>
                      </div>
                      {item.effect && item.effect !== "未入力" && <div className="text-[11px] font-medium text-slate-600 bg-slate-50 border p-3 rounded-xl"><span className="text-amber-500 font-black">💡 狙う効果:</span> {item.effect}</div>}
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${itemRatio}%`, backgroundColor: currentTab.color }}></div>
                      </div>
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        )}

        {/* ==================== 🔴 7. 営業履歴 ==================== */}
        {activeTab === 'history' && (
          <div className="bg-white border border-slate-200 p-10 rounded-[2.5rem] shadow-md space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-lg font-black text-slate-900 tracking-tighter flex items-center gap-2">
                <MessageSquare className="text-rose-600" size={20} /> 営業アプローチフィード・タイムライン
              </h2>
            </div>
            <div className="relative border-l-2 border-slate-100 pl-6 ml-4 space-y-8 py-2">
              {historyItems.length === 0 ? (
                <div className="text-slate-400 text-xs font-bold pl-2 py-4">💡 右上の「新規追加」ボタンから、商談ログを刻んでね！</div>
              ) : (
                historyItems.map((log, index) => (
                  <div key={index} className="relative group">
                    <div className="absolute -left-[35px] top-0 bg-white border-2 border-rose-500 p-1.5 rounded-full text-rose-500">
                      <Building2 size={12} />
                    </div>
                    <div className="bg-slate-50 border border-slate-100 p-6 rounded-3xl space-y-3 relative">
                      <div className="absolute top-4 right-6 flex gap-3 text-[10px] font-black tracking-wider uppercase">
                        <button onClick={() => handleOpenEditModal(index)} className="text-slate-400 hover:text-slate-900 flex items-center gap-1"><Edit2 size={11} /> 編集</button>
                        <button onClick={() => { if(confirm("消去しますか？")) handleDeleteItem(index); }} className="text-slate-300 hover:text-rose-500">削除</button>
                      </div>
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="text-xs bg-slate-900 text-white px-2.5 py-0.5 rounded-lg font-mono font-black">{log.date || '日付未設定'}</span>
                        <h4 className="text-base font-black text-slate-900 tracking-tight">{log.client}</h4>
                        <span className={`text-[11px] font-black px-3 py-0.5 rounded-full border ${log.result === '●' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : log.result === '×' ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>結果: {log.result}</span>
                      </div>
                      {log.proposal && <div className="text-xs font-black text-slate-800 bg-white border px-3 py-1.5 rounded-xl w-fit"><span className="text-rose-500 font-extrabold">💡 提案内容:</span> {log.proposal}</div>}
                      {log.detail && <p className="text-[12px] font-medium text-slate-600 leading-relaxed whitespace-pre-wrap">{log.detail}</p>}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ==================== 🔵 8. 工数 お兄ちゃん指定列完全直結型スタックバーチャート ==================== */}
        {activeTab === 'manhours' && (
          <div className="bg-white border border-slate-200 p-8 rounded-[2.5rem] shadow-md space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-lg font-black text-slate-900 tracking-tighter flex items-center gap-2">
                <Clock className="text-slate-600" size={20} /> 現場別投下工数実績内訳スタック分析（指定列M, O, Q, S, U, V同期）
              </h2>
            </div>
            
            <div className="h-[380px] bg-slate-50/50 p-6 rounded-3xl border border-slate-100">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={generateStackedManhoursData()} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} axisLine={false} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: '16px', border: 'none' }} />
                  <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', paddingBottom: '15px' }} />
                  
                  <Bar name="リコス" dataKey="リコス" stackId="reizoManpower" fill="#3b82f6" />
                  <Bar name="リコスアイス" dataKey="リコスアイス" stackId="reizoManpower" fill="#06b6d4" />
                  <Bar name="ブロンコビリー" dataKey="ブロンコビリー" stackId="reizoManpower" fill="#2563eb" />
                  <Bar name="汎用" dataKey="汎用" stackId="reizoManpower" fill="#1d4ed8" />
                  <Bar name="一括" dataKey="一括" stackId="reizoManpower" fill="#1e3a8a" />
                  <Bar name="間接工数（その他）" dataKey="間接工数" stackId="reizoManpower" fill="#94a3b8" radius={[8, 8, 0, 0]} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* ==================== 📊 1,2,3,4番タブ：バグ完全粉砕・リアルタイム2本並びグラフ ==================== */}
        {!['dx', 'env', 'history', 'manhours'].includes(activeTab) && (
          <div className={`grid grid-cols-1 ${displayMode === 'daily' ? 'lg:grid-cols-2' : ''} gap-8`}>
            {allMetrics.map((m, i) => {
              const isCost = lowIsBetterMetrics.some(k => m.title.includes(k));
              const isProductivityRatio = m.title.includes("生産性") || activeTab === 'productivity';
              
              const weekIdx = weeklyGroups[selectedWeek]?.indices || [];
              let chartData = [];
              let dispAct = 0; let dispFct = 0;
              let rawCalculatedRatio = 0; 

              // --- 1. 日次モード（いまのまま累計比率維持！） ---
              if (displayMode === 'daily') {
                chartData = currentMonthIndices.map(idx => ({ name: m.labels[idx], "実績": n(m.actual[idx]), [m.forecastType]: n(m.forecast[idx]) }));
                const today = new Date();
                const todayMonth = today.getMonth() + 1; const todayDate = today.getDate();

                const upToTodayIndices = currentMonthIndices.filter(idx => {
                  const label = m.labels[idx];
                  if (typeof label === 'string' && label.includes('/')) {
                    const p = label.split('/');
                    return (parseInt(p[0], 10) < todayMonth) || (parseInt(p[0], 10) === todayMonth && parseInt(p[1], 10) <= todayDate);
                  }
                  return false;
                });

                const targetIndices = upToTodayIndices.length > 0 ? upToTodayIndices : currentMonthIndices;
                const acts = targetIndices.map(idx => n(m.actual[idx])); const fcts = targetIndices.map(idx => n(m.forecast[idx]));

                if (isProductivityRatio) {
                  dispAct = acts.length ? acts.reduce((a, b) => a + b, 0) / acts.length : 0;
                  dispFct = fcts.length ? fcts.reduce((a, b) => a + b, 0) / fcts.length : 1;
                } else {
                  dispAct = acts.reduce((a, b) => a + b, 0); dispFct = fcts.reduce((a, b) => a + b, 0) || 1;
                }
                rawCalculatedRatio = dispFct > 0 ? (dispAct / dispFct) * 100 : 0;
              } 
              // --- 2. 週次モード（画面表示データそのままの実績合計÷計画合計の割り算！） ---
              else if (displayMode === 'weekly') {
                chartData = weekIdx.map(idx => ({ name: m.labels[idx], "実績": n(m.actual[idx]), [m.forecastType]: n(m.forecast[idx]) }));
                const acts = weekIdx.map(idx => n(m.actual[idx])); const fcts = weekIdx.map(idx => n(m.forecast[idx]));
                
                if (isProductivityRatio) {
                  dispAct = acts.length ? acts.reduce((a, b) => a + b, 0) / acts.length : 0;
                  dispFct = fcts.length ? fcts.reduce((a, b) => a + b, 0) / fcts.length : 1;
                } else { 
                  dispAct = acts.reduce((a, b) => a + b, 0); dispFct = fcts.reduce((a, b) => a + b, 0) || 1; 
                }
                // 💥 画面に表示されている数値の単純割り算に完全修正！きもち悪い固定％を完全粉砕！
                rawCalculatedRatio = dispFct > 0 ? (dispAct / dispFct) * 100 : 0;
              } 
              // --- 3. 月次確定モード（画面表示当月データそのままの実績合計÷計画合計の割り算！） ---
              else if (displayMode === 'monthly') {
                chartData = currentMonthIndices.map(idx => ({ name: m.labels[idx], "実績": n(m.actual[idx]), [m.forecastType]: n(m.forecast[idx]) }));
                const acts = currentMonthIndices.map(idx => n(m.actual[idx])); const fcts = currentMonthIndices.map(idx => n(m.forecast[idx]));
                
                if (isProductivityRatio) {
                  dispAct = acts.length ? acts.reduce((a, b) => a + b, 0) / acts.length : 0;
                  dispFct = fcts.length ? fcts.reduce((a, b) => a + b, 0) / fcts.length : 1;
                } else {
                  dispAct = acts.reduce((a, b) => a + b, 0); dispFct = fcts.reduce((a, b) => a + b, 0) || 1;
                }
                // 💥 画面に表示されている数値の単純割り算に完全修正！きもち悪い固定％を完全粉砕！
                rawCalculatedRatio = dispFct > 0 ? (dispAct / dispFct) * 100 : 0;
              }

              const evalData = getAiCorporateEvaluation(m.title, rawCalculatedRatio, displayMode);

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
                          <p className="text-[9px] font-bold text-slate-400 uppercase">本日までの累計実績</p>
                          <p className="text-xl font-black text-slate-800 tracking-tight">{Math.round(dispAct).toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-[9px] font-bold text-slate-400 uppercase">現在の達成率</p>
                          <p className={`text-xl font-black ${rawCalculatedRatio >= 100 ? (isCost ? 'text-rose-600' : 'text-emerald-600') : (isCost ? 'text-emerald-600' : 'text-rose-600')}`}>{rawCalculatedRatio.toFixed(1)}%</p>
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
                          {/* 💥 折れ線（計画値）もスプレッドシートの本物データを100%忠実にトレースして復活！ */}
                          <Line name={m.forecastType} type="monotone" dataKey={m.forecastType} stroke="#7c3aed" strokeWidth={3} dot={false} />
                        </ComposedChart>
                      </ResponsiveContainer>
                    </div>

                    {displayMode !== 'daily' && (
                      <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-inner h-[320px] flex flex-col justify-between">
                        <div className="border-b border-slate-800 pb-2"><p className="text-[10px] font-black tracking-widest text-blue-400 uppercase">当{displayMode === 'weekly' ? '週' : '月'}確認パネル</p></div>
                        <div className="space-y-4 my-auto">
                          <div className="flex justify-between items-baseline">
                            <span className="text-xs font-bold text-slate-400">表示中の実績値</span>
                            <span className="text-2xl font-black tracking-tight text-white">{Math.round(dispAct).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between items-baseline">
                            <span className="text-xs font-bold text-slate-400">計画値 ({m.forecastType})</span>
                            <span className="text-xl font-bold tracking-tight text-slate-300">{Math.round(dispFct).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between items-baseline border-t border-slate-800 pt-3">
                            <span className="text-xs font-black text-blue-400">達成率 (実績比)</span>
                            {/* 💥 ここが死んでいた％表示の戦犯！ガチで計算された数値を直撃割り当て！ */}
                            <span className={`text-3xl font-black tracking-tighter ${rawCalculatedRatio >= 100 ? (isCost ? 'text-rose-400' : 'text-emerald-400') : (isCost ? 'text-emerald-400' : 'text-rose-400')}`}>{rawCalculatedRatio.toFixed(1)}%</span>
                          </div>
                        </div>
                        <div className="text-[9px] text-slate-500 font-bold text-center uppercase tracking-wider">Executive Management DB</div>
                      </div>
                    )}
                  </div>

                  <div className={`p-5 rounded-3xl border text-[11px] font-medium flex items-start gap-4 shadow-sm ${evalData.color}`}><div className="p-2 bg-white rounded-xl shadow-sm shrink-0">{evalData.icon}</div><p>{evalData.comment}</p></div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* モーダルポップアップ */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-base font-black text-slate-900">【{tabs.find(t=>t.id===activeTab)?.label}】データの{editingIndex !== null ? '編集上書き' : '新規追加'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-900"><X size={18} /></button>
            </div>

            {activeTab === 'history' ? (
              <div className="space-y-4 text-xs font-bold text-slate-700">
                <div className="space-y-1"><label className="text-slate-400">1. 日端 *必須</label><input type="date" value={newItem.startDate} onChange={(e) => setNewItem({...newItem, startDate: e.target.value})} className="w-full bg-slate-50 border rounded-xl px-4 py-3 font-semibold text-slate-900" /></div>
                <div className="space-y-1"><label className="text-slate-400">2. 誰に *必須</label><input type="text" value={newItem.client} onChange={(e) => setNewItem({...newItem, client: e.target.value})} className="w-full bg-slate-50 border rounded-xl px-4 py-3 font-semibold text-slate-900" /></div>
                <div className="space-y-1"><label className="text-slate-400">3. 何を *必須</label><input type="text" value={newItem.proposal} onChange={(e) => setNewItem({...newItem, proposal: e.target.value})} className="w-full bg-slate-50 border rounded-xl px-4 py-3 font-semibold text-slate-900" /></div>
                <div className="space-y-1"><label className="text-slate-400">4. 内容詳細</label><textarea value={newItem.detail} onChange={(e) => setNewItem({...newItem, detail: e.target.value})} className="w-full bg-slate-50 border rounded-xl px-4 py-3 h-24 resize-none font-semibold text-slate-900" /></div>
                <div className="space-y-1">
                  <label className="text-slate-400">5. 商談結果</label>
                  <div className="grid grid-cols-3 gap-3">
                    {['●', '×', '△'].map(res => (
                      <button key={res} type="button" onClick={() => setNewItem({...newItem, result: res})} className={`py-2.5 rounded-xl font-black border transition-all ${newItem.result === res ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 text-slate-600'}`}>{res}</button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4 text-xs font-bold text-slate-700">
                <div className="space-y-1"><label className="text-slate-400">項目名 *必須</label><input type="text" value={newItem.name} onChange={(e) => setNewItem({...newItem, name: e.target.value})} className="w-full bg-slate-50 border rounded-xl px-4 py-3 font-semibold text-slate-900" /></div>
                <div className="space-y-1"><label className="text-slate-400">想定効果</label><textarea value={newItem.effect} onChange={(e) => setNewItem({...newItem, effect: e.target.value})} className="w-full bg-slate-50 border rounded-xl px-4 py-3 h-16 resize-none font-semibold text-slate-900" /></div>
                <div className="grid grid-cols-2 gap-4">
                  <input type="date" value={newItem.startDate} onChange={(e) => setNewItem({...newItem, startDate: e.target.value})} className="w-full bg-slate-50 border rounded-xl px-4 py-3 font-semibold text-slate-900" />
                  <input type="date" value={newItem.endDate} onChange={(e) => setNewItem({...newItem, endDate: e.target.value})} className="w-full bg-slate-50 border rounded-xl px-4 py-3 font-semibold text-slate-900" />
                </div>
                <div className="flex items-center gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100 cursor-pointer" onClick={() => setNewItem({...newItem, customerRelated: !newItem.customerRelated})}>
                  <input type="checkbox" checked={newItem.customerRelated} onChange={() => {}} className="accent-slate-900" />
                  <span className="text-xs text-slate-900 font-black">この施策は「顧客関連」に影響あり</span>
                </div>
                <div className="space-y-1 bg-slate-50 p-3 rounded-xl border">
                  <div className="flex justify-between font-black">
                    <label className="text-slate-400">進捗</label>
                    <span className="text-slate-900">{newItem.ratio}% {Number(newItem.ratio) === 100 ? '🎉 完了' : '🐾 実行中'}</span>
                  </div>
                  <input type="range" min="0" max="100" step="5" value={newItem.ratio} onChange={(e) => setNewItem({...newItem, ratio: Number(e.target.value)})} className="w-full accent-slate-900" />
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button onClick={() => setIsModalOpen(false)} className="flex-1 py-3 bg-slate-100 rounded-xl font-bold text-slate-700">キャンセル</button>
              <button onClick={handleSaveItem} className="flex-1 py-3 bg-slate-900 text-white rounded-xl font-black shadow-md">データを安全に保存</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}