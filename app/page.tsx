// @ts-nocheck
'use client';

import { useEffect, useState } from 'react';
import { Shield, Globe, MapPin } from 'lucide-react';
import dynamic from 'next/dynamic';

// ブラウザ側だけで安全に地図を動かすための設定
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);

export default function PortalPage() {
  const [mounted, setMounted] = useState(false);
  const [L, setL] = useState<any>(null);

  // お兄ちゃんが教えてくれた超正確な4拠点データ（住所・緯度経度）
  const centers = [
    { 
      id: 'SHOWA', 
      name: '昭和冷蔵（株式会社昭和）厚木センター', 
      lat: 35.517879, 
      lng: 139.354149, 
      active: true, 
      addr: '〒243-0801 神奈川県厚木市上依知字上ノ原3007-9', 
      tier: 'Main Node' 
    },
    { 
      id: 'AFS_MINAMI', 
      name: 'イオンフードサプライ（AFS）南関東センター', 
      lat: 35.669, 
      lng: 140.009, 
      active: false, 
      addr: '〒273-0014 千葉県船橋市高瀬町24-12（または習志野市芝園2-2-5）', 
      tier: 'Sub Node' 
    },
    { 
      id: 'MEDI', 
      name: 'メディエントランス株式会社', 
      lat: 34.822208, 
      lng: 135.48918, 
      active: false, 
      addr: '〒562-0036 大阪府箕面市船場西2丁目1-1（エリモビル4階）', 
      tier: 'Tier 4 Emergency' 
    },
    { 
      id: 'OIE', 
      name: '尾家産業株式会社 阪南支店', 
      lat: 34.454641, 
      lng: 135.344908, 
      active: false, 
      addr: '〒597-0093 大阪府貝塚市二色中町5-1', 
      tier: 'Kansai Hub' 
    },
  ];

  useEffect(() => {
    setMounted(true);
    // 地図のピンが消えるバグを解決するおまじない
    import('leaflet').then((leaflet) => {
      delete leaflet.Icon.Default.prototype._getIconUrl;
      leaflet.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
      });
      setL(leaflet);
    });
  }, []);

  if (!mounted || !L) {
    return <div className="h-screen bg-slate-950 flex items-center justify-center text-blue-400 font-mono animate-pulse uppercase tracking-[0.4em]">LOADING_REAL_MAP_ENGINE...</div>;
  }

  return (
    <div className="h-screen w-screen bg-slate-950 text-white font-sans overflow-hidden flex flex-col relative">
      {/* 真っ黒バグを直すためのLeaflet公式スタイルシートを強制注入 */}
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" />
      
      <style>{`
        .leaflet-container {
          width: 100%;
          height: 100%;
          background-color: #020617 !important;
        }
        .leaflet-popup-content-wrapper {
          background: #ffffff !important;
          border-radius: 1.5rem !important;
          padding: 8px !important;
        }
        .leaflet-popup-tip {
          background: #ffffff !important;
        }
      `}</style>

      {/* ヘッダー：経営ダッシュボード */}
      <header className="absolute top-0 left-0 right-0 z-[1000] h-24 border-b border-white/5 flex items-center justify-between px-12 backdrop-blur-md bg-slate-950/80">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.4)]">
            <Shield size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tighter uppercase italic text-slate-100">経営ダッシュボード</h1>
            <p className="text-[9px] font-bold text-blue-400 tracking-widest uppercase">Management Intelligence Portal</p>
          </div>
        </div>
        <div className="flex items-center gap-8">
          <div className="text-right border-l border-white/10 pl-8">
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Map Engine</p>
            <p className="text-xs font-black text-emerald-400 uppercase tracking-tight">LEAFLET_GPS_SYNC</p>
          </div>
        </div>
      </header>

      {/* メイン地図 */}
      <div className="w-full h-full pt-24 relative z-0">
        <MapContainer 
          center={[35.2, 137.8]} // 関東と関西の拠点がバランスよく綺麗に入る初期位置
          zoom={7} // 全拠点を俯瞰するのに最適なズーム
          zoomControl={false}
        >
          {/* 地図のデザイン：スタイリッシュなダークマップ */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />

          {/* 正確な住所・緯度経度で4拠点を配置 */}
          {centers.map((center) => (
            <Marker key={center.id} position={[center.lat, center.lng]}>
              <Popup>
                <div className="p-2 text-slate-900 font-sans" style={{ maxWidth: '240px' }}>
                  <p className="text-[9px] font-black text-blue-600 uppercase tracking-wider m-0">{center.tier}</p>
                  <h3 className="text-xs font-black m-0 mt-0.5 mb-1 leading-tight">{center.name}</h3>
                  <p className="text-[9px] text-slate-500 m-0 mb-3 leading-normal">{center.addr}</p>
                  
                  {center.active ? (
                    <a 
                      href={`/dashboard/${center.id}`}
                      className="block text-center no-underline bg-slate-900 text-white font-black text-[10px] py-2.5 rounded-xl hover:bg-blue-600 transition-colors uppercase tracking-wider"
                    >
                      ダッシュボードを開く
                    </a>
                  ) : (
                    <div className="text-center bg-slate-100 text-slate-400 font-bold text-[10px] py-2.5 rounded-xl cursor-not-allowed">
                      データ準備中
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* 左下に浮かぶステータスパネル */}
        <div className="absolute bottom-8 left-8 z-[1000] p-6 bg-slate-950/90 border border-white/10 rounded-3xl backdrop-blur-md w-[22rem] shadow-2xl pointer-events-auto">
          <h2 className="text-sm font-black uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
            <Globe size={14} className="text-blue-400" /> 拠点管制ステータス
          </h2>
          <div className="space-y-4">
            {centers.map(c => (
              <div key={c.id} className="flex items-start justify-between gap-4">
                <div className="space-y-0.5">
                  <p className="text-xs font-black text-white leading-tight">{c.name.split('（')[0].split('株式会社')[0]}</p>
                  <p className="text-[9px] text-slate-500 font-medium leading-tight line-clamp-1">{c.addr}</p>
                </div>
                <span className={`text-[9px] font-black px-2 py-0.5 rounded-md shrink-0 ${c.active ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-800 text-slate-500'}`}>
                  {c.active ? 'ACTIVE' : 'STANDBY'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}