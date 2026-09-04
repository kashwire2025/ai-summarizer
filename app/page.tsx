'use client';

import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { createClient } from '@supabase/supabase-js';

interface Message {
  role: 'user' | 'model';
  text: string;
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://tczk.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isDark, setIsDark] = useState(true);
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState('English');

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

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || prompt;
    if (!query.trim() || loading) return;

    const userMessage: Message = { role: 'user', text: query };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setPrompt('');
    setLoading(true);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: query, history: messages, language }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch response');
      }
      
      const aiMessage: Message = { role: 'model', text: data.text || 'Analysis complete.' };
      const finalMessages = [...updatedMessages, aiMessage];
      setMessages(finalMessages);
      await saveChatToSupabase(finalMessages);
    } catch (err: any) {
      const errorMessage: Message = { role: 'model', text: `API Error: ${err.message || 'Please check GEMINI_API_KEY on Vercel.'}` };
      setMessages([...updatedMessages, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={`min-h-screen p-4 sm:p-8 transition-colors duration-200 ${isDark ? 'bg-slate-900 text-white' : 'bg-gray-100 text-slate-900'}`}>
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header Layout */}
        <div className={`flex flex-wrap items-center justify-between w-full pb-4 border-b gap-2 ${isDark ? 'border-slate-800' : 'border-gray-300'}`}>
          <h1 className="text-xl sm:text-2xl font-bold text-blue-500">AI Document Workbench</h1>
          
          <div className="flex items-center gap-2">
            {/* Language Preference Dropdown */}
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className={`px-2 py-1.5 rounded-lg text-xs font-medium border outline-none ${
                isDark ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-white border-gray-300 text-slate-800'
              }`}
            >
              <option value="English">🌐 English</option>
              <option value="French">🌐 French</option>
              <option value="Spanish">🌐 Spanish</option>
              <option value="German">🌐 German</option>
              <option value="Hausa">🌐 Hausa</option>
              <option value="Yoruba">🌐 Yoruba</option>
              <option value="Igbo">🌐 Igbo</option>
            </select>

            <button
              onClick={() => supabase.auth.signInWithOAuth({ provider: 'google' })}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-xs sm:text-sm whitespace-nowrap"
            >
              Sign in with Google
            </button>

            <button
              onClick={() => setIsDark(!isDark)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border whitespace-nowrap ${isDark ? 'border-slate-700 bg-slate-800 text-white' : 'border-gray-300 bg-white text-slate-800'}`}
            >
              {isDark ? '☀️ Light' : '🌙 Dark'}
            </button>
          </div>
        </div>

        {/* Upload Container */}
        <div className={`p-4 rounded-xl border ${isDark ? 'border-slate-800 bg-slate-800/50' : 'border-gray-200 bg-white shadow-sm'}`}>
          <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-slate-200' : 'text-gray-700'}`}>Upload Context Document / Image</label>
          <input 
            type="file" 
            accept="image/*,.pdf"
            className={`block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}
          />
        </div>

        {/* Quick Action Chips */}
        <div className="flex flex-wrap gap-2">
          {['📋 Executive Summary', '✅ Key Action Items', '💡 Top Takeaways', '📊 Analyze Trends & Data'].map((text) => (
            <button
              key={text}
              onClick={() => handleSendMessage(text)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                isDark 
                  ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200' 
                  : 'bg-white hover:bg-gray-50 border-gray-300 text-slate-800 shadow-sm'
              }`}
            >
              {text}
            </button>
          ))}
        </div>

        {/* Chat / Response Output Window */}
        <div className={`p-4 rounded-xl border min-h-[280px] max-h-[450px] overflow-y-auto ${isDark ? 'border-slate-800 bg-slate-800/30' : 'border-gray-200 bg-white shadow-sm'}`}>
          {messages.length === 0 ? (
            <p className={`text-sm italic text-center mt-20 ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>
              Upload a document or type a command below to start analysis...
            </p>
          ) : (
            <div className="space-y-4">
              {messages.map((msg, idx) => (
                <div key={idx} className={`p-3 rounded-lg text-sm ${
                  msg.role === 'user' 
                    ? 'bg-blue-600 text-white ml-auto max-w-[85%]' 
                    : isDark ? 'bg-slate-800 border border-slate-700 text-slate-100' : 'bg-gray-100 border border-gray-200 text-slate-900'
                }`}>
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                </div>
              ))}
              {loading && <p className="text-xs text-blue-500 animate-pulse">AI is thinking...</p>}
            </div>
          )}
        </div>

        {/* Command Box & Input Field */}
        <div className={`p-2 rounded-xl border flex gap-2 items-center ${isDark ? 'border-slate-800 bg-slate-800/80' : 'border-gray-300 bg-white shadow-sm'}`}>
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type your prompt or question here..."
            className={`flex-1 px-3 py-2 text-sm rounded-lg outline-none ${
              isDark ? 'bg-slate-900 text-white placeholder-slate-500' : 'bg-gray-50 text-slate-900 placeholder-gray-400 border border-gray-200'
            }`}
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm transition-colors disabled:opacity-50"
          >
            Send
          </button>
        </div>

      </div>
    </main>
  );
}
