'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { MapPin, Shield, Activity, Globe, Zap } from 'lucide-react';

const LOCATIONS = [
  { id: 'ATSUGI', name: '厚木営業所', lat: 35.44, lng: 139.36, city: 'KANAGAWA', addr: '神奈川県厚木市' },
  { id: 'SOUTH-KANTO', name: 'イオンフードサプライ 南関東センター', lat: 35.68, lng: 139.98, city: 'CHIBA', addr: '千葉県船橋市高瀬町24-12' },
  { id: 'HANNAN', name: '尾家産業(株)阪南支店', lat: 34.44, lng: 135.36, city: 'OSAKA', addr: '大阪府貝塚市二色中町5-1' },
  { id: 'MEDIENT', name: 'メディエントランス（株）', lat: 34.82, lng: 135.48, city: 'OSAKA', addr: '大阪府箕面市船場西2丁目1-1' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans overflow-hidden relative">
      {/* 世界地図の背景（オーバーレイ） */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <img 
          src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&q=80&w=2000" 
          alt="World Map" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-transparent to-slate-950"></div>
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-6">
        <div className="text-center mb-16 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 rounded-full border border-blue-500/20 text-blue-400 text-[10px] font-black tracking-[0.4em] uppercase mb-4 animate-pulse">
            <Zap size={12} /> System_Operational
          </div>
          <h1 className="text-7xl font-black italic tracking-tighter text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]">
            AFS_COMMAND <span className="text-blue-500">CENTER</span>
          </h1>
          <p className="text-slate-400 font-mono tracking-[0.8em] text-[10px] uppercase opacity-60">Global Logistics Matrix Monitoring v4.0</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl w-full px-4">
          {LOCATIONS.map((loc) => (
            <Link key={loc.id} href={`/dashboard/${loc.id}`} className="no-underline group">
              <div className="h-full bg-slate-900/40 backdrop-blur-md hover:bg-blue-600 transition-all duration-500 p-8 rounded-[2.5rem] border border-white/5 flex flex-col justify-between shadow-2xl group-hover:-translate-y-4">
                <div className="space-y-6">
                  <div className="w-14 h-14 rounded-2xl bg-blue-500/20 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                    <MapPin size={24} className="text-blue-400 group-hover:text-white" />
                  </div>
                  <div>
                    <div className="text-[10px] text-blue-500 group-hover:text-blue-100 font-black mb-1 tracking-widest">{loc.city}</div>
                    <div className="text-xl font-black tracking-tighter text-white leading-tight">{loc.name}</div>
                    <div className="text-[9px] text-slate-500 group-hover:text-blue-200 mt-4 leading-relaxed font-medium">{loc.addr}</div>
                  </div>
                </div>
                <div className="mt-8 flex justify-end">
                  <Shield size={20} className="text-slate-700 group-hover:text-white/40" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-20 flex gap-12 text-[8px] text-slate-600 font-mono tracking-[0.5em] uppercase">
          <span>Encrypted_Link: Active</span>
          <span>Buffer_Status: Clear</span>
        </div>
      </div>
    </div>
  );
}