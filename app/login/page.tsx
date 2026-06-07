'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, ArrowRight, Loader2, Lock } from 'lucide-react';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        // パスワード正解でマップ画面へ突入！
        router.push('/');
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error || 'パスワードが違います');
        setIsLoading(false);
      }
    } catch (err) {
      setError('通信エラーが発生しました');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 relative overflow-hidden notranslate" translate="no">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 p-8 md:p-10 rounded-[2rem] shadow-2xl relative z-10 flex flex-col items-center">
        <div className="bg-white px-5 py-3 rounded-2xl mb-8 shadow-lg">
          <img src="/pal-logo.png" alt="PAL Logo" className="h-8 w-auto object-contain" />
        </div>

        <h1 className="text-xl md:text-2xl font-black text-white tracking-widest uppercase mb-2 text-center">
          Strategic Portal
        </h1>
        <p className="text-slate-400 text-xs font-bold tracking-widest mb-8 flex items-center gap-1.5">
          <ShieldCheck size={14} className="text-blue-400" /> セキュアアクセス領域
        </p>

        <form onSubmit={handleLogin} className="w-full space-y-5">
          <div className="space-y-2">
            <div className="relative">
              <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="アクセスパスワードを入力"
                className="w-full bg-slate-900/50 border border-slate-700 text-white font-bold px-4 py-3.5 pl-11 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-600"
                required
              />
            </div>
            {error && <p className="text-rose-400 text-xs font-bold pl-2 animate-pulse">{error}</p>}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black tracking-widest py-3.5 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? <Loader2 size={18} className="animate-spin" /> : '認証してシステムに入る'}
            {!isLoading && <ArrowRight size={18} />}
          </button>
        </form>
      </div>
    </div>
  );
}