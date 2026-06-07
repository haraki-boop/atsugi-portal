import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { password } = await request.json();
    
    // 金庫から本物のパスワードを取り出す（設定されていなければ pal2026 を使う）
    const CORRECT_PASSWORD = process.env.SITE_PASSWORD || 'pal2026';

    if (password === CORRECT_PASSWORD) {
      const response = NextResponse.json({ success: true });
      
      // パスワード正解！ブラウザに1週間有効な通行証（Cookie）を持たせる
      response.cookies.set('pal_auth_token', 'authenticated', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7日間有効
        path: '/',
      });
      return response;
    }

    return NextResponse.json({ error: 'パスワードが違います' }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 });
  }
}