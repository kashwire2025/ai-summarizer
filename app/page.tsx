'use client';

import React, { useState, useRef, useEffect } from 'react';

interface HistoryItem {
  id: string;
  date: string;
  prompt: string;
  summary: string;
  language: string;
  length: string;
}

export default function Home() {
  const [theme, setTheme] = useState<'black' | 'white' | 'blue'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('summarizer_theme');
      if (saved === 'white' || saved === 'blue' || saved === 'black') return saved;
    }
    return 'black';
  });
  
  const [language, setLanguage] = useState<string>('en');
  const [length, setLength] = useState<string>('bullets');
  const [prompt, setPrompt] = useState<string>('');
  const [image, setImage] = useState<string | null>(null);
  const [summary, setSummary] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedHistory = localStorage.getItem('summarizer_history');
      if (savedHistory) {
        try { setHistory(JSON.parse(savedHistory)); } catch (e) {}
      }
    }
  }, []);

  const changeTheme = (newTheme: 'black' | 'white' | 'blue') => {
    setTheme(newTheme);
    if (typeof window !== 'undefined') localStorage.setItem('summarizer_theme', newTheme);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSummarize = async () => {
    setLoading(true);
    setError(null);
    setSummary('');

    try {
      const res = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, length, image, language }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || `Server returned ${res.status}`);
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error('No response stream available from browser.');

      const decoder = new TextDecoder();
      let accumulatedText = '';
      let chunkCount = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunkCount++;
        accumulatedText += decoder.decode(value, { stream: true });
        setSummary(accumulatedText);
      }

      if (chunkCount === 0 && accumulatedText.trim() === '') {
         throw new Error("Stream connected successfully, but the AI returned 0 bytes of data.");
      }

      // Save to history
      const newItem: HistoryItem = {
        id: Date.now().toString(),
        date: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        prompt: prompt || 'Document Scan / Upload',
        summary: accumulatedText,
        language,
        length,
      };

      const updatedHistory = [newItem, ...history].slice(0, 20);
      setHistory(updatedHistory);
      if (typeof window !== 'undefined') localStorage.setItem('summarizer_history', JSON.stringify(updatedHistory));

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadTxt = () => {
    const element = document.createElement('a');
    const file = new Blob([summary], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `summary-${Date.now()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const clearHistory = () => {
    setHistory([]);
    if (typeof window !== 'undefined') localStorage.removeItem('summarizer_history');
  };

  const themeClasses = {
    black: 'bg-black text-white',
    white: 'bg-white text-gray-900',
    blue: 'bg-blue-950 text-white',
  };

  const cardClasses = {
    black: 'bg-zinc-900 border-zinc-800 text-white',
    white: 'bg-gray-100 border-gray-300 text-gray-900',
    blue: 'bg-blue-900 border-blue-800 text-white',
  };

  return (
    <main className={`min-h-screen p-4 md:p-8 transition-colors duration-300 ${themeClasses[theme]}`}>
      <div className="max-w-xl mx-auto space-y-6">
        
        {/* Header & Theme Switcher */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold tracking-tight">AI Document Summarizer</h1>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="text-xs px-2.5 py-1 rounded-lg border border-white/20 bg-white/10 hover:bg-white/20 transition font-medium"
            >
              📜 History ({history.length})
            </button>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm opacity-75">Theme:</span>
            <button 
              onClick={() => changeTheme('black')} 
              className={`w-7 h-7 rounded-full bg-black border-2 ${theme === 'black' ? 'border-blue-500 scale-110' : 'border-zinc-700'} transition-all`}
              title="Black Theme"
            />
            <button 
              onClick={() => changeTheme('white')} 
              className={`w-7 h-7 rounded-full bg-white border-2 ${theme === 'white' ? 'border-blue-500 scale-110' : 'border-gray-300'} transition-all`}
              title="White Theme"
            />
            <button 
              onClick={() => changeTheme('blue')} 
              className={`w-7 h-7 rounded-full bg-blue-600 border-2 ${theme === 'blue' ? 'border-white scale-110' : 'border-blue-800'} transition-all`}
              title="Blue Theme"
            />
          </div>
        </div>

        {/* History Drawer */}
        {showHistory && (
          <div className={`p-4 rounded-xl border ${cardClasses[theme]} space-y-3`}>
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <h2 className="font-semibold text-sm">Past Summaries</h2>
              {history.length > 0 && (
                <button onClick={clearHistory} className="text-xs text-red-400 hover:text-red-300">
                  Clear History
                </button>
              )}
            </div>
            {history.length === 0 ? (
              <p className="text-xs opacity-60 py-2">No past summaries saved yet.</p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {history.map((item) => (
                  <div 
                    key={item.id} 
                    onClick={() => {
                      setSummary(item.summary);
                      setPrompt(item.prompt);
                      setLanguage(item.language);
                      setLength(item.length);
                      setShowHistory(false);
                    }}
                    className="p-2.5 rounded-lg bg-black/30 border border-white/10 hover:border-blue-500 cursor-pointer transition text-xs space-y-1"
                  >
                    <div className="flex justify-between opacity-65 text-[10px]">
                      <span>{item.date}</span>
                      <span className="uppercase">{item.language} • {item.length}</span>
                    </div>
                    <p className="font-medium truncate">{item.prompt}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Settings Selectors */}
        <div className="grid grid-cols-2 gap-3">
          <div className={`p-3 rounded-xl border ${cardClasses[theme]} space-y-1.5`}>
             <label className="text-xs font-medium opacity-90 block">Language:</label>
             <select 
               value={language} 
               onChange={(e) => setLanguage(e.target.value)}
               className="w-full p-2 rounded-lg bg-black/40 border border-white/20 text-white focus:outline-none focus:border-blue-500 text-sm"
             >
               <option value="en">English</option>
               <option value="es">Spanish</option>
               <option value="fr">French</option>
               <option value="zh">Chinese</option>
             </select>
          </div>
          <div className={`p-3 rounded-xl border ${cardClasses[theme]} space-y-1.5`}>
             <label className="text-xs font-medium opacity-90 block">Format:</label>
             <select 
               value={length} 
               onChange={(e) => setLength(e.target.value)}
               className="w-full p-2 rounded-lg bg-black/40 border border-white/20 text-white focus:outline-none focus:border-blue-500 text-sm"
             >
               <option value="bullets">Bullet Points</option>
               <option value="brief">Executive Brief</option>
               <option value="detailed">Detailed Analysis</option>
             </select>
          </div>
        </div>

        {/* Capture & Upload Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => cameraInputRef.current?.click()}
            className="flex items-center justify-center gap-2 p-3 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 transition font-medium text-sm"
          >
            📷 Snap Photo
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center gap-2 p-3 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 transition font-medium text-sm"
          >
            📁 Upload Document
          </button>

          <input type="file" ref={cameraInputRef} accept="image/*" capture="environment" onChange={handleImageUpload} className="hidden" />
          <input type="file" ref={fileInputRef} accept="image/*,application/pdf" onChange={handleImageUpload} className="hidden" />
        </div>

        {image && (
          <div className={`flex items-center justify-between p-3 rounded-xl border ${cardClasses[theme]}`}>
            <div className="flex items-center gap-3">
              <img src={image} alt="Preview" className="w-12 h-12 object-cover rounded-lg border border-white/20" />
              <span className="text-sm font-medium">Document Image Loaded</span>
            </div>
            <button onClick={() => setImage(null)} className="text-red-400 hover:text-red-300 text-sm font-medium px-3 py-1">Remove</button>
          </div>
        )}

        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Paste text here, or type instructions when scanning a document..."
          rows={4}
          className={`w-full p-3.5 rounded-xl border ${cardClasses[theme]} focus:outline-none focus:border-blue-500 text-sm resize-none`}
        />

        <button
          onClick={handleSummarize}
          disabled={loading}
          className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold transition shadow-lg"
        >
          {loading ? 'Analyzing Document (Please wait...)' : 'Summarize Document'}
        </button>

        {error && (
          <div className="p-4 rounded-xl bg-red-950/80 border border-red-800 text-red-200 text-sm whitespace-pre-wrap">
            <strong>Diagnostic Error:</strong> {error}
          </div>
        )}

        {summary && (
          <div className={`p-5 rounded-xl border ${cardClasses[theme]} space-y-3 shadow-xl`}>
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <h2 className="font-semibold text-base">Summary Result</h2>
              <div className="flex items-center gap-2">
                <button onClick={copyToClipboard} className="text-xs px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 transition font-medium">
                  {copied ? 'Copied!' : '📋 Copy'}
                </button>
                <button onClick={downloadTxt} className="text-xs px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 transition font-medium">
                  💾 TXT
                </button>
              </div>
            </div>
            <div className="text-sm leading-relaxed whitespace-pre-wrap opacity-95">
              {summary}
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
