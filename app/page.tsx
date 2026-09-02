'use client';

import React, { useState, useRef, useEffect } from 'react';

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

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const changeTheme = (newTheme: 'black' | 'white' | 'blue') => {
    setTheme(newTheme);
    if (typeof window !== 'undefined') {
      localStorage.setItem('summarizer_theme', newTheme);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result as string);
    };
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
      if (!reader) throw new Error('No response stream available');

      const decoder = new TextDecoder();
      let accumulatedText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulatedText += decoder.decode(value, { stream: true });
        setSummary(accumulatedText);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
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
          <h1 className="text-xl font-bold tracking-tight">AI Document Summarizer</h1>
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

        {/* Output Language Selector */}
        <div className={`p-4 rounded-xl border ${cardClasses[theme]} space-y-2`}>
          <label className="text-sm font-medium opacity-90 block">Output Language:</label>
          <select 
            value={language} 
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full p-2.5 rounded-lg bg-black/40 border border-white/20 text-white focus:outline-none focus:border-blue-500"
          >
            <option value="en">English</option>
            <option value="es">Spanish (Español)</option>
            <option value="fr">French (Français)</option>
            <option value="zh">Chinese (中文)</option>
            <option value="ar">Arabic (العربية)</option>
            <option value="pt">Portuguese (Português)</option>
            <option value="hi">Hindi (हिन्दी)</option>
            <option value="de">German (Deutsch)</option>
          </select>
        </div>

        {/* Summary Format Selector */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: 'bullets', label: 'Bullet Points' },
            { id: 'brief', label: 'Executive Brief' },
            { id: 'detailed', label: 'Detailed Analysis' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setLength(item.id)}
              className={`p-2.5 rounded-xl text-xs sm:text-sm font-medium border transition-all ${
                length === item.id 
                  ? 'bg-blue-600 border-blue-500 text-white shadow-lg' 
                  : `${cardClasses[theme]} opacity-80 hover:opacity-100`
              }`}
            >
              {item.label}
            </button>
          ))}
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

          <input 
            type="file" 
            ref={cameraInputRef} 
            accept="image/*" 
            capture="environment" 
            onChange={handleImageUpload} 
            className="hidden" 
          />
          <input 
            type="file" 
            ref={fileInputRef} 
            accept="image/*,application/pdf" 
            onChange={handleImageUpload} 
            className="hidden" 
          />
        </div>

        {/* Image Preview Banner */}
        {image && (
          <div className={`flex items-center justify-between p-3 rounded-xl border ${cardClasses[theme]}`}>
            <div className="flex items-center gap-3">
              <img src={image} alt="Preview" className="w-12 h-12 object-cover rounded-lg border border-white/20" />
              <span className="text-sm font-medium">Document Image Loaded</span>
            </div>
            <button 
              onClick={() => setImage(null)} 
              className="text-red-400 hover:text-red-300 text-sm font-medium px-3 py-1"
            >
              Remove
            </button>
          </div>
        )}

        {/* Text Prompt Input */}
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Paste text here, or type instructions when scanning a document..."
          rows={4}
          className={`w-full p-3.5 rounded-xl border ${cardClasses[theme]} focus:outline-none focus:border-blue-500 text-sm resize-none`}
        />

        {/* Submit Action */}
        <button
          onClick={handleSummarize}
          disabled={loading}
          className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold transition shadow-lg"
        >
          {loading ? 'Analyzing Document...' : 'Summarize Document'}
        </button>

        {/* Error Banner */}
        {error && (
          <div className="p-4 rounded-xl bg-red-950/80 border border-red-800 text-red-200 text-sm whitespace-pre-wrap">
            <strong>Server Error:</strong> {error}
          </div>
        )}

        {/* Summary Output Section */}
        {summary && (
          <div className={`p-5 rounded-xl border ${cardClasses[theme]} space-y-3`}>
            <h2 className="font-semibold text-base border-b border-white/10 pb-2">Summary Result</h2>
            <div className="text-sm leading-relaxed whitespace-pre-wrap opacity-95">
              {summary}
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
