'use client';

import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  ScatterChart, Scatter, ZAxis, Cell, LabelList, Line, Legend, Area, ComposedChart
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { BrainCircuit, Bot, Zap, BarChart3, PieChart as PieChartIcon, ActivitySquare, Loader2, Globe, MapPin, Sparkles, TrendingUp, Target, Rocket, Leaf, MessageSquare, Search, Filter, Calendar } from 'lucide-react';

const GAS_API_URL = "/api/compare";

const SITE_AREA_MAP: { [key: string]: 'kanto' | 'kansai' | 'chubu' | 'cleanness' } = {
  "昭和冷蔵": "kanto", "asf南関東": "kanto", "AFS南関東": "kanto", "afs南関東": "kanto", "クラフトデリカ": "kanto", "ランドポート習志野": "kanto", "東急ストア": "kanto",
  "三井食品": "chubu", "afs尾西": "chubu", "AFS尾西": "chubu", "ヤマナカ": "chubu",
  "尾家産業": "kansai", "メディエントランス": "kansai", "カインズ神戸": "kansai", "カインズ福岡": "kansai",
  "尾西清盛": "cleanness", "尾西清掃": "cleanness", "兵庫清掃": "cleanness", "姫路清掃": "cleanness", "万代彩都": "cleanness", "万代綾都": "cleanness"
};

const LOCATION_NAME_MAP: { [key: string]: string } = {
  "afs-bisai": "afs尾西",
  "afs-minamikanto": "afs南関東",
  "cainz-kobe": "カインズ神戸",
  "medi-entrance": "メディエントランス",
  "mitsui-chubu": "三井食品",
  "oie-hannan": "尾家産業",
  "showa-reizo": "昭和冷蔵",
  "tokyu-store": "東急ストア",
  "yamanaka-shionagi": "ヤマナカ"
};

const getAreaForSite = (actualSiteName: string) => {
  if (!actualSiteName) return 'unknown';
  const matchedKey = Object.keys(SITE_AREA_MAP).find(key => actualSiteName.includes(key));
  return matchedKey ? SITE_AREA_MAP[matchedKey] : 'unknown';
};

interface LogisticsData {
  "現場名": string;
  "年月": string;
  "確定売上": number;
  "確定原価": number;
  "社員人数": number;
  "社員平均年齢": number;
  "スタッフ在籍者数": number;
  "スタッフ平均年齢": number;
  "社会保険加入人数": number;
  "事故件数（流通）": number;
  "事故件数（設備破壊）": number;
  "労災件数": number;
  "労務トラブル件数": number;
  "一般スタッフ採用時給": number;
  "最低賃金": number;
  "タイミー使用工数": number;
  "タイミー使用金額": number;
  "36協定違反者数": number;
  "社会保険": number;
  "雇用保険": number;
  "有給": number;
  "減価償却費": number;
  "事故費": number;
  "交通費": number;
  "27期予算": number;
  "実績_利益": number;
}

const AnimatedNumber = ({ value }: { value: string | number }) => {
  // 💡 安全装置：value が NaN だった場合は強制的に 0 に変換してクラッシュを防ぐ
  const safeValue = Number.isNaN(value) ? 0 : value;

  return (
    <motion.span
      key={String(safeValue)} // 💡 keyも安全に文字列へ変換
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="inline-block"
    >
      {safeValue}
    </motion.span>
  );
};

const DualRingChart = ({ 
  siteName, annualBudget, plannedSales, achievedSales 
}: { 
  siteName: string; annualBudget: number; plannedSales: number; achievedSales: number; 
}) => {
  const actualRatio = annualBudget > 0 ? (achievedSales / annualBudget) * 100 : 0;
  const planRatio = annualBudget > 0 ? (plannedSales / annualBudget) * 100 : 0;
  
  const radiusOuter = 58;
  const radiusInner = 44;
  const circOuter = 2 * Math.PI * radiusOuter;
  const circInner = 2 * Math.PI * radiusInner;
  
  const offsetOuter = circOuter - (Math.min(actualRatio, 100) / 100) * circOuter;
  const offsetInner = circInner - (Math.min(planRatio, 100) / 100) * circInner;

  const diff = achievedSales - plannedSales;
  const formatM = (val: number) => Math.round(val / 10000).toLocaleString() + '万';

  return (
    <div className="flex flex-col items-center p-4 w-[280px] bg-slate-50/50 rounded-2xl border border-slate-100 shadow-sm shrink-0">
      <div className="text-center w-full mb-2 border-b border-slate-100 pb-1.5">
        <h4 className="font-extrabold text-[#1e254c] text-xs truncate px-1" title={siteName}>{siteName}</h4>
      </div>
      
      <div className="relative w-[140px] h-[140px] flex items-center justify-center">
        <svg width="140" height="140" className="transform -rotate-90">
          <circle cx="70" cy="70" r={radiusOuter} stroke="#e2e8f0" strokeWidth="8" fill="none" />
          <circle cx="70" cy="70" r={radiusOuter} stroke="#00a6c0" strokeWidth="8" fill="none"
                  strokeDasharray={circOuter} strokeDashoffset={offsetOuter} strokeLinecap="round" className="transition-all duration-1000" />
          
          <circle cx="70" cy="70" r={radiusInner} stroke="#e2e8f0" strokeWidth="8" fill="none" />
          <circle cx="70" cy="70" r={radiusInner} stroke="#1e254c" strokeWidth="8" fill="none"
                  strokeDasharray={circInner} strokeDashoffset={offsetInner} strokeLinecap="round" className="transition-all duration-1000" />
        </svg>
        
        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className="text-[14px] font-black text-[#1e254c] tracking-tight">{formatM(achievedSales)}</span>
          <span className={`text-[11px] font-bold mt-0.5 ${diff >= 0 ? 'text-[#00a6c0]' : 'text-[#e6005c]'}`}>
            {diff >= 0 ? '+' : ''}{formatM(diff)}
          </span>
        </div>

        <div className="absolute top-0 left-0 text-[9px] font-bold text-[#00a6c0] bg-white/80 px-1 rounded">実績 {actualRatio.toFixed(0)}%</div>
        <div className="absolute bottom-0 left-0 text-[9px] font-bold text-[#1e254c] bg-white/80 px-1 rounded">予定 {planRatio.toFixed(0)}%</div>
        <div className="absolute top-0 right-0 text-[9px] font-bold text-slate-400 bg-white/80 px-1 rounded">予算:{formatM(annualBudget)}</div>
      </div>
    </div>
  );
};

export default function CompareDashboardPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [rawData, setRawData] = useState<LogisticsData[]>([]);
  const [months, setMonths] = useState<string[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  
  const [loading, setLoading] = useState<boolean>(true);
  const [rankingMode, setRankingMode] = useState<'sales' | 'profit'>('sales');
  const [selectedArea, setSelectedArea] = useState<'all' | 'kanto' | 'kansai' | 'chubu' | 'cleanness' | 'action'>('all');

  const [chappyAnalysis, setChappyAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentMonthStr, setCurrentMonthStr] = useState<string>('');

  const [dxItems, setDxItems] = useState<any[]>([]);
  const [envItems, setEnvItems] = useState<any[]>([]);
  const [historyItems, setHistoryItems] = useState<any[]>([]);
  const [actionSubTab, setActionSubTab] = useState<'dx' | 'env' | 'history'>('dx');
  const [actionLocationFilter, setActionLocationFilter] = useState<string>('all');
  const [actionMonthFilter, setActionMonthFilter] = useState<string>('all');
  const [actionSearchQuery, setActionSearchQuery] = useState<string>('');

  const fetchSupabaseAllData = async () => {
    try {
      const [dxRes, envRes, histRes] = await Promise.all([
        fetch(`/api/supabase`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ table: 'dx_actions', actionMethod: 'GET', query: '?order=id.asc' })
        }),
        fetch(`/api/supabase`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ table: 'env_actions', actionMethod: 'GET', query: '?order=id.asc' })
        }),
        fetch(`/api/supabase`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ table: 'sales_history', actionMethod: 'GET', query: '?order=id.asc' })
        })
      ]);

      if (dxRes.ok) setDxItems(await dxRes.json());
      if (envRes.ok) setEnvItems(await envRes.json());
      if (histRes.ok) setHistoryItems(await histRes.json());

    } catch (e) {
      console.error("Supabase Fetch Error:", e);
    }
  };

  useEffect(() => {
    setIsMounted(true);
    const fetchData = async () => {
      try {
        const res = await fetch(GAS_API_URL);
        const data = await res.json();
        if (!Array.isArray(data)) {
          console.error("Data error:", data);
          setLoading(false); return;
        }
        setRawData(data);
        
        const uniqueMonths = Array.from(new Set(data.map((item: any) => item["年月"]))).sort().reverse() as string[];
        setMonths(uniqueMonths);
        
        const now = new Date();
        const thisMonthStr = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}`;
        setCurrentMonthStr(thisMonthStr);
        
        if (uniqueMonths.includes(thisMonthStr)) setSelectedMonth(thisMonthStr);
        else if (uniqueMonths.length > 0) setSelectedMonth(uniqueMonths[0]);

        await fetchSupabaseAllData();

      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const monthFilteredData = rawData.filter(item => item["年月"] === selectedMonth);
  const filteredData = monthFilteredData.filter(item => {
    if (selectedArea === 'all' || selectedArea === 'action') return true;
    return getAreaForSite(item["現場名"]) === selectedArea;
  });

  const term27Months = [
    "2026/04", "2026/05", "2026/06", "2026/07", "2026/08", "2026/09",
    "2026/10", "2026/11", "2026/12", "2027/01", "2027/02", "2027/03"
  ];

  const term27Data = rawData.filter(item => {
    if (selectedArea !== 'all' && selectedArea !== 'action' && getAreaForSite(item["現場名"]) !== selectedArea) return false;
    return term27Months.includes(item["年月"]);
  });

  const parseTarget = (val: any) => {
    if (!val) return 0;
    if (typeof val === 'number') return val;
    return Number(String(val).replace(/,/g, '')) || 0;
  };

  const siteProgressData = Array.from(new Set(filteredData.map(item => item["現場名"]))).map(siteName => {
    const siteDataList = rawData.filter(d => d["現場名"] === siteName);
    const targetBudget = Math.max(...siteDataList.map(d => parseTarget(d["27期予算"])));
    
    const siteAchievedData = siteDataList.filter(d => term27Months.includes(d["年月"]) && d["年月"] <= selectedMonth);
    const achievedSales = siteAchievedData.reduce((sum, d) => sum + (d["確定売上"] || 0), 0);
    
    const plannedSales = (targetBudget / 12) * siteAchievedData.length;
    const progress = targetBudget > 0 ? (achievedSales / targetBudget) * 100 : 0;
    
    return { name: siteName, progress, annualBudget: targetBudget, plannedSales, achievedSales };
  }).sort((a, b) => b.progress - a.progress);

  const totalAnnualBudgetK2 = siteProgressData.reduce((sum, site) => sum + site.annualBudget, 0);

  let accBudget = 0;
  let accActual = 0;
  const cumulativeTrendData = term27Months.map(m => {
    const mData = term27Data.filter(d => d["年月"] === m);
    const mActual = mData.reduce((sum, d) => sum + (d["確定売上"] || 0), 0);
    const mTarget = mData.reduce((sum, d) => sum + (parseTarget(d["27期予算"]) / 12 || 0), 0); 
    
    accBudget += mTarget;
    let displayActual = null;
    if (m <= selectedMonth) {
      accActual += mActual;
      displayActual = accActual;
    }

    return { name: `${m.split('/')[1]}月`, "予算ペース (毎月累計)": accBudget, "27期 通期予算": totalAnnualBudgetK2, "累計実績売上": displayActual };
  });

  const annualProgressRate = totalAnnualBudgetK2 > 0 ? ((accActual / totalAnnualBudgetK2) * 100).toFixed(1) : "0.0";

  const getGrowthRate = () => {
    if (!selectedMonth || rawData.length === 0) return null;
    const [year, month] = selectedMonth.split('/').map(Number);
    const prevYear = month === 1 ? year - 1 : year;
    const prevMonth = month === 1 ? 12 : month - 1;
    const prevMonthStr = `${prevYear}/${String(prevMonth).padStart(2, '0')}`;

    const prevMonthData = rawData.filter(item => item["年月"] === prevMonthStr).filter(item => {
      if (selectedArea === 'all' || selectedArea === 'action') return true;
      return getAreaForSite(item["現場名"]) === selectedArea;
    });

    const prevSalesSum = prevMonthData.reduce((sum, item) => sum + (item["確定売上"] || 0), 0);
    if (prevSalesSum === 0) return null;
    return ((totalSales - prevSalesSum) / prevSalesSum) * 100;
  };

  const totalSales = filteredData.reduce((sum, item) => sum + (item["確定売上"] || 0), 0);
  const totalBudgetSales = filteredData.reduce((sum, item) => sum + (parseTarget(item["27期予算"]) / 12 || 0), 0);
  const totalProfit = filteredData.reduce((sum, item) => sum + (item["実績_利益"] || 0), 0);
  
  const achievementRate = totalBudgetSales > 0 ? Math.round((totalSales / totalBudgetSales) * 100) : 0;
  const avgProfitMargin = totalSales > 0 ? (totalProfit / totalSales) * 100 : 0;
  const growthRate = getGrowthRate();

  const sortedRankingData = [...filteredData]
    .sort((a, b) => rankingMode === 'sales' ? (b["確定売上"] || 0) - (a["確定売上"] || 0) : (b["実績_利益"] || 0) - (a["実績_利益"] || 0))
    .slice(0, 15);

  const maxBarValue = Math.max(...sortedRankingData.map(d => rankingMode === 'sales' ? (d["確定売上"] || 0) : (d["実績_利益"] || 0)), 1);

  const barChartData = sortedRankingData.map(item => {
    const value = rankingMode === 'sales' ? item["確定売上"] || 0 : item["実績_利益"] || 0;
    const monthlyTarget = (parseTarget(item["27期予算"]) / 12);
    
    let ratio = '-';
    if (rankingMode === 'sales') {
      ratio = monthlyTarget > 0 ? ((item["確定売上"] / monthlyTarget) * 100).toFixed(1) : '-';
    } else {
      ratio = item["確定売上"] > 0 ? ((item["実績_利益"] / item["確定売上"]) * 100).toFixed(1) : '-';
    }

    return {
      name: item["現場名"], value: value, maxValue: maxBarValue, 
      label: `${Math.round(value / 10000).toLocaleString()}万 (${ratio}%)`
    };
  });

  const bubbleChartData = filteredData.map(item => {
    const margin = item["確定売上"] > 0 ? ((item["実績_利益"] || 0) / item["確定売上"]) * 100 : 0;
    return { name: item["現場名"], x: item["確定売上"] || 0, y: margin, z: Math.max(Math.abs(margin), 10), profit: item["実績_利益"] || 0 };
  });

  const riskChartData = filteredData.map(item => ({
    name: item["現場名"],
    "流通事故": item["事故件数（流通）"] || 0,
    "設備破壊": item["事故件数（設備破壊）"] || 0,
    "労災": item["労災件数"] || 0,
    "労務トラブル": item["労務トラブル件数"] || 0,
    "36協定違反": item["36協定違反者数"] || 0,
    totalRisk: (item["事故件数（流通）"] || 0) + (item["事故件数（設備破壊）"] || 0) + (item["労災件数"] || 0) + (item["労務トラブル件数"] || 0) + (item["36協定違反者数"] || 0)
  })).sort((a, b) => b.totalRisk - a.totalRisk).slice(0, 15);

  const hrChartData = filteredData.map(item => ({
    name: item["現場名"],
    "タイミー使用金額": item["タイミー使用金額"] || 0,
    "採用時給": item["一般スタッフ採用時給"] || 0,
    "最低賃金": item["最低賃金"] || 0,
  })).sort((a, b) => b["タイミー使用金額"] - a["タイミー使用金額"]).slice(0, 15);

  const handleStartAnalysis = async () => {
    setIsAnalyzing(true);
    setChappyAnalysis(null);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      const isPastMonth = selectedMonth < currentMonthStr;
      
      const sitesWithRatio = filteredData
        .map(item => {
          const monthlyTarget = (parseTarget(item["27期予算"]) / 12);
          return { name: item["現場名"], ratio: monthlyTarget > 0 ? (item["確定売上"] / monthlyTarget) : 1 };
        })
        .filter(item => item.name);

      const goodSite = [...sitesWithRatio].sort((a, b) => b.ratio - a.ratio)[0]?.name || "該当なし";
      const badSite = [...sitesWithRatio].sort((a, b) => a.ratio - b.ratio)[0]?.name || "該当なし";
      const areaName = selectedArea === 'all' ? '全社' : selectedArea === 'kanto' ? '関東' : selectedArea === 'kansai' ? '関西' : selectedArea === 'chubu' ? '中部' : 'クリンネス';
      const growthText = growthRate !== null ? `前月比成長率は ${growthRate.toFixed(1)}% となっています。` : '';

      let metricsText = ""; let manhoursText = ""; let performanceText = "";

      if (isPastMonth) {
        metricsText = `【${areaName}確定期総評】最終的なエリア総確定売上は予測月次予算比${achievementRate}%を達成しました。${growthText}また、27期通期予算に対する累計進捗率は${annualProgressRate}%に到達。目標達成に最も貢献したのは「${goodSite}」であり、エリア全体の収益の柱として機能しています。この高効率なオペレーションを分析し、他現場への標準モデルとしてマニュアル化を進めるべきです。`;
        manhoursText = `【利益圧迫アラート】当月は「${badSite}」において、物量変動に対する人員配置のミスマッチが解消しきれず、最終日まで利益を圧迫しました。残業超過やタイミーの過剰投入が発生していないか、シフトと実働の乖離を至急洗い出してください。具体的な是正策を講じ、次月への課題として振り返りを徹底する必要があります。`;
        performanceText = `【パフォーマンス】エリア平均粗利益率は${avgProfitMargin.toFixed(1)}%で確定しました。一定の健全性は保っていますが、下位現場の労務費コントロールの甘さが全体の利益額を相殺しています。高利益率を維持している上位現場の要員配置スキームや作業導線を体系化し、全現場へ横展開する仕組みを構築してください。ボトムアップだけで全社利益はさらに改善します。`;
      } else {
        metricsText = `【${areaName}当月着地予測】現在のペースを維持した場合、月末の確定売上は予測月次予算比約${achievementRate}%に到達する見込みです。${growthText}27期の通期予算に対する累計進捗率は${annualProgressRate}%で推移中。現時点では「${goodSite}」の利益創出能力が非常に高く、目標達成に向けて全体を牽引する原動力となっています。この好調を維持しつつ、突発的な物量変動リスクへの体制構築を図ってください。`;
        manhoursText = `【超過アラート】現在「${badSite}」の売上に対する労務費比率が急増しており、放置すると当月の全体の着地利益を大きく圧迫するリスクがあります。残業の常態化やシフトのアンマッチがないか、至急現場マネージャーと連携して現状の工数コントロールを再点検してください。特に月末に向け、過剰な労務費が発生しないよう先行管理が必要です。`;
        performanceText = `【パフォーマンス】現時点のエリア平均粗利益率は${avgProfitMargin.toFixed(1)}%で推移しています。予算を下回っている課題現場の要員投入ペースを早急に是正することが最優先事項です。労務費が急増しているラインに対して詳細な工数分析を実行し、ボトルネックを排除することで、今月末までに全体の利益額を大幅に引き上げることが十分に期待できます。`;
      }
      setChappyAnalysis({ summaryMetrics: metricsText, summaryManhours: manhoursText, summaryPerformance: performanceText });
    } catch (err) {
      setChappyAnalysis({ summaryMetrics: `【通信エラー】AIとの接続に失敗しました。`, summaryManhours: "APIの通信状況を確認してください。", summaryPerformance: "-" });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getCellStyles = (ratio: number, base: number) => {
    if (ratio >= base * 1.1) return { backgroundColor: '#10b981', color: '#ffffff' }; 
    if (ratio >= base) return { backgroundColor: '#d1fae5', color: '#065f46' };       
    if (ratio >= base * 0.9) return { backgroundColor: '#ffe4e6', color: '#9f1239' }; 
    return { backgroundColor: '#f43f5e', color: '#ffffff' };                           
  };

  const modernTooltipStyle = {
    backgroundColor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(8px)', border: 'none', borderRadius: '12px',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)', fontWeight: 'bold', color: '#1e293b', padding: '12px'
  };

  const areaDisplayName = selectedArea === 'all' ? '全社' : selectedArea === 'action' ? 'アクション一覧' : selectedArea === 'kanto' ? '関東エリア' : selectedArea === 'kansai' ? '関西エリア' : selectedArea === 'chubu' ? '中部エリア' : 'クリンネス部門';

  const actionAvailableMonths = Array.from(new Set(
    [...dxItems, ...envItems, ...historyItems].map(item => {
      const d = item.date || item.start_date;
      if (!d) return null;
      const parts = d.replace(/-/g, '/').split('/');
      if (parts.length >= 2) return `${parts[0]}/${parts[1]}`;
      return null;
    }).filter(Boolean)
  )).sort().reverse() as string[];

  const currentActionList = actionSubTab === 'dx' ? dxItems : (actionSubTab === 'env' ? envItems : historyItems);
  
  const filteredActionList = currentActionList.filter(item => {
    const matchLoc = actionLocationFilter === 'all' || item.location_id === actionLocationFilter;
    const searchStr = actionSearchQuery.toLowerCase();
    const matchSearch = actionSubTab === 'history'
      ? (item.client?.toLowerCase().includes(searchStr) || item.proposal?.toLowerCase().includes(searchStr) || item.detail?.toLowerCase().includes(searchStr))
      : (item.name?.toLowerCase().includes(searchStr) || item.effect?.toLowerCase().includes(searchStr));

    let matchMonth = true;
    if (actionMonthFilter !== 'all') {
      const d = item.date || item.start_date;
      if (!d) {
        matchMonth = false;
      } else {
        const normalized = d.replace(/-/g, '/'); 
        matchMonth = normalized.startsWith(actionMonthFilter);
      }
    }
    return matchLoc && matchSearch && matchMonth;
  }).sort((a, b) => {
    const dateA = new Date((a.date || a.start_date || '').replace(/-/g, '/')).getTime() || 0;
    const dateB = new Date((b.date || b.start_date || '').replace(/-/g, '/')).getTime() || 0;
    return dateB - dateA;
  });

  const actionChartDataMap: { [key: string]: number } = {};
  Object.keys(LOCATION_NAME_MAP).forEach(k => actionChartDataMap[k] = 0);
  filteredActionList.forEach(item => { 
    if (actionChartDataMap[item.location_id] !== undefined) {
      actionChartDataMap[item.location_id]++;
    }
  });
  const actionChartData = Object.keys(actionChartDataMap).map(k => ({
    name: LOCATION_NAME_MAP[k],
    count: actionChartDataMap[k]
  })).sort((a, b) => b.count - a.count);

  // 🛡️ 変更箇所：ローディング画面を「全社統括ボード」らしいダークテーマに進化させました！
  if (loading || !isMounted) {
    return (
      <div className="h-screen w-full bg-slate-900 flex flex-col items-center justify-center relative overflow-hidden notranslate" translate="no">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/20 rounded-full blur-[120px] pointer-events-none animate-pulse" />
        <div className="relative z-10 flex flex-col items-center">
          <div className="bg-white px-6 py-3.5 rounded-2xl mb-8 shadow-lg border border-slate-700/50">
            <img src="/pal-logo.png" alt="PAL Logo" className="h-8 md:h-10 w-auto object-contain" />
          </div>
          <h1 className="text-2xl md:text-3xl font-black uppercase tracking-[0.2em] mb-8 text-white text-center px-4 drop-shadow-md">
            <span className="text-blue-400">PAL</span> HQ Strategic Board
          </h1>
          <div className="w-64 h-1.5 bg-slate-800 rounded-full overflow-hidden mb-6 shadow-inner relative border border-slate-700">
            <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-indigo-400 rounded-full w-1/2" style={{ animation: 'loading-slide 2s ease-in-out infinite' }} />
          </div>
          <div className="flex items-center gap-3 text-slate-400">
            <Loader2 className="animate-spin text-blue-400" size={18} />
            <span className="text-[11px] font-bold tracking-widest uppercase">Connecting to HQ Database...</span>
          </div>
        </div>
        <style dangerouslySetInnerHTML={{__html: `@keyframes loading-slide { 0% { transform: translateX(-100%); width: 50%; } 100% { transform: translateX(250%); width: 50%; } }`}} />
      </div>
    );
  }
  return (
    <div className="flex h-screen w-full bg-[#f4f6f8] text-slate-800 font-sans overflow-hidden notranslate" translate="no">
      
      <svg width="0" height="0">
        <defs>
          <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#f87171" stopOpacity={1}/><stop offset="100%" stopColor="#ec4899" stopOpacity={1}/>
          </linearGradient>
          <linearGradient id="areaActual" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/></linearGradient>
          <radialGradient id="bubbleGrad" cx="30%" cy="30%" r="70%"><stop offset="0%" stopColor="#38bdf8" stopOpacity={0.8}/><stop offset="100%" stopColor="#0284c7" stopOpacity={0.4}/></radialGradient>
          <linearGradient id="actionBarGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity={1}/><stop offset="100%" stopColor="#8b5cf6" stopOpacity={1}/>
          </linearGradient>
        </defs>
      </svg>

      <aside className="w-16 md:w-20 bg-white border-r border-slate-200 flex flex-col items-center py-4 space-y-3 shrink-0 z-10 shadow-sm">
        <a href="https://palproductivity-dashboard.vercel.app/" className="p-2 text-slate-400 hover:text-blue-600 transition-colors mb-2">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 0 001 1m-6 0h6"/></svg>
        </a>
        <div className="w-full border-t border-slate-100 my-1"></div>
        {['all', 'kanto', 'chubu', 'kansai', 'cleanness', 'action'].map((area) => (
          <button 
            key={area} onClick={() => { setSelectedArea(area as any); setChappyAnalysis(null); }} 
            className={`w-12 h-12 md:w-14 md:h-14 rounded-xl flex flex-col items-center justify-center gap-0.5 md:gap-1 transition-all text-[9px] md:text-[10px] font-black ${selectedArea === area ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-700'}`}
          >
            {area === 'all' ? <Globe size={15} /> : area === 'action' ? <Rocket size={15} /> : area === 'cleanness' ? <Sparkles size={15} /> : <MapPin size={15} />}
            <span>{area === 'all' ? '全社' : area === 'kanto' ? '関東' : area === 'chubu' ? '中部' : area === 'kansai' ? '関西' : area === 'cleanness' ? 'ｸﾘﾝﾈｽ' : 'ｱｸｼｮﾝ'}</span>
          </button>
        ))}
      </aside>

      <main className="flex-1 flex flex-col h-full overflow-hidden w-full relative">
        <header className="px-4 md:px-6 py-4 flex items-end justify-between shrink-0 bg-white border-b border-slate-200 z-30">
          <div className="flex items-center gap-2 md:gap-3">
            <svg className="w-6 h-6 md:w-8 md:h-8 text-blue-700" viewBox="0 0 24 24" fill="currentColor"><path d="M3 3h2v18H3zm4 14h2v4H7zm4-6h2v10h-2zm4-4h2v14h-2zm4-4h2v18h-2z"/></svg>
            <h1 className="text-lg md:text-2xl font-extrabold text-slate-800 tracking-tight">{areaDisplayName} {selectedArea === 'action' ? '管理ボード' : '業績比較ダッシュボード'}</h1>
          </div>
          {selectedArea !== 'action' && (
            <div className="flex gap-2">
              <select value={selectedMonth} onChange={(e) => { setSelectedMonth(e.target.value); setChappyAnalysis(null); }} className="bg-white border border-slate-300 text-slate-700 rounded px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm font-medium shadow-sm">
                {months.map(m => <option key={m} value={m}>{m}度 (実績)</option>)}
              </select>
            </div>
          )}
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6 w-full space-y-6">
          
          {selectedArea === 'action' ? (
            <div className="flex flex-col h-full gap-4">
              <div className="flex flex-col lg:flex-row justify-between items-center gap-4 shrink-0 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex bg-slate-100 p-1 rounded-lg w-full lg:w-auto overflow-x-auto">
                  {[
                    { id: 'dx', label: 'DX推進', icon: <Rocket size={14}/>, color: 'text-purple-600' },
                    { id: 'env', label: '現場改善', icon: <Leaf size={14}/>, color: 'text-emerald-600' },
                    { id: 'history', label: '営業履歴', icon: <MessageSquare size={14}/>, color: 'text-rose-600' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActionSubTab(tab.id as any)}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-black transition-all whitespace-nowrap ${actionSubTab === tab.id ? 'bg-white shadow-sm ' + tab.color : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      {tab.icon} {tab.label}
                    </button>
                  ))}
                </div>
                
                <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                  <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg shrink-0">
                    <Calendar size={14} className="text-slate-400" />
                    <select
                      value={actionMonthFilter}
                      onChange={(e) => setActionMonthFilter(e.target.value)}
                      className="bg-transparent text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
                    >
                      <option value="all">すべての月</option>
                      {actionAvailableMonths.map(m => (
                        <option key={m} value={m}>{m}度</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg shrink-0">
                    <Filter size={14} className="text-slate-400" />
                    <select
                      value={actionLocationFilter}
                      onChange={(e) => setActionLocationFilter(e.target.value)}
                      className="bg-transparent text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
                    >
                      <option value="all">すべての拠点</option>
                      {Object.keys(LOCATION_NAME_MAP).map(key => (
                        <option key={key} value={key}>{LOCATION_NAME_MAP[key]}</option>
                      ))}
                    </select>
                  </div>
                  <div className="relative w-full lg:w-64 shrink-0">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="text" placeholder="キーワード検索..." value={actionSearchQuery} onChange={(e) => setActionSearchQuery(e.target.value)} className="w-full bg-white border border-slate-200 text-xs font-bold text-slate-700 pl-8 pr-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
              </div>

              <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-[500px]">
                <div className="w-full lg:w-[60%] flex flex-col gap-3 overflow-y-auto custom-scrollbar pr-2 h-[600px] lg:h-full">
                  {filteredActionList.length === 0 ? (
                    <div className="h-full flex items-center justify-center bg-white rounded-xl border border-slate-200 border-dashed text-slate-400 font-bold text-sm">
                      該当するデータがありません。
                    </div>
                  ) : (
                    filteredActionList.map((item, i) => (
                      <div key={i} className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm flex flex-col sm:flex-row gap-4 items-start sm:items-center hover:shadow-md transition-all">
                        {actionSubTab !== 'history' ? (
                          <>
                            <div className="w-16 h-16 shrink-0 relative flex items-center justify-center bg-slate-50 rounded-full border border-slate-100">
                              <span className="text-lg font-black" style={{ color: actionSubTab === 'dx' ? '#9333ea' : '#10b981' }}>{item.ratio || 0}%</span>
                            </div>
                            <div className="flex-1 space-y-2 w-full">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="px-2 py-0.5 rounded text-[10px] font-black bg-slate-800 text-white shadow-sm">
                                  {LOCATION_NAME_MAP[item.location_id] || '拠点不明'}
                                </span>
                                {item.start_date && <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">📅 {item.start_date}</span>}
                                {item.customer_related === 'あり' && <span className="text-[10px] font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-100">顧客関連</span>}
                              </div>
                              <h3 className="text-sm font-black text-slate-900 leading-tight">{item.name}</h3>
                              {item.effect && item.effect !== '未入力' && <p className="text-[11px] font-medium text-slate-600 line-clamp-2">💡 {item.effect}</p>}
                            </div>
                          </>
                        ) : (
                          <div className="flex-1 space-y-2 w-full">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-slate-800 text-white shadow-sm">
                                {LOCATION_NAME_MAP[item.location_id] || '拠点不明'}
                              </span>
                              <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded font-mono">📅 {item.date || '未設定'}</span>
                              <span className={`text-[10px] font-black px-2 py-0.5 rounded border ${item.result === '●' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>結果: {item.result}</span>
                            </div>
                            <h3 className="text-sm font-black text-slate-900">{item.client}</h3>
                            {item.proposal && <p className="text-[11px] font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded inline-block">提案: {item.proposal}</p>}
                            {item.detail && <p className="text-[11px] font-medium text-slate-600 whitespace-pre-wrap">{item.detail}</p>}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>

                <div className="w-full lg:w-[40%] bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-col h-[400px] lg:h-[600px] sticky top-0">
                  <div className="mb-4 shrink-0 border-b border-slate-100 pb-2">
                    <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                      <BarChart3 size={16} className="text-blue-600" />
                      拠点別 アクション登録件数
                    </h3>
                    <p className="text-[10px] text-slate-400 font-bold mt-1">
                      選択中のサブタブ ({actionSubTab === 'dx' ? 'DX推進' : actionSubTab === 'env' ? '現場改善' : '営業履歴'}) の件数比較
                    </p>
                  </div>
                  <div className="flex-1 w-full min-h-0 relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={actionChartData} layout="vertical" margin={{ top: 0, right: 30, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" width={90} tick={{ fontSize: 10, fill: '#475569', fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                        <RechartsTooltip 
                          cursor={{ fill: 'rgba(241, 245, 249, 0.5)' }} 
                          contentStyle={modernTooltipStyle}
                          formatter={(val: any) => [`${val} 件`, '該当件数']}
                        />
                        <Bar dataKey="count" fill="url(#actionBarGrad)" radius={[0, 6, 6, 0]} barSize={20} animationDuration={1000}>
                          <LabelList dataKey="count" position="right" fill="#64748b" fontSize={11} fontWeight="bold" formatter={(val: any) => `${val}件`} />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-5 w-full">
              
              {/* 4大KPIボックス */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 shrink-0 w-full">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-col justify-between relative overflow-hidden h-24 md:h-28">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-full blur-2xl -mr-8 -mt-8 pointer-events-none"></div>
                  <p className="text-xs md:text-sm font-bold text-slate-800 relative z-10">総確定売上</p>
                  <div className="flex items-end justify-between relative z-10">
                    <div>
                      <p className="text-xl md:text-3xl font-extrabold text-slate-900 tracking-tight"><AnimatedNumber value={ `¥${(totalSales/10000).toLocaleString(undefined, {maximumFractionDigits: 0})}` }/><span className="text-xs md:text-sm font-bold text-slate-500 ml-0.5">万</span></p>
                      <div className="flex flex-wrap items-center gap-2 mt-0.5 text-[10px] font-bold"><span className={achievementRate >= 100 ? 'text-emerald-600' : 'text-rose-500'}>予測月次予算比 {achievementRate}%</span>{growthRate !== null && <span className={growthRate >= 0 ? 'text-emerald-600' : 'text-rose-500'}>前月比 {growthRate >= 0 ? `+${growthRate.toFixed(1)}%` : `${growthRate.toFixed(1)}%`}</span>}</div>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-col justify-center h-24 md:h-28"><p className="text-xs md:text-sm font-bold text-slate-800 mb-0.5">当月予測達成率</p><p className="text-xl md:text-3xl font-extrabold text-slate-900"><AnimatedNumber value={ achievementRate }/><span className="text-xs md:text-sm font-bold text-slate-500 ml-0.5">%</span></p></div>
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-col justify-center h-24 md:h-28"><p className="text-xs md:text-sm font-bold text-slate-800 mb-0.5">平均利益率</p><p className="text-xl md:text-3xl font-extrabold text-slate-900"><AnimatedNumber value={ avgProfitMargin.toFixed(1) }/><span className="text-xs md:text-sm font-bold text-slate-500 ml-0.5">%</span></p></div>
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-col justify-center h-24 md:h-28"><p className="text-xs md:text-sm font-bold text-slate-800 mb-0.5">稼働現場数</p><p className="text-xl md:text-3xl font-extrabold text-slate-900"><AnimatedNumber value={ filteredData.length }/><span className="text-xs md:text-sm font-bold text-slate-500 ml-0.5">現場</span></p></div>
              </div>

              {selectedArea !== 'all' && (
                <AnimatePresence>
                  <div className="flex flex-col lg:flex-row gap-4 w-full shrink-0 min-h-[340px]">
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="w-full lg:w-[65%] bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-col overflow-hidden h-[340px] lg:h-auto min-w-0">
                      <h3 className="text-xs font-bold text-slate-900 flex items-center gap-2 mb-3 shrink-0"><Target size={14} className="text-emerald-600" />現場別 通期27期予算進捗状況</h3>
                      
                      <div className="flex-1 flex flex-nowrap gap-3 overflow-x-auto custom-scrollbar pb-2 items-center w-full min-w-0 scroll-smooth">
                        {siteProgressData.map((site, index) => (
                          <motion.div key={site.name} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: index * 0.04 }} className="shrink-0">
                            <DualRingChart siteName={site.name} annualBudget={site.annualBudget} plannedSales={site.plannedSales} achievedSales={site.achievedSales} />
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="w-full lg:w-[35%] bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-col h-[300px] lg:h-auto">
                      <div className="flex justify-between items-center mb-2 shrink-0">
                        <div>
                          <h3 className="text-xs font-bold text-slate-900 flex items-center gap-2"><TrendingUp size={14} className="text-blue-600" />27期 通期累計売上 進捗トレンド</h3>
                        </div>
                        <div className="bg-blue-50 px-2.5 py-1 rounded border border-blue-100 text-center">
                          <span className="text-[9px] text-blue-600 block font-black leading-none mb-0.5">通期進捗率</span>
                          <span className="text-sm font-black text-blue-700 leading-none">{annualProgressRate}%</span>
                        </div>
                      </div>
                      <div className="flex-1 w-full min-h-0 relative">
                        <ResponsiveContainer width="100%" height="100%">
                          <ComposedChart data={cumulativeTrendData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b', fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                            <YAxis tickFormatter={(v: any) => `${Math.round(Number(v)/10000).toLocaleString()}万`} tick={{ fontSize: 10, fill: '#64748b', fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                            <RechartsTooltip contentStyle={modernTooltipStyle} formatter={(val: any) => `¥${Number(val).toLocaleString()}`} />
                            <Legend wrapperStyle={{ fontSize: 10, fontWeight: 'bold' }} />
                            <Bar dataKey="累計実績売上" name="累計実績売上" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={20} />
                            <Line type="step" dataKey="27期 通期予算" name="通期予算ゴール" stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="5 5" dot={false} activeDot={false} />
                            <Line type="monotone" dataKey="予算ペース (毎月累計)" stroke="#94a3b8" strokeWidth={1.2} strokeDasharray="4 4" dot={false} activeDot={false} />
                          </ComposedChart>
                        </ResponsiveContainer>
                      </div>
                    </motion.div>
                  </div>
                </AnimatePresence>
              )}

              <div className="flex flex-col lg:flex-row gap-4 h-auto lg:h-[320px] shrink-0 w-full">
                
                <div className="w-full lg:w-1/2 bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-col h-[320px] lg:h-full min-w-0">
                  <div className="flex items-center justify-between mb-2 shrink-0">
                    <h3 className="text-sm font-bold text-slate-900">現場別 {rankingMode === 'sales' ? '確定売上' : '実績利益'}ランキング</h3>
                    <div className="flex bg-slate-100 p-0.5 rounded-md text-xs">
                      <button onClick={() => setRankingMode('sales')} className={`px-2.5 py-1 rounded font-bold ${rankingMode === 'sales' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}>確定売上</button>
                      <button onClick={() => setRankingMode('profit')} className={`px-2.5 py-1 rounded font-bold ${rankingMode === 'profit' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}>実績利益</button>
                    </div>
                  </div>
                  <div className="flex-1 w-full min-h-0 relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={barChartData} layout="vertical" margin={{ top: 5, right: 140, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                        <XAxis type="number" hide domain={[0, maxBarValue]} xAxisId={0} />
                        <XAxis type="number" hide domain={[0, maxBarValue]} xAxisId={1} />
                        <YAxis dataKey="name" type="category" width={110} interval={0} tickFormatter={(v: any) => String(v).length > 8 ? `${String(v).slice(0, 8)}…` : v} tick={{ fontSize: 11, fill: '#374151', textAnchor: 'end', dy: 4 }} axisLine={false} tickLine={false} />
                        <RechartsTooltip 
                          cursor={{ fill: 'rgba(241, 245, 249, 0.5)' }} 
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const d = payload.find((p: any) => p.dataKey === 'value')?.payload || payload[0].payload;
                              if (!d) return null;
                              return (
                                <div style={modernTooltipStyle}>
                                  <p className="font-extrabold text-slate-900 border-b border-slate-100 pb-1 mb-1">{d.name}</p>
                                  <p className="text-pink-600 text-xs font-bold">
                                    {rankingMode === 'sales' ? '確定売上：' : '実績利益：'}
                                    {`${Math.round(Number(d.value) / 10000).toLocaleString()}万`}
                                  </p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Bar dataKey="maxValue" fill="#f3f4f6" radius={[0, 6, 6, 0]} barSize={14} animationDuration={0} xAxisId={0} />
                        <Bar dataKey="value" fill="url(#barGradient)" radius={[0, 6, 6, 0]} barSize={14} animationDuration={1000} xAxisId={1}>
                          <LabelList dataKey="label" position="right" fill="#ec4899" fontSize={11} fontWeight="bold" offset={10} />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="w-full lg:w-1/2 bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-col h-[320px] lg:h-full min-w-0">
                  <h3 className="text-sm font-bold text-slate-900 mb-2">確定売上 vs. 利益率</h3>
                  <div className="flex-1 w-full min-h-0 relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <ScatterChart margin={{ top: 20, right: 20, bottom: 25, left: -10 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cbd5e1" opacity={0.6} />
                        <XAxis type="number" dataKey="x" tickFormatter={(v: any) => `${(Number(v)/10000).toFixed(0)}万`} stroke="#94a3b8" fontSize={11} axisLine={false} tickLine={false} label={{ value: '確定売上', position: 'bottom', fontSize: 11, offset: 5 }} />
                        <YAxis type="number" dataKey="y" tickFormatter={(v: any) => `${Number(v)}%`} stroke="#94a3b8" fontSize={11} axisLine={false} tickLine={false} label={{ value: '利益率', angle: -90, position: 'insideLeft', fontSize: 11 }} />
                        <ZAxis type="number" dataKey="z" range={[200, 3500]} />
                        <RechartsTooltip cursor={{ strokeDasharray: '3 3', stroke: '#94a3b8' }} content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const d = payload[0].payload;
                            return (
                              <div style={modernTooltipStyle}>
                                <p className="font-extrabold text-slate-900 mb-1 border-b border-slate-100 pb-1">{d.name}</p>
                                <p className="text-slate-600 text-xs">利益率: {Number(d.y).toFixed(1)}%</p>
                              </div>
                            );
                          }
                          return null;
                        }} />
                        <Scatter data={bubbleChartData.filter(i=>i.x>0)} isAnimationActive={false}>
                          {bubbleChartData.filter(i=>i.x>0).map((entry, index) => <Cell key={`cell-${index}`} fill="url(#bubbleGrad)" stroke="#0284c7" strokeWidth={1.5} />)}
                          <LabelList dataKey="name" position="bottom" fill="#334155" fontSize={10} offset={14} fontWeight="bold" />
                        </Scatter>
                      </ScatterChart>
                    </ResponsiveContainer>
                  </div>
                </div>

              </div>

              <div className="flex flex-col lg:flex-row gap-4 h-auto lg:h-[320px] shrink-0 w-full">
                
                <div className="w-full lg:w-1/2 bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-col h-[320px] lg:h-full min-w-0">
                  <div className="flex items-center justify-between mb-2 shrink-0">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5"><ActivitySquare size={16} className="text-rose-600"/> 現場別 コンプライアンス・リスク発生状況</h3>
                  </div>
                  <div className="flex-1 w-full min-h-0 relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={riskChartData} margin={{ top: 20, right: 30, left: -20, bottom: 25 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="name" interval={0} tickFormatter={(v: any) => String(v).length > 5 ? `${String(v).slice(0, 5)}…` : v} tick={{ fontSize: 9, fill: '#64748b', fontWeight: 'bold' }} axisLine={false} tickLine={false} angle={-30} textAnchor="end" />
                        <YAxis tick={{ fontSize: 10, fill: '#64748b', fontWeight: 'bold' }} axisLine={false} tickLine={false} allowDecimals={false} />
                        <RechartsTooltip contentStyle={modernTooltipStyle} cursor={{fill: '#f1f5f9'}} />
                        <Legend wrapperStyle={{ fontSize: 10, fontWeight: 'bold' }} verticalAlign="top" />
                        
                        <Bar dataKey="36協定違反" stackId="a" fill="#e11d48" name="36協定違反" />
                        <Bar dataKey="労災" stackId="a" fill="#f59e0b" name="労災件数" />
                        <Bar dataKey="流通事故" stackId="a" fill="#3b82f6" name="流通事故" />
                        <Bar dataKey="設備破壊" stackId="a" fill="#8b5cf6" name="設備破壊" />
                        <Bar dataKey="労務トラブル" stackId="a" fill="#64748b" name="労務トラブル" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="w-full lg:w-1/2 bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-col h-[320px] lg:h-full min-w-0">
                  <div className="flex items-center justify-between mb-2 shrink-0">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5"><TrendingUp size={16} className="text-purple-600"/> タイミー使用金額 vs 採用時給</h3>
                  </div>
                  <div className="flex-1 w-full min-h-0 relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={hrChartData} margin={{ top: 20, right: 0, left: -10, bottom: 25 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="name" interval={0} tickFormatter={(v: any) => String(v).length > 5 ? `${String(v).slice(0, 5)}…` : v} tick={{ fontSize: 9, fill: '#64748b', fontWeight: 'bold' }} axisLine={false} tickLine={false} angle={-30} textAnchor="end" />
                        
                        <YAxis yAxisId="left" tickFormatter={(v: any) => `${Math.round(Number(v)/10000)}万`} tick={{ fontSize: 10, fill: '#3b82f6', fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                        <YAxis yAxisId="right" orientation="right" domain={['dataMin - 50', 'dataMax + 50']} tickFormatter={(v: any) => `¥${v}`} tick={{ fontSize: 10, fill: '#ec4899', fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                        
                        <RechartsTooltip contentStyle={modernTooltipStyle} cursor={{fill: '#f1f5f9'}} />
                        <Legend wrapperStyle={{ fontSize: 10, fontWeight: 'bold' }} verticalAlign="top" />
                        
                        <Bar yAxisId="left" dataKey="タイミー使用金額" fill="#3b82f6" name="タイミー使用金額" radius={[4, 4, 0, 0]} barSize={20} />
                        <Line yAxisId="right" type="monotone" dataKey="採用時給" stroke="#ec4899" strokeWidth={2} name="一般採用時給" dot={{ r: 3 }} />
                        <Line yAxisId="right" type="step" dataKey="最低賃金" stroke="#94a3b8" strokeWidth={1.5} strokeDasharray="3 3" name="最低賃金" dot={false} />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </div>

              </div>

              <div className="flex flex-col lg:flex-row gap-4 w-full shrink-0">
                <div className="w-full lg:w-1/2 bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-col h-auto">
                  <h3 className="text-sm font-bold text-slate-900 mb-2">現場別 KPIヒートマップ</h3>
                  <div className="flex-1 w-full overflow-x-auto">
                    <table className="w-full text-[11px] text-center border-collapse whitespace-nowrap">
                      <thead>
                        <tr className="text-slate-700 font-bold border-b border-slate-200">
                          <th className="py-1 text-left pl-2 bg-white">現場名</th>
                          <th className="py-1 bg-white">予測月次予算比</th>
                          <th className="py-1 bg-white">利益率</th>
                          <th className="py-1 pr-2 bg-white">実績利益</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredData.map((item, i) => {
                          const monthlyTarget = (parseTarget(item["27期予算"]) / 12);
                          const sRatio = monthlyTarget > 0 ? (item["確定売上"] / monthlyTarget) : 1;
                          const pMargin = item["確定売上"] > 0 ? (item["実績_利益"] / item["確定売上"]) : 0;
                          
                          const displayProfit = Number(item["実績_利益"]) || 0;
                          
                          const sRatioStyle = getCellStyles(sRatio, 1);
                          const pMarginStyle = getCellStyles(pMargin, 0.15);
                          const profitStyle = displayProfit >= 0 
                            ? { backgroundColor: '#d1fae5', color: '#065f46' } 
                            : { backgroundColor: '#ffe4e6', color: '#9f1239' };
                          
                          return (
                            <tr key={i} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                              <td className="py-0.5 text-left font-bold text-slate-700 pl-2">{item["現場名"]}</td>
                              <td className="py-0.5 font-extrabold border-l border-white shadow-inner" style={sRatioStyle}>
                                {(sRatio * 100).toFixed(1)}%
                              </td>
                              <td className="py-0.5 font-extrabold border-l border-white shadow-inner" style={pMarginStyle}>
                                {(pMargin * 100).toFixed(1)}%
                              </td>
                              <td className="py-0.5 pr-2 font-extrabold border-l border-white shadow-inner" style={profitStyle}>
                                ¥{Math.round(displayProfit).toLocaleString()}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="w-full lg:w-1/2 flex flex-col h-[350px] lg:h-auto">
                  <div className="flex-1 bg-white border border-slate-200 p-5 md:p-6 rounded-xl relative overflow-hidden flex flex-col shadow-sm">
                    <div className="flex items-center gap-2 md:gap-3 mb-4 shrink-0">
                      <BrainCircuit size={20} className="text-blue-600" />
                      <h3 className="text-base md:text-md font-black text-slate-900">AI組織分析 (chatGPT)</h3>
                    </div>

                    <div className="flex-1 overflow-hidden h-full">
                      {!chappyAnalysis && !isAnalyzing ? (
                        <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 px-4 py-10">
                          <Bot size={40} className="text-slate-400 mb-3" />
                          <p className="text-slate-600 font-bold text-xs md:text-sm mb-4 text-center">選択エリアの最新データに基づくAI経営分析を生成します。</p>
                          <button onClick={handleStartAnalysis} className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-black tracking-widest transition-all shadow-[0_0_20px_rgba(37,99,235,0.15)] flex items-center gap-2 hover:scale-105 active:scale-95">
                            <Zap size={16} />AI診断をスタート
                          </button>
                        </div>
                      ) : isAnalyzing ? (
                        <div className="h-full grid grid-cols-1 lg:grid-cols-3 gap-4">
                          {[1, 2, 3].map(i => (
                            <div key={i} className="flex-1 bg-slate-50 border border-slate-100 p-4 rounded-xl space-y-2 animate-pulse"><div className="h-3 bg-slate-200 rounded-md w-1/4"></div><div className="h-2 bg-slate-100 rounded-md w-full"></div><div className="h-2 bg-slate-100 rounded-md w-full"></div></div>
                          ))}
                        </div>
                      ) : (
                        <div className="h-full grid grid-cols-1 lg:grid-cols-3 gap-4 overflow-y-auto pr-2 custom-scrollbar">
                          <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl shadow-sm flex flex-col justify-start">
                            <h4 className="flex items-center gap-1.5 text-xs md:text-sm font-black text-emerald-700 mb-2 shrink-0"><BarChart3 size={14}/> 1. 主要指標評価</h4>
                            <p className="text-slate-700 text-[10px] md:text-[11px] leading-relaxed font-medium whitespace-pre-wrap">{chappyAnalysis.summaryMetrics}</p>
                          </div>
                          <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl shadow-sm flex flex-col justify-start">
                            <h4 className="flex items-center gap-1.5 text-xs md:text-sm font-black text-amber-700 mb-2 shrink-0"><PieChartIcon size={14}/> 2. 工数内訳分析</h4>
                            <p className="text-slate-700 text-[10px] md:text-[11px] leading-relaxed font-medium whitespace-pre-wrap">{chappyAnalysis.summaryManhours}</p>
                          </div>
                          <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl shadow-sm flex flex-col justify-start">
                            <h4 className="flex items-center gap-1.5 text-xs md:text-sm font-black text-purple-700 mb-2 shrink-0"><ActivitySquare size={14}/> 3. 次月是正策</h4>
                            <p className="text-slate-700 text-[10px] md:text-[11px] leading-relaxed font-medium whitespace-pre-wrap">{chappyAnalysis.summaryPerformance}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { height: 6px; width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}} />
    </div>
  );
}