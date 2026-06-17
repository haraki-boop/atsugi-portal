// @ts-nocheck
'use client';
import React, { useEffect, useState, useMemo } from 'react';
import { ArrowLeft, Calculator, Calendar, Rocket, Plus, X, Edit2, Loader2, Search, RefreshCw, Eye, EyeOff, FileText, ChevronDown, CheckCircle2, AlertTriangle, Link as LinkIcon, TrendingUp, Pin } from 'lucide-react';
import Link from 'next/link';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell, AreaChart, Area, Bar } from 'recharts';

// =========================================================
// 🚀 共通ユーティリティ関数
// =========================================================
const n = (val: any) => {
  if (val === undefined || val === null || val === "") return 0;
  return parseFloat(val.toString().replace(/[^0-9.-]/g, '')) || 0;
};

const AnimatedNumber = ({ value }: { value: number }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (value === 0 || isNaN(value)) { setCount(0); return; }
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

export default function UniversalDashboardPage() {
  // =========================================================
  // 🏢 【拠点マスター設定】
  // =========================================================
  const LOCATION_ID = 'afs-bisai-seiso';
  const LOCATION_NAME = '尾西_AFS_清掃';

  const GAS_URL = `/api/gas?location=${LOCATION_ID}`;
  const [isMounted, setIsMounted] = useState(false);
  const [data, setData] = useState<any>(null);

  // タブ管理・表示モード管理
  const [activeTab, setActiveTab] = useState('sales');
  const [activeActionTab, setActiveActionTab] = useState<string>('すべて');
  const [displayMode, setDisplayMode] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [selectedWeek, setSelectedWeek] = useState<number>(0);

  // 月選択ステート
  const [globalSelectedMonth, setGlobalSelectedMonth] = useState<string>('');
  const [contractSelectedMonth, setContractSelectedMonth] = useState<string>('');

  const [hideZeroContracts, setHideZeroContracts] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showHiddenItems, setShowHiddenItems] = useState(false);
  const [showHiddenMetrics, setShowHiddenMetrics] = useState(false);

  const [dxItems, setDxItems] = useState<any[]>([]);
  const [metricSettings, setMetricSettings] = useState<any[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const [actionYearFilter, setActionYearFilter] = useState<string>('all');
  const [actionMonthFilter, setActionMonthFilter] = useState<string>('all');

  const [newItem, setNewItem] = useState({
    name: '', effect: '', startDate: '', endDate: '', customerRelated: false, ratio: 0, category: '', url: ''
  });

  const [toastInfo, setToastInfo] = useState<{show: boolean, msg: string, type: 'success'|'error'}>({show: false, msg: '', type: 'success'});

  const formatVal = (val: number, title?: string) => {
    if (val === undefined || val === null || isNaN(val)) return '0';
    if (!title) return Math.round(val).toLocaleString();
    
    // 判定ロジックを修正: %、率、単価、時給、そして「工数」が含まれる場合は¥をつけない
    if (title.includes("%") || title.includes("率") || /単価|時給|工数|人員/.test(title)) {
      return Number(val.toFixed(1)).toLocaleString();
    }
    
    return `¥${Math.round(val).toLocaleString()}`;
  };

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToastInfo({ show: true, msg, type });
    setTimeout(() => setToastInfo({ show: false, msg: '', type: 'success' }), 3000);
  };

  const handleReloadData = async () => {
    setData(null);
    await fetchDashboardData(true);
  };

  // =========================================================
  // 🔌 Supabase通信ロジック
  // =========================================================
  const supabaseRequest = async (table: string, method: string, body?: any) => {
    try {
      let query = '';
      if (method === 'GET') query = `?location_id=eq.${LOCATION_ID}&order=id.asc`;
      if (method === 'PATCH' || method === 'DELETE') query = `?id=eq.${body.id}`;

      const cleanBody = method === 'PATCH' ? { ...body } : body;
      if (method === 'PATCH') delete cleanBody.id;

      const res = await fetch('/api/supabase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ table, actionMethod: method, payload: (method === 'POST' || method === 'PATCH') ? cleanBody : undefined, query })
      });

      if (!res.ok) throw new Error(`[API Error] ${res.status}`);
      return method === 'DELETE' ? true : await res.json();
    } catch (e) {
      console.error("Secure Supabase Operation Error:", e);
      throw e;
    }
  };

  const fetchSupabaseData = async () => {
    try {
      const [dxData, settingsData] = await Promise.all([
        supabaseRequest('dx_actions', 'GET').catch(() => []),
        supabaseRequest('dashboard_metric_settings', 'GET').catch(() => [])
      ]);
      if (dxData) setDxItems(dxData);
      if (settingsData) setMetricSettings(settingsData);
    } catch (err) {
      console.warn("データの取得に失敗しました。");
    }
  };

  const fetchDashboardData = async (isReload = false) => {
    fetchSupabaseData();
    try {
      const res = await fetch(GAS_URL);
      const json = await res.json();
      setData(json);

      if (!isReload && json && json.labels && json.labels.length > 0) {
        const monthsInLabels = json.labels.map((lbl: string) => {
          if (!lbl) return '';
          const parts = lbl.split('/');
          return parts.length >= 2 ? parts[0] : '';
        }).filter(Boolean);
        const uniqueM = Array.from(new Set(monthsInLabels));
        if (uniqueM.length > 0) {
          const extractedMonth = uniqueM[uniqueM.length - 1] as string;
          setGlobalSelectedMonth(extractedMonth);

          if (json.contractYojitsuData && json.contractYojitsuData.length > 0) {
            const cLabels = json.contractYojitsuData[0].labels || [];
            const cleanCLabels = cLabels.map((l: any) => String(l).replace('月', ''));
            if (cleanCLabels.includes(String(parseInt(extractedMonth)))) setContractSelectedMonth(String(parseInt(extractedMonth)));
            else setContractSelectedMonth(cleanCLabels[0] || '4');
          }
        }
      }
      if (isReload) showToast('最新データを取得しました', 'success');
    } catch (err) {
      showToast('データの取得に失敗しました', 'error');
    }
  };

  useEffect(() => {
    setIsMounted(true);
    fetchDashboardData(false);
  }, []);

  const handleToggleMetricSetting = async (metricTitle: string, field: 'is_pinned' | 'is_hidden', currentVal: boolean) => {
    try {
      const existing = metricSettings.find(s => s.tab_id === activeTab && s.metric_title === metricTitle);
      const payload: any = { location_id: LOCATION_ID, tab_id: activeTab, metric_title: metricTitle, is_pinned: field === 'is_pinned' ?
      !currentVal : (existing ? existing.is_pinned : false), is_hidden: field === 'is_hidden' ? !currentVal : (existing ? existing.is_hidden : false) };
      if (existing) { payload.id = existing.id; await supabaseRequest('dashboard_metric_settings', 'PATCH', payload); }
      else await supabaseRequest('dashboard_metric_settings', 'POST', payload);
      const updatedSettings = await supabaseRequest('dashboard_metric_settings', 'GET').catch(() => []);
      if (updatedSettings) setMetricSettings(updatedSettings);
      showToast('グラフの設定を保存しました', 'success');
    } catch (e) { showToast('設定の保存に失敗しました。', 'error'); }
  };

  const handleToggleHideMetric = async (metricTitle: string) => {
    const existing = metricSettings.find(s => s.tab_id === activeTab && s.metric_title === metricTitle);
    const isCurrentlyHidden = existing ? existing.is_hidden : false;
    await handleToggleMetricSetting(metricTitle, 'is_hidden', isCurrentlyHidden);
  };

  const handleTogglePinMetric = async (metricTitle: string) => {
    const existing = metricSettings.find(s => s.tab_id === activeTab && s.metric_title === metricTitle);
    const isCurrentlyPinned = existing ? existing.is_pinned : false;
    await handleToggleMetricSetting(metricTitle, 'is_pinned', isCurrentlyPinned);
  };

  const tabs = [
    { id: 'sales', label: '1. 売上進捗', icon: Calculator, color: '#2563eb', dataKey: 'salesData' },
    { id: 'actions', label: '2. アクション', icon: Rocket, color: '#7c3aed' },
    { id: 'contract', label: '3. 請負予実', icon: FileText, color: '#3b82f6' },
  ];
  const currentTab = tabs.find(t => t.id === activeTab) || tabs[0];

  const baseLabelsFiltered = data ? (data.labels || []) : [];

  const availableMonths = useMemo(() => {
    if (!baseLabelsFiltered || baseLabelsFiltered.length === 0) return [];
    const months = baseLabelsFiltered.map((lbl: string) => {
      if (!lbl) return '';
      const p = lbl.split('/');
      return p.length >= 2 ? p[0] : '';
    }).filter(Boolean);
    const uniqueM = Array.from(new Set(months)).sort((a, b) => (parseInt(a as string) || 0) - (parseInt(b as string) || 0));
    return uniqueM.map(m => ({ month: m, display: `${parseInt(m as string) || m}月度` }));
  }, [baseLabelsFiltered]);

  const currentMonthIndices = useMemo(() => {
    return baseLabelsFiltered.reduce((acc: number[], lbl: string, idx: number) => {
      if (!lbl) return acc;
      const p = lbl.split('/');
      const m = p.length >= 2 ? p[0] : '';
      if (m === globalSelectedMonth) acc.push(idx);
      return acc;
    }, []);
  }, [baseLabelsFiltered, globalSelectedMonth]);

  const contractAvailableMonths = (() => {
    if (!data || !data.contractYojitsuData || data.contractYojitsuData.length === 0) return [];
    const sets = new Set<string>();
    data.contractYojitsuData.forEach((item: any) => {
      if (item.labels) item.labels.forEach((lbl: any) => { if (lbl) sets.add(String(lbl).replace('月', '')); });
    });
    return Array.from(sets).sort((a, b) => {
      const getOrder = (mStr: string) => { const val = parseInt(mStr, 10) || 0; return val >= 4 ? val : val + 12; };
      return getOrder(a) - getOrder(b);
    });
  })();

  const weeklyGroups = (() => {
    const groups: { weekNum: number; label: string; indices: number[] }[] = [];
    if (!baseLabelsFiltered || baseLabelsFiltered.length === 0 || currentMonthIndices.length === 0) return groups;
    let currentWeekIndices: number[] = []; let weekCount = 1; let startLabel = baseLabelsFiltered[currentMonthIndices[0]];

    currentMonthIndices.forEach((idx: number, loopIndex: number) => {
      const labelStr = String(baseLabelsFiltered[idx]);
      let dayStr = labelStr.replace(/[^0-9]/g, '') || '1';
      if (labelStr.includes('/')) { const parts = labelStr.split('/'); dayStr = parts[parts.length - 1]; }
      const dayNum = parseInt(dayStr, 10);
      const currentYear = new Date().getFullYear();
      const date = new Date(currentYear, parseInt(globalSelectedMonth) - 1, dayNum);

      if (date.getDay() === 0 && currentWeekIndices.length > 0) {
        groups.push({ weekNum: weekCount, label: `第${weekCount}週 (${startLabel} ～ ${baseLabelsFiltered[currentMonthIndices[loopIndex - 1]]})`, indices: currentWeekIndices });
        weekCount++; startLabel = labelStr; currentWeekIndices = [];
      }
      currentWeekIndices.push(idx);
    });
    if (currentWeekIndices.length > 0) {
      groups.push({ weekNum: weekCount, label: `第${weekCount}週 (${startLabel} ～ ${baseLabelsFiltered[currentMonthIndices[currentMonthIndices.length - 1]]})`, indices: currentWeekIndices });
    }
    return groups;
  })();

  const getCombinedMetrics = () => {
    if (!data || !data.salesData) return [];
    const combinedMap = new Map();

    data.salesData.forEach((item: any) => {
      if (!item || !item.title || !item.values || !Array.isArray(item.values)) return;
      const normalizedTitle = item.title.replace('＿', '_');

      let cleanTitle = normalizedTitle
        .replace('今期', '').replace('前期', '')
        .replace('実績_', '').replace('予測_', '').replace('予算_', '').replace('目標_', '')
        .replace('実績', '').replace('予測', '').replace('予算', '').replace('目標', '');

      if (!combinedMap.has(cleanTitle)) {
        const setting = metricSettings.find(s => s.tab_id === activeTab && s.metric_title === cleanTitle);
        combinedMap.set(cleanTitle, {
          title: cleanTitle, labels: item.labels || baseLabelsFiltered,
          actual_current: new Array((item.labels || baseLabelsFiltered).length).fill(0),
          actual_previous: new Array((item.labels || baseLabelsFiltered).length).fill(0),
          forecast: new Array((item.labels || baseLabelsFiltered).length).fill(0),
          forecastType: '予測',
          is_pinned: setting ? setting.is_pinned : false, is_hidden: setting ? setting.is_hidden : false
        });
      }
      const entry = combinedMap.get(cleanTitle);
      const isYosan = normalizedTitle.match(/予算|予測|目標/);
      const isJisseki = !isYosan;

      if (isJisseki) {
        if (normalizedTitle.includes('前期')) entry.actual_previous = item.values;
        else entry.actual_current = item.values;
      }

      if (isYosan && (normalizedTitle.includes('今期') || !normalizedTitle.match(/前期/))) {
        if (entry.forecastType === '予算' && normalizedTitle.includes('予測')) return;
        entry.forecast = item.values;
        if (normalizedTitle.includes('予算')) entry.forecastType = '予算';
        else if (normalizedTitle.includes('目標')) entry.forecastType = '目標';
        else entry.forecastType = '予測';
      }
    });

    let result = Array.from(combinedMap.values());
    if (searchQuery) result = result.filter(m => m.title.toLowerCase().includes(searchQuery.toLowerCase()));
    return result;
  };

  const sortedMetrics = getCombinedMetrics();

  const finalSortedMetrics = useMemo(() => {
    if (activeTab !== 'sales') return [];

    const metricsWithValues = sortedMetrics.map(m => {
      const isAvgMetric = m.title.includes("%") || m.title.includes("率") || m.title.includes("単価");
      const weekIdx = weeklyGroups[selectedWeek]?.indices || [];

      if (displayMode === 'monthly') {
        let totalBudget = 0; let totalChakuchi = 0; let validBudgetDays = 0; let validChakuchiDays = 0;
        let totalPrev = 0; let validPrevDays = 0; let hasFct = false;

        currentMonthIndices.forEach(idx => {
          let actVal = n(m.actual_current?.[idx]);
          let fctVal = n(m.forecast?.[idx]);
          let prevVal = n(m.actual_previous?.[idx]);

          if (fctVal > 0) { totalBudget += fctVal; validBudgetDays++; hasFct = true; }
          if (actVal > 0) { totalChakuchi += actVal; validChakuchiDays++; }
          else { totalChakuchi += fctVal; if (fctVal > 0) validChakuchiDays++; }
          if (prevVal > 0) { totalPrev += prevVal; validPrevDays++; }
        });

        if (!hasFct && validChakuchiDays > 0 && validChakuchiDays < currentMonthIndices.length && !isAvgMetric) {
          const dailyAvg = totalChakuchi / validChakuchiDays;
          totalChakuchi = dailyAvg * currentMonthIndices.length;
        }

        const finalBudget = isAvgMetric && validBudgetDays > 0 ? totalBudget / validBudgetDays : totalBudget;
        const finalChakuchi = isAvgMetric && validChakuchiDays > 0 ? totalChakuchi / validChakuchiDays : totalChakuchi;
        const finalPrev = isAvgMetric && validPrevDays > 0 ? totalPrev / validPrevDays : totalPrev;

        return {
          ...m, _sortVal: finalChakuchi, _monthlyBudget: finalBudget, _monthlyChakuchi: finalChakuchi, _monthlyPrevAct: finalPrev
        };
      }

      const targetIndices = displayMode === 'weekly' ? weekIdx : currentMonthIndices.filter(idx => {
        if (!baseLabelsFiltered[idx]) return false;
        const labelStr = String(baseLabelsFiltered[idx]);
        let dayStr = labelStr.replace(/[^0-9]/g, '') || '1';
        if (labelStr.includes('/')) dayStr = labelStr.split('/').pop();
        const dayNum = parseInt(dayStr, 10);
        const todayMonth = new Date().getMonth() + 1; const selMonth = parseInt(globalSelectedMonth, 10);
        if (selMonth !== todayMonth) return true;
        return dayNum <= new Date().getDate();
      });

      const acts = targetIndices.map(idx => n(m.actual_current?.[idx]));
      let actVal = 0;
      if (isAvgMetric) {
        const valid = acts.filter(v => v > 0);
        actVal = valid.length > 0 ? valid.reduce((a, b) => a + b, 0) / valid.length : 0;
      } else {
        actVal = acts.reduce((a, b) => a + b, 0);
      }
      return { ...m, _sortVal: actVal };
    });

    let filteredMetrics = metricsWithValues;
    if (!showHiddenMetrics) {
      filteredMetrics = filteredMetrics.filter(m => !m.is_hidden);
    }

    return filteredMetrics.sort((a, b) => {
      if (a.is_pinned !== b.is_pinned) return a.is_pinned ? -1 : 1;
      return b._sortVal - a._sortVal;
    });
  }, [sortedMetrics, displayMode, selectedWeek, globalSelectedMonth, currentMonthIndices, baseLabelsFiltered, activeTab, weeklyGroups, showHiddenMetrics]);

  const contractList = (() => {
    if (!data || !data.contractYojitsuData) return [];
    const cMap = new Map();
    data.contractYojitsuData.forEach((item: any) => {
      if (!item.title) return;
      const isYosan = item.title.startsWith('予算_');
      const isJisseki = item.title.startsWith('実績_');
      const cleanTitle = item.title.replace('予算_', '').replace('実績_', '');
      if (!cMap.has(cleanTitle)) { cMap.set(cleanTitle, { title: cleanTitle, labels: item.labels || [], actual: new Array((item.labels || []).length).fill(0), forecast: new Array((item.labels || []).length).fill(0) });
      }
      const entry = cMap.get(cleanTitle);
      if (isJisseki) entry.actual = item.values;
      if (isYosan) entry.forecast = item.values;
    });
    let list = Array.from(cMap.values());
    if (searchQuery) list = list.filter(m => m.title.toLowerCase().includes(searchQuery.toLowerCase()));
    return list;
  })();

  const actionCategories = useMemo(() => {
    const baseCats = Array.from(new Set(dxItems.map(item => String(item.category || '未分類').trim()))).filter(Boolean);
    return ['すべて', ...baseCats];
  }, [dxItems]);

  const actionAvailableYears = useMemo(() => {
    const years = new Set<string>();
    dxItems.forEach(item => {
      if (item.start_date) {
        const parts = item.start_date.split('/');
        if (parts.length >= 1) years.add(parts[0]);
      }
    });
    return Array.from(years).sort().reverse();
  }, [dxItems]);

  const filteredDxItems = useMemo(() => {
    return dxItems.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || item.effect?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTab = activeActionTab === 'すべて' || String(item.category).trim() === activeActionTab;
      const matchesHidden = showHiddenItems ? true : !item.is_hidden;

      let matchesYear = true;
      let matchesMonth = true;
      if (item.start_date) {
        const parts = item.start_date.replace(/-/g, '/').split('/');
        if (actionYearFilter !== 'all') matchesYear = parts[0] === actionYearFilter;
        if (actionMonthFilter !== 'all') {
          const m = parts[1] ? parts[1].padStart(2, '0') : '';
          matchesMonth = m === actionMonthFilter;
        }
      } else {
        if (actionYearFilter !== 'all' || actionMonthFilter !== 'all') {
          matchesYear = false;
          matchesMonth = false;
        }
      }
      return matchesSearch && matchesTab && matchesHidden && matchesYear && matchesMonth;
    }).sort((a: any, b: any) => (b.start_date || '').localeCompare(a.start_date || ''));
  }, [dxItems, searchQuery, activeActionTab, showHiddenItems, actionYearFilter, actionMonthFilter]);

  const getCategoryColor = (categoryName: string) => {
    const safeCategory = String(categoryName || '未分類').trim();
    
    const palettes = [
      { hex: '#e11d48', text: 'text-rose-600', badgeBg: 'bg-rose-100', badgeText: 'text-rose-700' },       // 🔴 1番目: 赤
      { hex: '#ea580c', text: 'text-orange-600', badgeBg: 'bg-orange-100', badgeText: 'text-orange-700' }, // 🟠 2番目: オレンジ
      { hex: '#d97706', text: 'text-amber-600', badgeBg: 'bg-amber-100', badgeText: 'text-amber-700' },    // 🟡 3番目: 濃い黄
      { hex: '#16a34a', text: 'text-green-600', badgeBg: 'bg-green-100', badgeText: 'text-green-700' },    // 🟢 4番目: 緑
      { hex: '#0d9488', text: 'text-teal-600', badgeBg: 'bg-teal-100', badgeText: 'text-teal-700' },       // 🧩 5番目: 青緑
      { hex: '#2563eb', text: 'text-blue-600', badgeBg: 'bg-blue-100', badgeText: 'text-blue-700' },       // 🔵 6番目: 青
      { hex: '#9333ea', text: 'text-purple-600', badgeBg: 'bg-purple-100', badgeText: 'text-purple-700' }, // 🟣 7番目: 紫
      { hex: '#db2777', text: 'text-pink-600', badgeBg: 'bg-pink-100', badgeText: 'text-pink-700' },       // 🌸 8番目: ピンク
    ];
    
    // 🌟 変更点: ハッシュ（文字の計算）をやめて、「カテゴリ一覧（actionCategories）」の中での順番を取得する
    const catIndex = actionCategories.indexOf(safeCategory);
    
    // actionCategoriesの0番目は「すべて」ボタンなので、1を引いてズラす。見つからなければ0番目の色。
    const index = catIndex > 0 ? catIndex - 1 : 0;
    
    return palettes[index % palettes.length];
  };

  const handleOpenAddModal = () => {
    setEditingIndex(null);
    setNewItem({ name: '', effect: '', startDate: '', endDate: '', customerRelated: false, ratio: 0, category: '', url: '' });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (realIdx: number) => {
    setEditingIndex(realIdx);
    const item = dxItems[realIdx];
    setNewItem({
      name: item.name || '', effect: item.effect === '未入力' ? '' : (item.effect || ''), category: item.category ||
      '', url: item.url || '',
      startDate: item.start_date ? item.start_date.replace(/\//g, '-') : '', endDate: item.end_date ? item.end_date.replace(/\//g, '-') : '',
      customerRelated: item.customer_related === 'あり', ratio: item.ratio || 0
    });
    setIsModalOpen(true);
  };

  const handleSaveItem = async () => {
    setIsModalOpen(false);
    if (!newItem.name) return;
    const payload: any = {
      location_id: LOCATION_ID, name: newItem.name, effect: newItem.effect || '未入力',
      category: newItem.category || '未分類', url: newItem.url || '',
      start_date: newItem.startDate ? newItem.startDate.replace(/-/g, '/') : '',
      end_date: newItem.endDate ? newItem.endDate.replace(/-/g, '/') : '',
      customer_related: newItem.customerRelated ? 'あり' : 'なし', ratio: Number(newItem.ratio)
    };
    if (editingIndex !== null) {
      payload.id = dxItems[editingIndex].id;
      await supabaseRequest('dx_actions', 'PATCH', payload);
    } else {
      await supabaseRequest('dx_actions', 'POST', payload);
    }
    await fetchSupabaseData();
    showToast('データを保存しました', 'success');
  };

  const handleDeleteItem = async (realIdx: number) => {
    await supabaseRequest('dx_actions', 'DELETE', { id: dxItems[realIdx].id });
    await fetchSupabaseData();
    showToast('データを削除しました', 'success');
  };

  const handleToggleHideItem = async (item: any) => {
    await supabaseRequest('dx_actions', 'PATCH', { id: item.id, is_hidden: !item.is_hidden });
    await fetchSupabaseData();
    showToast(item.is_hidden ? '項目を再表示しました' : '項目を非表示にしました', 'success');
  };

  // 🌟 完全版：グラデーション背景・くるくるスピナー・右横ワイパー・流れるプログレスバー
  if (!data || !isMounted) {
    return (
      <div className="h-screen bg-cyan-50 flex flex-col items-center justify-center relative overflow-hidden notranslate" translate="no">
        {/* 背景のグラデーション */}
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-50 via-white to-cyan-100/50" />
        
        <div className="relative z-10 flex flex-col items-center">
          {/* ロゴのコンテナ */}
          <div className="bg-white/80 backdrop-blur-sm px-8 py-4 rounded-2xl mb-8 shadow-sm border border-cyan-100 relative flex items-center justify-center w-80 h-20 overflow-visible">
            <img src="/pal-logo.png" alt="PAL Logo" className="h-10 md:h-12 w-auto object-contain z-10" />
            
            {/* ロゴの右横でゆったり動くワイパー */}
            <div className="absolute right-[-20px] top-1/2 -mt-6 w-16 h-20 flex items-center justify-center z-20" style={{ animation: 'slow-wipe 2s ease-in-out infinite' }}>
              <img src="/souji_pikapika_4803.png" alt="Wiper" className="h-16 w-auto object-contain" />
            </div>
          </div>

          <h1 className="text-2xl md:text-3xl font-black uppercase tracking-[0.2em] mb-8 text-slate-800 text-center px-4">
            <span className="text-cyan-600">PAL</span> Productivity Dashboard
          </h1>
          
          {/* 流れるプログレスバー */}
          <div className="w-64 h-1.5 bg-cyan-200/50 rounded-full overflow-hidden mb-6 shadow-inner relative">
            <div 
              className="absolute top-0 left-0 h-full bg-cyan-500 rounded-full w-1/2" 
              style={{ animation: 'loading-slide 2s ease-in-out infinite' }} 
            />
          </div>

          {/* くるくるスピナー */}
          <div className="flex items-center gap-3 text-cyan-700">
            <Loader2 className="animate-spin" size={18} />
            <span className="text-[11px] font-bold tracking-widest uppercase">Loading Dashboard...</span>
          </div>
        </div>
        
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes loading-slide { 
            0% { transform: translateX(-100%); } 
            100% { transform: translateX(200%); } 
          }
          
          @keyframes slow-wipe {
            0%   { transform: translateY(-10px) rotate(5deg); }
            50%  { transform: translateY(10px) rotate(-5deg); }
            100% { transform: translateY(-10px) rotate(5deg); }
          }
        `}} />
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-cyan-50 text-slate-900 font-sans pb-20 notranslate" translate="no">
      <header className="bg-white border-b border-cyan-100 px-4 md:px-10 py-3 md:py-0 md:h-20 flex flex-col md:flex-row justify-between items-center sticky top-0 z-40 backdrop-blur-md bg-white/80 gap-3 md:gap-0 print:hidden">
        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-3">
            <img src="/pal-logo.png" alt="PAL Logo" className="h-6 md:h-7 w-auto object-contain shrink-0" />
            <div className="h-4 w-[1px] bg-slate-100 shrink-0 hidden md:block" />
          </div>
          <Link href="/" className="flex items-center gap-1.5 text-slate-400 no-underline font-black hover:text-blue-600 transition-colors">
            <ArrowLeft size={15} /> <span className="text-[11px] md:text-xs tracking-tight">MAPへ</span>
          </Link>
        </div>
        <div className="text-center w-full md:w-auto order-first md:order-none mb-1 md:mb-0">
          <h1 className="text-base md:text-lg font-black italic tracking-tighter uppercase text-slate-800">経営ダッシュボード : {LOCATION_NAME}</h1>
          <p className="text-[8px] md:text-[9px] font-bold text-blue-600 tracking-[0.2em] uppercase mt-0.5">CLEANNESS MANAGEMENT LAYER</p>
        </div>
        <div className="flex flex-wrap justify-center gap-2 md:gap-3 items-center w-full md:w-auto">
          {/* データ更新と日次・週次・月次切り替えタブを除去し、アクションタブの「新規追加」ボタンだけ残す */}
          {activeTab === 'actions' && (
            <button onClick={handleOpenAddModal} className="hidden md:flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black tracking-wider transition-all shadow-md">
              <Plus size={14} /> 新規追加
            </button>
          )}
        </div>
      </header>

      <main className="p-4 md:p-8 max-w-[1800px] mx-auto space-y-4 md:space-y-6">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {tabs.map((t) => <button key={t.id} onClick={() => { setActiveTab(t.id); setSearchQuery(''); }} className={`px-4 md:px-5 py-2.5 rounded-xl transition-all font-black text-[10px] md:text-xs flex-grow md:flex-grow-0 text-center flex items-center justify-center gap-2 ${activeTab === t.id ? 'bg-slate-900 text-white shadow-lg' : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'}`}><t.icon size={14} className={activeTab === t.id ? "text-blue-400" : "text-slate-400"} />{t.label}</button>)}
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto justify-end">
            {['sales'].includes(activeTab) && (
              <button onClick={() => setShowHiddenMetrics(!showHiddenMetrics)} className={`px-3 py-2 rounded-xl text-[10px] md:text-xs font-black border transition-all whitespace-nowrap shrink-0 shadow-sm ${showHiddenMetrics ? 'bg-slate-800 text-white border-slate-700 shadow-inner' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}>
                {showHiddenMetrics ? '非表示グラフを隠す(ON)' : '非表示グラフを表示'}
              </button>
            )}
            <div className="relative w-full sm:w-72 shrink-0">
              <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" placeholder="項目を検索..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-white border border-slate-200 text-xs font-bold text-slate-700 pl-10 pr-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm" />
            </div>
            {activeTab === 'sales' && (
              <div className="flex items-center gap-1.5 bg-blue-50 border border-blue-100 px-3 py-2.5 rounded-xl shadow-sm shrink-0">
                <Calendar size={14} className="text-blue-500" />
                <select value={globalSelectedMonth} onChange={(e) => { setGlobalSelectedMonth(e.target.value); setSelectedWeek(0); }} className="bg-transparent border-none text-blue-800 text-xs font-black focus:outline-none cursor-pointer">
                  {availableMonths.map((m, idx) => <option key={idx} value={m.month}>{m.display}</option>)}
                </select>
                <ChevronDown size={14} className="text-blue-400" />
              </div>
            )}
          </div>
        </div>

        {activeTab === 'sales' && displayMode === 'weekly' && (
          <div className="bg-white border border-slate-200 p-3 md:p-4 rounded-2xl md:rounded-3xl shadow-sm flex flex-wrap gap-2 items-center">
            <span className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-wider mr-2 ml-1">週の選択:</span>
            {weeklyGroups.map((g, idx) => <button key={idx} onClick={() => setSelectedWeek(idx)} className={`px-4 md:px-5 py-2 rounded-xl font-black text-[10px] md:text-xs transition-all ${selectedWeek === idx ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}>{g.label}</button>)}
          </div>
        )}

        {/* =========================================
            📊 タブ1：売上進捗（美しいカード型グリッド）
        ========================================= */}
        {activeTab === 'sales' && (
          <div className={`grid gap-4 md:gap-6 print:grid-cols-2 print:gap-8 ${displayMode !== 'daily' ? 'grid-cols-1 lg:grid-cols-2' : ''}`} style={displayMode === 'daily' ? { gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 450px), 1fr))' } : {}}>
            {finalSortedMetrics.length === 0 && <div className="col-span-full py-10 text-center text-slate-400 font-bold">該当するデータがありません。</div>}

            {finalSortedMetrics.map((m, i) => {
              const isMonthly = displayMode === 'monthly';
              const isCost = false; // 売上項目ベースなのでコスト反転は無し

              let chartData = [];
              let dispAct = m._sortVal;
              let dispFct = 0;
              let dispPrevAct = 0;
              let currentRatio = 0;
              let diffPrev = 0;
              let prevRatio = 0;
              let hasForecastData = m.forecast?.some((v: number) => n(v) > 0) || false;

              let totalChakuchi = 0;
              let validChakuchiDays = 0;
              let dailyAvg = 0;

              const weekIdx = weeklyGroups[selectedWeek]?.indices || [];
              const targetIndices = isMonthly ? currentMonthIndices : (displayMode === 'weekly' ? weekIdx : currentMonthIndices.filter(idx => {
                if (!baseLabelsFiltered[idx]) return false;
                const labelStr = String(baseLabelsFiltered[idx]);
                let dayStr = labelStr.replace(/[^0-9]/g, '') || '1';
                if (labelStr.includes('/')) dayStr = labelStr.split('/').pop();
                const dayNum = parseInt(dayStr, 10);
                return (parseInt(globalSelectedMonth, 10) !== (new Date().getMonth() + 1)) || dayNum <= new Date().getDate();
              }));

              if (isMonthly) {
                dispAct = m._monthlyChakuchi;
                dispFct = m._monthlyBudget;
                dispPrevAct = m._monthlyPrevAct;
                
                currentMonthIndices.forEach(idx => {
                  let actVal = n(m.actual_current?.[idx]);
                  if (actVal > 0) { totalChakuchi += actVal; validChakuchiDays++; }
                });
                dailyAvg = validChakuchiDays > 0 ? totalChakuchi / validChakuchiDays : 0;
              } else {
                const fcts = targetIndices.map(idx => n(m.forecast[idx]));
                dispFct = fcts.reduce((a, b) => a + b, 0);
                dispPrevAct = targetIndices.reduce((sum, idx) => sum + n(m.actual_previous[idx]), 0);
              }

              currentRatio = dispFct > 0 ? (dispAct / dispFct) * 100 : 0;
              diffPrev = dispAct - dispPrevAct;
              prevRatio = dispPrevAct > 0 ? (dispAct / dispPrevAct) * 100 : (dispAct > 0 ? 100 : 0);

              const chartIndicesForRender = isMonthly ? currentMonthIndices : (displayMode === 'daily' ? currentMonthIndices : weekIdx);
              chartData = chartIndicesForRender.map(idx => {
                let fctVal = n(m.forecast[idx]);
                if (fctVal === 0 && !hasForecastData && dailyAvg > 0) fctVal = dailyAvg;
                return { name: m.labels[idx], 今期実績: n(m.actual_current[idx]), 前期実績: n(m.actual_previous[idx]), [m.forecastType]: fctVal };
              });

              if (!hasForecastData && dailyAvg > 0) hasForecastData = true;

              const getDiffBgBorderColor = (diff: number | null) => {
                if (diff === null || diff === 0) return 'text-slate-500 bg-slate-50 border-slate-200';
                return diff > 0 ? 'text-emerald-600 bg-emerald-50 border-emerald-200' : 'text-rose-600 bg-rose-50 border-rose-200';
              };
              const getDarkBadgeStyle = (diff: number | null) => {
                if (diff === null || diff === 0) return 'bg-slate-800 text-slate-400 border-slate-700';
                return diff > 0 ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border-rose-500/30';
              };

              const primaryColor = '#3b82f6';
              const secondaryColor = '#8b5cf6';

              return (
                <div key={i} className={`print-avoid-break p-4 rounded-2xl shadow-sm flex flex-col gap-3 min-w-0 overflow-hidden transition-all border ${m.is_hidden ? 'opacity-40 bg-slate-100 border-dashed border-amber-300' : 'bg-white border-slate-200'}`}>
                  
                  {/* ヘッダー領域 */}
                  <div className="flex flex-col gap-2 border-b border-slate-100 pb-2">
                    <div className="flex justify-between items-center w-full">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] md:text-[11px] font-black text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200 uppercase tracking-widest shadow-sm whitespace-nowrap">{globalSelectedMonth}月度</span>
                        {m.is_pinned && <span className="text-[9px] font-black bg-blue-600 text-white px-1.5 py-0.5 rounded flex items-center gap-0.5 shadow-sm">📌 固定中</span>}
                      </div>
                      <div className="flex gap-1.5 print:hidden z-20">
                        <button onClick={() => handleTogglePinMetric(m.title)} className={`w-7 h-7 flex items-center justify-center rounded-full border shadow-sm transition-all ${m.is_pinned ? 'bg-blue-100 border-blue-300 text-blue-600 font-black' : 'bg-white text-slate-400 hover:text-blue-500'}`} title={m.is_pinned ? "最上位ピン留めを解除" : "最上位にピン留めする"}><Pin size={13} className={m.is_pinned ? "fill-blue-600 rotate-45" : ""} /></button>
                        <button onClick={() => handleToggleHideMetric(m.title)} className={`w-7 h-7 flex items-center justify-center rounded-full border shadow-sm transition-all ${m.is_hidden ? 'bg-amber-100 border-amber-300 text-amber-600' : 'bg-white text-slate-400 hover:text-amber-500'}`} title={m.is_hidden ? "グラフを表示する" : "グラフを非表示にする"}><Eye size={13} /></button>
                      </div>
                    </div>
                    <h4 className="text-sm md:text-base font-black text-slate-900 tracking-tighter leading-snug truncate" title={m.title}>{m.title}</h4>
                  </div>

                  {/* 実績額と進捗率 */}
                  <div className="flex flex-col gap-2.5 pt-0.5 pb-1">
                    <div className="flex justify-between items-start w-full gap-4">
                      <div className="flex-1">
                        {(displayMode === 'daily' || displayMode === 'monthly') && (
                          <div className="mt-0">
                            {isMonthly && <span className="text-[10px] font-bold text-slate-400 block mb-0.5">月末着地予測</span>}
                            <p className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tighter leading-none">{formatVal(dispAct, m.title)}</p>
                          </div>
                        )}
                      </div>
                      
                      {(displayMode === 'daily' || displayMode === 'monthly') && (hasForecastData || isMonthly) && (
                        <div className="flex items-center gap-2 bg-slate-900 text-white px-3 py-1.5 rounded-xl shadow-sm text-right shrink-0">
                          <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap">{isMonthly ? '予算達成率' : '進捗率'}</span>
                          <span className={`text-sm sm:text-base font-black whitespace-nowrap ${currentRatio >= 100 ? 'text-emerald-400' : 'text-rose-400'}`}>{currentRatio.toFixed(1)}%</span>
                        </div>
                      )}
                    </div>

                    {/* 前期差・前期比のバッジ */}
                    {(displayMode === 'daily' || displayMode === 'monthly') && (
                      <div className="flex flex-col gap-1.5 w-full mt-0.5">
                        <div className="flex flex-wrap gap-1.5 justify-end">
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1.5 border shadow-sm ${getDiffBgBorderColor(diffPrev)}`}>
                            <span className="text-slate-400 font-medium">前期{isMonthly ? '差' : '比'}:</span>
                            <span className="font-black">{diffPrev > 0 ? '+' : ''} {formatVal(diffPrev, m.title)}</span>
                            <span className="text-[9px] opacity-75">({prevRatio.toFixed(1)}%)</span>
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5 justify-end mt-0.5">
                          <span className="bg-amber-50 text-amber-800 px-2.5 py-1 rounded-lg border border-amber-200 text-[10px] font-bold flex items-center gap-1 shadow-sm">
                            <span className="text-amber-500 font-medium">前期:</span>
                            <span className="font-mono font-black">{formatVal(dispPrevAct, m.title)}</span>
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className={displayMode !== 'daily' ? 'flex flex-col xl:flex-row gap-4 items-stretch w-full min-w-0' : 'w-full min-w-0'}>
                    <div className="flex-1 w-full h-[220px] min-h-[220px] bg-slate-50/50 p-2 rounded-2xl border min-w-0" style={{ position: 'relative' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <defs>
                            <linearGradient id={`colorAct-${i}`} x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={primaryColor} stopOpacity={0.4}/><stop offset="95%" stopColor={primaryColor} stopOpacity={0}/></linearGradient>
                            <linearGradient id={`colorFct-${i}`} x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={secondaryColor} stopOpacity={0.15}/><stop offset="95%" stopColor={secondaryColor} stopOpacity={0}/></linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                          <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} axisLine={false} tickLine={false} />
                          <YAxis stroke="#94a3b8" fontSize={9} axisLine={false} tickLine={false} tickFormatter={(v) => v.toLocaleString()} />
                          <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
                          <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ fontSize: '10px', paddingBottom: '10px' }} />
                          
                          {chartData.some(d => d["前期実績"]) && <Area type="monotone" name="前期実績" dataKey="前期実績" stroke="#fbbf24" strokeWidth={2.5} strokeDasharray="4 4" fillOpacity={0} />}
                          <Area type="monotone" name="今期実績" dataKey="今期実績" stroke={primaryColor} strokeWidth={3} fillOpacity={1} fill={`url(#colorAct-${i})`} activeDot={{ r: 5 }} />
                          {hasForecastData && <Area type="step" name={m.forecastType} dataKey={m.forecastType} stroke={secondaryColor} strokeWidth={2} strokeDasharray="5 5" fillOpacity={1} fill={`url(#colorFct-${i})`} />}
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                    {/* 週次・月次の右側の黒いフォアキャストパネル */}
                    {displayMode !== 'daily' && (
                      <div className="w-full xl:w-[240px] bg-slate-900 text-white p-5 rounded-2xl flex flex-col justify-between shrink-0 shadow-inner min-w-0">
                        <div>
                          <p className="text-[9px] font-black tracking-widest text-blue-400 uppercase mb-3">{isMonthly ? '月次フォアキャスト確定' : '当週合計確認'}</p>
                          <div className="mb-3">
                            <span className="text-[10px] md:text-[11px] font-bold text-slate-400 block mb-0.5">{isMonthly ? '月末着地予測' : '当週合計実績'}</span>
                            <span className="text-2xl md:text-3xl font-black text-white block tracking-tighter">{formatVal(dispAct, m.title)}</span>
                          </div>
                          {(hasForecastData || isMonthly) && (
                            <div className="space-y-2 mt-3 pt-3 border-t border-slate-700/50">
                              <div className="flex justify-between items-baseline">
                                <span className="text-[10px] md:text-xs font-bold text-slate-400 whitespace-nowrap">{isMonthly ? '今期目標設定' : `当週${m.forecastType}`}</span>
                                <span className="text-sm md:text-base font-bold text-slate-300">{formatVal(dispFct, m.title)}</span>
                              </div>
                              <div className="flex justify-between items-baseline">
                                <span className="text-[10px] md:text-xs font-black text-blue-400 whitespace-nowrap">達成率</span>
                                <span className={`text-lg md:text-xl font-black whitespace-nowrap ${currentRatio >= 100 ? 'text-emerald-400' : 'text-rose-400'}`}>{currentRatio.toFixed(1)}%</span>
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="border-t border-slate-800 pt-3 mt-3 flex flex-col gap-2">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap">前期{isMonthly?'着地':'比'}</span>
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-black border whitespace-nowrap ${getDarkBadgeStyle(diffPrev)}`}>
                              {diffPrev > 0 ? '▲' : diffPrev < 0 ? '▼' : ''} {prevRatio.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* =========================================
            🚀 タブ2：アクション管理
        ========================================= */}
        {activeTab === 'actions' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-slate-200 pb-4">
              <div>
                <h2 className="text-xl font-black text-slate-800 flex items-center gap-2"><Rocket className="text-purple-500" size={24} /> 2. 清掃アクション管理</h2>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Cleanness Action Roadmap</p>
              </div>
              
              <div className="flex flex-wrap items-center gap-3">
                {/* 🌟 追加: 年次・月次フィルター（切り離し版） */}
                <div className="flex flex-wrap items-center gap-2">
                  {/* 年フィルター */}
                  <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl shadow-sm">
                    <Calendar size={14} className="text-slate-400" />
                    <select value={actionYearFilter} onChange={(e) => setActionYearFilter(e.target.value)} className="bg-transparent text-slate-700 text-xs font-bold outline-none cursor-pointer">
                      <option value="all">すべての年</option>
                      {actionAvailableYears.map(y => <option key={y} value={y}>{y}年</option>)}
                    </select>
                  </div>
                  
                  {/* 月フィルター */}
                  <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl shadow-sm">
                    <Calendar size={14} className="text-slate-400" />
                    <select value={actionMonthFilter} onChange={(e) => setActionMonthFilter(e.target.value)} className="bg-transparent text-slate-700 text-xs font-bold outline-none cursor-pointer">
                      <option value="all">すべての月</option>
                      {['01','02','03','04','05','06','07','08','09','10','11','12'].map(m => <option key={m} value={m}>{parseInt(m, 10)}月</option>)}
                    </select>
                  </div>
                </div>

                <button onClick={() => setShowHiddenItems(!showHiddenItems)} className={`px-4 py-2 rounded-xl text-xs font-black border transition-all ${showHiddenItems ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-white text-indigo-600 border-indigo-200 hover:bg-indigo-50'}`}>
                  {showHiddenItems ? '非表示項目を隠す' : '非表示項目を表示する'}
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 bg-white p-2 rounded-2xl border border-slate-200 w-fit shadow-sm">
              {actionCategories.map(cat => (
                <button
                  key={cat} onClick={() => setActiveActionTab(cat)}
                  className={`px-5 py-2 rounded-xl text-xs font-black transition-all ${activeActionTab === cat ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'}`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredDxItems.length === 0 ? (
                <div className="col-span-full bg-white border border-slate-200 p-12 rounded-3xl text-center shadow-sm">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400"><Rocket size={24} /></div>
                  <p className="text-slate-500 font-bold text-sm">アクションがありません。右上の「新規追加」から登録してください。</p>
                </div>
              ) : (
                filteredDxItems.map((item, index) => {
                  const itemRatio = Math.min(100, Math.max(0, Math.round(n(item.ratio))));
                  const catColor = getCategoryColor(item.category);
                  
                  const realIdx = dxItems.findIndex(x => x.id === item.id);

                  return (
                    <div key={index} className={`bg-white border p-6 rounded-[2rem] shadow-sm flex flex-col sm:flex-row gap-6 items-center relative overflow-hidden transition-all hover:shadow-md ${item.is_hidden ? 'opacity-50 bg-slate-50 border-dashed':'border-slate-200'}`}>
                      <div className="absolute top-4 right-4 flex gap-2">
                        <button onClick={() => handleToggleHideItem(item)} className="w-8 h-8 flex items-center justify-center rounded-full bg-white border border-slate-200 text-slate-400 shadow-sm hover:text-amber-500 transition-all">{item.is_hidden ? <Eye size={14} /> : <EyeOff size={14} />}</button>
                        <button onClick={() => handleOpenEditModal(realIdx)} className="w-8 h-8 flex items-center justify-center rounded-full bg-white border border-slate-200 text-slate-400 shadow-sm hover:text-blue-500 transition-all"><Edit2 size={14} /></button>
                        <button onClick={() => { if(confirm("本当に消去しますか？")) handleDeleteItem(realIdx); }} className="w-8 h-8 flex items-center justify-center rounded-full bg-white border border-slate-200 text-slate-400 shadow-sm hover:text-rose-500 transition-all"><X size={15} /></button>
                      </div>
                      
                      <div className="w-28 h-28 shrink-0 relative mt-6 sm:mt-0">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart><Pie data={[{ value: itemRatio }, { value: 100 - itemRatio }]} cx="50%" cy="50%" innerRadius="75%" outerRadius="100%" startAngle={90} endAngle={-270} dataKey="value" stroke="none"><Cell fill={catColor.hex} /><Cell fill="#f1f5f9" /></Pie></PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className={`text-xl font-black ${catColor.text}`}>{itemRatio}%</span>
                          <span className={`text-[9px] font-bold ${catColor.text} tracking-widest mt-0.5 uppercase opacity-60`}>Progress</span>
                        </div>
                      </div>

                      <div className="flex-1 space-y-3 w-full pr-12">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap mb-2">
                            <span className={`text-[9px] font-black tracking-widest uppercase px-2.5 py-1 rounded-md ${catColor.badgeBg} ${catColor.badgeText}`}>{item.category || '未分類'}</span>
                            {item.start_date && <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-md border border-slate-200">📅 {item.start_date} ～</span>}
                          </div>
                          <h3 className="text-base font-black text-slate-800 leading-tight">{item.name}</h3>
                        </div>
                        {item.effect && item.effect !== "未入力" && (
                          <div className="text-xs font-medium text-slate-600 bg-slate-50 border border-slate-100 p-3 rounded-2xl">
                            <span className={`${catColor.text} font-black mr-1`}>💡 狙う効果:</span> {item.effect}
                          </div>
                        )}
                        {item.url && (
                          <a href={item.url} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center gap-1.5 mt-2 text-[11px] font-black hover:underline transition-colors px-3 py-1.5 rounded-lg border border-transparent ${catColor.badgeBg} ${catColor.text}`}>
                            <LinkIcon size={12} /> 関連資料・リンクを開く
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* =========================================
            📊 タブ3：請負予実
        ========================================= */}
        {activeTab === 'contract' && (
          <div className="space-y-6">
            <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3">
              <div>
                <h2 className="text-xl font-black text-slate-800 flex items-center gap-2"><FileText className="text-blue-500" size={24} /> 3. 月別 請負予算・実績マトリックス</h2>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Budget & Actual Financials</p>
              </div>
              <div className="flex flex-wrap items-center gap-2 md:gap-3">
                <button onClick={() => setHideZeroContracts(!hideZeroContracts)} className={`px-4 py-2 rounded-xl text-xs font-black border transition-all whitespace-nowrap shadow-sm ${hideZeroContracts ? 'bg-blue-600 text-white border-blue-700 shadow-inner' : 'bg-white text-blue-600 border-blue-200 hover:bg-blue-50'}`}>
                  {hideZeroContracts ? '0の項目を隠す(ON)' : '0の項目も表示'}
                </button>
                <div className="flex items-center gap-1.5 bg-blue-50 border border-blue-100 px-4 py-2 rounded-xl shadow-sm">
                  <Calendar size={14} className="text-blue-500" />
                  <select value={contractSelectedMonth} onChange={(e) => setContractSelectedMonth(e.target.value)} className="bg-transparent border-none text-blue-800 text-xs font-black focus:outline-none cursor-pointer">
                    {contractAvailableMonths.map((m, idx) => <option key={idx} value={m}>{m}月度 データ</option>)}
                  </select>
                  <ChevronDown size={14} className="text-blue-400" />
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {contractList.length === 0 && <div className="col-span-full py-20 text-center text-slate-400 font-bold bg-white border border-slate-200 rounded-3xl">予実データがありません。スプシ側でデータを転写してください。</div>}
              {contractList.map((m, i) => {
                const targetIdx = m.labels.findIndex(lbl => String(lbl).replace('月', '') === String(contractSelectedMonth));
                const actVal = targetIdx !== -1 ? n(m.actual[targetIdx]) : 0;
                const fctVal = targetIdx !== -1 ? n(m.forecast[targetIdx]) : 0;
                if (hideZeroContracts && actVal === 0 && fctVal === 0) return null;
                const diffVal = actVal - fctVal;
                const ratioVal = fctVal > 0 ? (actVal / fctVal) * 100 : 0;
                
                return (
                  <div key={i} className="bg-white border border-slate-200 p-4 rounded-3xl shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between gap-3 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-blue-500"></div>
                    <div className="border-b border-slate-100 pb-2 min-h-[2.5rem] mt-1">
                      <h4 className="text-xs font-black text-slate-800 leading-snug line-clamp-2">{m.title}</h4>
                    </div>
                    <div className="space-y-1.5 text-xs font-medium">
                      <div className="flex justify-between items-center"><span className="text-slate-400 text-[10px] font-bold">実績:</span><span className="font-black text-slate-800">{formatVal(actVal, m.title)}</span></div>
                      <div className="flex justify-between items-center"><span className="text-slate-400 text-[10px] font-bold">予算:</span><span className="font-bold text-slate-500">{formatVal(fctVal, m.title)}</span></div>
                      <div className="flex justify-between items-center border-t border-slate-100 pt-1.5 mt-1">
                        <span className="text-slate-400 text-[10px] font-bold">差異:</span>
                        <span className={`font-black ${diffVal > 0 ? 'text-emerald-600' : diffVal < 0 ? 'text-rose-600' : 'text-slate-400'}`}>
                          {diffVal > 0 ? '+' : ''}{formatVal(diffVal, m.title)}
                        </span>
                      </div>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-xl border border-slate-100 flex justify-between items-center mt-1">
                      <span className="text-slate-500 text-[10px] font-black uppercase tracking-wider">達成率</span>
                      <span className={`px-2 py-1 rounded-lg text-xs font-black ${ratioVal >= 100 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                        {ratioVal > 0 ? `${ratioVal.toFixed(1)}%` : '--%'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* 🛠️ アクション編集モーダル */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <h3 className="text-sm font-black text-slate-800 tracking-tight">清掃アクションデータの{editingIndex !== null ? '編集' : '新規追加'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 p-2 rounded-full transition-colors"><X size={16} /></button>
            </div>
            
            <div className="space-y-4 text-xs font-bold text-slate-700">
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-400 uppercase tracking-widest">1. サブタブ名（カテゴリ） <span className="text-rose-500">*</span></label>
                <input type="text" placeholder="例: 日常清掃、定期清掃" value={newItem.category} onChange={(e) => setNewItem({...newItem, category: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 focus:ring-2 focus:ring-blue-500/50 focus:outline-none transition-all" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-400 uppercase tracking-widest">2. 施策タイトル <span className="text-rose-500">*</span></label>
                <input type="text" placeholder="アクションの具体的な内容" value={newItem.name} onChange={(e) => setNewItem({...newItem, name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 focus:ring-2 focus:ring-blue-500/50 focus:outline-none transition-all" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-400 uppercase tracking-widest">3. 狙う効果・詳細</label>
                <textarea placeholder="この施策によって何が改善されるか" value={newItem.effect} onChange={(e) => setNewItem({...newItem, effect: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 h-20 resize-none focus:ring-2 focus:ring-blue-500/50 focus:outline-none transition-all" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-400 uppercase tracking-widest">4. 関連URLリンク</label>
                <input type="url" placeholder="https://..." value={newItem.url} onChange={(e) => setNewItem({...newItem, url: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 focus:ring-2 focus:ring-blue-500/50 focus:outline-none transition-all" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-400 uppercase tracking-widest">開始日</label>
                  <input type="date" value={newItem.startDate} onChange={(e) => setNewItem({...newItem, startDate: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-600 focus:outline-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-400 uppercase tracking-widest">終了日</label>
                  <input type="date" value={newItem.endDate} onChange={(e) => setNewItem({...newItem, endDate: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-600 focus:outline-none" />
                </div>
              </div>
              
              <div className="space-y-2 bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100 mt-2">
                <div className="flex justify-between items-center font-black">
                  <label className="text-[10px] text-indigo-400 uppercase tracking-widest">現在の進捗率</label>
                  <span className="text-lg text-indigo-600">{newItem.ratio}%</span>
                </div>
                <input type="range" min="0" max="100" step="10" value={newItem.ratio} onChange={(e) => setNewItem({...newItem, ratio: Number(e.target.value)})} className="w-full accent-indigo-600 cursor-pointer h-2 bg-indigo-200 rounded-lg appearance-none" />
              </div>
            </div>
            
            <div className="flex gap-3 pt-2">
              <button onClick={() => setIsModalOpen(false)} className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 rounded-2xl font-bold text-slate-600 text-sm transition-colors">キャンセル</button>
              <button onClick={handleSaveItem} className="flex-1 py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black text-sm shadow-lg transition-colors">保存する</button>
            </div>
          </div>
        </div>
      )}

      {/* トースト通知 */}
      {toastInfo.show && (
        <div className={`fixed bottom-8 right-8 z-50 px-6 py-4 rounded-2xl shadow-2xl text-sm font-black text-white transform transition-all flex items-center gap-2 ${toastInfo.type === 'success' ? 'bg-slate-900' : 'bg-rose-600'}`}>
          {toastInfo.type === 'success' ? <CheckCircle2 size={20} className="text-emerald-400" /> : <AlertTriangle size={20} className="text-white" />}
          {toastInfo.msg}
        </div>
      )}
    </div>
  );
}