// @ts-nocheck
'use client';

import { ArrowRight, MapPin, Zap, TrendingUp, Bot, Globe } from 'lucide-react';
import Link from 'next/link';

export default function PortalPage() {
  const centers = [
    { id: 'ATSUGI', name: '昭和冷蔵', top: '55%', left: '42%', active: true },
    { id: 'TOKYO', name: '東京拠点', top: '48%', left: '46%', active: false },
    { id: 'OSAKA', name: '大阪拠点', top: '62%', left: '35%', active: false },
    { id: 'FUKUOKA', name: '福岡拠点', top: '70%', left: '22%', active: false },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans overflow-hidden relative">
      {/* 背景：リアルなデジタル世界地図画像 */}
      <div className="absolute inset-0 z-0 opacity-40">
        <img 
          src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&q=80&w=2000" 
          className="w-full h-full object-cover filter brightness-50 contrast-125"
          alt="World Map Background"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-transparent to-slate-950"></div>
      </div>

      <header className="relative z-10 h-24 border-b border-white/10 flex items-center justify-between px-12 backdrop-blur-md bg-black/20">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.5)]">
            <Globe size={24} className="text-white" />
          </div>
          <h1 className="text-xl font-black tracking-tighter italic uppercase">経営ダッシュボード</h1>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">System Status</p>
          <p className="text-xs font-black text-blue-400">CONNECTING_GLOBAL_NODES...</p>
        </div>
      </header>

      <main className="relative z-10 flex flex-col items-center pt-16 px-10 max-w-7xl mx-auto">
        <div className="text-center space-y-2 mb-12">
          <h2 className="text-7xl font-black italic tracking-tighter uppercase leading-none">Strategic Portal</h2>
          <p className="text-blue-400 font-bold tracking-[0.5em] text-xs uppercase">Management Command Center</p>
        </div>

        <div className="w-full relative aspect-[21/9] bg-slate-900/40 rounded-[3rem] border border-white/10 shadow-2xl overflow-hidden group">
          {/* マップ上のピン */}
          {centers.map((center) => (
            <Link key={center.id} href={center.active ? `/dashboard/${center.id}` : '#'}>
              <div 
                className={`absolute ${center.active ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'} group/pin`}
                style={{ top: center.top, left: center.left }}
              >
                {center.active && <div className="absolute -inset-4 bg-blue-500/30 rounded-full animate-ping"></div>}
                <div className="relative flex flex-col items-center gap-2">
                  <div className={`w-8 h-8 bg-slate-950 border-2 ${center.active ? 'border-blue-400' : 'border-slate-600'} rounded-full flex items-center justify-center shadow-lg`}>
                    <MapPin size={16} className={center.active ? 'text-blue-400 fill-blue-400' : 'text-slate-600'} />
                  </div>
                  <div className="bg-white/90 backdrop-blur-md px-4 py-1 rounded-full">
                    <span className="text-[10px] font-black text-slate-950 whitespace-nowrap">{center.name}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full mt-12">
           <div className="bg-white/5 border border-white/10 p-8 rounded-[2rem] backdrop-blur-md">
              <Bot className="text-blue-400 mb-4" />
              <h3 className="text-xs font-black uppercase text-slate-400 mb-2">AI Intelligence</h3>
              <p className="text-sm font-medium leading-relaxed italic text-slate-200">
                昭和冷蔵の物流フローを検知。予測モデルとの照合を開始しました。
              </p>
           </div>
           <div className="bg-white/5 border border-white/10 p-8 rounded-[2rem] backdrop-blur-md">
              <TrendingUp className="text-emerald-400 mb-4" />
              <h3 className="text-xs font-black uppercase text-slate-400 mb-2">Active Nodes</h3>
              <p className="text-4xl font-black italic tracking-tighter text-white">01 <span className="text-xl text-slate-600">/ 04</span></p>
           </div>
           <div className="flex items-end pb-4">
              <div className="w-full h-[2px] bg-gradient-to-r from-blue-500 to-transparent opacity-50"></div>
           </div>
        </div>
      </main>
    </div>
  );
}