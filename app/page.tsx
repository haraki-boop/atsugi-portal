// @ts-nocheck
'use client';

import { useEffect, useState } from 'react';
import { Shield, Globe } from 'lucide-react';
import dynamic from 'next/dynamic';

// Leafletはブラウザ側だけで動かす必要があるため、動的読み込みにする
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

  // 4拠点の正確な緯度・経度を設定
  const centers = [
    { id: 'SHOWA', name: '昭和冷蔵', lat: 35.426, lng: 139.352, active: true, addr: '神奈川県厚木市上依知', tier: 'Main Node' },
    { id: 'AFS_MINAMI', name: 'AFS南関東', lat: 35.430, lng: 139.355, active: false, addr: '神奈川県厚木市', tier: 'Sub Node' },
    { id: 'MEDI', name: 'メディエントランス', lat: 35.676, lng: 139.772, active: false, addr: '東京都中央区京橋', tier: 'Tier 4 Emergency' },
    { id: 'OIE', name: '尾家産業', lat: 34.759, lng: 135.516, active: false, addr: '大阪府吹田市芳野町', tier: 'Kansai Hub' },
  ];

  useEffect(() => {
    setMounted(true);
    // Leafletのアイコンバグを防ぐためにブラウザ側で読み込む
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
    <div className="min-h-screen bg-slate-950 text-white font-sans overflow-hidden flex flex-col relative">
      {/* Leafletのスタイルシートを強制注入 */}
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" />

      {/* ヘッダー：経営ダッシュボード */}
      <header className="relative z-[1000] h-24 border-b border-white/5 flex items-center justify-between px-12 backdrop-blur-md bg-slate-950/80 shrink-0">
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
            <p className="text-xs font-black text-emerald-400 uppercase tracking-tight">LEAFLET_LIVE_SYNC</p>
          </div>
        </div>
      </header>

      {/* メインエリア：画面全体を本物の地図に */}
      <div className="flex-grow w-full relative z-0">
        <MapContainer 
          center={[35.5, 137.5]} // 関東と関西の間を中心に設定
          zoom={7} // 日本全体が綺麗に見えるズームレベル
          style={{ height: '100%', width: '100%' }}
          className="bg-slate-950"
        >
          {/* 超カッコいいダークモード仕様の地図タイル（CartoDB DarkMatter） */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />

          {/* 4拠点を本物の地図上にプロット */}
          {centers.map((center) => (
            <Marker key={center.id} position={[center.lat, center.lng]}>
              <Popup>
                <div className="p-2 text-slate-900 font-sans" style={{ minWidth: '160px' }}>
                  <p className="text-[9px] font-black text-blue-600 uppercase tracking-wider m-0">{center.tier}</p>
                  <h3 className="text-sm font-black m-0 mt-0.5 mb-1">{center.name}</h3>
                  <p className="text-[10px] text-slate-500 m-0 mb-3">{center.addr}</p>
                  
                  {center.active ? (
                    <a 
                      href={`/dashboard/${center.id}`}
                      className="block text-center no-underline bg-slate-900 text-white font-black text-[10px] py-2 rounded-xl hover:bg-blue-600 transition-colors uppercase tracking-wider"
                    >
                      ダッシュボードを開く
                    </a>
                  ) : (
                    <div className="text-center bg-slate-100 text-slate-400 font-bold text-[10px] py-2 rounded-xl cursor-not-allowed">
                      データ準備中
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* マップ上に浮かぶサイド情報パネル */}
        <div className="absolute bottom-8 left-8 z-[500] p-6 bg-slate-950/90 border border-white/10 rounded-3xl backdrop-blur-md max-w-xs shadow-2xl pointer-events-auto">
          <h2 className="text-sm font-black uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
            <Globe size={14} className="text-blue-400" /> 拠点管制ステータス
          </h2>
          <div className="space-y-3">
            {centers.map(c => (
              <div key={c.id} className="flex items-center justify-between gap-6">
                <div>
                  <p className="text-xs font-black text-white">{c.name}</p>
                  <p className="text-[9px] text-slate-500 font-medium">{c.addr}</p>
                </div>
                <span className={`text-[9px] font-black px-2 py-0.5 rounded-md ${c.active ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-800 text-slate-500'}`}>
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