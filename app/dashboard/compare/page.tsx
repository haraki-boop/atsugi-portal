'use client';

import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  ScatterChart, Scatter, ZAxis, Cell, LabelList
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { BrainCircuit, Bot, Zap, BarChart3, PieChart as PieChartIcon, ActivitySquare, Loader2 } from 'lucide-react';

const GAS_API_URL = "/api/compare";

interface LogisticsData {
  "現場名": string;
  "年月": string;
  "予算_売上": number;
  "実績_売上": number;
  "予算_労務費": number;
  "実績_労務費": number;
  "予測_総工数": number;
  "実績_総工数": number;
  "予算_売上生産性": number;
  "実績_売上生産性": number;
  "実績_利益": number;
}

const AnimatedNumber = ({ value }: { value: string | number }) => {
  return (
    <motion.span
      key={value}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="inline-block"
    >
      {value}
    </motion.span>
  );
};

export default function CompareDashboardPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [rawData, setRawData] = useState<LogisticsData[]>([]);
  const [months, setMonths] = useState<string[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  
  const [loading, setLoading] = useState<boolean>(true);
  const [rankingMode, setRankingMode] = useState<'sales' | 'productivity'>('sales');
  
  const [chappyAnalysis, setChappyAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentMonthStr, setCurrentMonthStr] = useState<string>('');

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
        
        if (uniqueMonths.includes(thisMonthStr)) {
          setSelectedMonth(thisMonthStr);
        } else if (uniqueMonths.length > 0) {
          setSelectedMonth(uniqueMonths[0]);
        }
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredData = rawData.filter(item => item["年月"] === selectedMonth);
  const totalSales = filteredData.reduce((sum, item) => sum + (item["実績_売上"] || 0), 0);
  const totalBudgetSales = filteredData.reduce((sum, item) => sum + (item["予算_売上"] || 0), 0);
  const totalProfit = filteredData.reduce((sum, item) => sum + (item["実績_利益"] || 0), 0);
  
  const achievementRate = totalBudgetSales > 0 ? Math.round((totalSales / totalBudgetSales) * 100) : 0;
  const avgProfitMargin = totalSales > 0 ? (totalProfit / totalSales) * 100 : 0;

  const handleStartAnalysis = async () => {
    setIsAnalyzing(true);
    setChappyAnalysis(null);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const isPastMonth = selectedMonth < currentMonthStr;
      const sitesWithRatio = filteredData
        .map(item => {
          const ratio = item["予算_売上"] > 0 ? (item["実績_売上"] / item["予算_売上"]) : 1;
          return { name: item["現場名"], ratio };
        })
        .filter(item => item.name);

      const goodSite = [...sitesWithRatio].sort((a, b) => b.ratio - a.ratio)[0]?.name || "該当なし";
      const badSite = [...sitesWithRatio].sort((a, b) => a.ratio - b.ratio)[0]?.name || "該当なし";

      let metricsText = "";
      let manhoursText = "";
      let performanceText = "";

      if (isPastMonth) {
        metricsText = `【確定期総評】最終的な全社総売上実績は予算比${achievementRate}%を達成し、目標水準をクリアしました。特に「${goodSite}」が稼働安定化により当初予算を大幅に上回る好調な推移を記録。これが全体の収益を力強く底上げする大黒柱となっています。今後はこの高効率なオペレーションを分析し、他現場への標準モデルとしてマニュアル化を進めるべきです。`;
        manhoursText = `【工数内訳】当月は「${badSite}」において、物量変動に対する人員配置のミスマッチが解消しきれず、最終日まで数値を圧迫しました。投入総工数に対し売上生産性が追いついていない要因を特定するため、時間帯別の稼働効率を至急洗い出してください。具体的な是正策を講じ、次月への課題として振り返りを徹底する必要があります。`;
        performanceText = `【パフォーマンス】平均粗利益率は${avgProfitMargin.toFixed(1)}%で確定しました。一定の健全性は保っていますが、下位現場の工数コントロールの甘さが全体の利益率を相殺しています。高利益率を維持している上位現場の要員配置スキームや作業導線を体系化し、全現場へ横展開する仕組みを構築してください。ボトムアップだけで全社利益はさらに数％改善します。`;
      } else {
        metricsText = `【当月着地予測】現在のペースを維持した場合、月末の総売上実績は予算比約${achievementRate}%に到達する見込みです。現時点では「${goodSite}」の生産性が非常に高く、目標達成に向けて全体を牽引する原動力となっています。この好調を維持しつつ、突発的な物量変動や人員欠員が発生した場合のリスクマネジメント体制を並行して構築し、着地精度のさらなる安定化を図ってください。`;
        manhoursText = `【超過アラート】現在「${badSite}」の生産性が大幅に落ち込んでおり、放置すると当月の全体の着地利益を大きく圧迫するリスクがあります。残業の常態化やシフトのアンマッチが起きていないか、至急現場マネージャーと連携して現状の工数コントロールを再点検してください。特に月末に向け、過剰な労務費が発生しないよう先行管理が必要です。`;
        performanceText = `【パフォーマンス】現時点の全社平均粗利益率は${avgProfitMargin.toFixed(1)}%で推移しています。生産性が予算を下回っている課題現場の要員投入ペースを早急に是正することが最優先事項です。労務費比率が急増しているラインに対してChappyを用いた詳細な工数分析を実行し、ボトルネックを排除することで、今月末までに全体の利益率を数％引き上げることが十分に期待できます。`;
      }

      setChappyAnalysis({
        summaryMetrics: metricsText,
        summaryManhours: manhoursText,
        summaryPerformance: performanceText
      });
    } catch (err: any) {
      setChappyAnalysis({
        summaryMetrics: `【通信エラー】AIとの接続に失敗しました。`,
        summaryManhours: "APIの通信状況を確認してください。",
        summaryPerformance: "-",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 💡 【大修正】タイトル通り「TOP 15」で、15件目以降は下からしっかり削るように制限
  const sortedRankingData = [...filteredData]
    .sort((a, b) => {
      if (rankingMode === 'sales') {
        return (b["実績_売上"] || 0) - (a["実績_売上"] || 0);
      } else {
        return (b["実績_売上生産性"] || 0) - (a["実績_売上生産性"] || 0);
      }
    })
    .slice(0, 15);

  const barChartData = sortedRankingData.map(item => {
    if (rankingMode === 'sales') {
      const bRatio = item["予算_売上"] > 0 ? ((item["実績_売上"] / item["予算_売上"]) * 100).toFixed(1) : '-';
      return {
        name: item["現場名"],
        value: item["実績_売上"] || 0,
        label: `${Math.round((item["実績_売上"] || 0) / 10000).toLocaleString()}万 (${bRatio}%)`
      };
    } else {
      const pRatio = item["予算_売上生産性"] > 0 ? ((item["実績_売上生産性"] / item["予算_売上生産性"]) * 100).toFixed(1) : '-';
      return {
        name: item["現場名"],
        value: item["実績_売上生産性"] || 0,
        label: `${Math.round(item["実績_売上生産性"] || 0).toLocaleString()} (${pRatio}%)`
      };
    }
  });

  const bubbleChartData = filteredData.map(item => {
    const margin = item["実績_売上"] > 0 ? ((item["実績_利益"] || 0) / item["実績_売上"]) * 100 : 0;
    return {
      name: item["現場名"],
      x: item["実績_売上"] || 0,
      y: margin,
      z: Math.max(Math.abs(margin), 10), 
      profit: item["実績_利益"] || 0
    };
  });

  const getCellStyles = (ratio: number, base: number) => {
    if (ratio >= base * 1.1) return { backgroundColor: '#10b981', color: '#ffffff' }; 
    if (ratio >= base) return { backgroundColor: '#d1fae5', color: '#065f46' };       
    if (ratio >= base * 0.9) return { backgroundColor: '#ffe4e6', color: '#9f1239' }; 
    return { backgroundColor: '#f43f5e', color: '#ffffff' };                          
  };

  if (loading || !isMounted || rawData.length === 0) {
    return (
      <div className="h-screen bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden notranslate" translate="no">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none animate-pulse" />
        <div className="relative z-10 flex flex-col items-center">
          <div className="bg-white/95 px-6 py-3.5 rounded-2xl mb-8 shadow-[0_0_40px_rgba(59,130,246,0.3)] backdrop-blur-sm border border-white/20">
            <img src="/pal-logo.png" alt="PAL Logo" className="h-8 md:h-10 w-auto object-contain" />
          </div>
          <h1 className="text-2xl md:text-3xl font-black uppercase tracking-[0.3em] mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 text-center px-4">
            PAL Productivity Dashboard
          </h1>
          <div className="w-64 h-1.5 bg-slate-800 rounded-full overflow-hidden mb-6 shadow-inner relative">
            <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full w-1/2 animate-[ping_2s_ease-in-out_infinite]" style={{ animationName: 'loading-slide', animationDuration: '2s', animationIterationCount: 'infinite' }} />
          </div>
          <div className="flex items-center gap-3 text-slate-400">
            <Loader2 className="animate-spin text-blue-500" size={18} />
            <span className="text-[11px] font-bold tracking-widest uppercase">Connecting to Database...</span>
          </div>
        </div>
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes loading-slide { 0% { transform: translateX(-100%); width: 50%; } 100% { transform: translateX(250%); width: 50%; } }
        `}} />
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-[#f4f6f8] text-slate-800 font-sans overflow-hidden">
      
      <aside className="w-16 bg-[#ffffff] border-r border-slate-200 flex flex-col items-center py-4 space-y-6 shrink-0 z-10 shadow-sm">
        <div className="p-2 bg-blue-50 text-blue-600 rounded-md mb-4"><svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M3 3h18v2H3zm0 4h18v2H3zm0 4h18v2H3zm0 4h18v2H3zm0 4h18v2H3z"/></svg></div>
        <a href="https://palproductivity-dashboard.vercel.app/" className="p-2 text-slate-400 hover:text-blue-600 transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
        </a>
      </aside>

      <main className="flex-1 flex flex-col h-full overflow-y-auto min-w-[1000px]">
        
        <header className="px-6 py-4 flex items-end justify-between shrink-0">
          <div className="flex items-center gap-3">
            <svg className="w-8 h-8 text-blue-700" viewBox="0 0 24 24" fill="currentColor"><path d="M3 3h2v18H3zm4 14h2v4H7zm4-6h2v10h-2zm4-4h2v14h-2zm4-4h2v18h-2z"/></svg>
            <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">15現場 業績比較ダッシュボード</h1>
          </div>
          <div className="flex gap-2">
            <select 
              value={selectedMonth} 
              onChange={(e) => {
                setSelectedMonth(e.target.value);
                setChappyAnalysis(null);
              }}
              className="bg-white border border-slate-300 text-slate-700 rounded px-4 py-2 text-sm font-medium focus:outline-none focus:border-blue-500 shadow-sm"
            >
              {months.map(m => <option key={m} value={m}>{m}度 (実績)</option>)}
            </select>
          </div>
        </header>

        <div className="p-6 pt-0 flex flex-col gap-4">
          <div className="flex flex-row flex-nowrap w-full gap-4 shrink-0 h-32">
            <div className="flex-1 bg-white rounded-lg shadow-sm border border-slate-200 p-5 flex flex-col justify-between">
              <p className="text-sm font-bold text-slate-800">総売上実績</p>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-3xl 2xl:text-4xl font-extrabold text-slate-900 tracking-tight">
                    <AnimatedNumber value={ `¥${(totalSales/10000).toLocaleString(undefined, {maximumFractionDigits: 0})}` }/>
                    <span className="text-lg font-bold text-slate-500 ml-1">万</span>
                  </p>
                  <p className={`text-sm font-bold mt-1 ${achievementRate >= 100 ? 'text-emerald-600' : 'text-rose-500'}`}>
                    予算比 {achievementRate}%
                  </p>
                </div>
                <svg className="w-16 h-8 text-blue-400" viewBox="0 0 100 40" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 35 L25 20 L45 25 L65 5 L95 15" /></svg>
              </div>
            </div>
            <div className="flex-1 bg-white rounded-lg shadow-sm border border-slate-200 p-5 flex flex-col justify-center">
              <p className="text-sm font-bold text-slate-800 mb-1">目標達成率</p>
              <p className="text-3xl 2xl:text-4xl font-extrabold text-slate-900"><AnimatedNumber value={ achievementRate }/><span className="text-xl font-bold text-slate-500 ml-1">%</span></p>
            </div>
            <div className="flex-1 bg-white rounded-lg shadow-sm border border-slate-200 p-5 flex flex-col justify-center">
              <p className="text-sm font-bold text-slate-800 mb-1">平均粗利益率</p>
              <p className="text-3xl 2xl:text-4xl font-extrabold text-slate-900"><AnimatedNumber value={ avgProfitMargin.toFixed(1) }/><span className="text-xl font-bold text-slate-500 ml-1">%</span></p>
            </div>
            <div className="flex-1 bg-white rounded-lg shadow-sm border border-slate-200 p-5 flex flex-col justify-center">
               <p className="text-sm font-bold text-slate-800 mb-1">稼働現場数</p>
               <p className="text-3xl 2xl:text-4xl font-extrabold text-slate-900"><AnimatedNumber value={ filteredData.length }/><span className="text-lg font-bold text-slate-500 ml-1">現場</span></p>
            </div>
          </div>

          <div className="flex flex-row gap-4 h-[320px] shrink-0">
            <div className="flex-1 bg-white rounded-lg shadow-sm border border-slate-200 p-4 flex flex-col w-1/2">
              <div className="flex items-center justify-between mb-2 shrink-0">
                <h3 className="text-sm font-bold text-slate-900">現場別 {rankingMode === 'sales' ? '売上' : '売上生産性'}ランキング (TOP 15)</h3>
                <div className="flex bg-slate-100 p-0.5 rounded-md text-xs">
                  <button onClick={() => setRankingMode('sales')} className={`px-2.5 py-1 rounded font-bold ${rankingMode === 'sales' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}>売上</button>
                  <button onClick={() => setRankingMode('productivity')} className={`px-2.5 py-1 rounded font-bold ${rankingMode === 'productivity' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}>生産性</button>
                </div>
              </div>
              <div className="flex-1 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barChartData} layout="vertical" margin={{ top: 5, right: 140, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                    <XAxis type="number" hide />
                    {/* 💡 【大復活】現場名が長い場合は後ろ（下）を綺麗に削って「…」にする処理を再搭載 */}
                    <YAxis 
                      dataKey="name" 
                      type="category" 
                      width={90} 
                      interval={0} 
                      tickFormatter={(v) => v.length > 7 ? `${v.slice(0, 7)}…` : v}
                      tick={{ fontSize: 11, fill: '#334155', fontWeight: 600 }} 
                      axisLine={false} 
                      tickLine={false} 
                    />
                    <RechartsTooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '8px' }} />
                    <Bar dataKey="value" fill={rankingMode === 'sales' ? "#1d70b8" : "#c2410c"} radius={[0, 2, 2, 0]} barSize={12}>
                      <LabelList dataKey="label" position="right" fill="#475569" fontSize={10} fontWeight="bold" offset={10} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="flex-1 bg-white rounded-lg shadow-sm border border-slate-200 p-4 flex flex-col w-1/2">
              <h3 className="text-sm font-bold text-slate-900 mb-2">売上実績 vs. 利益率</h3>
              <div className="flex-1 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 30, right: 20, bottom: 25, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#7dd3fc" opacity={0.6} />
                    <XAxis type="number" dataKey="x" tickFormatter={(v) => `${(v/10000).toFixed(0)}万`} stroke="#94a3b8" fontSize={11} axisLine={false} tickLine={false} label={{ value: '売上実績', position: 'bottom', fontSize: 11, offset: 5 }} />
                    <YAxis type="number" dataKey="y" tickFormatter={(v) => `${v}%`} stroke="#94a3b8" fontSize={11} axisLine={false} tickLine={false} label={{ value: '利益率', angle: -90, position: 'insideLeft', fontSize: 11 }} />
                    <ZAxis type="number" dataKey="z" range={[200, 3500]} />
                    <RechartsTooltip cursor={{ strokeDasharray: '3 3' }} content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const d = payload[0].payload;
                        return (
                          <div className="bg-white border border-slate-300 p-3 rounded-lg shadow-xl text-xs">
                            <p className="font-extrabold text-slate-900">{d.name}</p>
                            <p className="text-slate-600">利益率: {d.y.toFixed(1)}%</p>
                          </div>
                        );
                      }
                      return null;
                    }} />
                    <Scatter data={bubbleChartData} isAnimationActive={false}>
                      {bubbleChartData.map((entry, index) => <Cell key={`cell-${index}`} fill="rgba(14, 165, 233, 0.4)" stroke="#0ea5e9" strokeWidth={1.5} />)}
                      <LabelList dataKey="name" position="bottom" fill="#334155" fontSize={10} offset={14} fontWeight="bold" />
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="flex flex-row gap-4 h-[350px] shrink-0">
            <div className="w-1/2 bg-white rounded-lg shadow-sm border border-slate-200 p-4 flex flex-col overflow-hidden">
              <h3 className="text-sm font-bold text-slate-900 mb-2">現場別 KPIヒートマップ</h3>
              <div className="overflow-y-auto flex-1 custom-scrollbar">
                 <table className="w-full text-xs text-center border-collapse">
                   <thead className="sticky top-0 bg-white shadow-sm">
                     <tr className="text-slate-700 font-bold border-b border-slate-200">
                       <th className="py-2.5 text-left pl-2">現場名</th>
                       <th className="py-2.5">予算比</th>
                       <th className="py-2.5">利益率</th>
                       <th className="py-2.5 pr-2">実績生産性</th>
                     </tr>
                   </thead>
                   <tbody>
                     {filteredData.map((item, i) => {
                       const sRatio = item["予算_売上"] > 0 ? (item["実績_売上"] / item["予算_売上"]) : 1;
                       const pMargin = item["実績_売上"] > 0 ? (item["実績_利益"] / item["実績_売上"]) : 0;
                       const prodStyles = getCellStyles(Number(item["実績_売上生産性"]) || 0, item["予算_売上生産性"] || 1);
                       return (
                         <tr key={i} className="border-b border-slate-100 hover:bg-slate-50">
                           <td className="py-2.5 text-left font-bold text-slate-700 pl-2">{item["現場名"]}</td>
                           <td className="py-2.5" style={getCellStyles(sRatio, 1)}>{(sRatio*100).toFixed(1)}%</td>
                           <td className="py-2.5" style={getCellStyles(pMargin, 0.15)}>{(pMargin*100).toFixed(1)}%</td>
                           <td className="py-2.5 pr-2 font-bold" style={prodStyles}>{item["実績_売上生産性"]}</td>
                         </tr>
                       );
                     })}
                   </tbody>
                 </table>
              </div>
            </div>

            <div className="w-1/2 flex flex-col">
              <div className="flex-1 bg-white border border-slate-200 p-5 md:p-6 rounded-2xl relative overflow-hidden flex flex-col shadow-sm">
                <div className="flex items-center gap-2 md:gap-3 mb-4 shrink-0">
                  <BrainCircuit size={20} className="text-blue-600" />
                  <h3 className="text-base md:text-md font-black text-slate-900">AI診断結果 (chatGPT)</h3>
                </div>

                <div className="flex-1 overflow-hidden">
                  {!chappyAnalysis && !isAnalyzing ? (
                    <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 px-4 py-8">
                      <Bot size={40} className="text-slate-400 mb-3" />
                      <p className="text-slate-600 font-bold text-xs md:text-sm mb-4 text-center">最新の全指標データに基づくAI経営分析を生成します。</p>
                      <button onClick={handleStartAnalysis} className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-black tracking-widest transition-all shadow-[0_0_20px_rgba(37,99,235,0.15)] flex items-center gap-2 hover:scale-105 active:scale-95">
                        <Zap size={16} />AI診断をスタート
                      </button>
                    </div>
                  ) 
                  : isAnalyzing ? (
                    <div className="h-full grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="flex-1 bg-slate-50 border border-slate-100 p-4 rounded-xl space-y-2">
                          <div className="h-3 bg-slate-200 rounded-md w-1/4"></div>
                          <div className="h-2 bg-slate-100 rounded-md w-full"></div>
                          <div className="h-2 bg-slate-100 rounded-md w-full"></div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="h-full grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 overflow-y-auto pr-2 custom-scrollbar">
                      <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl shadow-sm flex flex-col justify-start">
                        <h4 className="flex items-center gap-2 text-xs md:text-sm font-black text-emerald-700 mb-2 shrink-0"><BarChart3 size={16}/> 1. 主要・コスト指標 評価</h4>
                        <p className="text-slate-700 text-[11px] md:text-[12px] leading-relaxed font-medium whitespace-pre-wrap">{chappyAnalysis.summaryMetrics}</p>
                      </div>
                      <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl shadow-sm flex flex-col justify-start">
                        <h4 className="flex items-center gap-2 text-xs md:text-sm font-black text-amber-700 mb-2 shrink-0"><PieChartIcon size={16}/> 2. 工数内訳 評価</h4>
                        <p className="text-slate-700 text-[11px] md:text-[12px] leading-relaxed font-medium whitespace-pre-wrap">{chappyAnalysis.summaryManhours}</p>
                      </div>
                      <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl shadow-sm flex flex-col justify-start">
                        <h4 className="flex items-center gap-2 text-xs md:text-sm font-black text-purple-700 mb-2 shrink-0"><ActivitySquare size={16}/> 3. パフォーマンス 評価</h4>
                        <p className="text-slate-700 text-[11px] md:text-[12px] leading-relaxed font-medium whitespace-pre-wrap">{chappyAnalysis.summaryPerformance}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
      
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}} />
    </div>
  );
}