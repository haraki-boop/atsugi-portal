// @ts-nocheck
'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MapPin, Navigation, Building2, Layers, Shield, ChevronRight, Search, Globe, Radio } from 'lucide-react';

export default function MapPortalPage() {
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [pulseActive, setPulseActive] = useState(true);

  // 📍 昭和冷蔵の全ネットワーク（既存拠点 ＋ お兄ちゃんが指定した新しい8拠点すべてを最初からドッキング！）
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
    // 🌟 ここからお兄ちゃんが追加した最新の8拠点！
    {
      id: 'craft-delica',
      name: 'クラフトデリカ（イオンフードサプライ本社）',
      address: '千葉県船橋市高瀬町24-6',
      lat: 35.6715,
      lng: 139.9930,
      type: 'new-pin',
      desc: 'イオンフードサプライ本社インフラ連携'
    },
    {
      id: 'landport-narashino',
      name: 'ランドポート習志野',
      address: '千葉県習志野市茜浜3丁目7-2',
      lat: 35.6586,
      lng: 139.9920,
      type: 'new-pin',
      desc: '習志野エリア 高機能型最先端物流デポ'
    },
    {
      id: 'tokyu-store',
      name: '東急ストア 流通センター',
      address: '神奈川県川崎市川崎区東扇島23-4',
      lat: 35.4998,
      lng: 139.7702,
      type: 'new-pin',
      desc: '東扇島臨海エリア コールドチェーン流通センター'
    },
    {
      id: 'afs-bisai',
      name: 'AFS尾西_流通',
      address: '愛知県一宮市明地南茱之木25-1',
      lat: 35.2869,
      lng: 136.7391,
      type: 'new-pin',
      desc: '中部エリア 尾西広域マザー流通センター'
    },
    {
      id: 'yamanaka-shionagi',
      name: 'ヤマナカ しおなぎ生鮮センター',
      address: '愛知県名古屋市港区潮凪町1-3',
      lat: 35.0797,
      lng: 136.8618,
      type: 'new-pin',
      desc: '名古屋港湾エリア 生鮮サプライコールドデポ'
    },
    {
      id: 'mitsui-chubu',
      name: '三井食品 中部物流センター（高根山）',
      address: '愛知県名古屋市緑区高根山2丁目108',
      lat: 35.0461,
      lng: 136.9485,
      type: 'new-pin',
      desc: '緑区高根山 中部広域サプライチェーンコア'
    },
    {
      id: 'cainz-kobe',
      name: 'カインズ 神戸流通センター',
      address: '兵庫県神戸市須磨区弥栄台',
      lat: 34.6860,
      xsLng: 135.0750, // 緯度経度のマッピング安全ガード
      lng: 135.0750,
      type: 'new-pin',
      desc: '関西エリア 須磨弥栄台高機能ロジスティクス'
    },
    {
      id: 'cainz-fukuoka',
      name: 'カインズ 福岡流通センター',
      address: '福岡県糟屋郡久山町久原2940',
      lat: 33.6420,
      lng: 130.5050,
      type: 'new-pin',
      desc: '九州エリア 久山広域ネットワークデポ'
    }
  ];

  // 日本地図の座標範囲をきれいに収めるための画面マッピング計算（簡易型ミリタリースタイル）
  const mapBounds = { minLat: 32.0, maxLat: 37.0, minLng: 130.0, maxLng: 141.5 };
  
  const filteredLocations = locations.filter(loc =>
    loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    loc.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 定期的にレーダーパルスを動かす
  useEffect(() => {
    const interval = setInterval(() => setPulseActive(p => !p), 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-screen w-screen bg-slate-950 text-slate-100 flex overflow-hidden font-sans">
      
      {/* 🎛️ 左側：超近未来コックピット型サイドコントロールパネル */}
      <div className="w-[450px] bg-slate-900/90 border-r border-slate-800 flex flex-col justify-between backdrop-blur-md z-20 relative shadow-2xl">
        
        <div className="p-8 space-y-8 overflow-y-auto flex-1">
          {/* ヘッダー */}
          <div className="border-b border-slate-800 pb-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-500/10 rounded-2xl border border-blue-500/30 text-blue-400">
                <Radio className="animate-pulse" size={18} />
              </div>
              <div>
                <h1 className="text-sm font-black tracking-[0.3em] text-slate-400 uppercase">SHOWA REIZO</h1>
                <p className="text-lg font-black tracking-tighter text-white uppercase italic">全拠点統括ロジスティクスナビ</p>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2 text-[10px] font-bold text-emerald-400 bg-emerald-500/5 px-3 py-1 rounded-lg border border-emerald-500/10 w-fit">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping"></span>
              CENTRAL BRAIN NODE CONNECTED
            </div>
          </div>

          {/* 検索バー */}
          <div className="relative">
            <Search className="absolute left-4 top-3.5 text-slate-500" size={16} />
            <input
              type="text"
              placeholder="拠点名、住所でネットワークを走査..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-12 pr-4 py-3 text-xs font-medium text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-all shadow-inner"
            />
          </div>

          {/* 拠点リスト */}
          <div className="space-y-3">
            <p className="text-[10px] font-black tracking-widest text-slate-500 uppercase px-1">全登録拠点一覧 ({filteredLocations.length})</p>
            <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-2 scrollbar-thin">
              {filteredLocations.map((loc) => (
                <button
                  key={loc.id}
                  onClick={() => setSelectedLocation(loc)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all flex justify-between items-center ${
                    selectedLocation?.id === loc.id
                      ? 'bg-gradient-to-r from-blue-900/40 to-slate-800/40 border-blue-500/50 shadow-md transform scale-[1.01]'
                      : 'bg-slate-950/60 border-slate-900/60 hover:bg-slate-800/50 hover:border-slate-700/50'
                  }`}
                >
                  <div className="space-y-1.5 flex-1 pr-3">
                    {/* 💥 【お兄ちゃん指定】センターの名前を大きく（text-base）、太く（font-black）改修！ */}
                    <h3 className="text-base font-black text-white tracking-tighter leading-snug">
                      {loc.name}
                    </h3>
                    <p className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
                      <MapPin size={11} className="text-slate-600" /> {loc.address}
                    </p>
                  </div>
                  <ChevronRight size={14} className={selectedLocation?.id === loc.id ? 'text-blue-400' : 'text-slate-700'} />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* フッターインフォ */}
        <div className="p-6 bg-slate-950 border-t border-slate-800 text-[10px] text-slate-500 font-bold flex justify-between items-center tracking-wider uppercase">
          <div className="flex items-center gap-1.5"><Globe size={12} className="text-slate-600" /> REIZO COLDCHAIN SYS v4.0</div>
          <div className="text-blue-500 font-mono">SECURE</div>
        </div>
      </div>

      {/* 🗺️ 右側：超高機能風デジタルタクティカルマップ画面 */}
      <div className="flex-1 bg-slate-950 relative flex items-center justify-center overflow-hidden">
        
        {/* 背景グリッド＆レーダーエフェクト */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-70"></div>
        
        { pulseActive && <div className="absolute w-[800px] h-[800px] bg-blue-500/[0.01] border border-blue-500/5 rounded-full animate-ping pointer-events-none"></div> }

        {/* マップコンテナ（座標をプロットして日本列島の雰囲気を模したグリッドマップ） */}
        <div className="relative w-[1100px] h-[750px] border border-slate-900/40 bg-slate-900/[0.05] rounded-[3rem] p-8 flex items-center justify-center">
          
          <div className="absolute top-6 left-8 text-left space-y-1">
            <span className="text-[10px] font-black text-blue-500 tracking-[0.2em] uppercase">SYSTEM MONITOR</span>
            <h2 className="text-xs font-bold text-slate-400 font-mono">JAPAN WIDE INFRASTRUCTURE LAYERS</h2>
          </div>

          {/* 📍 デジタルピンの配置 */}
          {filteredLocations.map((loc) => {
            // 緯度経度から画面上の％位置へ安全にマッピング計算
            const topPct = 100 - ((loc.lat - mapBounds.minLat) / (mapBounds.maxLat - mapBounds.minLat)) * 100;
            const leftPct = ((loc.lng - mapBounds.minLng) / (mapBounds.maxLng - mapBounds.minLng)) * 100;

            // 境界チェック
            if (topPct < 0 || topPct > 100 || leftPct < 0 || leftPct > 100) return null;

            return (
              <button
                key={loc.id}
                onClick={() => setSelectedLocation(loc)}
                style={{ top: `${topPct}%`, left: `${leftPct}%` }}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 group z-10"
              >
                <div className="relative flex items-center justify-center">
                  <span className={`absolute w-8 h-8 rounded-full ${loc.type === 'hub' ? 'bg-amber-500/20 animate-ping' : 'bg-blue-500/20 group-hover:animate-ping'}`}></span>
                  <div className={`p-2.5 rounded-xl border transition-all ${
                    selectedLocation?.id === loc.id
                      ? 'bg-amber-500 text-slate-950 border-white shadow-lg scale-125 z-30'
                      : loc.type === 'hub'
                        ? 'bg-slate-900 text-amber-400 border-amber-500/50 shadow-md'
                        : 'bg-slate-900 text-blue-400 border-blue-500/40 group-hover:border-blue-400'
                  }`}>
                    {loc.type === 'hub' ? <Building2 size={14} /> : <MapPin size={14} />}
                  </div>
                  
                  {/* ピンの横に出るクイックラベル */}
                  <span className="absolute left-10 whitespace-nowrap bg-slate-900/90 border border-slate-800 text-[10px] font-black px-2.5 py-1 rounded-lg text-slate-300 opacity-60 group-hover:opacity-100 transition-all pointer-events-none shadow-sm">
                    {loc.name.split('（')[0]} {/* スッキリ表示用 */}
                  </span>
                </div>
              </button>
            );
          })}

          {/* 🖥️ 選択された拠点のタクティカルコックピットポップアップ */}
          {selectedLocation && (
            <div className="absolute bottom-8 right-8 w-[400px] bg-slate-950/95 border border-slate-800 p-6 rounded-[2rem] shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-4 duration-200 z-30 space-y-4">
              <div className="flex justify-between items-start border-b border-slate-800 pb-3">
                <div className="space-y-1">
                  {/* 💥 【お兄ちゃん指定】ポップアップ側の名前も超極太・大文字（text-lg font-black）に改修！ */}
                  <h2 className="text-lg font-black text-white tracking-tighter leading-tight">
                    {selectedLocation.name}
                  </h2>
                  <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest flex items-center gap-1">
                    <Navigation size={10} /> LAT: {selectedLocation.lat.toFixed(4)} / LNG: {selectedLocation.lng.toFixed(4)}
                  </p>
                </div>
                <button onClick={() => setSelectedLocation(null)} className="text-slate-600 hover:text-white font-mono text-xs p-1">✕</button>
              </div>

              <div className="space-y-3">
                <div className="bg-slate-900/50 border border-slate-900 p-3 rounded-xl text-[11px] text-slate-400 leading-relaxed font-medium">
                  {selectedLocation.desc}
                </div>
                <div className="text-[11px] text-slate-500 font-medium flex gap-1.5">
                  <span className="text-slate-600 font-bold">所在地:</span> {selectedLocation.address}
                </div>
              </div>

              {/* 🚀 【お兄ちゃん指定：青文字リンクを全削除】事務的な青いテキストを全て排除し、センター名が主役の美しすぎる近未来ボタンへ完全統合！ */}
              <Link
                href={`/dashboard/${selectedLocation.id}`}
                className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-black tracking-widest text-center shadow-lg transition-all flex items-center justify-center gap-2 group border-t border-white/20 uppercase no-underline"
              >
                コックピットへエントリー <ChevronRight size={13} className="transform group-hover:translate-x-0.5 transition-all" />
              </Link>
            </div>
          )}

        </div>
      </div>

    </div>
  );
}