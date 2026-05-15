'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { MapPin, Shield, Activity, Globe } from 'lucide-react';

// 拠点データの定義
const LOCATIONS = [
  { id: 'ATSUGI', name: '厚木営業所', lat: 35.44, lng: 139.36, city: 'KANAGAWA' },
  { id: 'SOUTH-KANTO', name: 'イオンフードサプライ 南関東', lat: 35.68, lng: 139.98, city: 'CHIBA' },
  { id: 'HANNAN', name: '尾家産業 阪南支店', lat: 34.44, lng: 135.36, city: 'OSAKA' },
  { id: 'MEDIENT', name: 'メディエントランス', lat: 34.82, lng: 135.48, city: 'OSAKA' },
];

export default function LandingPage() {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans overflow-hidden relative">
      {/* 背景のグリッド */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]"></div>
      
      {/* メインコンテンツ */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-6">
        
        {/* ヘッダーエリア */}
        <div className="text-center mb-12 space-y-4">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-blue-500/10 rounded-3xl border border-blue-500/20 shadow-[0_0_50px_rgba(59,130,246,0.2)]">
              <Globe className="text-blue-500 animate-spin-slow" size={48} />
            </div>
          </div>
          <h1 className="text-6xl font-black italic tracking-tighter text-white">
            AFS_COMMAND <span className="text-blue-500">CENTER</span>
          </h1>
          <p className="text-slate-500 font-mono tracking-[0.5em] text-xs uppercase">
            National Logistics Monitoring System v3.0
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-7xl w-full">
          
          {/* 左側：かっちょいい日本地図エリア */}
          <div className="relative aspect-square bg-slate-900/50 rounded-[4rem] border border-white/5 shadow-2xl overflow-hidden group">
            <div className="absolute inset-0 flex items-center justify-center opacity-20">
               {/* 日本地図の簡易表現（ドット） */}
               <svg viewBox="0 0 500 500" className="w-[80%] h-[80%] fill-blue-500">
                 <path d="M380,100 L400,80 L420,120 L380,200 L350,300 L300,380 L250,420 L180,450 L100,420 L80,350 L150,300 L250,200 Z" opacity="0.3" />
               </svg>
            </div>

            {/* 各拠点のピン */}
            {LOCATIONS.map((loc) => (
              <div
                key={loc.id}
                className="absolute transition-all duration-500"
                style={{ 
                  left: `${(loc.lng - 130) * 8}%`, 
                  bottom: `${(loc.lat - 30) * 8}%` 
                }}
              >
                <div 
                  className={`relative flex flex-col items-center group-hover:scale-110 transition-transform`}
                  onMouseEnter={() => setHovered(loc.id)}
                  onMouseLeave={() => setHovered(null)}
                >
                  <div className={`w-4 h-4 rounded-full bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,1)] animate-pulse`}></div>
                  {hovered === loc.id && (
                    <div className="absolute bottom-6 bg-slate-900 border border-blue-500/50 px-3 py-1 rounded text-[10px] whitespace-nowrap z-50">
                      {loc.name}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* 右側：拠点選択リスト */}
          <div className="space-y-4">
            <h2 className="text-slate-500 font-black text-[10px] tracking-[0.3em] mb-6 flex items-center gap-2">
              <Activity size={14} className="text-blue-500" /> SELECT_DESTINATION
            </h2>
            
            <div className="grid gap-4">
              {LOCATIONS.map((loc) => (
                <Link key={loc.id} href={`/dashboard/${loc.id}`} className="no-underline group">
                  <div className="bg-slate-900/50 hover:bg-blue-600 transition-all duration-300 p-6 rounded-[2rem] border border-white/5 flex items-center justify-between group-hover:translate-x-2 shadow-xl">
                    <div className="flex items-center gap-6">
                      <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-white/20">
                        <MapPin size={20} className="text-blue-400 group-hover:text-white" />
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-500 group-hover:text-blue-200 font-mono mb-1">{loc.city}</div>
                        <div className="text-lg font-black tracking-tighter text-white group-hover:scale-105 transition-transform origin-left">
                          {loc.name}
                        </div>
                      </div>
                    </div>
                    <div className="text-blue-500 group-hover:text-white">
                      <Shield size={24} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

        </div>

        {/* フッター */}
        <div className="mt-16 text-[8px] text-slate-600 font-mono tracking-[1em] uppercase">
          Secure_Encrypted_Link_Active
        </div>
      </div>

      <style jsx global>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 12s linear infinite;
        }
      `}</style>
    </div>
  );
}