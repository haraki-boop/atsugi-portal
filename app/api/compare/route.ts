import { NextResponse } from 'next/server';

// 💡 常に最新の全社比較データを取得するための設定（キャッシュを持たせない）
export const revalidate = 0;

export async function GET() {
  try {
    // 🛡️ 新仕様：金庫(.env.local)から安全に比較用URLを取り出す
    const targetGasUrl = process.env.GAS_URL_COMPARE;

    if (!targetGasUrl) {
      console.error('[API Error] GAS_URL_COMPARE が .env.local に設定されていません。');
      return NextResponse.json({ error: 'Compare GAS URL is not configured.' }, { status: 500 });
    }

    // サーバーの裏側から、安全に全社比較GAS本体へ通信する
    const res = await fetch(targetGasUrl, { cache: 'no-store' });
    
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