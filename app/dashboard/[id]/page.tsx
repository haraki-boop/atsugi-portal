// @ts-nocheck
'use client';
import { useEffect, useState } from 'react';
import { ArrowLeft, Activity, Calculator, TrendingUp, Calendar, Rocket, Leaf, MessageSquare, Clock, Bot, ThumbsUp, AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage({ params }: { params: { id: string } }) {
  const [data, setData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('logistics');

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

  if (!data) return <div className="h-screen bg-slate-950 flex items-center justify-center text-blue-400 font-mono animate-pulse uppercase tracking-[0.4em]">SYNCING_EXPERT_BRAIN...</div>;

  const currentTab = tabs.find(t => t.id === activeTab) || tabs[1];
  const lowIsBetterMetrics = ["労務費", "タイミー", "外注費", "社会保険", "雇用保険", "有給", "交通費", "工数"];

  const getCombinedMetrics = () => {
    let allItems = data[`${currentTab.id}Data`] || [];
    const combinedMap = new Map();

    allItems.forEach(item => {
      const cleanTitle = item.title.replace('実績_', '').replace('予測_', '').replace('予算_', '').replace('目標_', '');
      if (!combinedMap.has(cleanTitle)) {
        combinedMap.set(cleanTitle, { 
          title: cleanTitle, 
          labels: item.labels || data.labels || ["日", "月", "火", "水", "木", "金", "土"], 
          actual: [], 
          forecast: [],
          forecastType: '予測'
        });
      }
      const entry = combinedMap.get(cleanTitle);
      if (item.title.startsWith('実績_')) entry.actual = item.values;
      else {
        entry.forecast = item.values;
        entry.forecastType = item.title.split('_')[0];
      }
    });

    return Array.from(combinedMap.values());
  };

  const metrics = getCombinedMetrics();

  // 🚚 物流エキスパートAI・ロジカル評価アルゴリズム
  const getAiExpertEvaluation = (metric) => {
    const latestActual = metric.actual[metric.actual.length - 1] || 0;
    const latestForecast = metric.forecast[metric.forecast.length - 1] || 1;
    const isLowBetter = lowIsBetterMetrics.some(keyword => metric.title.includes(keyword));
    const ratio = (latestActual / latestForecast) * 100;

    let status = 'STABLE';
    let color = 'text-blue-700 bg-blue-50 border-blue-200';
    let icon = <Bot size={14} className="text-blue-600" />;
    let comment = "";

    if (isLowBetter) {
      // 💸 【コスト・工数系：低いほうが好調】
      if (ratio <= 90) {
        status = 'EXCELLENT';
        color = 'text-emerald-700 bg-emerald-50 border-emerald-200';
        icon = <CheckCircle2 size={14} className="text-emerald-600" />;
        comment = `【物流エキスパート診断：極めて良好】『${metric.title}』は計画比${ratio.toFixed(1)}%と大幅に抑制。人員配置の最適化および現場ラインの作業効率化が非常に高精度に機能しています。このオペレーション配置を維持し、次週の標準進捗のベースラインとして固定することを推奨します。`;
      } else if (ratio > 90 && ratio <= 103) {
        status = 'STABLE';
        color = 'text-blue-700 bg-blue-50 border-blue-200';
        icon = <Bot size={14} className="text-blue-600" />;
        comment = `【物流エキスパート診断：巡航速度】『${metric.title}』は達成率${ratio.toFixed(1)}%で計画線上で推移。物量波動に対する労務コントロールは適正範囲内です。突発的な車両遅延や庫内滞留の予兆も見られず、現状のシフト編成・コスト投下バランスのまま次節へ移行して問題ありません。`;
      } else {
        status = 'WARNING';
        color = 'text-rose-700 bg-rose-50 border-rose-200';
        icon = <ShieldAlert size={14} className="text-rose-600" />;
        comment = `【物流エキスパート診断：要是正】『${metric.title}』が予測を${(ratio - 100).toFixed(1)}%超過しています。入庫遅延による待機工数の発生か、現場の生産性低下を補うためのタイミー等の過剰投下が疑われます。作業ピッチタイムを再測定し、ボトルネック工程への人員リバランシングが急務です。`;
      }
    } else {
      // 📈 【売上・生産性系：高いほうが好調】
      if (ratio >= 105) {
        status = 'EXCELLENT';
        color = 'text-emerald-700 bg-emerald-50 border-emerald-200';
        icon = <ThumbsUp size={14} className="text-emerald-600" />;
        comment = `【物流エキスパート診断：超高効率】『${metric.title}』は目標比${ratio.toFixed(1)}%と上振れ達成。1人あたりMH（マンアワー）の処理効率が予測値を凌駕しています。出荷バースの回転率も非常に良好であり、高密度な庫内動線が構築されています。この優良事例（ナレッジ）を他班へ水平展開してください。`;
      } else if (ratio >= 95 && ratio < 105) {
        status = 'STABLE';
        color = 'text-blue-700 bg-blue-50 border-blue-200';
        icon = <Bot size={14} className="text-blue-600" />;
        comment = `【物流エキスパート診断：安定稼働】『${metric.title}』は達成率${ratio.toFixed(1)}%と堅調な着地。物量インフラおよびピッキングシステムの稼働率はマスタ通りに機能しています。出荷進捗の遅延リスクは極めて低く、このペースを維持することで月次利益ターゲットは計画通り達成可能です。`;
      } else {
        status = 'WARNING';
        color = 'text-rose-700 bg-rose-50 border-rose-200';
        icon = <AlertTriangle size={14} className="text-rose-600" />;
        comment = `【物流エキスパート診断：警告】『${metric.title}』が計画値の${ratio.toFixed(1)}%に留まり、アラートラインを突破。庫内通路の狭小化による搬送ラグ、もしくは特定のピッキングエリアでの滞留が発生している可能性が高いです。即座に充填率を点検し、実稼働プロセスの見直しを要求します。`;
      }
    }

    return { status, color, icon, comment, ratio: ratio.toFixed(1), latestActual, latestForecast };
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-20">
      <style>{`
        @keyframes waveAnimation {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .liquid-wave::before {
          content: "";
          position: absolute;
          top: -15px;
          left: -50%;
          width: 200%;
          height: 40px;
          background-color: inherit;
          border-radius: 43%;
          animation: waveAnimation 7s infinite linear;
          opacity: 0.9;
        }
      `}</style>

      <header className="h-20 bg-white border-b border-slate-200 px-10 flex justify-between items-center sticky top-0 z-40 backdrop-blur-md bg-white/80">
        <Link href="/" className="flex items-center gap-2 text-slate-400 no-underline font-black hover:text-blue-600 transition-all">
          <ArrowLeft size={16} /> <span className="text-xs">PORTAL</span>
        </Link>
        <div className="text-center">
          <h1 className="text-lg font-black italic tracking-tighter uppercase text-slate-800">経営ダッシュボード : 昭和冷蔵</h1>
          <p className="text-[9px] font-bold text-blue-600 tracking-[0.2em] uppercase">Daily Fluid Intelligence Stream</p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
          <span className="px-6 py-2 bg-white shadow-sm rounded-xl text-[10px] font-black text-blue-600">DAILY MODE</span>
        </div>
      </header>

      <main className="p-10 max-w-[1800px] mx-auto space-y-8">
        <div className="flex flex-wrap gap-2.5">
          {tabs.map((t) => (
            <button key={t.id} onClick={() => setActiveTab(t.id)} className={`px-6 py-3 rounded-2xl transition-all font-black text-xs ${activeTab === t.id ? `bg-slate-900 text-white shadow-lg` : 'bg-white border text-slate-500 hover:bg-slate-50'}`}>
              {t.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {metrics.map((m, i) => {
            const evalData = getAiExpertEvaluation(m);
            const isCost = lowIsBetterMetrics.some(k => m.title.includes(k));

            return (
              <div key={i} className="bg-white border border-slate-200 p-8 rounded-[2.5rem] shadow-md flex flex-col gap-6">
                
                {/* グラフタイトル＆数値対比 */}
                <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                  <div>
                    <h4 className="text-lg font-black text-slate-900 tracking-tighter uppercase">{m.title}</h4>
                    <p className="text-[10px] font-bold text-slate-400 mt-0.5 uppercase tracking-widest">vs {m.forecastType} Expert System</p>
                  </div>
                  <div className="flex gap-6 text-right items-center">
                    <div className="border-r pr-4 border-slate-100">
                      <p className="text-[9px] font-bold text-slate-400 uppercase">Latest Actual</p>
                      <p className="text-xl font-black text-slate-800 tracking-tight">{evalData.latestActual.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase">Ratio</p>
                      <p className={`text-xl font-black ${Number(evalData.ratio) >= 100 ? (isCost ? 'text-rose-600' : 'text-emerald-600') : (isCost ? 'text-emerald-600' : 'text-rose-600')}`}>{evalData.ratio}%</p>
                    </div>
                  </div>
                </div>

                {/* リキッドカプセルゲージ */}
                <div className="flex justify-between items-end gap-2 px-6 py-6 bg-slate-50 rounded-3xl h-[320px] relative">
                  <div className="absolute left-3 top-6 bottom-12 flex flex-col justify-between text-[10px] font-bold text-slate-400 pointer-events-none z-10">
                    <span>100%</span>
                    <span>50%</span>
                    <span>0%</span>
                  </div>

                  {m.labels.map((label, idx) => {
                    const act = m.actual[idx] || 0;
                    const fct = m.forecast[idx] || 1;
                    const fillHeight = Math.min(Math.max((act / fct) * 100, 2), 100);

                    let liquidColor = currentTab.color;
                    if (isCost) {
                      liquidColor = fillHeight > 100 ? '#e11d48' : '#059669';
                    } else {
                      liquidColor = fillHeight >= 100 ? '#059669' : '#ff4d00';
                    }

                    return (
                      <div key={idx} className="flex flex-col items-center flex-1 h-full justify-end gap-3 z-20">
                        <div className="w-10 h-[220px] bg-slate-200 border border-slate-300/60 rounded-full relative overflow-hidden flex flex-col-reverse shadow-inner">
                          <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-slate-700 mix-blend-difference z-30">
                            {((act / fct) * 100).toFixed(0)}%
                          </div>
                          <div className="w-full relative liquid-wave transition-all duration-1000 ease-out" style={{ height: `${fillHeight}%`, backgroundColor: liquidColor }}></div>
                        </div>
                        <span className="text-[10px] font-black text-slate-500 whitespace-nowrap text-center tracking-tighter">{label}</span>
                      </div>
                    );
                  })}
                </div>

                {/* 🚚 150文字前後の物流エキスパートAIによるロジカルな評価スタック */}
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