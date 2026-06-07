import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // 1. ダッシュボード画面から「どのテーブルに」「どんな操作を」「どんなデータで」行いたいかを受け取る
    const { table, actionMethod, payload, query } = await request.json();

    // 2. 金庫(.env.local)からSupabaseのURLと合鍵（トークン）を取り出す
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('[API Error] Supabaseの鍵が .env.local に設定されていません。');
      return NextResponse.json({ error: 'Supabase credentials are missing.' }, { status: 500 });
    }

    // 3. 通信先URLを組み立てる
    const url = `${supabaseUrl}/rest/v1/${table}${query || ''}`;

    // 4. サーバーの裏側から、安全にSupabase本体へ通信する！
    const res = await fetch(url, {
      method: actionMethod,
      headers: {
        'apikey': supabaseKey,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      // 🚨 復活：データを送る必要がある(POSTやPATCH)場合だけ、payloadをくっつける
      body: payload ? JSON.stringify(payload) : undefined
    }); // 🚨 復活：ここできっちりfetchを閉じる！

    // 5. Supabaseからの返答をチェック
    if (!res.ok) {
      const errDetail = await res.json().catch(() => ({}));
      console.error(`[Supabase API Error] ${actionMethod} ${table}:`, errDetail);
      return NextResponse.json({ error: errDetail.message || 'Supabase Error' }, { status: res.status });
    }

    // DELETE（削除）の場合は返すデータが無いので、成功の合図だけを返す
    if (actionMethod === 'DELETE') {
      return NextResponse.json({ success: true });
    }

    // GET, POST, PATCH の場合は、結果のデータを画面に返す
    const data = await res.json();
    return NextResponse.json(data);

  } catch (error: any) {
    console.error('[Supabase Route Exception]:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}