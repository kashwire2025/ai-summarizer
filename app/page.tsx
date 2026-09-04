'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import AuthModal from '../components/AuthModal';
import HistorySidebar from '../components/HistorySidebar';

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setCurrentSessionId(null);
    setSummary('');
  };

  const handleNewChat = () => {
    setCurrentSessionId(null);
    setPrompt('');
    setSummary('');
  };

  const handleSelectSession = (sessionId: string, messages: any[]) => {
    setCurrentSessionId(sessionId);
    const userMsg = messages.find((m) => m.role === 'user');
    const modelMsg = messages.find((m) => m.role === 'model');
    if (userMsg) setPrompt(userMsg.text);
    if (modelMsg) setSummary(modelMsg.text);
  };

  const handleSummarize = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    setSummary('');

    try {
      const res = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      const outputText = data.result || 'No response generated.';
      setSummary(outputText);

      if (user) {
        let activeSessionId = currentSessionId;

        if (!activeSessionId) {
          const { data: sessionData } = await supabase
            .from('sessions')
            .insert([{ user_id: user.id, title: prompt.slice(0, 30) + '...' }])
            .select()
            .single();

          if (sessionData) {
            activeSessionId = sessionData.id;
            setCurrentSessionId(activeSessionId);
          }
        }

        if (activeSessionId) {
          await supabase.from('messages').insert([
            { session_id: activeSessionId, user_id: user.id, role: 'user', text: prompt },
            { session_id: activeSessionId, user_id: user.id, role: 'model', text: outputText }
          ]);
        }
      }
    } catch (err) {
      setSummary('An error occurred while generating the summary.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <header className="border-b border-slate-800 p-4 flex justify-between items-center max-w-4xl w-full mx-auto">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsHistoryOpen(true)}
            className="text-xs bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-700 transition flex items-center gap-1.5"
          >
            <span>📜</span> History
          </button>
          <h1 className="font-bold text-lg text-blue-400">AI Document Workbench</h1>
        </div>

        <div>
          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400 hidden sm:inline">{user.email}</span>
              <button
                onClick={handleSignOut}
                className="text-xs bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-700 transition"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsAuthOpen(true)}
              className="text-xs bg-blue-600 hover:bg-blue-500 font-semibold px-3 py-1.5 rounded-lg transition"
            >
              Sign In with Email
            </button>
          )}
        </div>
      </header>

      <div className="flex-1 max-w-4xl w-full mx-auto p-4 flex flex-col gap-4">
        <form onSubmit={handleSummarize} className="space-y-3">
          <textarea
            rows={4}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Paste text or type your summarization prompt here..."
            className="w-full p-3 rounded-lg bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-sm"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading || !prompt.trim()}
              className="flex-1 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 font-semibold text-white transition disabled:opacity-50 text-sm"
            >
              {loading ? 'Processing Document...' : 'Generate Summary'}
            </button>
            {currentSessionId && (
              <button
                type="button"
                onClick={handleNewChat}
                className="px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-sm border border-slate-700 transition"
              >
                + New
              </button>
            )}
          </div>
        </form>

        {summary && (
          <div className="p-4 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 text-sm leading-relaxed whitespace-pre-wrap">
            {summary}
          </div>
        )}
      </div>

      <HistorySidebar
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        userId={user?.id || null}
        currentSessionId={currentSessionId}
        onSelectSession={handleSelectSession}
        onNewChat={handleNewChat}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={() => setIsAuthOpen(false)}
      />
    </main>
  );
}
