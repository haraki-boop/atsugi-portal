// @ts-nocheck
'use client';
import { useState, useEffect } from 'react';
import { MapPin, Shield, Activity, Layers, Compass, BarChart3, Settings, Users, AlertTriangle, CheckCircle, Search, Filter, Sliders, ChevronRight, X, Info } from 'lucide-react';
import Link from 'next/link';

export default function MapDashboard() {
  const [selectedOffice, setSelectedOffice] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const offices = [
    { id: 'tokyo', name: '東京第一営業所', lat: 35.6812, lng: 139.7671, status: 'normal', manager: '佐藤 健一', staff: 24, volume: '12,450t', efficiency: '94.2%', alert: null },
    { id: 'osaka', name: '大阪中央ロジセンター', lat: 34.6937, lng: 135.5023, status: 'warning', manager: '田中 美咲', staff: 42, volume: '28,100t', efficiency: '81.5%', alert: '車両待機時間が目標を18分超過' },
    { id: 'nagoya', name: '名古屋みなと倉庫', lat: 35.1815, lng: 136.9066, status: 'normal', manager: '鈴木 誠', staff: 18, volume: '8,900t', efficiency: '91.8%', alert: null },
    { id: 'fukuoka', name: '福岡アイランドシティ営業所', lat: 33.6064, lng: 130.4182, status: 'danger', manager: '高橋 竜也', staff: 31, volume: '15,200t', efficiency: '74.3%', alert: '冷凍庫Bラインにて一時的な温度上昇アラート' },
    { id: 'sapporo', name: '札幌北ベース', lat: 43.0621, lng: 141.3544, status: 'normal', manager: '渡辺 裕二', staff: 15, volume: '6,200t', efficiency: '95.1%', alert: null }
  ];

  const filteredOffices = offices.filter(o => {
    const matchesSearch = o.name.includes(searchQuery) || o.manager.includes(searchQuery);
    const matchesFilter = statusFilter === 'all' || o.status === statusFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen w-screen bg-slate-950 text-slate-100 font-sans flex overflow-hidden selection:bg-blue-500/30">
      
      {/* SIDE NAVIGATION PANEL */}
      <aside className="w-20 bg-slate-900 border-r border-slate-800 flex flex-col items-center py-6 justify-between shrink-0">
        <div className="flex flex-col items-center gap-8 w-full">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-blue-500/20 ring-1 ring-white/10">
            <Shield size={22} className="text-white animate-pulse" />
          </div>
          <nav className="flex flex-col gap-3 w-full px-2">
            <button className="w-full aspect-square rounded-xl bg-slate-800 text-blue-400 flex items-center justify-center transition-all ring-1 ring-blue-500/20"><Layers size={20} /></button>
            <button className="w-full aspect-square rounded-xl text-slate-500 hover:text-slate-300 flex items-center justify-center transition-all hover:bg-slate-800/50"><Compass size={20} /></button>
            <button className="w-full aspect-square rounded-xl text-slate-500 hover:text-slate-300 flex items-center justify-center transition-all hover:bg-slate-800/50"><Users size={20} /></button>
            <button className="w-full aspect-square rounded-xl text-slate-500 hover:text-slate-300 flex items-center justify-center transition-all hover:bg-slate-800/50"><Settings size={20} /></button>
          </nav>
        </div>
        <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-black text-xs text-slate-400">HQ</div>
      </aside>

      {/* MAIN COCKPIT CONTAINER */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        
        {/* TOP COMPONENT HEADER */}
        <header className="h-20 bg-slate-900/90 border-b border-slate-800 px-8 flex justify-between items-center backdrop-blur-md z-30">
          {/* 💥 タイトルコンテナ：ロゴをタイトルの左横にインラインで直撃配置 */}
          <div className="flex items-center gap-4">
            {/* お兄ちゃん指定のBase64画像オブジェクト（タイトルの左横） */}
            <div className="shrink-0 flex items-center justify-center overflow-hidden rounded-lg bg-transparent">
              <img 
                src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHwAAAAwCAYAAADThB6pAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAATNSURBVHhe7Zu/iyRFFMdfLyy6l/grcMVgqxWFQ8Q/YauN7kT8cRiYTVduIqKCgVUleuAFF2yggkjXRIpmmlxWzWHiLwQ9lHN37cJgjws0kWPPqE2mhu7X0z+nZ7Znpj5QsFOvqqfo77xXr36sl6ZpCo6NYQtXONYbJ/iG4QTfMM5McCEExHGMqx0LZumCx3EMvu+DlBKbHEtgaYIbYyAIAgiCAIwx2FzJ6S834L/jP3G1owNLEVwIAb7vdwrht68ewM1nL+BqR0cWKngcxxAEQafwfef7H+Hw4otw6/IVbHLMwcIEZ4xBEASdvPrW5Stw+NxLcOeHn7DJMSe9C66UAt/3QSmFTbX8e/1buBlcgNtXD7DJ0RO9CW6TMsZY66QM0hRO3n0Pji+9Cqe/3sBWR494feylCyFy8zSlFAghuTaz4JzDg38cwQl/H+4eHmFzjvPfXYd7Hn8MVztaMpfgcRyDlLIwT3POQQiRqyvjny++gr9eex1XF3CC90PnkG7X1Fjss8YY06j0QafpawIeT1npm9aCK6XA87zBCZ0ljmNgjIHv+6XF87zp302jURZjDCilOr0HY0zlGIMg6PzsWtKWAEBt4ZzjbqX8/fumX6c8PPVpb7h4d4661cM4L49Jap1rrlHOeUkqnNkJIq3HbZ1NKsakVWuvcGMMwxE16Za0Fxy8TkyRJQfQoinCzAkmS5J6bJAlu0hj8LK01btIrrUP6OkEIgSiKpisKY0yjXUG8x9CkTxl4NYM/981aC97k5RFCYDQaTT/b+bUKKWXu2UqphSRYi2CtBW8KpTT3uUpw691a64Loq4ATfAZVkcF6N44M4/F4JbzcCT4J41mwx1vs2tgKLYTIzf9VkWEoOMEn3mlzMOVUkAIya3bsZcPnY0XHG9waK1zdovN4LMCA4oGcRwXosXQ2CjBs4IYY0AIAYyxqT2KotJwbpMyvCtHKc31GXrytlGCj8djYIxNt1XH4zEQQoBzDmmaQhiGuMsUKSVwznE1AArrUspBe/lGCR5FEWitYbLDCEmSQJIkBa/FWK8t+0GEYZib94ecvG2U4F2xO2lSSmCMzSxZhpy8rYTg9z1/EbZ3H8bVS8EuxSilsLe3V1pGo9HUywedvOHN9TrwQcms0ufhyckHH+IujcEHE13gnKeEEFw9kzAMp9/V5tQrO8Y2BzFt2loG6+He9jbsfXIAj7zzFjYtjbKlWBnZdsvYX+9yaDNIwXeeOg9PXvsaHnjlEjYtlbKlWBn4Lt8il2hdnz04we9/+QV44to3sPPM09jUmnk9TEpZui4vY94lWpP2xhhgjJUuE6sYlOC7b78B5NOPYGvnXmzqRJOXV4b16v39fWyqBP9AunpiGfHknzGhYgu4ikEIvnXuHJDPPobdN+tvr7YBL4+ahmalVKf5cRb2Vm/Zjw+PyS7zhBCFYi+OQsWeQC04i6sDZ+SzStss/fS333F1Z7TWuWwZF0JIGobhzAw3SZKUEFLoQymtzbq11jP7Zkv2+lQYhrXtq0rXq1Ct76V7noerclBKSw8gHGdPryFda+3EHji9CE4IAa11IWFxDI+5Q7oL4avFXB7uQvjq0UlwF8JXl9YhPQgC59UrTGvBHatNp5DuWF2c4BuGE3zD+B+R2CF0YjSabAAAAABJRU5ErkJggg==" 
                alt="株式会社PAL Logo" 
                className="h-10 w-auto object-contain block opacity-95"
              />
            </div>
            <div>
              {/* タイトル：株式会社PAL拠点統括ロジスティクスマップ */}
              <h1 className="text-base font-black tracking-tight text-white uppercase flex items-center gap-2">
                <Activity size={16} className="text-blue-500" /> 株式会社PAL拠点統括ロジスティクスマップ
              </h1>
              <p className="text-[10px] font-bold text-slate-500 tracking-widest uppercase mt-0.5">Global Infrastructure Operations Feed</p>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex bg-slate-950 p-0.5 rounded-xl border border-slate-800/80">
              <button className="px-3 py-1 bg-slate-800 text-xs font-bold text-white rounded-lg shadow-sm">MAP VIEW</button>
              <button className="px-3 py-1 text-xs font-bold text-slate-500 hover:text-slate-400">ANALYTICS</button>
            </div>
          </div>
        </header>

        {/* GEOGRAPHIC GRID & SIDEBAR OVERLAY */}
        <div className="flex-1 w-full relative bg-slate-950">
          
          {/* HIGH-FIDELITY VECTOR GRAPHIC SIMULATED MAP */}
          <div className="absolute inset-0 z-10 overflow-hidden bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] bg-slate-950 flex items-center justify-center">
            <div className="w-[800px] h-[800px] opacity-20 border border-blue-500/20 rounded-full absolute pointer-events-none animate-[spin_120s_linear_infinite]"></div>
            <div className="w-[500px] h-[500px] opacity-10 border border-dashed border-indigo-500/30 rounded-full absolute pointer-events-none animate-[spin_80s_linear_infinite_reverse]"></div>
            
            {/* INTERACTIVE MARKER MAP PINPOINT NODES */}
            {filteredOffices.map((office) => {
              const xPos = 400 + (office.lng - 136) * 45;
              const yPos = 400 - (office.lat - 37) * 45;
              const isSelected = selectedOffice?.id === office.id;

              return (
                <button
                  key={office.id}
                  onClick={() => setSelectedOffice(office)}
                  style={{ top: `${yPos}px`, left: `${xPos}px` }}
                  className="absolute z-20 group -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
                >
                  <div className={`w-3.5 h-3.5 rounded-full ${office.status === 'danger' ? 'bg-rose-500' : office.status === 'warning' ? 'bg-amber-500' : 'bg-emerald-500'} animate-ping absolute opacity-40 pointer-events-none`}></div>
                  <div className={`w-4 h-4 rounded-full border-2 border-slate-950 shadow-xl flex items-center justify-center transition-all duration-300 relative group-hover:scale-125 ${isSelected ? 'scale-125 ring-4' : 'ring-2'} ${office.status === 'danger' ? 'bg-rose-500 ring-rose-500/30' : office.status === 'warning' ? 'bg-amber-500 ring-amber-500/30' : 'bg-emerald-500 ring-emerald-500/30'}`}>
                    <MapPin size={8} className="text-slate-950 font-black" />
                  </div>
                  <div className="absolute top-6 bg-slate-900/90 border border-slate-800 px-2 py-1 rounded-md text-[9px] font-black tracking-tight text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-md pointer-events-none backdrop-blur-sm z-30">
                    {office.name}
                  </div>
                </button>
              );
            })}
          </div>

          {/* SEARCH & FILTER CONTROLS */}
          <div className="absolute top-6 left-8 z-20 bg-slate-900/95 border border-slate-800 p-4 rounded-2xl w-80 shadow-2xl backdrop-blur-md flex flex-col gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={13} />
              <input
                type="text"
                placeholder="営業所名・責任者で検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800/80 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 font-bold focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            <div className="flex gap-1 border border-slate-800/60 p-0.5 rounded-xl bg-slate-950">
              <button onClick={() => setStatusFilter('all')} className={`flex-1 py-1 text-[10px] font-black rounded-lg transition-all ${statusFilter === 'all' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-300'}`}>全て</button>
              <button onClick={() => setStatusFilter('normal')} className={`flex-1 py-1 text-[10px] font-black rounded-lg transition-all ${statusFilter === 'normal' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-slate-500 hover:text-slate-300'}`}>正常</button>
              <button onClick={() => setStatusFilter('warning')} className={`flex-1 py-1 text-[10px] font-black rounded-lg transition-all ${statusFilter === 'warning' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'text-slate-500 hover:text-slate-300'}`}>注意</button>
              <button onClick={() => setStatusFilter('danger')} className={`flex-1 py-1 text-[10px] font-black rounded-lg transition-all ${statusFilter === 'danger' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'text-slate-500 hover:text-slate-300'}`}>アラート</button>
            </div>
          </div>

          {/* SIDEBAR DETAILED CARD */}
          {selectedOffice && (
            <div className="absolute top-6 right-8 bottom-6 w-96 z-20 bg-slate-900/95 border border-slate-800 rounded-[2rem] shadow-2xl backdrop-blur-md flex flex-col overflow-hidden animate-in slide-in-from-right-8 duration-200">
              <div className="p-6 border-b border-slate-800/80 bg-gradient-to-b from-slate-800/30 to-transparent flex justify-between items-start">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${selectedOffice.status === 'danger' ? 'bg-rose-500' : selectedOffice.status === 'warning' ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
                    <span className="text-[10px] font-black tracking-widest text-slate-500 uppercase">OFFICE NODE</span>
                  </div>
                  <h2 className="text-base font-black text-white tracking-tight leading-snug">{selectedOffice.name}</h2>
                </div>
                <button onClick={() => setSelectedOffice(null)} className="p-1.5 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors"><X size={14} /></button>
              </div>

              <div className="flex-1 p-6 space-y-5 overflow-y-auto text-xs font-bold text-slate-400">
                {selectedOffice.alert && (
                  <div className={`p-4 rounded-2xl border flex gap-3 ${selectedOffice.status === 'danger' ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' : 'bg-amber-500/10 border-amber-500/20 text-amber-400'}`}>
                    <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <p className="font-black text-[10px] uppercase tracking-wider">CRITICAL FEED ALERT</p>
                      <p className="text-[11px] font-medium leading-relaxed">{selectedOffice.alert}</p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800/40">
                    <p className="text-[9px] text-slate-500 uppercase tracking-wider mb-1">拠点最高責任者</p>
                    <p className="text-slate-200 text-xs font-black">{selectedOffice.manager}</p>
                  </div>
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800/40">
                    <p className="text-[9px] text-slate-500 uppercase tracking-wider mb-1">現在の総稼働スタッフ</p>
                    <p className="text-slate-200 text-xs font-black">{selectedOffice.staff} 名</p>
                  </div>
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800/40">
                    <p className="text-[9px] text-slate-500 uppercase tracking-wider mb-1">当月累計総取扱物量</p>
                    <p className="text-slate-200 text-xs font-black">{selectedOffice.volume}</p>
                  </div>
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800/40">
                    <p className="text-[9px] text-slate-500 uppercase tracking-wider mb-1">生産効率性マトリクス</p>
                    <p className="text-blue-400 text-xs font-black">{selectedOffice.efficiency}</p>
                  </div>
                </div>

                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800/40 flex items-start gap-3">
                  <Info size={14} className="text-blue-400 shrink-0 mt-0.5" />
                  <p className="text-[11px] font-medium leading-relaxed text-slate-500">下のゲートウェイボタンをクリックすると、この拠点の財務、人件費、物量密度、生産性を完全可視化した「経営ダッシュボード」に直接安全にアクセスできます。</p>
                </div>
              </div>

              <div className="p-6 bg-slate-950 border-t border-slate-800/80">
                <Link 
                  href={`/dashboard/${selectedOffice.id}`}
                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-blue-500/10 active:scale-[0.99] no-underline"
                >
                  経営指標管理ブレインにアクセス <ChevronRight size={14} />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}