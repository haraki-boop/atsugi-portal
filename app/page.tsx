// @ts-nocheck
'use client';

import { MapPin, Zap, TrendingUp, Bot, Globe, Shield, Navigation } from 'lucide-react';
import Link from 'next/link';

export default function PortalPage() {
  // 4拠点の正確なプロット（日本地図の座標に基づき計算）
  const centers = [
    { id: 'SHOWA', name: '昭和冷蔵', top: '57%', left: '71%', active: true, addr: '神奈川県厚木市', tier: 'Main Node' },
    { id: 'AFS_MINAMI', name: 'AFS南関東', top: '58.5%', left: '71.5%', active: false, addr: '神奈川県厚木市', tier: 'Sub Node' },
    { id: 'MEDI', name: 'メディエントランス', top: '55.5%', left: '72.5%', active: false, addr: '東京都中央区', tier: 'Tier 4 Emergency' },
    { id: 'OIE', name: '尾家産業', top: '63%', left: '58%', active: false, addr: '大阪府吹田市/神戸市周辺', tier: 'Kansai Hub' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans overflow-hidden relative">
      
      {/* 背景：プロフェッショナルな日本地図グラフィック */}
      <div className="absolute inset-0 z-0 flex items-center justify-center opacity-30">
        <img 
          src="http://googleusercontent.com/image_collection/image_retrieval/210357640492831416" 
          className="w-full h-full object-cover filter brightness-50 contrast-125 saturate-50"
          alt="Strategic Japan Map Background"
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_#020617_85%)]"></div>
      </div>

      {/* ヘッダー：経営ダッシュボード */}
      <header className="relative z-10 h-24 border-b border-white/5 flex items-center justify-between px-12 backdrop-blur-md bg-slate-950/40">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.4)]">
            <Shield size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tighter uppercase italic text-slate-100">経営ダッシュボード</h1>
            <p className="text-[9px] font-bold text-blue-400 tracking-widest uppercase">Management Intelligence Portal</p>
          </div>
        </div>
        
        <div className="flex items-center gap-8">
          <div className="text-right border-l border-white/10 pl-8">
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Active Commander</p>
            <p className="text-xs font-black text-lime-400 uppercase tracking-tight">ONLINE_AUTHORIZED</p>
          </div>
        </div>
      </header>

      <main className="relative z-10 flex flex-col items-center pt-12 px-10 max-w-7xl mx-auto">
        
        {/* メインキャッチ */}
        <div className="text-center space-y-3 mb-10">
          <h2 className="text-6xl font-black italic tracking-tighter uppercase leading-none text-white">Strategic Logistics Map</h2>
          <div className="flex items-center justify-center gap-3">
             <span className="h-[1px] w-12 bg-blue-500"></span>
             <p className="text-blue-500 font-bold tracking-[0.4em] text-[10px] uppercase">国内全拠点リアルタイム統括ポータル</p>
             <span className="h-[1px] w-12 bg-blue-500"></span>
          </div>
        </div>

        {/* 日本地図プロットエリア */}
        <div className="w-full relative aspect-[21/9] bg-slate-900/10 border border-white/10 rounded-[3rem] shadow-2xl overflow-hidden group">
          
          {/* 精密な日本地図の背景（ピンポイント位置確認用） */}
          <div className="absolute inset-0 opacity-15 mix-blend-screen pointer-events-none">
             <svg viewBox="0 0 1000 500" className="w-full h-full fill-blue-900 stroke-blue-500/20 stroke-1">
                <path d="M150,450 L300,430 L450,380 L520,360 L650,320 L750,220 L820,120 L860,100 L950,110 L900,200 L820,350 L750,450 L600,480 L450,490 Z" />
             </svg>
          </div>

          {/* 4拠点ピン：住所に基づき配置 */}
          {centers.map((center) => (
            <div key={center.id} className="absolute" style={{ top: center.top, left: center.left }}>
              {center.active ? (
                <Link href={`/dashboard/${center.id}`}>
                  <div className="relative cursor-pointer group/pin">
                    <div className="absolute -inset-4 bg-blue-500/20 rounded-full animate-ping"></div>
                    <div className="relative flex flex-col items-center gap-2">
                      <div className="w-9 h-9 bg-slate-950 border-2 border-blue-400 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(96,165,250,0.5)] transition-transform group-hover/pin:scale-125">
                        <MapPin size={18} className="text-blue-400 fill-blue-400" />
                      </div>
                      <div className="bg-white px-4 py-1.5 rounded-full shadow-2xl transition-all group-hover/pin:-translate-y-1">
                        <span className="text-[10px] font-black text-slate-950 whitespace-nowrap">{center.name}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ) : (
                <div className="relative opacity-40 grayscale group/pin">
                  <div className="relative flex flex-col items-center gap-2">
                    <div className="w-8 h-8 bg-slate-800 border-2 border-slate-600 rounded-full flex items-center justify-center">
                      <MapPin size={14} className="text-slate-500" />
                    </div>
                    <div className="bg-slate-800 px-3 py-1 rounded-full border border-white/5">
                      <span className="text-[9px] font-bold text-slate-400 whitespace-nowrap">{center.name} (準備中)</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* 左下の凡例表示 */}
          <div className="absolute bottom-8 left-8 p-6 bg-slate-950/80 border border-white/5 rounded-3xl backdrop-blur-md">
             <div className="space-y-4">
                <div className="flex items-center gap-3">
                   <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                   <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Active Node: 01</p>
                </div>
                <div className="flex items-center gap-3 opacity-50">
                   <div className="w-2 h-2 bg-slate-600 rounded-full"></div>
                   <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Standby Nodes: 03</p>
                </div>
             </div>
          </div>
        </div>

        {/* 拠点リスト（住所表示） */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 w-full mt-10">
           {centers.map(c => (
             <div key={c.id} className={`p-5 rounded-2xl border transition-all ${c.active ? 'bg-blue-600/5 border-blue-500/20' : 'bg-white/5 border-white/5 opacity-50'}`}>
                <p className="text-[9px] font-black text-blue-400 uppercase mb-1">{c.tier}</p>
                <h3 className="text-sm font-black text-white mb-2">{c.name}</h3>
                <div className="flex items-center gap-2 text-slate-500">
                   <Navigation size={10} />
                   <span className="text-[10px] font-medium">{c.addr}</span>
                </div>
             </div>
           ))}
        </div>

      </main>
    </div>
  );
}