'use client';

import { createClient } from '@/utils/supabase/client';

export default function LoginPage() {
  const supabase = createClient();

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'https://ai-summarizer-5vbj.vercel.app/auth/callback',
      },
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <button 
        onClick={handleGoogleLogin}
        className="rounded-lg bg-black px-4 py-2 text-white font-medium"
      >
        Sign in with Google
      </button>
    </div>
  );
}
