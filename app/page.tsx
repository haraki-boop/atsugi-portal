// @ts-nocheck
'use client';

import { ArrowRight, MapPin, Search, Globe, Shield, Zap, TrendingUp, Bot } from 'lucide-react';
import Link from 'next/link';

export default function PortalPage() {
  // 拠点のデータ (ピンの位置と情報を管理)
  const centers = [
    { id: 'ATSUGI', name: '昭和冷蔵', top: '55%', left: '42%', color: '#deff9a' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-lime-500/30 overflow-hidden relative">
      
      {/* 背景：デジタル・グリッドと地図の装飾 */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent"></div>
        <img 
          src="https://www.transparentpng.com/download/world-map/blue-digital-world-map-background-png-hW6t9K.png" 
          className="w-full h-full object-cover filter brightness-50"
          alt="Digital World Map"
        />
      </div>

      {/* ヘッダー */}
      <header className="relative z-10 h-24 border-b border-white/5 flex items-center justify-between px-12 backdrop-blur-md bg-slate-950/50">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-lime-400 rounded-lg flex items-center justify-center">
            <Zap size={24} className="text-slate-950" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tighter italic uppercase">Management_Portal</h1>
            <p className="text-[10px] font-bold text-lime-400 uppercase tracking-widest">Global Intelligence Network</p>
          </div>
        </div>
        
        <div className="flex items-center gap-8">
          <div className="text-right">
            <p className="text-[10px] font-bold text-slate-500 uppercase">System Status</p>
            <p className="text-xs font-black text-lime-400">ONLINE_ENCRYPTED</p>
          </div>
        </div>
      </header>

      <main className="relative z-10 flex flex-col items-center pt-20 px-10 pb-20 max-w-7xl mx-auto">
        
        {/* メインタイトル */}
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-6xl font-black italic tracking-tighter leading-none uppercase">
            経営ダッシュボード
          </h2>
          <p className="text-slate-400 font-medium tracking-widest text-sm uppercase">
            Strategic Logistics Management System
          </p>
        </div>

        {/* マップエリア */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">
          
          <div className="space-y-8 order-2 lg:order-1">
             <div className="bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-sm">
                <TrendingUp className="text-lime-400 mb-4" />
                <h3 className="font-black text-xs uppercase mb-2">Total Logistics Flow</h3>
                <p className="text-3xl font-black tracking-tighter italic">LIVE <span className="text-sm font-normal text-slate-500 italic">Syncing...</span></p>
             </div>
             <div className="bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-sm">
                <Bot className="text-blue-400 mb-4" />
                <h3 className="font-black text-xs uppercase mb-2">AI Summary</h3>
                <p className="text-sm text-slate-400 font-medium italic leading-relaxed">
                  昭和冷蔵の稼働データ正常。実績と予測の乖離を監視中。
                </p>
             </div>
          </div>

          <div className="lg:col-span-2 relative aspect-[16/10] bg-slate-900/50 rounded-[3rem] border border-white/10 shadow-2xl order-1 lg:order-2 overflow-hidden group">
            <div className="absolute inset-0 opacity-40">
               <svg viewBox="0 0 1000 1000" className="w-full h-full fill-slate-700">
                 <path d="M600,400 L650,450 L630,550 L550,600 L500,550 L520,450 Z" />
               </svg>
            </div>

            {centers.map((center) => (
              <Link key={center.id} href={`/dashboard/${center.id}`}>
                <div 
                  className="absolute cursor-pointer group/pin hover:z-50"
                  style={{ top: center.top, left: center.left }}
                >
                  <div className="absolute -inset-4 bg-lime-400/20 rounded-full animate-ping"></div>
                  <div className="relative flex flex-col items-center gap-2">
                    <div className="w-8 h-8 bg-slate-950 border-2 border-lime-400 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(163,230,53,0.5)]">
                      <MapPin size={16} className="text-lime-400 fill-lime-400" />
                    </div>
                    <div className="bg-white px-4 py-1.5 rounded-full shadow-xl">
                      <span className="text-[10px] font-black text-slate-950 whitespace-nowrap">{center.name}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-24 grid grid-cols-1 md:grid-cols-4 gap-8 w-full border-t border-white/5 pt-12">
           <div className="space-y-4">
              <h4 className="text-xs font-black text-lime-400 uppercase tracking-widest">Active Node</h4>
              <p className="text-3xl font-black italic tracking-tighter">昭和冷蔵</p>
           </div>
        </div>

      </main>
    </div>
  );
}