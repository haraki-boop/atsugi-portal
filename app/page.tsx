'use client';

import Link from 'next/link';
import { MapPin, Globe } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-10 text-white font-sans uppercase tracking-[0.3em]">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-500/5 rounded-full blur-[120px]"></div>
      </div>

      <div className="relative z-10 text-center mb-16">
        <div className="flex justify-center mb-6">
          <div className="p-5 bg-blue-500/10 rounded-3xl border border-blue-500/20 shadow-[0_0_30px_rgba(59,130,246,0.2)]">
            <Globe className="text-blue-500 animate-spin" style={{ animationDuration: '15s' }} size={48} />
          </div>
        </div>
        <h1 className="text-5xl font-black italic tracking-tighter mb-4 text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-slate-500">
          AFS_COMMAND_CENTER
        </h1>
        <div className="flex items-center justify-center gap-3">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></div>
          <p className="text-blue-500 text-[10px] font-bold tracking-[0.5em] m-0">SYSTEM STATUS: ONLINE</p>
        </div>
      </div>

      <div className="relative z-10 w-full max-w-[480px]">
        <div className="bg-slate-900/40 backdrop-blur-3xl rounded-[4rem] border border-white/10 p-12 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50"></div>
          
          <div className="space-y-10">
            <div className="text-center">
              <span className="text-[10px] text-slate-500 font-black tracking-[0.6em]">SELECT_ACTIVE_NODE</span>
            </div>

            <Link href="/dashboard/atsugi" className="block no-underline">
              <div className="bg-slate-800/80 hover:bg-blue-600 p-8 rounded-[2.5rem] border border-white/5 hover:border-blue-400 transition-all duration-500 flex items-center justify-between group/btn shadow-xl hover:shadow-blue-500/30 hover:scale-[1.02]">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-slate-950 rounded-2xl flex items-center justify-center text-blue-500 group-hover/btn:text-white transition-colors">
                    <MapPin size={32} />
                  </div>
                  <div className="text-left">
                    <div className="text-2xl font-black italic group-hover/btn:tracking-wider transition-all">厚木営業所</div>
                    <div className="text-[9px] text-slate-500 font-bold tracking-widest mt-1">ATS_BRANCH_001</div>
                  </div>
                </div>
                <div className="text-blue-500 group-hover/btn:text-white font-black italic text-xs opacity-0 group-hover/btn:opacity-100 transition-all translate-x-[-10px] group-hover/btn:translate-x-0">
                  ENTER_
                </div>
              </div>
            </Link>

            <div className="opacity-20 cursor-not-allowed">
              <div className="bg-slate-950/50 p-6 rounded-[2rem] border border-white/5 flex items-center justify-between grayscale">
                <div className="flex items-center gap-5">
                  <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center">
                    <MapPin size={20} className="text-slate-700" />
                  </div>
                  <span className="text-lg font-bold italic text-slate-600 tracking-tight">横浜営業所</span>
                </div>
                <span className="text-[8px] font-black tracking-widest">OFFLINE</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}