'use client';

import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { createClient } from '@supabase/supabase-js';

interface Message {
  role: 'user' | 'model';
  text: string;
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isDark, setIsDark] = useState(true);

  const saveChatToSupabase = async (newMessages: Message[]) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('chats')
      .upsert({
        user_id: user.id,
        messages: newMessages,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' });
  };

  const loadChatFromSupabase = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('chats')
      .select('messages')
      .eq('user_id', user.id)
      .single();

    if (data && data.messages) {
      setMessages(data.messages);
    }
  };

  useEffect(() => {
    loadChatFromSupabase();
  }, []);

  const handleQuickPrompt = (text: string) => {
    setPrompt(text);
  };

  return (
    <main className={`min-h-screen p-4 sm:p-8 ${isDark ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-900'}`}>
      <div className="max-w-4xl mx-auto">
        {/* Header Layout */}
        <div className="flex items-center justify-between w-full mb-6 gap-2 border-b border-slate-700 pb-4">
          <h1 className="text-xl sm:text-2xl font-bold text-blue-500">AI Document Workbench</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => supabase.auth.signInWithOAuth({ provider: 'google' })}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-xs sm:text-sm whitespace-nowrap"
            >
              Sign in with Google
            </button>
            <button
              onClick={() => setIsDark(!isDark)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold border whitespace-nowrap border-slate-600"
            >
              {isDark ? '☀️ Light' : '🌙 Dark'}
            </button>
          </div>
        </div>

        {/* Upload Section */}
        <div className="mb-6 p-4 rounded-xl border border-slate-700 bg-slate-800/50">
          <label className="block text-sm font-medium mb-2">Upload Context Document / Image</label>
          <input 
            type="file" 
            accept="image/*,.pdf"
            className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
          />
        </div>

        {/* Quick Prompts */}
        <div className="flex flex-wrap gap-2 mb-6">
          {['📋 Executive Summary', '✅ Key Action Items', '💡 Top Takeaways', '📊 Analyze Trends & Data'].map((text) => (
            <button
              key={text}
              onClick={() => handleQuickPrompt(text)}
              className="px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700"
            >
              {text}
            </button>
          ))}
        </div>

        {/* Output Section */}
        <div className="p-4 rounded-xl border border-slate-700 bg-slate-800/30 min-h-[300px]">
          {messages.length === 0 ? (
            <p className="text-slate-400 text-sm italic text-center mt-20">
              Upload a document or choose a quick prompt to start analysis...
            </p>
          ) : (
            <div className="space-y-4">
              {messages.map((msg, idx) => (
                <div key={idx} className={`p-3 rounded-lg ${msg.role === 'user' ? 'bg-blue-900/40 ml-auto max-w-[80%]' : 'bg-slate-800 border border-slate-700'}`}>
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
