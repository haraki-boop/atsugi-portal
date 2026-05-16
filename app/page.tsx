// @ts-nocheck
'use client';

import { MapPin, Globe, Zap, TrendingUp, Bot, Shield, Layers } from 'lucide-react';
import Link from 'next/link';

export default function PortalPage() {
  // 日本列島ベースの座標プロット
  const centers = [
    { id: 'SHOWA', name: '昭和冷蔵', top: '56%', left: '68%', active: true, desc: '戦略フラッグシップ拠点' },
    { id: 'OIE', name: '尾家産業', top: '58%', left: '55%', active: false, desc: '西日本統括ノード' },
    { id: 'AFS_MINAMI', name: 'AFS南関東', top: '57%', left: '69%', active: false, desc: '南関東エリア司令室' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans overflow-hidden relative">
      {/* 背景ハイテクグリッド */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] z-0 opacity-60"></div>

      <header className="relative z-10 h-24 border-b border-white/10 flex items-center justify-between px-12 backdrop-blur-md bg-slate-950/40">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.4)]">
            <Globe size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tighter uppercase italic text-slate-100">経営ダッシュボード</h1>
            <p className="text-[9px] font-bold text-blue-400 tracking-widest uppercase">Central Intelligence Portal</p>
          </div>
        </div>
        <div className="flex items-center gap-6 text-right">
          <div>
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Network Status</p>
            <p className="text-xs font-black text-emerald-400 uppercase tracking-tight">SECURE_NODE_ACTIVE</p>
          </div>
        </div>
      </header>

      <main className="relative z-10 flex flex-col items-center pt-12 px-10 max-w-7xl mx-auto">
        <div className="text-center space-y-2 mb-10">
          <h2 className="text-6xl font-black italic tracking-tighter uppercase leading-none bg-gradient-to-r from-white via-slate-200 to-slate-500 bg-clip-text text-transparent">Japan Strategic Map</h2>
          <p className="text-blue-500 font-bold tracking-[0.4em] text-xs uppercase">国内拠点オペレーション統合マップ</p>
        </div>

        {/* 精密な日本列島画像バックグラウンドのマップコンテナ */}
        <div className="w-full relative aspect-[21/10] bg-slate-900/20 border border-white/10 rounded-[3.5rem] shadow-2xl overflow-hidden backdrop-blur-sm">
          <div className="absolute inset-0 z-0 flex items-center justify-center p-8 opacity-25">
            <img 
              src="https://images.unsplash.com/photo-1504109586057-7a2ae83d1338?auto=format&fit=crop&q=80&w=1600" 
              className="w-full h-full object-cover rounded-[3rem] filter grayscale contrast-150 brightness-50" 
              alt="Strategic Texture"
            />
          </div>
          
          {/* 精密な日本地図の輪郭オーバーレイ */}
          <div className="absolute inset-0 z-0 opacity-60 mix-blend-screen pointer-events-none flex items-center justify-center">
            <svg viewBox="0 0 1000 800" className="w-[85%] h-[85%] fill-slate-800/40 stroke-blue-500/30 stroke-2">
              {/* 近畿・中国・四国・九州 */}
              <path d="M150,600 L250,580 L350,550 L420,530 L460,510 L480,530 L450,560 L380,580 L280,630 Z" />
              {/* 中部・関東・東北 */}
              <path d="M460,510 L520,480 L580,440 L650,420 L680,450 L690,410 L730,350 L750,280 L790,200 L840,150 L810,250 L780,380 L730,460 L690,520 L620,560 L520,540 Z" />
              {/* 北海道 */}
              <path d="M780,180 L840,130 L890,90 L950,110 L920,180 L850,230 L800,210 Z" />
            </svg>
          </div>

          {/* 3拠点プロットピン */}
          {centers.map((center) => (
            <Link key={center.id} href={center.active ? `/dashboard/${center.id}` : '#'}>
              <div 
                className={`absolute ${center.active ? 'cursor-pointer' : 'cursor-not-allowed opacity-40'} group/pin`} 
                style={{ top: center.top, left: center.left }}
              >
                {center.active && (
                  <div className="absolute -inset-4 bg-blue-500/30 rounded-full animate-pulse shadow-[0_0_30px_rgba(59,130,246,0.4)]"></div>
                )}
                <div className="relative flex flex-col items-center gap-2">
                  <div className={`w-9 h-9 bg-slate-950 border-2 ${center.active ? 'border-blue-400 shadow-[0_0_15px_rgba(96,165,250,0.6)] scale-110' : 'border-slate-700'} rounded-full flex items-center justify-center transition-transform group-hover/pin:scale-125`}>
                    <MapPin size={16} className={center.active ? 'text-blue-400 fill-blue-500/20' : 'text-slate-600'} />
                  </div>
                  <div className="bg-slate-900/90 border border-white/10 backdrop-blur-md px-4 py-1.5 rounded-2xl shadow-xl transition-all group-hover/pin:bg-blue-600 group-hover/pin:border-blue-400">
                    <p className="text-[11px] font-black text-white whitespace-nowrap tracking-tight">{center.name}</p>
                    <p className="text-[7px] text-slate-400 group-hover/pin:text-blue-100 font-bold whitespace-nowrap">{center.desc}</p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-10">
          <div className="bg-slate-900/40 border border-white/5 p-6 rounded-3xl backdrop-blur-md flex items-start gap-4">
            <Bot className="text-blue-400 mt-1 shrink-0" size={20} />
            <div>
              <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-1">AI Agent Stream</h3>
              <p className="text-[11px] font-medium leading-relaxed text-slate-300 italic">日本列島ノード正常。昭和冷蔵のデータストリームがメインラインに直結されました。</p>
            </div>
          </div>
          <div className="bg-slate-900/40 border border-white/5 p-6 rounded-3xl backdrop-blur-md flex items-start gap-4">
            <Layers className="text-indigo-400 mt-1 shrink-0" size={20} />
            <div>
              <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-1">Active Clusters</h3>
              <p className="text-2xl font-black italic tracking-tighter text-white">01 <span className="text-xs font-normal text-slate-600 tracking-normal">/ 03 CONNECTED</span></p>
            </div>
          </div>
          <div className="bg-slate-900/40 border border-white/5 p-6 rounded-3xl backdrop-blur-md flex items-start gap-4">
            <Shield className="text-emerald-400 mt-1 shrink-0" size={20} />
            <div>
              <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-1">Data Firewall</h3>
              <p className="text-[11px] font-black text-emerald-400 tracking-widest uppercase">AES_256_ACTIVE</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}