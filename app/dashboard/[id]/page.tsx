// @ts-nocheck
'use client';
import React, { useEffect, useState } from 'react';
import { ArrowLeft, Activity, Calculator, TrendingUp, Calendar, Rocket, Leaf, MessageSquare, Clock, Bot, ThumbsUp, AlertTriangle, CheckCircle2, ShieldAlert, Edit2, Plus, X, Building2, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Bar, Line, ComposedChart, Legend, PieChart, Pie, Cell } from 'recharts';

export default function DashboardPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = React.use(params);
  const rawId = unwrappedParams?.id || 'showa-reizo';
  const locationId = rawId.toLowerCase();

  const [isMounted, setIsMounted] = useState(false);
  const [data, setData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('logistics');
  const [displayMode, setDisplayMode] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [selectedWeek, setSelectedWeek] = useState<number>(0);
  const [globalSelectedMonth, setGlobalSelectedMonth] = useState<string>('');

  const [dxItems, setDxItems] = useState<any[]>([]);
  const [envItems, setEnvItems] = useState<any[]>([]);
  const [historyItems, setHistoryItems] = useState<any[]>([]); 
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

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

  const supabaseRequest = async (table: string, method: string, body?: any) => {
    try {
      const url = `https://ukhcalayaazwmufewsks.supabase.co/rest/v1/${table}`;
      const token = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVraGNhbGF5YWF6d211ZmV3c2tzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxMDc5MTUsImV4cCI6MjA5NDY4MzkxNX0.I5A3_xeDUcBJvRogo_pYVa45_vJ_qL8Fur1qbuu3j4c`;
      
      const headers: any = {
        'apikey': token,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      };

      if (method === 'GET') {
        // 🚀 読み込み時も「ロケーションID」でフィルター
        const res = await fetch(`${url}?%E3%83%AD%E3%82%B1%E3%83%BC%E3%82%B7%E3%83%A7%E3%83%B3ID=eq.${locationId}&order=id.asc`, { method: 'GET', headers, cache: 'no-store' });
        if (!res.ok) throw new Error(`GET ${res.status}`);
        return await res.json();
      } else if (method === 'POST') {
        const res = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body) });
        if (!res.ok) throw new Error(`POST ${res.status}`);
        return await res.json();
      } else if (method === 'PATCH') {
        const res = await fetch(`${url}?id=eq.${body.id}`, { method: 'PATCH', headers, body: JSON.stringify(body) });
        if (!res.ok) throw new Error(`PATCH ${res.status}`);
        return await res.json();
      } else if (method === 'DELETE') {
        const res = await fetch(`${url}?id=eq.${body.id}`, { method: 'DELETE', headers });
        if (!res.ok) throw new Error(`DELETE ${res.status}`);
        return true;
      }
    } catch (e) {
      console.error("Supabase Operation Error:", e);
    }
    return null;
  };

  const fetchSupabaseData = async () => {
    if (!locationId) return;
    const [dxData, envData, historyData] = await Promise.all([
      supabaseRequest('dx_actions', 'GET'),
      supabaseRequest('env_actions', 'GET'),
      supabaseRequest('sales_history', 'GET')
    ]);
    if (dxData) setDxItems(dxData);
    if (envData) setEnvItems(envData);
    if (historyData) setHistoryItems(historyData);
  };

  const n = (val: any) => {
    if (val === undefined || val === null || val === "") return 0;
    return parseFloat(val.toString().replace(/[^0-9.-]/g, '')) || 0;
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

  useEffect(() => {
    setIsMounted(true);
    fetchSupabaseData();

    const gasUrl = "https://script.google.com/macros/s/AKfycbyosyzeCglI2Pz2GWh_dbZXAgDslEV5DZrws5ulw24GrkI-fShocaWUdOLMfaNh_m0_/exec";
    fetch(gasUrl).then(res => res.json()).then(json => {
      setData(json);
      if (json && json.labels && json.labels.length > 0) {
        const months = getAvailableMonths(json.labels);
        const today = new Date();
        const currentMonth = (today.getMonth() + 1).toString();
        if (months.includes(currentMonth)) {
          setGlobalSelectedMonth(currentMonth);
        } else {
          setGlobalSelectedMonth(months[0]);
        }
      }
    });
  }, [locationId]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    if (tabId === 'monthly') {
      setDisplayMode('monthly');
    } else if (!['dx', 'env', 'history', 'manhours'].includes(tabId) && displayMode === 'monthly') {
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
        startDate: item['開始日'] || item.date || '',
        client: item['名前'] || item.client || '', 
        proposal: item['効果'] || item.proposal || '', 
        detail: item['終了日'] || item.detail || '', 
        result: item['顧客関連'] || item.result || '●'
      });
    } else {
      const targetList = activeTab === 'dx' ? dxItems : envItems;
      const item = targetList[index];
      setNewItem({
        name: item['名前'] || item.name || '', 
        effect: item['効果'] === '未入力' ? '' : (item['効果'] || item.effect || ''),
        startDate: item['開始日'] ? item['開始日'].replace(/\//g, '-') : '',
        endDate: item['終了日'] ? item['終了日'].replace(/\//g, '-') : '',
        customerRelated: item['顧客関連'] === 'あり', 
        ratio: n(item['比率'] || item.ratio)
      });
    }
    setIsModalOpen(true);
  };

  // 🚀 【大逆転修正】Supabase側の日本語のカラム名（列名）に100%完全に一致するようにデータを整形して送信
  const handleSaveItem = async () => {
    if (activeTab === 'history') {
      if (!newItem.client || !newItem.proposal) return;
      const payload = {
        'ロケーションID': locationId,
        '開始日': newItem.startDate ? newItem.startDate.replace(/-/g, '/') : '',
        '名前': newItem.client, 
        '効果': newItem.proposal, 
        '終了日': newItem.detail || '', 
        '顧客関連': newItem.result
      };
      if (editingIndex !== null) {
        payload.id = historyItems[editingIndex].id;
        await supabaseRequest('sales_history', 'PATCH', payload);
      } else {
        await supabaseRequest('sales_history', 'POST', payload);
      }
    } else {
      if (!newItem.name) return;
      const payload = {
        'ロケーションID': locationId,
        '名前': newItem.name, 
        '効果': newItem.effect || '未入力',
        '開始日': newItem.startDate ? newItem.startDate.replace(/-/g, '/') : '',
        '終了日': newItem.endDate ? newItem.endDate.replace(/-/g, '/') : '',
        '顧客関連': newItem.customerRelated ? 'あり' : 'なし', 
        '比率': Number(newItem.ratio)
      };
      const targetTable = activeTab === 'dx' ? 'dx_actions' : 'env_actions';
      if (editingIndex !== null) {
        const targetList = activeTab === 'dx' ? dxItems : envItems;
        payload.id = targetList[editingIndex].id;
        await supabaseRequest(targetTable, 'PATCH', payload);
      } else {
        await supabaseRequest(targetTable, 'POST', payload);
      }
    }
    await fetchSupabaseData(); 
    setIsModalOpen(false);
  };

  const handleDeleteItem = async (indexToDelete: number) => {
    if (activeTab === 'history') {
      await supabaseRequest('sales_history', 'DELETE', { id: historyItems[indexToDelete].id });
    } else if (activeTab === 'dx') {
      await supabaseRequest('dx_actions', 'DELETE', { id: dxItems[indexToDelete].id });
    } else {
      await supabaseRequest('env_actions', 'DELETE', { id: envItems[indexToDelete].id });
    }
    await fetchSupabaseData(); 
  };

  if (!data || !isMounted) return <div className="h-screen bg-slate-950 flex items-center justify-center text-blue-400 font-mono animate-pulse uppercase tracking-[0.4em]">SYNCING_MANAGEMENT_BRAIN...</div>;

  const currentTab = tabs.find(t => t.id === activeTab) || tabs[1];
  const lowIsBetterMetrics = ["労務費", "タイミー", "外注費", "社会保険", "雇用保険", "有給", "交通費", "工数"];
  const totalMetricsKeywords = ["売上", "原価", "費", "工数", "物量", "タイミー", "有給", "交通費"];

  const baseLabels = data.labels || ["4/1", "4/2"];
  const availableMonths = getAvailableMonths(baseLabels);
  const currentMonthIndices = baseLabels.map((l, idx) => (typeof l === 'string' && l.split('/')[0] === globalSelectedMonth) ? idx : -1).filter(idx => idx !== -1);

  const weeklyGroups = (() => {
    const groups: { weekNum: number; label: string; indices: number[] }[] = [];
    if (!currentMonthIndices || currentMonthIndices.length === 0) return groups;
    let currentWeekIndices: number[] = [];
    let weekCount = 1;
    let startLabel = baseLabels[currentWeekIndices[0]];

    currentMonthIndices.forEach((idx) => {
      const label = baseLabels[idx];
      if (!label || typeof label !== 'string' || !label.includes('/')) {
        currentWeekIndices.push(idx); return;
      }
      const parts = label.split('/');
      const date = new Date(2026, parseInt(parts[0], 10) - 1, parseInt(parts[1], 10));
      if (date.getDay() === 0 && currentWeekIndices.length > 0) {
        groups.push({ weekNum: weekCount, label: `${globalSelectedMonth}月度 ${weekCount}週目 (${startLabel} ～ ${baseLabels[idx - 1]})`, indices: currentWeekIndices });
        weekCount++; startLabel = label; currentWeekIndices = [];
      }
      currentWeekIndices.push(idx);
    });
    if (currentWeekIndices.length > 0) {
      groups.push({ weekNum: weekCount, label: `${weekCount}週目 (${startLabel} ～ ${currentMonthIndices[currentMonthIndices.length - 1]})`, indices: currentWeekIndices });
    }
    return groups;
  })();

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
        combinedMap.set(cleanTitle, { title: cleanTitle, labels: item.labels || baseLabels, actual: item.values, forecast: new Array(baseLabels.length).fill(0), forecastType: '予測' });
      }
      const entry = combinedMap.get(cleanTitle);
      if (normalizedTitle.includes('実績')) { entry.actual = item.values; } else {
        entry.forecast = item.values;
        const detectedType = normalizedTitle.split('_')[0];
        if (detectedType && detectedType !== normalizedTitle) { entry.forecastType = detectedType; } 
        else if (normalizedTitle.includes('予算')) { entry.forecastType = '予算'; } 
        else if (normalizedTitle.includes('目標')) { entry.forecastType = '目標'; } 
        else { entry.forecastType = '予測'; }
      }
    });
    return Array.from(combinedMap.values());
  };

  const allMetrics = getCombinedMetrics();

  const getAiCorporateEvaluation = (title, actual, forecast, mode, isTotal, currentRatio, rawForecastArray) => {
    const isLowBetter = lowIsBetterMetrics.some(keyword => title.includes(keyword));
    const ratio = currentRatio;
    let modeText = mode === 'daily' ? '今日までの累計進捗' : (mode === 'weekly' ? `当週${isTotal ? '合計' : '平均'}` : `当月${isTotal ? '合計' : '平均'}`);
    const totalMonthForecast = currentMonthIndices.reduce((sum, idx) => sum + n(rawForecastArray[idx]), 0);
    const projectedEndResult = totalMonthForecast * (ratio / 100);
    const deviationAmount = Math.abs(projectedEndResult - totalMonthForecast);
    const formatVal = (val) => title.includes("%") || title.includes("率") ? `${val.toFixed(1)}%` : `¥${Math.round(val).toLocaleString()}`;
    let status = 'STABLE', color = 'text-slate-700 bg-slate-50 border-slate-200', icon = <Bot size={14} className="text-slate-600" />, comment = "";
    if (isLowBetter) {
      if (ratio <= 92) {
        status = 'EXCELLENT'; color = 'text-emerald-700 bg-emerald-50 border-emerald-200'; icon = <CheckCircle2 size={14} className="text-emerald-600" />;
        comment = `【経営予測：利益上振れ】『${title}』は${modeText}で予算比${ratio.toFixed(1)}%と大幅なコスト抑制に成功。この推移を維持して着地できれば、当月末の総執行は予測枠より【${formatVal(deviationAmount)}】削減され、営業利益率の直接的な押し上げ要因となります。`;
      } else if (ratio > 103) {
        status = 'WARNING'; color = 'text-rose-700 bg-rose-50 border-rose-200'; icon = <ShieldAlert size={14} className="text-rose-600" />;
        comment = `【経営予測：緊急コスト警告】『${title}』が計画比${(ratio - 100).toFixed(1)}%超過。この推移のまま月末を迎えると、最終着地が計画を【${formatVal(deviationAmount)}】オーバーし、今期の限界利益を著しく圧迫する試算となります。`;
      } else {
        comment = `【経営予測：予算内着地想定】『${title}』は${modeText}執行率${ratio.toFixed(1)}%と適正。このペースであれば月末の総執行も計画枠内（着地想定: ${formatVal(projectedEndResult)}）に収まるシミュレーション結果です。`;
      }
    } else {
      if (ratio >= 105) {
        status = 'EXCELLENT'; color = 'text-emerald-700 bg-emerald-50 border-emerald-200'; icon = <ThumbsUp size={14} className="text-emerald-600" />;
        comment = `【経営予測：収益ポテンシャル拡大】『${title}高』は${modeText}目標比${ratio.toFixed(1)}%の躍近。この推移を維持して着地できれば、当月末の最終売上高は目標値を【${formatVal(deviationAmount)}】上振れ突破し、過去最高の限界利益を叩き出す見込みです。`;
      } else if (ratio < 95) {
        status = 'WARNING'; color = 'text-rose-700 bg-rose-50 border-rose-200'; icon = <AlertTriangle size={14} className="text-rose-600" />;
        comment = `【経営予測：致命的失速アラート】『${title}』が計画の${ratio.toFixed(1)}%に留まり急ブレーキ。この推移のまま月末を通過すると、当月最終売上が予算比で【${formatVal(deviationAmount)}】も致命的に下振れ失速する業績リスクが試算されます。`;
      } else {
        comment = `【経営予測：計画達成維持】『${title}』は${modeText}達成率${ratio.toFixed(1)}%と手堅く推移。このペースを維持すれば月末の総着地は ${formatVal(projectedEndResult)} となり、経営計画通りの順調な利益水準を確保できるシミュレーションです。`;
      }
    }
    return { status, color, icon, comment, ratio: ratio.toFixed(1) };
  };

  const generateStackedManhoursData = () => {
    const logisticsItems = data["logisticsData"] || [];
    const colV_Total = logisticsItems.find(item => item && item.title && (item.title === "総工数" || item.title === "実績_総工数"));
    const colM_Lycos = logisticsItems.find(item => item && item.title && (item.title === "リコス工数" || item.title === "実績_リコス工数"));
    const colO_Ice = logisticsItems.find(item => item && item.title && (item.title === "リコスアイス工数" || item.title === "実績_リコスアイス工数"));
    const colQ_Bronco = logisticsItems.find(item => item && item.title && (item.title === "ブロンコビリー工数" || item.title === "実績_ブロンコビリー工数"));
    const colS_Genuse = logisticsItems.find(item => item && item.title && (item.title === "汎用工数" || item.title === "実績_汎用工数"));
    const colU_Ikkatsu = logisticsItems.find(item => item && item.title && (item.title === "一括工数" || item.title === "実績_一括工数"));
    return currentMonthIndices.map(idx => {
      const label = baseLabels[idx];
      const totalH = colV_Total && colV_Total.values ? n(colV_Total.values[idx]) : 0;
      const lycosH = colM_Lycos && colM_Lycos.values ? n(colM_Lycos.values[idx]) : 0;
      const iceH = colO_Ice && colO_Ice.values ? n(colO_Ice.values[idx]) : 0;
      const broncoH = colQ_Bronco && colQ_Bronco.values ? n(colQ_Bronco.values[idx]) : 0;
      const genuseH = colS_Genuse && colS_Genuse.values ? n(colS_Genuse.values[idx]) : 0;
      const ikkatsuH = colU_Ikkatsu && colU_Ikkatsu.values ? n(colU_Ikkatsu.values[idx]) : 0;
      const directSum = lycosH + iceH + broncoH + genuseH + ikkatsuH;
      return { name: label, 'リコス': Math.round(lycosH), 'リコスアイス': Math.round(iceH), 'ブロンコビリー': Math.round(broncoH), '汎用': Math.round(genuseH), '一括': Math.round(ikkatsuH), '間接工数': Math.round(Math.max(0, totalH - directSum)) };
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
          <div className="relative flex items-center group">
            <Calendar size={14} className="absolute left-3 text-slate-400 pointer-events-none group-hover:text-blue-500 transition-colors" />
            <select 
              value={globalSelectedMonth}
              onChange={(e) => { setGlobalSelectedMonth(e.target.value); setSelectedWeek(0); }}
              className="appearance-none bg-slate-100 border border-slate-200 text-slate-700 text-[10px] font-black pl-9 pr-8 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all cursor-pointer hover:border-slate-300"
            >
              {availableMonths.map((m, idx) => (
                <option key={idx} value={m}>{m}月度を表示</option>
              ))}
            </select>
            <ChevronDown size={12} className="absolute right-3 text-slate-400 pointer-events-none" />
          </div>
          {['dx', 'env', 'history'].includes(activeTab) && (
            <button onClick={handleOpenAddModal} className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black tracking-wider transition-all shadow-md transform hover:scale-[1.02]"><Plus size={14} /> 新規追加</button>
          )}
          <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 gap-1">
            <button disabled={['monthly', 'dx', 'env', 'history', 'manhours'].includes(activeTab)} onClick={() => setDisplayMode('daily')} className={`px-4 py-1.5 rounded-xl text-[10px] font-black transition-all ${displayMode === 'daily' && !['dx', 'env', 'history', 'manhours'].includes(activeTab) ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 disabled:opacity-30'}`}>日次</button>
            <button disabled={['monthly', 'dx', 'env', 'history', 'manhours'].includes(activeTab)} onClick={() => setDisplayMode('weekly')} className={`px-4 py-1.5 rounded-xl text-[10px] font-black transition-all ${displayMode === 'weekly' && !['dx', 'env', 'history', 'manhours'].includes(activeTab) ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}>週次</button>
            <button disabled={activeTab !== 'monthly'} className={`px-4 py-1.5 rounded-xl text-[10px] font-black transition-all ${displayMode === 'monthly' ? 'bg-amber-500 text-white shadow-sm' : 'hidden'}`}>月次確定</button>
          </div>
        </div>
      </header>
      <main className="p-10 max-w-[1800px] mx-auto space-y-8">
        <div className="flex flex-wrap gap-2.5">
          {tabs.map((t) => (
            <button key={t.id} onClick={() => handleTabChange(t.id)} className={`px-6 py-3 rounded-2xl transition-all font-black text-xs ${activeTab === t.id ? `bg-slate-900 text-white shadow-lg` : 'bg-white border text-slate-500 hover:bg-slate-50'}`}>{t.label}</button>
          ))}
        </div>
        {displayMode === 'weekly' && !['dx', 'env', 'history', 'manhours'].includes(activeTab) && (
          <div className="bg-white border border-slate-200 p-4 rounded-3xl shadow-sm flex flex-wrap gap-2 items-center">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider mr-2 ml-1">月の週選択:</span>
            {weeklyGroups.map((g, idx) => (
              <button key={idx} onClick={() => setSelectedWeek(idx)} className={`px-5 py-2.5 rounded-xl font-black text-xs transition-all ${selectedWeek === idx ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}>{g.label}</button>
            ))}
          </div>
        )}
        {['dx', 'env'].includes(activeTab) && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {(() => {
              const currentItems = activeTab === 'dx' ? dxItems : envItems;
              if (currentItems.length === 0) return <div className="col-span-2 bg-white border p-12 rounded-[2.5rem] text-center text-slate-400 font-bold text-sm">💡 右上の「新規追加」ボタンから項目を入力・保存してください！</div>;
              return currentItems.map((item, index) => {
                const itemRatio = Math.min(100, Math.max(0, Math.round(n(item['比率'] || item.ratio))));
                const chartPieData = [{ name: '完了', value: itemRatio }, { name: '未完了', value: 100 - itemRatio }];
                const themeColor = currentTab.color;
                return (
                  <div key={index} className={`bg-white border p-8 rounded-[2.5rem] shadow-md flex flex-col md:flex-row gap-6 items-center transition-all relative overflow-hidden ${item['顧客関連'] === 'あり' || item.customer_related === 'あり' ? 'border-rose-200 bg-rose-50/10' : 'border-slate-200'}`}>
                    {(item['顧客関連'] === 'あり' || item.customer_related === 'あり') && <div className="absolute top-0 right-0 bg-rose-600 text-white px-4 py-1 text-[9px] font-black tracking-widest uppercase rounded-bl-2xl">🚨 顧客関連</div>}
                    <div className="absolute bottom-4 right-4 flex gap-3 text-[10px] font-black tracking-wider uppercase">
                      <button onClick={() => handleOpenEditModal(index)} className="text-slate-400 hover:text-slate-900 flex items-center gap-1 transition-all"><Edit2 size={11} /> 編集</button>
                      <button onClick={() => { if(confirm("削除しますか？")) handleDeleteItem(index); }} className="text-slate-300 hover:text-rose-500">削除</button>
                    </div>
                    <div className="w-[160px] h-[160px] relative shrink-0">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={chartPieData} cx="50%" cy="50%" innerRadius={52} outerRadius={70} startAngle={90} endAngle={-270} dataKey="value">
                            <Cell fill={themeColor} />
                            <Cell fill={item['顧客関連'] === 'あり' || item.customer_related === 'あり' ? "#ffe4e6" : "#f1f5f9"} />
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl font-black tracking-tighter" style={{ color: themeColor }}>{itemRatio}%</span>
                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{itemRatio === 100 ? '完了' : '進捗率'}</span>
                      </div>
                    </div>
                    <div className="flex-1 space-y-4 w-full pb-3 md:pb-0">
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[9px] font-black px-2 py-0.5 rounded-md text-white" style={{ backgroundColor: themeColor }}>施策 {index + 1}</span>
                          {(item['開始日'] || item.start_date) && <span className="text-[9px] font-mono font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">📅 {item['開始日'] || item.start_date} ～ {item['終了日'] || item.end_date || '未定'}</span>}
                        </div>
                        <h3 className="text-base font-black text-slate-900 tracking-tight pt-1 leading-snug">{item['名前'] || item.name}</h3>
                      </div>
                      {(item['効果'] || item.effect) && (item['効果'] !== "未入力" && item.effect !== "未入力") && <div className="text-[11px] font-medium text-slate-600 bg-slate-50 border p-3 rounded-xl"><span className="text-amber-500 font-black">💡 狙う効果:</span> {item['効果'] || item.effect}</div>}
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${itemRatio}%`, backgroundColor: themeColor }}></div>
                      </div>
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        )}
        {activeTab === 'history' && (
          <div className="bg-white border border-slate-200 p-10 rounded-[2.5rem] shadow-md space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-lg font-black text-slate-900 tracking-tighter flex items-center gap-2"><MessageSquare className="text-rose-600" size={20} /> 営業アプローチタイムライン</h2>
            </div>
            <div className="relative border-l-2 border-slate-100 pl-6 ml-4 space-y-8 py-2">
              {historyItems.length === 0 ? (
                <div className="text-slate-400 text-xs font-bold pl-2 py-4">💡 右上の「新規追加」ボタンから、商談ログを刻んでね！</div>
              ) : (
                historyItems.map((log, index) => (
                  <div key={index} className="relative group">
                    <div className="absolute -left-[35px] top-0 bg-white border-2 border-rose-500 p-1.5 rounded-full text-rose-500"><Building2 size={12} /></div>
                    <div className="bg-slate-50 border border-slate-100 p-6 rounded-3xl space-y-3 relative">
                      <div className="absolute top-4 right-6 flex gap-3 text-[10px] font-black tracking-wider uppercase">
                        <button onClick={() => handleOpenEditModal(index)} className="text-slate-400 hover:text-slate-900 flex items-center gap-1 transition-all"><Edit2 size={11} /> 編集</button>
                        <button onClick={() => { if(confirm("消去しますか？")) handleDeleteItem(index); }} className="text-slate-300 hover:text-rose-500">削除</button>
                      </div>
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="text-xs bg-slate-900 text-white px-2.5 py-0.5 rounded-lg font-mono font-black">{log['開始日'] || log.date || '日付未設定'}</span>
                        <h4 className="text-base font-black text-slate-900 tracking-tight">{log['名前'] || log.client}</h4>
                        <span className={`text-[11px] font-black px-3 py-0.5 rounded-full border ${log['顧客関連'] === '●' || log.result === '●' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>結果: {log['顧客関連'] || log.result}</span>
                      </div>
                      {(log['効果'] || log.proposal) && <div className="text-xs font-black text-slate-800 bg-white border px-3 py-1.5 rounded-xl w-fit"><span className="text-rose-500 font-extrabold">💡 提案内容:</span> {log['効果'] || log.proposal}</div>}
                      {(log['終了日'] || log.detail) && <p className="text-[12px] font-medium text-slate-600 leading-relaxed whitespace-pre-wrap">{log['終了日'] || log.detail}</p>}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
        {activeTab === 'manhours' && (
          <div className="bg-white border border-slate-200 p-8 rounded-[2.5rem] shadow-md space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-lg font-black text-slate-900 tracking-tighter flex items-center gap-2"><Clock className="text-slate-600" size={20} /> 現場別投下工数実績内訳スタック分析</h2>
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
                  <Bar name="間接工数" dataKey="間接工数" stackId="reizoManpower" fill="#94a3b8" radius={[8, 8, 0, 0]} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </main>

      {/* 新規追加・編集モーダル */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl space-y-6">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-base font-black text-slate-900">【{tabs.find(t=>t.id===activeTab)?.label}】データの{editingIndex !== null ? '編集上書き' : '新規追加'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-900"><X size={18} /></button>
            </div>
            {activeTab === 'history' ? (
              <div className="space-y-4 text-xs font-bold text-slate-700">
                <div className="space-y-1"><label className="text-slate-400">1. 日付 *必須</label><input type="date" value={newItem.startDate} onChange={(e) => setNewItem({...newItem, startDate: e.target.value})} className="w-full bg-slate-50 border rounded-xl px-4 py-3 font-semibold text-slate-900" /></div>
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
                    <span className="text-slate-900">{newItem.ratio}%</span>
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