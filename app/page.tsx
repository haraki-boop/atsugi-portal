// @ts-nocheck
'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MapPin, Navigation, Building2, ChevronRight } from 'lucide-react';

export default function MapPortalPage() {
  const [map, setMap] = useState<any>(null);
  const [selectedLocation, setSelectedLocation] = useState<any>(null);

  // 📍 お兄ちゃんの指定通りのデータ配列（1文字も改変せず完全ホールド）
  const locations = [
    {
      id: 'showa-reizo',
      name: '昭和冷蔵',
      address: '神奈川県厚木市',
      lat: 35.4430,
      lng: 139.3640,
      type: 'hub',
      desc: ''
    },
    {
      id: 'afs-minamikanto',
      name: 'AFS南関東センター',
      address: '〒千葉県船橋市高瀬町24番12号',
      lat: 35.6717,
      lng: 139.9924,
      type: 'center',
      desc: ''
    },
    {
      id: 'craft-delica',
      name: 'クラフトデリカ',
      address: '千葉県船橋市高瀬町24-6',
      lat: 35.6715,
      lng: 139.9930,
      type: 'center',
      desc: ''
    },
    {
      id: 'landport-narashino',
      name: 'ランドポート習志野',
      address: '千葉県習志野市茜浜3丁目7-2',
      lat: 35.6586,
      lng: 139.9920,
      type: 'center',
      desc: ''
    },
    {
      id: 'tokyu-store',
      name: '東急ストア 流通センター',
      address: '神奈川県川崎市川崎区東扇島23-4',
      lat: 35.4998,
      lng: 139.7702,
      type: 'center',
      desc: ''
    },
    {
      id: 'afs-bisai',
      name: 'AFS尾西_流通',
      address: '愛知県一宮市明地南茱之木25-1',
      lat: 35.2869,
      lng: 136.7391,
      type: 'center',
      desc: ''
    },
    {
      id: 'yamanaka-shionagi',
      name: 'ヤマナカ しおなぎ生鮮センター',
      address: '愛知県名古屋市港区潮凪町1-3',
      lat: 35.0797,
      lng: 136.8618,
      type: 'center',
      desc: ''
    },
    {
      id: 'mitsui-chubu',
      name: '三井食品 中部物流センター（高根山）',
      address: '愛知県名古屋市緑区高根山2丁目108',
      lat: 35.0461,
      lng: 136.9485,
      type: 'center',
      desc: ''
    },
    {
      id: 'cainz-kobe',
      name: 'カインズ 神戸流通センター',
      address: '兵庫県神戸市須磨区弥栄台',
      lat: 34.6860,
      lng: 135.0750,
      type: 'center',
      desc: ''
    },
    {
      id: 'cainz-fukuoka',
      name: 'カインズ 福岡流通センター',
      address: '福岡県糟屋郡久山町久原2940',
      lat: 33.6420,
      lng: 130.5050,
      type: 'center',
      desc: ''
    }
  ];

  useEffect(() => {
    if (typeof window !== 'undefined' && !map) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);

      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = () => {
        const L = window.L;
        const leafMap = L.map('leaflet-map-container', {
          zoomControl: true,
          attributionControl: true
        }).setView([35.2, 137.5], 7);

        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
          attribution: '&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>'
        }).addTo(leafMap);

        locations.forEach(loc => {
          const marker = L.marker([loc.lat, loc.lng]).addTo(leafMap);
          
          marker.on('click', () => {
            setSelectedLocation(loc);
            leafMap.panTo([loc.lat, loc.lng]);
          });
        });

        setMap(leafMap);
      };
      document.head.appendChild(script);
    }
  }, [map]);

  const handleLocationClick = (loc: any) => {
    setSelectedLocation(loc);
    if (map && window.L) {
      map.setView([loc.lat, loc.lng], 11, { animate: true, duration: 1 });
    }
  };

  return (
    <div className="h-screen w-screen bg-slate-50 text-slate-900 flex overflow-hidden font-sans">
      
      {/* 左側サイドバー */}
      <div className="w-[400px] bg-white border-r border-slate-200 flex flex-col justify-between z-20 shadow-lg shrink-0">
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          <div className="border-b border-slate-100 pb-4">
            <h1 className="text-xs font-black tracking-[0.2em] text-slate-400 uppercase">株式会社PAL</h1>
            
            {/* 💥 正しい画像名 /pal-logo.png で綺麗にインライン読み込み */}
            <p className="text-base font-black text-slate-800 tracking-tighter uppercase flex items-center mt-1">
              <img 
                src="/pal-logo.png" 
                alt="株式会社PAL Logo" 
                className="h-7 w-auto object-contain inline-block mr-1.5 align-middle"
              />
              <span className="align-middle">拠点統括ロジスティクスマップ</span>
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase px-1">拠点一覧 ({locations.length})</p>
            <div className="space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto pr-1">
              {locations.map((loc) => (
                <button
                  key={loc.id}
                  onClick={() => handleLocationClick(loc)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all flex justify-between items-center ${
                    selectedLocation?.id === loc.id
                      ? 'bg-slate-900 border-slate-900 text-white shadow-md'
                      : 'bg-white border-slate-100 hover:bg-slate-50'
                  }`}
                >
                  <div className="space-y-1 flex-1 pr-2">
                    <h3 className={`text-base font-black tracking-tighter leading-snug ${selectedLocation?.id === loc.id ? 'text-white' : 'text-slate-900'}`}>
                      {loc.name}
                    </h3>
                    <p className={`text-[11px] font-medium flex items-center gap-1 ${selectedLocation?.id === loc.id ? 'text-slate-400' : 'text-slate-500'}`}>
                      <MapPin size={11} /> {loc.address}
                    </p>
                  </div>
                  <ChevronRight size={14} className={selectedLocation?.id === loc.id ? 'text-white' : 'text-slate-400'} />
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="p-4 bg-slate-50 border-t border-slate-100 text-[10px] text-slate-400 font-bold text-center">
          REIZO COLDCHAIN SYSTEM
        </div>
      </div>

      {/* 右側：地図表示エリア */}
      <div className="flex-1 w-full h-full bg-slate-100 relative overflow-hidden">
        
        {/* 地図コンテナ */}
        <div id="leaflet-map-container" className="w-full h-full z-10"></div>

        {/* 拠点ポップアップ */}
        {selectedLocation && (
          <div className="absolute bottom-8 right-8 w-[360px] bg-white/95 border border-slate-200 p-5 rounded-[2rem] shadow-2xl animate-in slide-in-from-bottom-2 duration-150 z-30 space-y-4 backdrop-blur-md">
            <div className="flex justify-between items-start border-b border-slate-100 pb-2">
              <div className="space-y-0.5">
                <h2 className="text-lg font-black text-slate-900 tracking-tighter leading-tight">
                  {selectedLocation.name}
                </h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Navigation size={10} /> LAT: {selectedLocation.lat.toFixed(4)} / LNG: {selectedLocation.lng.toFixed(4)}
                </p>
              </div>
              <button onClick={() => setSelectedLocation(null)} className="text-slate-400 hover:text-slate-900 text-xs p-1 font-mono">✕</button>
            </div>

            <div className="space-y-2">
              {selectedLocation.desc && (
                <div className="bg-slate-50 p-3 rounded-xl text-[11px] text-slate-600 font-medium">
                  {selectedLocation.desc}
                </div>
              )}
              <div className="text-[11px] text-slate-500 font-medium">
                <span className="text-slate-400 font-bold">住所:</span> {selectedLocation.address}
              </div>
            </div>

            <Link
              href={`/dashboard/${selectedLocation.id}`}
              className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black tracking-widest text-center shadow-md transition-all flex items-center justify-center gap-1 uppercase no-underline border-t border-white/10"
            >
              ダッシュボードを開く <ChevronRight size={13} />
            </Link>
          </div>
        )}

      </div>

    </div>
  );
}