'use client';

import { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';

interface Message {
  role: 'user' | 'model';
  text: string;
}

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Quick Action Presets
  const quickPrompts = [
    "📋 Executive Summary",
    "✅ Key Action Items",
    "💡 Top Takeaways",
    "📊 Analyze Trends & Data"
  ];

  useEffect(() => {
    const handleSelection = () => {
      const text = window.getSelection()?.toString() || '';
      setSelectedText(text.trim());
    };
    document.addEventListener('selectionchange', handleSelection);
    return () => document.removeEventListener('selectionchange', handleSelection);
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSend = async (customPrompt?: string) => {
    const activePrompt = customPrompt || prompt;
    if (!activePrompt.trim() && !image) return;

    const userMessageText = activePrompt || 'Summarize this content.';
    const updatedMessages: Message[] = [...messages, { role: 'user', text: userMessageText }];
    setMessages(updatedMessages);
    setPrompt('');
    setLoading(true);

    try {
      const res = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: userMessageText,
          image: image || undefined,
          history: history
        })
      });

      if (image) setImage(null);

      const rawText = await res.text();
      let data: any = {};
      try {
        data = JSON.parse(rawText);
      } catch {
        data = { error: rawText || 'Invalid response format from server.' };
      }

      if (data.result) {
        setMessages([...updatedMessages, { role: 'model', text: data.result }]);
        setHistory([
          ...history,
          { role: 'user', parts: [{ text: userMessageText }] },
          { role: 'model', parts: [{ text: data.result }] }
        ]);
      } else {
        const errorMsg = data.error || 'Failed to generate response.';
        setMessages([...updatedMessages, { role: 'model', text: `Error: ${errorMsg}` }]);
      }
    } catch (err: any) {
      setMessages([...updatedMessages, { role: 'model', text: `Error: ${err.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  const downloadTextFile = (content: string, fileName: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // PDF Generation using dynamically loaded browser CDN script
  const downloadPDF = async () => {
    if (!chatContainerRef.current) return;

    const loadScript = (src: string) => {
      return new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) return resolve(true);
        const script = document.createElement('script');
        script.src = src;
        script.onload = () => resolve(true);
        script.onerror = () => reject(false);
        document.body.appendChild(script);
      });
    };

    try {
      await loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js');
      const html2pdf = (window as any).html2pdf;
      if (!html2pdf) throw new Error('PDF generator library failed to load.');

      const element = chatContainerRef.current;
      const opt = {
        margin:       10,
        filename:     'ai-summary-report.pdf',
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2 },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };
      html2pdf().set(opt).from(element).save();
    } catch (err: any) {
      alert(`Could not generate PDF: ${err.message}`);
    }
  };

  const handleShare = async (textToShare: string) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'AI Document Summary',
          text: textToShare,
        });
      } catch (err) {
        console.log('Sharing canceled', err);
      }
    } else {
      const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(textToShare)}`;
      window.open(waUrl, '_blank');
    }
  };

  const latestModelOutput = [...messages].reverse().find(m => m.role === 'model' && !m.text.startsWith('Error:'))?.text || '';
  const isDark = theme === 'dark';

  return (
    <main className={`min-h-screen p-4 md:p-8 flex flex-col items-center transition-colors duration-200 ${
      isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'
    }`}>
      <div className="w-full max-w-3xl space-y-5">
        
        {/* Header & Theme Switcher */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-500">AI Document Workbench</h1>
          <button
            onClick={() => supabase.auth.signInWithOAuth({ provider: 'google' })}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm mr-2"
          >
            Sign in with Google
          </button>
          <button
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${
              isDark ? 'bg-slate-900 border-slate-700 text-slate-300' : 'bg-white border-slate-300 text-slate-700'
            }`}
          >
            {isDark ? '☀️ Light Mode' : '🌙 Dark Mode'}
          </button>
        </div>

        {/* Highlighted Selection Floating Bar */}
        {selectedText && (
          <div className="sticky top-4 z-50 bg-blue-600 text-white p-3 rounded-lg shadow-xl flex items-center justify-between animate-fade-in">
            <span className="text-xs truncate max-w-xs">Highlighted: "{selectedText}"</span>
            <div className="flex space-x-2">
              <button
                onClick={() => downloadTextFile(selectedText, 'highlighted-snippet.txt')}
                className="bg-slate-900 hover:bg-slate-800 text-xs px-3 py-1.5 rounded font-medium"
              >
                Download Selection
              </button>
              <button
                onClick={() => handleShare(selectedText)}
                className="bg-slate-900 hover:bg-slate-800 text-xs px-3 py-1.5 rounded font-medium"
              >
                Share
              </button>
            </div>
          </div>
        )}

        {/* File Upload Box */}
        <div className={`p-4 rounded-xl border space-y-2 ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <label className={`block text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            Upload Context Document / Image
          </label>
          <input
            type="file"
            accept="image/*,application/pdf"
            onChange={handleFileUpload}
            className={`w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-600 file:text-white file:font-medium hover:file:bg-blue-500 cursor-pointer ${
              isDark ? 'text-slate-400' : 'text-slate-600'
            }`}
          />
          {image && <p className="text-xs text-green-500 font-medium">Document loaded into memory. Select a prompt or ask below.</p>}
        </div>

        {/* Quick Action Prompt Pills */}
        <div className="flex flex-wrap gap-2">
          {quickPrompts.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(preset)}
              disabled={loading}
              className={`text-xs px-3 py-1.5 rounded-full border transition ${
                isDark 
                  ? 'bg-slate-900 border-slate-800 hover:border-blue-500 text-slate-300' 
                  : 'bg-white border-slate-300 hover:border-blue-500 text-slate-700 shadow-sm'
              }`}
            >
              {preset}
            </button>
          ))}
        </div>

        {/* Chat Output Container */}
        <div 
          ref={chatContainerRef}
          className={`p-4 rounded-xl border min-h-[300px] max-h-[500px] overflow-y-auto space-y-4 ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          {messages.length === 0 ? (
            <p className="text-slate-400 italic text-center mt-12 text-sm">
              Upload a document or choose a quick prompt to start analysis...
            </p>
          ) : (
            messages.map((msg, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg text-sm leading-relaxed ${
                  msg.role === 'user' 
                    ? (isDark ? 'bg-blue-950/60 border border-blue-900 ml-8 text-blue-100' : 'bg-blue-50 border border-blue-200 ml-8 text-blue-900') 
                    : (isDark ? 'bg-slate-950 border border-slate-800 mr-8 text-slate-200' : 'bg-slate-50 border border-slate-200 mr-8 text-slate-800')
                }`}
              >
                <div className="font-semibold text-xs mb-1 text-slate-400">
                  {msg.role === 'user' ? 'You' : 'AI Assistant'}
                </div>
                <ReactMarkdown>{msg.text}</ReactMarkdown>
              </div>
            ))
          )}
          {loading && <p className="text-xs text-blue-500 animate-pulse font-medium">AI is thinking...</p>}
        </div>

        {/* Export & Sharing Actions */}
        {latestModelOutput && (
          <div className="flex flex-wrap gap-2 justify-end">
            <button
              onClick={downloadPDF}
              className="bg-emerald-600 hover:bg-emerald-500 text-xs px-3 py-2 rounded-lg text-white font-medium"
            >
              📄 Export PDF
            </button>
            <button
              onClick={() => downloadTextFile(latestModelOutput, 'ai-summary.txt')}
              className={`text-xs px-3 py-2 rounded-lg border ${
                isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700' : 'bg-slate-200 hover:bg-slate-300 text-slate-800 border-slate-300'
              }`}
            >
              Download .TXT
            </button>
            <button
              onClick={() => handleShare(latestModelOutput)}
              className="bg-blue-600 hover:bg-blue-500 text-xs px-3 py-2 rounded-lg text-white font-medium"
            >
              Share Output
            </button>
          </div>
        )}

        {/* Input Form */}
        <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-2">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ask a follow-up question or custom prompt..."
            className={`flex-1 p-3 border rounded-lg text-sm focus:outline-none focus:border-blue-500 ${
              isDark 
                ? 'bg-slate-900 border-slate-800 text-slate-100' 
                : 'bg-white border-slate-300 text-slate-900'
            }`}
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white font-medium px-5 py-3 rounded-lg text-sm transition"
          >
            Send
          </button>
        </form>

      </div>
    </main>
  );
}
