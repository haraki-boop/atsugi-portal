// @ts-nocheck
'use client';
import React, { useEffect, useState } from 'react';
import { ArrowLeft, Activity, Calculator, TrendingUp, Calendar, Rocket, Leaf, MessageSquare, Clock, Bot, ThumbsUp, ThumbsDown, Plus, X, Building2, ChevronDown, ShieldAlert as AccidentIcon, Zap, AlertTriangle, CheckCircle2, ShieldAlert, Edit2 } from 'lucide-react';
import Link from 'next/link';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell, AreaChart, Area, ComposedChart, Bar } from 'recharts';

const AnimatedNumber = ({ value }: { value: number }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (value === 0) { setCount(0); return; }
    let start = 0; const duration = 1200; const interval = 16;
    const step = value / (duration / interval);
    const timer = setInterval(() => {
      start += step;
      if (start >= value) { setCount(value); clearInterval(timer); } 
      else { setCount(Math.floor(start)); }
    }, interval);
    return () => clearInterval(timer);
  }, [value]);
  return <>{count.toLocaleString(undefined, { maximumFractionDigits: 1 })}</>;
};

export default function AfsMinamikantoDashboardPage() {
  const locationId = 'afs-minamikanto';
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
    name: '', effect: '', startDate: '', endDate: '', customerRelated: false, ratio: 0, client: '', proposal: '', detail: '', result: '●'
  });

  const tabs = [
    { id: 'sales', label: '1. 売上・原価', icon: Calculator, color: '#2563eb' },
    { id: 'logistics', label: '2. 物量・工数', icon: Activity, color: '#059669' },
    { id: 'productivity', label: '3. 生産性', icon: TrendingUp, color: '#d97706' },
    { id: 'monthly', label: '4. 月次', icon: Calendar, color: '#ca8a04' },
    { id: 'dx', label: '5. DX推進', icon: Rocket, color: '#7c3aed' },
    { id: 'env', label: '6. 現場改善', icon: Leaf, color: '#10b981' }, 
    { id: 'history', label: '7. 営業履歴', icon: MessageSquare, color: '#e11d48' },
    { id: 'accidents', label: '8. 事故', icon: AccidentIcon, color: '#f59e0b' },
    { id: 'manhours', label: '9. 工数分析', icon: Clock, color: '#475569' },
  ];

  const supabaseRequest = async (table: string, method: string, body?: any) => {
    try {
      const url = `https://ukhcalayaazwmufewsks.supabase.co/rest/v1/${table}`;
      const token = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVraGNhbGF5YWF6d211ZmV3c2tzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxMDc5MTUsImV4cCI6MjA5NDY4MzkxNX0.I5A3_xeDUcBJvRogo_pYVa45_vJ_qL8Fur1qbuu3j4c`;
      const headers: any = { 'apikey': token, 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json', 'Prefer': 'return=representation' };
      if (method === 'GET') {
        const res = await fetch(`${url}?location_id=eq.${locationId}&order=id.asc`, { method: 'GET', headers, cache: 'no-store' });
        if (!res.ok) throw new Error(`GET ${res.status}`); return await res.json();
      } else if (method === 'POST') {
        const res = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body) });
        if (!res.ok) throw new Error(`POST ${res.status}`); return await res.json();
      } else if (method === 'PATCH') {
        const targetId = String(body.id); const { id, ...cleanBody } = body; 
        const res = await fetch(`${url}?id=eq.${targetId}`, { method: 'PATCH', headers, body: JSON.stringify(cleanBody) });
        if (!res.ok) throw new Error(`PATCH ${res.status}`); return await res.json();
      } else if (method === 'DELETE') {
        const res = await fetch(`${url}?id=eq.${body.id}`, { method: 'DELETE', headers });
        if (!res.ok) throw new Error(`DELETE ${res.status}`); return true;
      }
    } catch (e) { console.error("Supabase Operation Error:", e); }
    return null;
  };

  const fetchSupabaseData = async () => {
    const [dxData, envData, historyData] = await Promise.all([
      supabaseRequest('dx_actions', 'GET'), supabaseRequest('env_actions', 'GET'), supabaseRequest('sales_history', 'GET')
    ]);
    if (dxData) setDxItems(dxData); if (envData) setEnvItems(envData); if (historyData) setHistoryItems(historyData);
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
    setIsMounted(true); fetchSupabaseData();
    const gasUrl = "https://script.google.com/macros/s/AKfycbyxsQ8srjM3gWc057pmopweW2vE78_-S9_E5_NS0omcvwvPGcJSObDJQPl41FqLjLVOxw/exec";
    fetch(gasUrl).then(res => res.json()).then(json => {
      setData(json);
      if (json && json.labels && json.labels.length > 0) {
        const months = getAvailableMonths(json.labels);
        const today = new Date(); const currentMonth = (today.getMonth() + 1).toString();
        if (months.includes(currentMonth)) setGlobalSelectedMonth(currentMonth);
        else setGlobalSelectedMonth(months[0]);
      }
    });
  }, []);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    if (tabId === 'monthly') setDisplayMode('monthly');
    else if (!['dx', 'env', 'history', 'accidents', 'manhours'].includes(tabId) && displayMode === 'monthly') setDisplayMode('daily');
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
      setNewItem({ startDate: item.date ? item.date.replace(/\//g, '-') : '', client: item.client || '', proposal: item.proposal || '', detail: item.detail || '', result: item.result || '●' });
    } else {
      const targetList = activeTab === 'dx' ? dxItems : envItems; const item = targetList[index];
      setNewItem({ name: item.name || '', effect: item.effect === '未入力' ? '' : (item.effect || ''), startDate: item.start_date ? item.start_date.replace(/\//g, '-') : '', endDate: item.end_date ? item.end_date.replace(/\//g, '-') : '', customerRelated: item.customer_related === 'あり', ratio: item.ratio || 0 });
    }
    setIsModalOpen(true);
  };

  const handleSaveItem = async () => {
    if (activeTab === 'history') {
      if (!newItem.client || !newItem.proposal) return;
      const payload = { location_id: locationId, date: newItem.startDate ? newItem.startDate.replace(/-/g, '/') : '', client: newItem.client, proposal: newItem.proposal, detail: newItem.detail || '', result: newItem.result };
      if (editingIndex !== null) { payload.id = historyItems[editingIndex].id; await supabaseRequest('sales_history', 'PATCH', payload); } 
      else { await supabaseRequest('sales_history', 'POST', payload); }
    } else {
      if (!newItem.name) return;
      const payload = { location_id: locationId, name: newItem.name, effect: newItem.effect || '未入力', start_date: newItem.startDate ? newItem.startDate.replace(/-/g, '/') : '', end_date: newItem.endDate ? newItem.endDate.replace(/-/g, '/') : '', customer_related: newItem.customerRelated ? 'あり' : 'なし', ratio: Number(newItem.ratio) };
      const targetTable = activeTab === 'dx' ? 'dx_actions' : 'env_actions';
      if (editingIndex !== null) {
        const targetList = activeTab === 'dx' ? dxItems : envItems; payload.id = targetList[editingIndex].id; await supabaseRequest(targetTable, 'PATCH', payload);
      } else { await supabaseRequest(targetTable, 'POST', payload); }
    }
    await fetchSupabaseData(); setIsModalOpen(false);
  };

  const handleDeleteItem = async (indexToDelete: number) => {
    if (activeTab === 'history') await supabaseRequest('sales_history', 'DELETE', { id: historyItems[indexToDelete].id });
    else if (activeTab === 'dx') await supabaseRequest('dx_actions', 'DELETE', { id: dxItems[indexToDelete].id });
    else await supabaseRequest('env_actions', 'DELETE', { id: envItems[indexToDelete].id });
    await fetchSupabaseData();
  };

  if (!data || !isMounted) return <div className="h-screen bg-slate-950 flex items-center justify-center text-blue-400 font-mono animate-pulse uppercase tracking-[0.4em]">SYNCING_MANAGEMENT_BRAIN...</div>;

  const currentTab = tabs.find(t => t.id === activeTab) || tabs[1];
  const lowIsBetterMetrics = ["労務費", "タイミー", "外注費", "社会保険", "雇用保険", "有給", "交通費", "工数", "事故", "償却"];
  const totalMetricsKeywords = ["売上", "原価", "費", "工数", "物量", "タイミー", "有給", "交通費", "事故", "数", "ケース", "パレット", "卸量", "トン"];

  const baseLabels = data.labels || [];
  const availableMonths = getAvailableMonths(baseLabels);
  const currentMonthIndices = baseLabels.map((l, idx) => (typeof l === 'string' && l.split('/')[0] === globalSelectedMonth) ? idx : -1).filter(idx => idx !== -1);

  const weeklyGroups = (() => {
    const groups: { weekNum: number; label: string; indices: number[] }[] = [];
    if (!currentMonthIndices || currentMonthIndices.length === 0) return groups;
    let currentWeekIndices: number[] = []; let weekCount = 1; let startLabel = baseLabels[currentMonthIndices[0]];
    currentMonthIndices.forEach((idx) => {
      const label = baseLabels[idx];
      if (!label || typeof label !== 'string' || !label.includes('/')) { currentWeekIndices.push(idx); return; }
      const parts = label.split('/'); const date = new Date(2026, parseInt(parts[0], 10) - 1, parseInt(parts[1], 10));
      if (date.getDay() === 0 && currentWeekIndices.length > 0) {
        groups.push({ weekNum: weekCount, label: `${globalSelectedMonth}月度 ${weekCount}週目 (${startLabel} ～ ${baseLabels[idx - 1]})`, indices: currentWeekIndices });
        weekCount++; startLabel = label; currentWeekIndices = [];
      }
      currentWeekIndices.push(idx);
    });
    if (currentWeekIndices.length > 0) {
      groups.push({ weekNum: weekCount, label: `${weekCount}週目 (${startLabel} ～ ${baseLabels[currentMonthIndices[currentMonthIndices.length - 1]]})`, indices: currentWeekIndices });
    }
    return groups;
  })();

  const getCombinedMetrics = () => {
    const targetTabId = activeTab === 'monthly' ? 'sales' : (activeTab === 'accidents' ? 'logistics' : currentTab.id);
    let allItems = data[`${targetTabId}Data`] || [];
    if (activeTab === 'monthly' && data.monthlyData) allItems = [...allItems, ...data.monthlyData];

    const combinedMap = new Map();
    allItems.forEach(item => {
      if (!item || !item.title || !item.values || !Array.isArray(item.values)) return;
      const normalizedTitle = item.title.replace('＿', '_');
      let cleanTitle = normalizedTitle.replace('実績_', '').replace('予測_', '').replace('予算_', '').replace('目標_', '').replace('実績', '').replace('予測', '').replace('予算', '').replace('目標', '');
      if (item.title.includes('社会保険')) cleanTitle = '社会保険';
      
      const isMonthlyFixed = item.labels && item.labels.length > 0 && !item.labels[0].toString().includes('/');

      if (!combinedMap.has(cleanTitle)) {
        combinedMap.set(cleanTitle, { title: cleanTitle, labels: item.labels || baseLabels, actual: new Array(baseLabels.length).fill(0), forecast: new Array(baseLabels.length).fill(0), forecastType: '予測' });
      }
      const entry = combinedMap.get(cleanTitle);

      if (normalizedTitle.includes('実績') || isMonthlyFixed) { 
        entry.actual = item.values; 
      } 
      if (!normalizedTitle.includes('実績') && !isMonthlyFixed) {
        entry.forecast = item.values;
        const detectedType = normalizedTitle.split('_')[0];
        if (detectedType && detectedType !== normalizedTitle) { entry.forecastType = detectedType; } 
        else if (normalizedTitle.includes('予算')) { entry.forecastType = '予算'; } 
        else if (normalizedTitle.includes('目標')) { entry.forecastType = '目標'; } 
        else { entry.forecastType = '予測'; }
      }
    });

    let result = Array.from(combinedMap.values());
    if (displayMode === 'daily' || displayMode === 'weekly') {
      const hiddenKeywords = ["本部費", "償却費", "社会保険", "雇用保険", "交通費", "有給"];
      result = result.filter(m => !hiddenKeywords.some(k => m.title.includes(k)));
    }
    return result;
  };

  const allMetrics = getCombinedMetrics();

  const accidentCategories = (() => {
    const rawRecords = data?.accidentData || [];
    const absoluteLastDateMap = {}; const catMap = {};
    const allCategoryNames = Array.from(new Set(rawRecords.map(r => r.category))).filter(Boolean);

    rawRecords.forEach(row => {
      const name = row.category;
      if (row.date) {
        const rowDate = new Date(row.date);
        if (!isNaN(rowDate.getTime())) {
          if (!absoluteLastDateMap[name] || rowDate > new Date(absoluteLastDateMap[name])) { absoluteLastDateMap[name] = row.date; }
        }
      }
      if (row.date) {
        const parts = row.date.split('/'); 
        if (parts.length >= 2) {
          const monthNum = parseInt(parts[1], 10).toString(); 
          if (monthNum === globalSelectedMonth) {
            if (!catMap[name]) catMap[name] = { chaseOn: 0, chaseOff: 0, total: 0 };
            catMap[name].chaseOn += n(row.chaseOn); catMap[name].chaseOff += n(row.chaseOff); catMap[name].total += n(row.total);
          }
        }
      }
    });

    const result = allCategoryNames.map(name => {
      return { name: name, chaseOn: catMap[name]?.chaseOn || 0, chaseOff: catMap[name]?.chaseOff || 0, total: catMap[name]?.total || 0, lastDate: absoluteLastDateMap[name] || '履歴なし' };
    });
    if (result.length === 0) return [{ name: "総合（全カテゴリ）", lastDate: "未取得", chaseOn: 0, chaseOff: 0, total: 0 }];
    return result;
  })();

  const getLevelStyles = (count) => {
    if (count >= 3) return { cardBorder: 'border-rose-100', bg: 'bg-rose-50', text: 'text-rose-600', meterBorder: 'border-rose-400', icon: <ShieldAlert className="text-rose-500" size={22} /> };
    if (count === 2) return { cardBorder: 'border-amber-100', bg: 'bg-amber-50', text: 'text-amber-600', meterBorder: 'border-amber-400', icon: <AlertTriangle className="text-amber-500" size={22} /> };
    return { cardBorder: 'border-blue-100', bg: 'bg-blue-50', text: 'text-blue-600', meterBorder: 'border-blue-400', icon: <CheckCircle2 className="text-blue-500" size={22} /> };
  };

  const calculateDaysSince = (dateStr) => {
    if (!dateStr || dateStr === "未取得" || dateStr === "履歴なし" || dateStr === "データなし") return 0;
    const last = new Date(dateStr); if (isNaN(last.getTime())) return 0;
    const today = new Date(); const diffTime = Math.abs(today.getTime() - last.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getAiCorporateEvaluation = (title, actual, forecast, mode, isTotal, currentRatio, rawForecastArray) => {
    const isLowBetter = lowIsBetterMetrics.some(keyword => title.includes(keyword));
    const ratio = currentRatio;
    let modeText = mode === 'daily' ? '今日までの累計進捗' : (mode === 'weekly' ? `当週${isTotal ? '合計' : '平均'}` : `当月${isTotal ? '合計' : '平均'}`);
    const totalMonthForecast = currentMonthIndices.reduce((sum, idx) => sum + n(rawForecastArray[idx]), 0);
    const projectedEndResult = totalMonthForecast * (ratio / 100);
    const deviationAmount = Math.abs(projectedEndResult - totalMonthForecast);
    
    const formatVal = (val) => {
      if (title.includes("%") || title.includes("率")) return `${val.toFixed(1)}%`;
      if (title.includes("生産性") || /時給|最低賃金|人数|在籍者|違反者/.test(title)) return Number(val.toFixed(1)).toLocaleString();
      if (/売上|原価|費|利益|金額/.test(title)) return `¥${Math.round(val).toLocaleString()}`;
      return Math.round(val).toLocaleString();
    };
    
    let color = 'text-slate-700 bg-slate-50 border-slate-200'; let icon = <Bot size={18} className="text-slate-500" />;
    let comment = ""; let shortComment = "";

    if (isLowBetter) {
      if (ratio < 99) {
        color = 'text-emerald-700 bg-emerald-50 border-emerald-200'; icon = <ThumbsUp size={18} className="text-emerald-600" />;
        comment = `【経営予測：利益上振れ】『${title}』は見事なコスト抑制に成功しています。この驚異的な推移を維持して着地できれば、当月末枠よりも【${formatVal(deviationAmount)}】削減され、営業利益率を直接的に押し上げる強力な要因となります。`; 
      } else if (ratio > 101) {
        color = 'text-rose-700 bg-rose-50 border-rose-200'; icon = <ThumbsDown size={18} className="text-rose-600" />;
        comment = `【経営予測：緊急コスト警告】『${title}』が計画比超過推移に突入しています。最終着地が当初計画を【${formatVal(deviationAmount)}】もオーバーしてしまうシミュレーション結果となっています。`; 
      } else {
        color = 'text-slate-700 bg-slate-50 border-slate-200'; icon = <Bot size={18} className="text-slate-500" />;
        comment = `【経営予測：予算内着地想定】『${title}』は極めて適正かつ計画通りのコントロールが維持されています。`; 
      }
    } else {
      if (ratio > 101) {
        color = 'text-emerald-700 bg-emerald-50 border-emerald-200'; icon = <ThumbsUp size={18} className="text-emerald-600" />;
        comment = `【経営予測：収益ポテンシャル拡大】『${title}』は素晴らしい躍進を遂げています。当月末の最終実績は目標値を【${formatVal(deviationAmount)}】上振れ突破する見込みです。`; 
      } else if (ratio < 99) {
        color = 'text-rose-700 bg-rose-50 border-rose-200'; icon = <ThumbsDown size={18} className="text-rose-600" />;
        comment = `【経営予測：致命的失速アラート】『${title}』は看過できない急ブレーキがかかっています。当月最終実績が予算比で【${formatVal(deviationAmount)}】も下振れ失速するリスクが試算されます。`; 
      } else {
        color = 'text-slate-700 bg-slate-50 border-slate-200'; icon = <Bot size={18} className="text-slate-500" />;
        comment = `【経営予測：計画達成維持】『${title}』は経営計画通りの手堅く堅実な推移を見せています。`; 
      }
    }
    return { color, icon, comment, shortComment, ratio: ratio.toFixed(1) };
  };

  const generateStackedManhoursData = () => {
    const logisticsItems = data["logisticsData"] || [];
    const colV_Total = logisticsItems.find(item => item && item.title && (item.title === "総工数" || item.title === "実績_総工数"));
    
    const colChikusan = logisticsItems.find(item => item && item.title && (item.title === "畜産工数" || item.title === "実績_畜産工数"));
    const colSuisan = logisticsItems.find(item => item && item.title && (item.title === "水産工数" || item.title === "実績_水産工数"));
    
    return currentMonthIndices.map(idx => {
      const label = baseLabels[idx]; 
      const totalH = colV_Total && colV_Total.values ? n(colV_Total.values[idx]) : 0;
      
      const chikusanH = colChikusan && colChikusan.values ? n(colChikusan.values[idx]) : 0; 
      const suisanH = colSuisan && colSuisan.values ? n(colSuisan.values[idx]) : 0; 
      
      const directSum = chikusanH + suisanH;
      return { 
        name: label, 
        '畜産': Math.round(chikusanH), 
        '水産': Math.round(suisanH), 
        '間接工数': Math.round(Math.max(0, totalH - directSum)) 
      };
    });
  };

  const sortedMetrics = activeTab === 'monthly' ? (() => {
    const priority = ["売上", "労務費", "売上総利益"];
    const top = allMetrics.filter(m => priority.includes(m.title)).sort((a, b) => priority.indexOf(a.title) - priority.indexOf(b.title));
    const others = allMetrics.filter(m => !priority.includes(m.title));
    return { top, others };
  })() : { top: allMetrics, others: [] };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-20 notranslate" translate="no">
      <header className="h-20 bg-white border-b border-slate-200 px-10 flex justify-between items-center sticky top-0 z-40 backdrop-blur-md bg-white/80">
        <div className="flex items-center gap-4">
          <img src="/pal-logo.png" alt="PAL Logo" className="h-7 w-auto object-contain shrink-0" />
          <div className="h-4 w-[1px] bg-slate-200 shrink-0" />
          <Link href="/" className="flex items-center gap-2 text-slate-400 no-underline font-black hover:text-blue-600 transition-colors">
            <ArrowLeft size={15} /> <span className="text-xs tracking-tight">拠点MAPに戻る</span>
          </Link>
        </div>
        <div className="text-center">
          <h1 className="text-lg font-black italic tracking-tighter uppercase text-slate-800">経営ダッシュボード : AFS南関東</h1>
          <p className="text-[9px] font-bold text-blue-600 tracking-[0.2em] uppercase">
            {['dx', 'env', 'history', 'accidents', 'manhours'].includes(activeTab) ? 'STRATEGIC MANAGEMENT LAYER' : `${displayMode.toUpperCase()} ANALYTICS MODE (${globalSelectedMonth}月)`}
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
            <button disabled={['monthly', 'dx', 'env', 'history', 'accidents', 'manhours'].includes(activeTab)} onClick={() => setDisplayMode('daily')} className={`px-4 py-1.5 rounded-xl text-[10px] font-black transition-all ${displayMode === 'daily' && !['dx', 'env', 'history', 'accidents', 'manhours'].includes(activeTab) ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 disabled:opacity-30'}`}>日次</button>
            <button disabled={['monthly', 'dx', 'env', 'history', 'accidents', 'manhours'].includes(activeTab)} onClick={() => setDisplayMode('weekly')} className={`px-4 py-1.5 rounded-xl text-[10px] font-black transition-all ${displayMode === 'weekly' && !['dx', 'env', 'history', 'accidents', 'manhours'].includes(activeTab) ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}>週次</button>
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

        {/* 8. 事故管理タブ */}
        {activeTab === 'accidents' && (
          <div className="space-y-8">
            <div className="border-b border-slate-200 pb-4">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3"><AccidentIcon className="text-amber-500" size={28} /> カテゴリ別 事故件数 ({globalSelectedMonth}月度)</h2>
              <p className="text-slate-400 text-sm font-bold mt-1 uppercase tracking-widest">Category-wise Safety Performance</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {accidentCategories.map((cat, i) => {
                const styles = getLevelStyles(cat.total); const daysSince = calculateDaysSince(cat.lastDate);
                return (
                  <div key={i} className={`bg-white border-2 ${styles.cardBorder} p-6 rounded-[2rem] shadow-sm relative transition-all flex flex-col justify-between`}>
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center gap-2">
                        {styles.icon} <h3 className="text-lg font-black text-slate-800">{cat.name}</h3>
                      </div>
                      <div className="bg-slate-900 text-white px-4 py-1.5 rounded-2xl flex items-center gap-2 shadow-md">
                        <span className="text-[9px] font-bold text-blue-400 tracking-wider">無事故</span>
                        <span className="text-xl font-black italic tracking-tighter"><AnimatedNumber value={daysSince} /></span>
                        <span className="text-[9px] font-bold">DAYS</span>
                      </div>
                    </div>
                    <div className="flex justify-center mb-8 relative">
                      <div className={`w-40 h-40 rounded-full border-[12px] flex flex-col items-center justify-center bg-white shadow-inner z-10 relative ${styles.meterBorder} ${styles.text}`}>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-[-5px]">当月事故</span>
                        <span className="text-6xl font-black tracking-tighter"><AnimatedNumber value={cat.total} /></span>
                      </div>
                    </div>
                    <div className="flex justify-center gap-3 text-xs font-bold">
                      <div className="flex-1 flex flex-col items-center justify-center p-3 bg-rose-50 text-rose-600 rounded-xl border border-rose-100">
                        <span className="text-[9px] uppercase tracking-wider mb-1">追走あり</span>
                        <div className="flex items-baseline gap-1"><span className="text-2xl font-black"><AnimatedNumber value={cat.chaseOn}/></span><span className="text-xs">件</span></div>
                      </div>
                      <div className="flex-1 flex flex-col items-center justify-center p-3 bg-slate-50 text-slate-500 rounded-xl border border-slate-200">
                        <span className="text-[9px] uppercase tracking-wider mb-1">追走なし</span>
                        <div className="flex items-baseline gap-1"><span className="text-lg font-black"><AnimatedNumber value={cat.chaseOff}/></span><span className="text-[10px]">件</span></div>
                      </div>
                    </div>
                    <div className="text-center mt-6 border-t border-slate-100 pt-4"><p className="text-[10px] font-bold text-slate-400">最終発生日: {cat.lastDate}</p></div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 9. 工数分析タブ */}
        {activeTab === 'manhours' && (
          <div className="bg-white border border-slate-200 p-8 rounded-[2.5rem] shadow-md space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-lg font-black text-slate-900 tracking-tighter flex items-center gap-2"><Clock className="text-slate-600" size={20} /> 現場別投下工数実績内訳スタック analysis</h2>
            </div>
            <div className="h-[450px] bg-slate-50/50 p-6 rounded-3xl border border-slate-100 min-w-0">
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <ComposedChart data={generateStackedManhoursData()} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} axisLine={false} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: '16px', border: 'none' }} />
                  <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', paddingBottom: '15px' }} />
                  <Bar name="畜産" dataKey="畜産" stackId="afsManpower" fill="#3b82f6" />
                  <Bar name="水産" dataKey="水産" stackId="afsManpower" fill="#06b6d4" />
                  <Bar name="間接工数" dataKey="間接工数" stackId="afsManpower" fill="#94a3b8" radius={[8, 8, 0, 0]} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* 主要数値グラフ表示 */}
        {!['dx', 'env', 'history', 'accidents', 'manhours'].includes(activeTab) && (
          <div className={`grid grid-cols-1 ${displayMode === 'daily' ? 'xl:grid-cols-3 lg:grid-cols-2' : 'lg:grid-cols-2'} gap-8`}>
            {sortedMetrics.top.map((m, i) => {
              const isCost = lowIsBetterMetrics.some(k => m.title.includes(k));
              const isAvgMetric = m.title.includes("生産性") || m.title.includes("%") || m.title.includes("率") || activeTab === 'productivity';
              const totalMetricsKeywords = ["売上", "原価", "費", "工数", "物量", "タイミー", "有給", "交通費", "事故", "数", "ケース", "パレット", "卸量", "トン"];
              const isTotalType = (totalMetricsKeywords.some(k => m.title.includes(k)) || activeTab === 'logistics' || activeTab === 'sales' || activeTab === 'monthly') && !isAvgMetric;
              
              const weekIdx = weeklyGroups[selectedWeek]?.indices || [];
              let chartData = []; let dispAct = 0; let dispFct = 0;
              
              const calcAvg = (arr) => { const valid = arr.filter(v => v > 0); return valid.length > 0 ? valid.reduce((a, b) => a + b, 0) / valid.length : 0; };
              
              if (displayMode === 'daily') {
                chartData = currentMonthIndices.map(idx => ({ name: m.labels[idx], "実績": n(m.actual[idx]), [m.forecastType]: n(m.forecast[idx]) }));
                const today = new Date(); const todayMonth = today.getMonth() + 1; const todayDate = today.getDate();
                const upToTodayIndices = currentMonthIndices.filter(idx => {
                  const label = m.labels[idx]; if (typeof label === 'string' && label.includes('/')) { const p = label.split('/'); const mNum = parseInt(p[0], 10); const dNum = parseInt(p[1], 10); if (mNum < todayMonth) return true; if (mNum === todayMonth && dNum <= todayDate) return true; } return false;
                });
                const targetIndices = upToTodayIndices.length > 0 ? upToTodayIndices : currentMonthIndices;
                const acts = targetIndices.map(idx => n(m.actual[idx])); const fcts = targetIndices.map(idx => n(m.forecast[idx]));
                if (isAvgMetric) { dispAct = calcAvg(acts); dispFct = calcAvg(fcts) || 1; } 
                else { dispAct = acts.reduce((a, b) => a + b, 0); dispFct = fcts.reduce((a, b) => a + b, 0) || 1; }
              } else if (displayMode === 'weekly') {
                chartData = weekIdx.map(idx => ({ name: m.labels[idx], "実績": n(m.actual[idx]), [m.forecastType]: n(m.forecast[idx]) }));
                const acts = weekIdx.map(idx => n(m.actual[idx])); const fcts = weekIdx.map(idx => n(m.forecast[idx]));
                if (isAvgMetric) { dispAct = calcAvg(acts); dispFct = calcAvg(fcts); } 
                else if (isTotalType) { dispAct = acts.reduce((a, b) => a + b, 0); dispFct = fcts.reduce((a, b) => a + b, 0); } 
                else { dispAct = calcAvg(acts); dispFct = calcAvg(fcts); }
              } else if (displayMode === 'monthly') {
                chartData = currentMonthIndices.map(idx => ({ name: m.labels[idx], "実績": n(m.actual[idx]), [m.forecastType]: n(m.forecast[idx]) }));
                const acts = currentMonthIndices.map(idx => n(m.actual[idx])); const fcts = currentMonthIndices.map(idx => n(m.forecast[idx]));
                if (isAvgMetric) { dispAct = calcAvg(acts); dispFct = calcAvg(fcts); } 
                else if (isTotalType) { dispAct = acts.reduce((a, b) => a + b, 0); dispFct = fcts.reduce((a, b) => a + b, 0); } 
                else { dispAct = calcAvg(acts); dispFct = calcAvg(fcts); }
              }
              const currentRatio = dispFct > 0 ? (dispAct / dispFct) * 100 : 0;
              const evalData = getAiCorporateEvaluation(m.title, dispAct, dispFct, displayMode, isTotalType, currentRatio, m.forecast);
              const isKousu = m.title.includes('工数');
              const primaryColor = isCost ? '#ef4444' : (isKousu ? '#f472b6' : currentTab.color); const secondaryColor = '#8b5cf6';
              
              const formatVal = (val) => {
                if (m.title.includes("%") || m.title.includes("率")) return `${val.toFixed(1)}%`;
                if (m.title.includes("生産性") || /時給|最低賃金|人数|在籍者|違反者/.test(m.title)) return Number(val.toFixed(1)).toLocaleString();
                if (/売上|原価|費|利益|金額/.test(m.title)) return `¥${Math.round(val).toLocaleString()}`;
                return Math.round(val).toLocaleString();
              };
              
              return (
                <div key={i} className="bg-white border border-slate-200 p-8 rounded-[2.5rem] shadow-md flex flex-col gap-6 min-w-0">
                  <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                    <div>
                      <h4 className="text-lg font-black text-slate-900 tracking-tighter uppercase">{m.title}</h4>
                      <p className="text-[10px] font-bold text-slate-400 mt-0.5 uppercase tracking-widest">vs {m.forecastType} Matrix</p>
                    </div>
                    {displayMode === 'daily' && (
                      <div className="flex gap-6 text-right items-center">
                        <div className="border-r pr-4 border-slate-100">
                          <p className="text-[9px] font-bold text-slate-400 uppercase">{globalSelectedMonth}月 本日まで{isAvgMetric ? 'の平均' : 'の累計'}</p>
                          <p className="text-xl font-black text-slate-800 tracking-tight">{formatVal(dispAct)}</p>
                        </div>
                        <div>
                          <p className="text-[9px] font-bold text-slate-400 uppercase">今日現在の進捗率</p>
                          <p className={`text-xl font-black ${currentRatio >= 101 ? (isCost ? 'text-rose-600' : 'text-emerald-600') : (currentRatio < 99 ? (isCost ? 'text-emerald-600' : 'text-rose-600') : 'text-slate-600')}`}>{currentRatio.toFixed(1)}%</p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className={displayMode !== 'daily' ? 'grid grid-cols-1 xl:grid-cols-3 gap-8 items-start min-w-0' : 'w-full min-w-0'}>
                    <div className={displayMode !== 'daily' ? 'xl:col-span-2 h-[320px] bg-slate-50/50 p-4 rounded-3xl border border-slate-100 min-w-0' : 'h-[280px] w-full bg-slate-50/50 p-4 rounded-3xl border border-slate-100 min-w-0'}>
                      <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <defs>
                            <linearGradient id={`colorAct-${i}`} x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={primaryColor} stopOpacity={0.4}/><stop offset="95%" stopColor={primaryColor} stopOpacity={0}/></linearGradient>
                            <linearGradient id={`colorFct-${i}`} x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={secondaryColor} stopOpacity={0.15}/><stop offset="95%" stopColor={secondaryColor} stopOpacity={0}/></linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                          <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} axisLine={false} tickLine={false} />
                          <YAxis stroke="#94a3b8" fontSize={10} axisLine={false} tickLine={false} />
                          <Tooltip contentStyle={{ borderRadius: '16px', border: 'none' }} />
                          <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', paddingBottom: '15px' }} />
                          <Area type="monotone" name="実績" dataKey="実績" stroke={primaryColor} strokeWidth={4} fillOpacity={1} fill={`url(#colorAct-${i})`} activeDot={{ r: 6 }} />
                          <Area type="monotone" name={m.forecastType} dataKey={m.forecastType} stroke={secondaryColor} strokeWidth={2.5} strokeDasharray="5 5" fillOpacity={1} fill={`url(#colorFct-${i})`} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                    
                    {displayMode !== 'daily' && (
                      <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-inner h-[320px] flex flex-col justify-between">
                        <div className="border-b border-slate-800 pb-2"><p className="text-[10px] font-black tracking-widest text-blue-400 uppercase">当{displayMode === 'weekly' ? '週' : '月'}{isAvgMetric ? '平均' : (isTotalType ? '合計' : '平均')}確認パネル</p></div>
                        <div className="space-y-4 my-auto">
                          <div className="flex justify-between items-baseline"><span className="text-xs font-bold text-slate-400">{isAvgMetric ? '平均実績' : (isTotalType ? `${displayMode === 'weekly' ? '合計実績' : '当月合計実績'}` : '平均実績')}</span><span className="text-2xl font-black tracking-tight text-white">{formatVal(dispAct)}</span></div>
                          <div className="flex justify-between items-baseline"><span className="text-xs font-bold text-slate-400">{isAvgMetric ? `平均${m.forecastType}` : (isTotalType ? `${displayMode === 'weekly' ? '合計' : '当月合計'}${m.forecastType}` : `平均${m.forecastType}`)}</span><span className="text-xl font-bold tracking-tight text-slate-300">{formatVal(dispFct)}</span></div>
                          <div className="flex justify-between items-baseline border-t border-slate-800 pt-3"><span className="text-xs font-black text-blue-400">達成率 ({m.forecastType}比)</span><span className={`text-3xl font-black tracking-tighter ${currentRatio >= 101 ? (isCost ? 'text-rose-400' : 'text-emerald-400') : (currentRatio < 99 ? (isCost ? 'text-emerald-400' : 'text-rose-400') : 'text-slate-300')}`}>{currentRatio.toFixed(1)}%</span></div>
                        </div>
                        <div className="text-[9px] text-slate-500 font-bold text-center uppercase tracking-wider">Executive Management DB</div>
                      </div>
                    )}
                  </div>
                  {(displayMode === 'weekly' || displayMode === 'monthly') && (
                    <div className={`p-5 rounded-3xl border text-[11px] font-medium flex items-start gap-4 shadow-sm leading-relaxed ${evalData.color}`}><div className="p-2 bg-white rounded-xl shadow-sm shrink-0 mt-0.5 flex items-center justify-center">{evalData.icon}</div><p>{evalData.comment}</p></div>
                  )}
                </div>
              );
            })}
            
            {/* 月次タブのその他項目（Tier2 コンパクト表示） */}
            {activeTab === 'monthly' && sortedMetrics.others.length > 0 && (
              <div className="lg:col-span-2 space-y-6 pt-8 border-t-2 border-dashed border-slate-200">
                <h3 className="text-xl font-black text-slate-400 border-l-4 border-slate-300 pl-4 tracking-tighter">その他 運営指標 (Compact View)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {sortedMetrics.others.map((m, i) => {
                    const monthlyLowerIsBetter = ['事故件数（流通）', '事故金額', '労災件数', '社員残業工数', 'スタッフ残業工数', 'スタッフ使用工数', '社員工数', '一般スタッフ採用時給', 'タイミー使用工数', '36協定違反者数', '事故'];
                    const monthlyDisplayOnly = ['社員人数', 'スタッフ在籍者数', '最低賃金'];
                    const isMonthlyFixed = m.labels && m.labels.length > 0 && !m.labels[0].toString().includes('/');
                    
                    // 🚀 ここでちゃんと isCost を定義！
                    const isCost = lowIsBetterMetrics.some(k => m.title.includes(k)) || monthlyLowerIsBetter.some(k => m.title.includes(k));

                    let dispAct = 0; let prevVal = 0; let dispFct = 0;

                    if (isMonthlyFixed) {
                      const mIdx = m.labels.indexOf(globalSelectedMonth);
                      const prevMonthStr = (parseInt(globalSelectedMonth) - 1 || 12).toString();
                      const prevIdx = m.labels.indexOf(prevMonthStr);
                      dispAct = mIdx !== -1 ? n(m.actual[mIdx]) : 0;
                      prevVal = prevIdx !== -1 ? n(m.actual[prevIdx]) : 0;
                      dispFct = prevVal; 
                    } else {
                      const acts = currentMonthIndices.map(idx => n(m.actual[idx])); const fcts = currentMonthIndices.map(idx => n(m.forecast[idx]));
                      const calcAvg = (arr) => { const valid = arr.filter(v => v > 0); return valid.length > 0 ? valid.reduce((a, b) => a + b, 0) / valid.length : 0; };
                      if (m.title.includes("生産性") || m.title.includes("%") || m.title.includes("率")) { dispAct = calcAvg(acts); dispFct = calcAvg(fcts); } 
                      else { dispAct = acts.reduce((a, b) => a + b, 0); dispFct = fcts.reduce((a, b) => a + b, 0); }
                    }
                    
                    const currentRatio = dispFct > 0 ? (dispAct / dispFct) * 100 : (dispAct === 0 ? 100 : 0);
                    
                    const formatVal = (val, title) => {
                      if (title.includes("%") || title.includes("率")) return `${val.toFixed(1)}%`;
                      if (title.includes("生産性") || /時給|最低賃金|人数|在籍者|違反者/.test(title)) return Number(val.toFixed(1)).toLocaleString();
                      if (/売上|原価|費|利益|金額/.test(title)) return `¥${Math.round(val).toLocaleString()}`;
                      return Math.round(val).toLocaleString();
                    };

                    const evalData = (() => {
                      let shortComment = "";
                      if (isMonthlyFixed) {
                        if (monthlyDisplayOnly.some(k => m.title.includes(k))) shortComment = "月次モニタリング指標として記録されています。";
                        else if (monthlyLowerIsBetter.some(k => m.title.includes(k))) {
                            if (prevVal > 0 && dispAct < prevVal) shortComment = `前月（${formatVal(prevVal, m.title)}）から減少し、改善傾向にあります。`;
                            else if (prevVal > 0 && dispAct > prevVal) shortComment = `前月（${formatVal(prevVal, m.title)}）から増加・悪化しています。注意が必要です。`;
                            else shortComment = prevVal > 0 ? `前月（${formatVal(prevVal, m.title)}）と同水準を維持しています。` : "当月データのみ登録されています。";
                        } else {
                            if (prevVal > 0 && dispAct > prevVal) shortComment = `前月（${formatVal(prevVal, m.title)}）から増加・良化しています。`;
                            else if (prevVal > 0 && dispAct < prevVal) shortComment = `前月（${formatVal(prevVal, m.title)}）から減少・悪化しています。`;
                            else shortComment = prevVal > 0 ? `前月（${formatVal(prevVal, m.title)}）と同水準を維持しています。` : "当月データのみ登録されています。";
                        }
                      } else {
                        if (isCost) {
                          if (currentRatio < 99) shortComment = "コスト管理は想定以上に良好です。現体制の効率化維持を推奨します。";
                          else if (currentRatio > 101) shortComment = "警告：予算超過ペース。直ちにしきい値の見直しと人員配置の適正化が必要です。";
                          else shortComment = "計画通り順調な推移です。現状のオペレーションを維持してください。";
                        } else {
                          if (currentRatio > 101) shortComment = "業績好調。数値が目標を突破し、限界利益の押し上げに貢献しています。";
                          else if (currentRatio < 99) shortComment = "失速アラート。目標値に対し下振れ傾向。早急な原因分析を求む。";
                          else shortComment = "手堅い計画達成ペース。着実なオペレーション管理が行われています。";
                        }
                      }
                      return { shortComment };
                    })();

                    let evalColor = 'bg-slate-50 border-slate-100 text-slate-500'; let evalIcon = <Bot size={14} className="text-blue-500 shrink-0" />;
                    let badgeColor = 'bg-slate-50 text-slate-500'; let badgeText = prevVal > 0 ? `${((dispAct / prevVal) * 100).toFixed(1)}%` : "前月比 --%";

                    if (isMonthlyFixed) {
                        const ratio = prevVal > 0 ? (dispAct / prevVal) * 100 : 0;
                        badgeText = prevVal > 0 ? `${ratio.toFixed(1)}%` : "前月データなし";

                        if (monthlyDisplayOnly.some(k => m.title.includes(k))) {
                            badgeColor = 'bg-slate-100 text-slate-500';
                        } else if (monthlyLowerIsBetter.some(k => m.title.includes(k))) {
                            if (prevVal > 0 && dispAct < prevVal) { evalColor = 'bg-emerald-50/80 border-emerald-100 text-emerald-700'; evalIcon = <ThumbsUp size={14} className="text-emerald-500 shrink-0" />; badgeColor = 'bg-emerald-50 text-emerald-600'; } 
                            else if (prevVal > 0 && dispAct > prevVal) { evalColor = 'bg-rose-50/80 border-rose-100 text-rose-700'; evalIcon = <ThumbsDown size={14} className="text-rose-500 shrink-0" />; badgeColor = 'bg-rose-50 text-rose-600'; } 
                            else { badgeColor = 'bg-slate-100 text-slate-500'; }
                        } else {
                            if (prevVal > 0 && dispAct > prevVal) { evalColor = 'bg-emerald-50/80 border-emerald-100 text-emerald-700'; evalIcon = <ThumbsUp size={14} className="text-emerald-500 shrink-0" />; badgeColor = 'bg-emerald-50 text-emerald-600'; } 
                            else if (prevVal > 0 && dispAct < prevVal) { evalColor = 'bg-rose-50/80 border-rose-100 text-rose-700'; evalIcon = <ThumbsDown size={14} className="text-rose-500 shrink-0" />; badgeColor = 'bg-rose-50 text-rose-600'; } 
                            else { badgeColor = 'bg-slate-100 text-slate-500'; }
                        }
                    } else {
                       const ratio = dispFct > 0 ? (dispAct/dispFct)*100 : 0;
                       badgeText = dispFct > 0 ? `${ratio.toFixed(1)}%` : "確定実績"; badgeColor = 'bg-slate-100 text-slate-500';
                    }

                    return (
                      <div key={i} className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-4 group">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{m.title}</p>
                            <p className="text-2xl font-black text-slate-800 tracking-tighter mt-1">{formatVal(dispAct, m.title)}</p>
                          </div>
                          <div className="text-right">
                            {isMonthlyFixed ? (
                                <p className="text-[10px] font-bold text-slate-400">前月比</p>
                            ) : (
                                dispFct > 0 && <p className="text-[10px] font-bold text-slate-400">{m.forecastType}: {formatVal(dispFct, m.title)}</p>
                            )}
                            <div className={`mt-1.5 px-3 py-1 rounded-xl text-[11px] font-black inline-block ${badgeColor}`}>
                              {badgeText}
                            </div>
                          </div>
                        </div>
                        <div className={`rounded-xl p-3 text-[10px] font-medium flex items-center gap-2 transition-colors ${evalColor}`}>
                          {evalIcon}
                          <p className="line-clamp-2 leading-relaxed">{evalData.shortComment}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* DX推進・現場改善タブ */}
        {['dx', 'env'].includes(activeTab) && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {(() => {
              const currentItems = activeTab === 'dx' ? dxItems : envItems;
              if (currentItems.length === 0) return <div className="col-span-2 bg-white border p-12 rounded-[2.5rem] text-center text-slate-400 font-bold text-sm">💡 右上の「新規追加」ボタンから項目を入力・保存してください！</div>;
              return currentItems.map((item, index) => {
                const itemRatio = Math.min(100, Math.max(0, Math.round(n(item.ratio))));
                const chartPieData = [{ name: '完了', value: itemRatio }, { name: '未完了', value: 100 - itemRatio }];
                const themeColor = currentTab.color;
                return (
                  <div key={index} className={`bg-white border p-8 rounded-[2.5rem] shadow-md flex flex-col md:flex-row gap-6 items-center transition-all relative overflow-hidden ${item.customer_related === 'あり' ? 'border-rose-200 bg-rose-50/10' : 'border-slate-200'}`}>
                    {item.customer_related === 'あり' && <div className="absolute top-0 right-0 bg-rose-600 text-white px-4 py-1 text-[9px] font-black tracking-widest uppercase rounded-bl-2xl">🚨 顧客関連</div>}
                    <div className="absolute bottom-4 right-4 flex gap-3 text-[10px] font-black tracking-wider uppercase">
                      <button onClick={() => handleOpenEditModal(index)} className="text-slate-400 hover:text-slate-900 flex items-center gap-1 transition-all"><Edit2 size={11} /> 編集</button>
                      <button onClick={() => { if(confirm("削除しますか？")) handleDeleteItem(index); }} className="text-slate-300 hover:text-rose-500">削除</button>
                    </div>
                    <div className="w-[160px] h-[160px] relative shrink-0 min-w-0">
                      <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                        <PieChart>
                          <Pie data={chartPieData} cx="50%" cy="50%" innerRadius={52} outerRadius={70} startAngle={90} endAngle={-270} dataKey="value">
                            <Cell fill={themeColor} /> <Cell fill={item.customer_related === 'あり' ? "#ffe4e6" : "#f1f5f9"} />
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
                          {item.start_date && <span className="text-[9px] font-mono font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">📅 {item.start_date} ～ {item.end_date || '未定'}</span>}
                        </div>
                        <h3 className="text-base font-black text-slate-900 tracking-tight pt-1 leading-snug">{item.name}</h3>
                      </div>
                      {item.effect && item.effect !== "未入力" && <div className="text-[11px] font-medium text-slate-600 bg-slate-50 border p-3 rounded-xl"><span className="text-amber-500 font-black">💡 狙う効果:</span> {item.effect}</div>}
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

        {/* 🚀 7. 営業履歴タブ（2列グリッド） */}
        {activeTab === 'history' && (
          <div className="bg-white border border-slate-200 p-10 rounded-[2.5rem] shadow-md space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-lg font-black text-slate-900 tracking-tighter flex items-center gap-2"><MessageSquare className="text-rose-600" size={20} /> 営業アプローチ履歴</h2>
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 py-2">
              {historyItems.length === 0 ? (
                <div className="col-span-1 xl:col-span-2 text-slate-400 text-xs font-bold pl-2 py-4">💡 右上の「新規追加」ボタンから、商談ログを刻んでね！</div>
              ) : (
                historyItems.map((log, index) => (
                  <div key={index} className="bg-slate-50 border border-slate-100 p-6 rounded-3xl space-y-3 relative group hover:shadow-md transition-all">
                    <div className="absolute top-4 right-6 flex gap-3 text-[10px] font-black tracking-wider uppercase">
                      <button onClick={() => handleOpenEditModal(index)} className="text-slate-400 hover:text-slate-900 flex items-center gap-1 transition-all"><Edit2 size={11} /> 編集</button>
                      <button onClick={() => { if(confirm("消去しますか？")) handleDeleteItem(index); }} className="text-slate-300 hover:text-rose-500">削除</button>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="bg-white border-2 border-rose-500 p-1.5 rounded-full text-rose-500 shrink-0"><Building2 size={12} /></div>
                      <span className="text-xs bg-slate-900 text-white px-2.5 py-0.5 rounded-lg font-mono font-black">{log.date || '日付未設定'}</span>
                      <h4 className="text-base font-black text-slate-900 tracking-tight">{log.client}</h4>
                      <span className={`text-[11px] font-black px-3 py-0.5 rounded-full border ${log.result === '●' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>結果: {log.result}</span>
                    </div>
                    {log.proposal && <div className="text-xs font-black text-slate-800 bg-white border px-3 py-1.5 rounded-xl w-fit"><span className="text-rose-500 font-extrabold">💡 提案内容:</span> {log.proposal}</div>}
                    {log.detail && <p className="text-[12px] font-medium text-slate-600 leading-relaxed whitespace-pre-wrap">{log.detail}</p>}
                  </div>
                ))
              )}
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