import { NextResponse } from 'next/server';

const GAS_API_URL = "https://script.google.com/macros/s/AKfycbwOGihPhhUIM7CyNLP-WGhoSf6aELs3IT2QropaWwXPjByQbywEG4--mYf2O1-DZ43Ylw/exec";

export async function GET() {
  try {
    // サーバーサイドからGASをフェッチ（ブラウザのCORS制限を受けない）
    const res = await fetch(GAS_API_URL, {
      cache: 'no-store' // 常に最新のデータをGASから取得する設定
    });

    if (!res.ok) {
      return NextResponse.json({ error: `GAS returned status ${res.status}` }, { status: 500 });
    }

    const data = await res.json();
    return NextResponse.json(data);
    
  } catch (error: any) {
    console.error("GAS fetch error in server:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}