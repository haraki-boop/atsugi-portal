// app/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { Globe, Zap, MapPin, ArrowRight } from 'lucide-react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import 'leaflet/dist/leaflet.css';

const MapContainer = dynamic(() => import('react-leaflet').then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then((mod) => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then((mod) => mod.Marker), { ssr: false });

export default function MapPage() {
  const [L, setL] = useState<any>(null);
  const [activeId, setActiveId] = useState('atsugi');

  useEffect(() => {
    import('leaflet').then((res) => setL(res));
  }, []);

  const hubs = {
    atsugi: { name: '厚木営業所', pos: [35.44, 139.36], status: '稼働中', color: '#10b981' },
    tokyo: { name: '東京本社', pos: [35.68, 139.76], status: 'オンライン', color: '#3b82f6' }
  };

  if (!L) return <div className="h-screen bg-slate-950 flex items-center justify-center text-blue-500 font-mono animate-pulse">SYSTEM LOADING...</div>;

  const icon = (color: string) => new L.DivIcon({
    className: 'custom-icon',
    html: `<div style="background-color:${color}; width:20px; height:20px; border-radius:50%; border:3px solid white; box-shadow:0 0 15px ${color};"></div>`
  });

  return (
    <div className="h-screen w-full bg-slate-950 flex flex-col font-sans text-white overflow-hidden uppercase">
      <header className="h-16 bg-slate-900 border-b border-white/10 px-8 flex justify-between items-center z-50">
        <div className="flex items-center gap-3">
          <Globe size={20} className="text-blue-500" />
          <h1 className="text-lg font-black tracking-tighter">PAL-STYLE <span className="text-blue-500 italic">PORTAL</span></h1>
        </div>
      </header>

      <main className="flex-grow flex relative">
        <div className="flex-grow relative bg-slate-950">
          <MapContainer center={[36.0, 138.8] as any} zoom={7} style={{ height: '100%', width: '100%' }} zoomControl={false}>
            <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
            {Object.entries(hubs).map(([id, hub]) => (
              <Marker key={id} position={hub.pos as any} icon={icon(hub.color)} eventHandlers={{ click: () => setActiveId(id) }} />
            ))}
          </MapContainer>
        </div>

        <aside className="w-96 bg-slate-900 border-l border-white/10 p-8 flex flex-col justify-between z-50 shadow-2xl">
          <div className="space-y-6">
            <div className="bg-blue-500/10 p-4 rounded-2xl border border-blue-500/20">
              <span className="text-[10px] text-blue-500 font-bold block mb-1 tracking-widest">SELECTED_NODE</span>
              <h2 className="text-2xl font-black italic">{hubs[activeId as keyof typeof hubs].name}</h2>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed italic border-l-2 border-blue-500 pl-4">
              日本物流ネットワークの主要ノード。リアルタイム経営指標にアクセス可能です。
            </p>
          </div>
          
          <Link href={`/dashboard/${activeId}`} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-5 rounded-2xl transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-3 no-underline group active:scale-95">
            詳細ダッシュボードへ潜入 <ArrowRight className="group-hover:translate-x-2 transition-transform" />
          </Link>
        </aside>
      </main>
    </div>
  );
}