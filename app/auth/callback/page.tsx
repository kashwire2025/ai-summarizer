"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const processAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) throw error;

        if (session) {
          if (active) router.push("/");
          return;
        }

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
          if (newSession && active) {
            router.push("/");
          }
        });

        // Fail-safe redirect if authentication fails to settle within 6 seconds
        const timer = setTimeout(() => {
          if (active) {
            setErrorMsg("Authentication timed out. Please check your Vercel Supabase environment variables.");
            setTimeout(() => router.push("/login"), 2500);
          }
        }, 6000);

        return () => {
          subscription.unsubscribe();
          clearTimeout(timer);
        };
      } catch (err: any) {
        if (active) {
          setErrorMsg(err.message || "Authentication token exchange failed.");
          setTimeout(() => router.push("/login"), 2500);
        }
      }
    };

    processAuth();

    return () => {
      active = false;
    };
  }, [router]);

  return (
    <main className="min-h-screen bg-[#0b101d] text-white flex items-center justify-center p-4">
      <div className="text-center space-y-4 max-w-sm">
        {!errorMsg ? (
          <>
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-sm text-slate-400">Completing sign in, redirecting to application...</p>
          </>
        ) : (
          <div className="bg-red-950/50 border border-red-800 text-red-200 p-4 rounded-xl text-xs space-y-2">
            <p className="font-semibold">Sign In Notice</p>
            <p>{errorMsg}</p>
          </div>
        )}
      </div>
    </main>
  );
}
