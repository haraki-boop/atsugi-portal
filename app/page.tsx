// @ts-nocheck
'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { MapPin, Navigation, Building2, ChevronRight, DoorOpen } from 'lucide-react';

export default function MapPortalPage() {
  const [map, setMap] = useState<any>(null);
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  
  // 🚀 ピンの重なり順（前後）を操作するために、全ピンを保存しておく箱
  const markersRef = useRef<{ [key: string]: any }>({});

  const locations = [
    { id: 'showa-reizo', name: '昭和冷蔵', address: '神奈川県厚木市', lat: 35.4430, lng: 139.3640, type: 'hub', desc: '' },
    { id: 'afs-minamikanto', name: 'AFS南関東センター', address: '〒千葉県船橋市高瀬町24番12号', lat: 35.6717, lng: 139.9924, type: 'center', desc: '' },
    { id: 'craft-delica', name: 'クラフトデリカ', address: '千葉県船橋市高瀬町24-6', lat: 35.6715, lng: 139.9930, type: 'center', desc: '' },
    { id: 'landport-narashino', name: 'ランドポート習志野', address: '千葉県習志野市茜浜3丁目7-2', lat: 35.6586, lng: 139.9920, type: 'center', desc: '' },
    { id: 'tokyu-store', name: '東急ストア 流通センター', address: '神奈川県川崎市川崎区東扇島23-4', lat: 35.4998, lng: 139.7702, type: 'center', desc: '' },
    { id: 'afs-bisai', name: 'AFS尾西_流通', address: '愛知県一宮市明地南茱之木25-1', lat: 35.2869, lng: 136.7391, type: 'center', desc: '' },
    { id: 'yamanaka-shionagi', name: 'ヤマナカ しおなぎ生鮮センター', address: '愛知県名古屋市港区潮凪町1-3', lat: 35.0797, lng: 136.8618, type: 'center', desc: '' },
    { id: 'mitsui-chubu', name: '三井食品 中部物流センター（高根山）', address: '愛知県名古屋市緑区高根山2丁目108', lat: 35.0461, lng: 136.9485, type: 'center', desc: '' },
    
    // 💡 新規追加：三井とカインズの間に挿入（青ピン）
    { id: 'oie-hannan', name: '尾家産業 阪南支店', address: '大阪府貝塚市二色中町5-1', lat: 34.454641, lng: 135.344908, type: 'center', desc: '' },
    { id: 'medi-entrance', name: 'メディエントランス', address: '大阪府箕面市森町西2丁目4-1', lat: 34.885, lng: 135.443, type: 'center', desc: '' },

    { id: 'cainz-kobe', name: 'カインズ 神戸流通センター', address: '兵庫県神戸市須磨区弥栄台', lat: 34.6860, lng: 135.0750, type: 'center', desc: '' },
    { id: 'cainz-fukuoka', name: 'カインズ 福岡流通センター', address: '福岡県糟屋郡久山町久原2940', lat: 33.6420, lng: 130.5050, type: 'center', desc: '' },
    
    // 🌸 ピンク指定の3現場
    { id: 'afs-bisai-seiso', name: 'AFS尾西_清掃', address: '愛知県一宮市明地南茱之木25-1', lat: 35.286934, lng: 136.739061, type: 'center', desc: '', isPink: true },
    { id: 'himeji-afs-seiso', name: '兵庫姫路_AFS_清掃', address: '兵庫県姫路市白浜町甲841-51', lat: 34.778469, lng: 134.703810, type: 'center', desc: '', isPink: true },
    { id: 'mandai-saito', name: '万代彩都', address: '大阪府茨木市彩都あかね3-1', lat: 34.861370, lng: 135.534495, type: 'center', desc: '万代 彩都物流センター', isPink: true }
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

        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
          iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
          shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        });

        const leafMap = L.map('leaflet-map-container', {
          zoomControl: true,
          attributionControl: true
        }).setView([35.2, 137.5], 6);

        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
          attribution: '&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>'
        }).addTo(leafMap);

        const pinkIcon = new L.Icon({
          iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
          shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41],
          className: 'pink-map-pin' 
        });

        locations.forEach(loc => {
          const markerOptions = loc.isPink ? { icon: pinkIcon } : {};
          const marker = L.marker([loc.lat, loc.lng], markerOptions).addTo(leafMap);
          
          // 作成したピンをRefに保存
          markersRef.current[loc.id] = marker;
          
          marker.on('click', () => {
            setSelectedLocation(loc);
            leafMap.panTo([loc.lat, loc.lng]);
            
            // 🚀 クリックされたピンを最前面（一番上）に持ってくる
            Object.values(markersRef.current).forEach((m: any) => m.setZIndexOffset(0));
            marker.setZIndexOffset(1000);
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
      
      // 🚀 サイドバーから選んだ時も、該当のピンを最前面に持ってくる
      if (markersRef.current) {
        Object.values(markersRef.current).forEach((m: any) => m.setZIndexOffset(0));
        if (markersRef.current[loc.id]) {
          markersRef.current[loc.id].setZIndexOffset(1000);
        }
      }
    }
  };

  return (
    <div className="h-[100dvh] w-screen bg-slate-50 text-slate-900 flex flex-col md:flex-row overflow-hidden font-sans">
      
      <style dangerouslySetInnerHTML={{__html: `
        .pink-map-pin {
          filter: hue-rotate(140deg) saturate(200%) brightness(110%);
        }
      `}} />

      {/* サイドバーエリア */}
      <div className="w-full md:w-[400px] h-[35vh] md:h-full bg-white border-b md:border-b-0 md:border-r border-slate-200 flex flex-col justify-between z-20 shadow-lg shrink-0">
        <div className="p-4 md:p-6 space-y-4 md:space-y-6 overflow-y-auto flex-1">
          <div className="border-b border-slate-100 pb-3 md:pb-4">
            <h1 className="text-[10px] md:text-xs font-black tracking-[0.2em] text-slate-400 uppercase">株式会社PAL</h1>
            <p className="text-sm md:text-base font-black text-slate-800 tracking-tighter uppercase flex items-center mt-1">
              <img 
                src="/pal-logo.png" 
                alt="株式会社PAL Logo" 
                className="h-5 md:h-7 w-auto object-contain inline-block mr-1.5 align-middle"
              />
              <span className="align-middle">拠点統スタロジスティクスマップ</span>
            </p>
          </div>

          <div className="space-y-2">
            {/* 💡 視認性アップ：サイズを14→18に拡大、初期色を少し濃いめの slate-400 に変更！ */}
            <div className="flex items-center justify-between px-1">
              <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase">拠点一覧 ({locations.length})</p>
              <Link 
                href="https://palproductivity-dashboard.vercel.app/dashboard/compare" 
                title="15現場 業績比較ダッシュボードを開く" 
                className="text-slate-400 hover:text-blue-600 transition-all p-1 rounded-lg hover:bg-slate-50 duration-200 flex items-center justify-center"
              >
                <DoorOpen size={18} />
              </Link>
            </div>
            
            <div className="space-y-2 max-h-full overflow-y-auto pr-1">
              {locations.map((loc) => (
                <button
                  key={loc.id}
                  onClick={() => handleLocationClick(loc)}
                  className={`w-full text-left p-3 md:p-4 rounded-2xl border transition-all flex justify-between items-center ${
                    selectedLocation?.id === loc.id
                      ? 'bg-slate-900 border-slate-900 text-white shadow-md'
                      : 'bg-white border-slate-100 hover:bg-slate-50'
                  }`}
                >
                  <div className="space-y-1 flex-1 pr-2">
                    <div className="flex items-center gap-2">
                      <h3 className={`text-sm md:text-base font-black tracking-tighter leading-snug ${selectedLocation?.id === loc.id ? 'text-white' : 'text-slate-900'}`}>
                        {loc.name}
                      </h3>
                    </div>
                    <p className={`text-[10px] md:text-[11px] font-medium flex items-center gap-1.5 ${selectedLocation?.id === loc.id ? 'text-slate-300' : 'text-slate-500'}`}>
                      <MapPin 
                        size={13} 
                        className={selectedLocation?.id === loc.id ? "text-white" : (loc.isPink ? "text-pink-500" : "text-blue-500")} 
                      /> 
                      {loc.address}
                    </p>
                  </div>
                  <ChevronRight size={14} className={selectedLocation?.id === loc.id ? 'text-white' : 'text-slate-400'} />
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="p-3 bg-slate-50 border-t border-slate-100 text-[9px] md:text-[10px] text-slate-400 font-bold text-center">
          PRODUCTIVITY SYSTEM
        </div>
      </div>

      {/* 地図エリア */}
      <div className="flex-1 w-full h-[65vh] md:h-full bg-slate-100 relative overflow-hidden">
        <div id="leaflet-map-container" className="w-full h-full z-10"></div>

        {/* 拠点ポップアップ */}
        {selectedLocation && (
          <div className="absolute bottom-4 left-4 right-4 md:bottom-8 md:right-8 md:left-auto md:w-[360px] bg-white/95 border border-slate-200 p-4 md:p-5 rounded-[2rem] shadow-2xl animate-in slide-in-from-bottom-2 duration-150 z-30 space-y-4 backdrop-blur-md">
            <div className="flex justify-between items-start border-b border-slate-100 pb-2">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h2 className="text-base md:text-lg font-black text-slate-900 tracking-tighter leading-tight">
                    {selectedLocation.name}
                  </h2>
                </div>
                <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Navigation size={10} /> LAT: {selectedLocation.lat.toFixed(4)} / LNG: {selectedLocation.lng.toFixed(4)}
                </p>
              </div>
              <button onClick={() => setSelectedLocation(null)} className="text-slate-400 hover:text-slate-900 text-xs p-1 font-mono bg-slate-100 rounded-full w-6 h-6 flex items-center justify-center">✕</button>
            </div>

            <div className="space-y-2">
              {selectedLocation.desc && (
                <div className="bg-slate-50 p-3 rounded-xl text-[10px] md:text-[11px] text-slate-600 font-medium">
                  {selectedLocation.desc}
                </div>
              )}
              <div className="text-[10px] md:text-[11px] text-slate-500 font-medium flex items-start gap-1">
                <MapPin size={12} className={`mt-0.5 shrink-0 ${selectedLocation.isPink ? 'text-pink-500' : 'text-blue-500'}`} /> 
                <span>{selectedLocation.address}</span>
              </div>
            </div>

            <Link
              href={`/dashboard/${selectedLocation.id}`}
              className="w-full py-3 md:py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black tracking-widest text-center shadow-md transition-all flex items-center justify-center gap-1 uppercase no-underline border-t border-white/10"
            >
              ダッシュボードを開く <ChevronRight size={13} />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}