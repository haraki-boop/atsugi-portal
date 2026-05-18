// @ts-nocheck
'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MapPin, Navigation, Building2, ChevronRight } from 'lucide-react';

export default function MapPortalPage() {
  const [map, setMap] = useState<any>(null);
  const [selectedLocation, setSelectedLocation] = useState<any>(null);

  // 📍 既存拠点 ＋ 新しい8拠点を完全にドッキングしたマスター配列
  const locations = [
    {
      id: 'showa-reizo',
      name: '昭和冷蔵',
      address: '神奈川県厚木市（本社エリア）',
      lat: 35.4430,
      lng: 139.3640,
      type: 'hub',
      desc: '昭和冷蔵 マネジメント・コア・ブレイン拠点'
    },
    {
      id: 'afs-minamikanto',
      name: 'AFS南関東センター',
      address: '神奈川県座間市ひばりが丘',
      lat: 35.4740,
      lng: 139.4230,
      type: 'center',
      desc: '南関東エリア 基幹物流コントロールセンター'
    },
    // 🌟 追加された新しい8拠点
    {
      id: 'craft-delica',
      name: 'クラフトデリカ（イオンフードサプライ本社）',
      address: '千葉県船橋市高瀬町24-6',
      lat: 35.6715,
      lng: 139.9930,
      type: 'center',
      desc: 'イオンフードサプライ本社インフラ連携'
    },
    {
      id: 'landport-narashino',
      name: 'ランドポート習志野',
      address: '千葉県習志野市茜浜3丁目7-2',
      lat: 35.6586,
      lng: 139.9920,
      type: 'center',
      desc: '習志野エリア 高機能型最先端物流デポ'
    },
    {
      id: 'tokyu-store',
      name: '東急ストア 流通センター',
      address: '神奈川県川崎市川崎区東扇島23-4',
      lat: 35.4998,
      lng: 139.7702,
      type: 'center',
      desc: '東扇島臨海エリア コールドチェーン流通センター'
    },
    {
      id: 'afs-bisai',
      name: 'AFS尾西_流通',
      address: '愛知県一宮市明地南茱之木25-1',
      lat: 35.2869,
      lng: 136.7391,
      type: 'center',
      desc: '中部エリア 尾西広域マザー流通センター'
    },
    {
      id: 'yamanaka-shionagi',
      name: 'ヤマナカ しおなぎ生鮮センター',
      address: '愛知県名古屋市港区潮凪町1-3',
      lat: 35.0797,
      lng: 136.8618,
      type: 'center',
      desc: '名古屋港湾エリア 生鮮サプライコールドデポ'
    },
    {
      id: 'mitsui-chubu',
      name: '三井食品 中部物流センター（高根山）',
      address: '愛知県名古屋市緑区高根山2丁目108',
      lat: 35.0461,
      lng: 136.9485,
      type: 'center',
      desc: '緑区高根山 中部広域サプライチェーンコア'
    },
    {
      id: 'cainz-kobe',
      name: 'カインズ 神戸流通センター',
      address: '兵庫県神戸市須磨区弥栄台',
      lat: 34.6860,
      lng: 135.0750,
      type: 'center',
      desc: 'カインズ 神戸流通ネットワークデポ'
    },
    {
      id: 'cainz-fukuoka',
      name: 'カインズ 福岡流通センター',
      address: '福岡県糟屋郡久山町久原2940',
      lat: 33.6420,
      lng: 130.5050,
      type: 'center',
      desc: 'カインズ 福岡流通ネットワークデポ'
    }
  ];

  // 日本列島がきれいに収まる基準座標
  const mapBounds = { minLat: 32.0, maxLat: 37.0, minLng: 130.0, maxLng: 141.5 };

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

        // 💥 シンプルな白ベースのタイルレイヤーURLに完全修正！
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
          attribution: '&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>'
        }).addTo(leafMap);

        // ピンの全自動プロット
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
            {/* 💥 【お兄ちゃん指定】「SHOWA REIZO」から「株式会社PAL」にピンポイントで変更 */}
            <h1 className="text-xs font-black tracking-[0.2em] text-slate-400 uppercase">株式会社PAL</h1>
            
            {/* 💥 【お兄ちゃん指定】「拠点統括ロジスティクスマップ」のすぐ左横にインラインでロゴを直撃配置 */}
            <p className="text-base font-black text-slate-800 tracking-tighter uppercase flex items-center gap-1.5 mt-1">
              <img 
                src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHwAAAAwCAYAAADThB6pAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAATNSURBVHhe7Zu/iyRFFMdfLyy6l/grcMVgqxWFQ8Q/YauN7kT8cRiYTVduIqKCgVUleuAFF2yggkjXRIpmmlxWzWHiLwQ9lHN37cJgjws0kWPPqE2mhu7X0z+nZ7Znpj5QsFOvqqfo77xXr36sl6ZpCo6NYQtXONYbJ/ iG4QTfMM5McCEExHGMqx0LZumCx3EMvu+DlBKbHEtgaYIbYyAIAgiCAIwx2FzJ6S834L/jP3G1owNLEVwIAb7vdwrht68ewM1nL+BqR0cWKngcxxAEQafwfef7H+Hw4otw6/IVbHLMwcIEZ4xBEASdvPrW5Stw+NxLcOeHn7DJMSe9C66UAt/3QSmFTbX8e/1buBlcgNtXD7DJ0RO9CW6TMsZY66QM0hRO3n0Pji+9Cqe/3sBWR494feylCyFy8zSlFAghuTaz4JzDg38cwQl/H+4eHmFzjvPfXYd7Hn8MVztaMpfgcRyDlLIwT3POQQiRqyvjny++gr9eex1XF3CC90PnkG7X1Fjss8YY06j0QafpawIeT1npm9aCK6XA87zBCZ0ljmNgjIHv+6XF87zp302jURZjDCilOr0HY0zlGIMg6PzsWtKWAEBt4ZzjbqX8/fumX6c8PPVpb7h4d4661cM4L49Jap1rrlHOeUkqnNkJIq3HbZ1NKsakVWuvcGMMwxE16Za0Fxy8TkyRJQfQoinCzAkmS5J6bJAlu0hj8LK01btIrrUP6OkEIgSiKpisKY0yjXUG8x9CkTxl4NYM/981aC97k5RFCYDQaTT/b+bUKKWXu2UqphSRYi2CtBW8KpTT3uUpw691a64Loq4ATfAZVkcF6N44M4/F4JbzcCT4J41mwx1vs2tgKLYTIzf9VkWEoOMEn3mlzMOVUkAIya3bsZcPnY0XHG9waK1zdovN4LMCA4oGcRwXosXQ2CjBs4IYY0AIAYyxqT2KotJwbpMyvCtHKc31GXrytlGCj8djYIxNt1XH4zEQQoBzDmmaQhiGuMsUKSVwznE1AArrUspBe/lGCR5FEUitYbLDCEmSQJIkBa/FWK8t+0GEYZib94ecvG2U4F2xO2lSSmCMzSxZhpy8rYTg9z1/EbZ3H8bVS8EuxSilsLe3V1pGo9HUywedvOHN9TrwQcms0ufhyckHH+IujcEHE13gnKeEEFw9kzAMp9/V5tQrO8Y2BzFt2loG6+He9jbsfXIAj7zzFjYtjbKlWBnZdsvYX+9yaDNIwXeeOg9PXvsaHnjlEjYtlbKlWBn4Lt8il2hdnz04we9/+QV44to3sPPM09jUmnk9TEpZui4vY94lWpP2xhhgjJUuE6sYlOC7b78B5NOPYGvnXmzqRJOXV4b16v39fWyqBP9AunpiGfHknzGhYgu4ikEIvnXuHJDPPobdN+tvr7YBL4+ahmalVKf5cRb2Vm/Zjw+PyS7zhBCFYi+OQsWeQC04i6sDZ+SzStss/fS33いつ3AHeQPf6V7noerclBKSw8gHGdPryFda+3EHji9CE4IAa11IWFxDI+5Q7oL4avFXB7uQvjq0UlwF8JXl9YhPQgC59UrTGvBHatNp5DuWF2c4BuGE3zD+B+R2CF0YjSabAAAAABJRU5ErkJggg==" 
                alt="株式会社PAL Logo" 
                className="h-7 w-auto object-contain inline-block align-middle"
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

      {/* 右側：Leaflet白ベース地図表示エリア */}
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
              <div className="bg-slate-50 p-3 rounded-xl text-[11px] text-slate-600 font-medium">
                {selectedLocation.desc}
              </div>
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