import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // ログイン画面やロゴ画像など、パスワードなしでも見せていい場所
  const isPublicPath = path === '/login';

  // ユーザーが持っている通行証（Cookie）を確認
  const token = request.cookies.get('pal_auth_token')?.value || '';

  // 通行証がなく、かつ公開ページ以外にアクセスしようとしたらログイン画面へ強制送還
  if (!isPublicPath && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 既に通行証を持っているのにログイン画面に来たら、マップ画面（/）へ案内
  if (path === '/login' && token) {
    return NextResponse.redirect(new URL('/', request.url));
  }
}

// 門番が監視する対象のルール（画像や裏側のシステムファイルは監視から外す）
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|pal-logo.png).*)',
  ],
};