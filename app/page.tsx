'use client';

import { useState, useRef } from 'react';

const themes = {
  dark: { name: 'Dark Slate', bg: 'bg-slate-950', card: 'bg-slate-900', border: 'border-slate-800', text: 'text-white' },
  navy: { name: 'Deep Navy', bg: 'bg-blue-950', card: 'bg-blue-900/40', border: 'border-blue-800/60', text: 'text-blue-50' },
  emerald: { name: 'Emerald', bg: 'bg-emerald-950', card: 'bg-emerald-900/40', border: 'border-emerald-800/60', text: 'text-emerald-50' },
  purple: { name: 'Midnight Purple', bg: 'bg-purple-950', card: 'bg-purple-900/40', border: 'border-purple-800/60', text: 'text-purple-50' },
  oled: { name: 'OLED Black', bg: 'bg-black', card: 'bg-zinc-900', border: 'border-zinc-800', text: 'text-zinc-100' },
};

const languages = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ar', name: 'Arabic' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'hi', name: 'Hindi' },
  { code: 'de', name: 'German' },
];

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [length, setLength] = useState('bullets');
  const [language, setLanguage] = useState('en');
  const [summary, setSummary] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTheme, setActiveTheme] = useState<keyof typeof themes>('dark');

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const theme = themes[activeTheme];

  const handleImageCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setImagePreview(null);
    if (cameraInputRef.current) cameraInputRef.current.value = '';
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSummarize = async () => {
    if (!prompt.trim() && !imagePreview) return;
    setLoading(true);
    setSummary('');
    setError('');

    try {
      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: `${prompt}\n\n[TRANSLATE_TARGET_LANG: ${language}]`, 
          length,
          image: imagePreview 
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('Failed to open stream reader.');
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        setSummary((prev) => prev + chunk);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to generate summary.');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    if (navigator.share && summary) {
      navigator.share({
        title: 'Document Summary',
        text: summary,
      }).catch(() => {});
    } else if (summary) {
      navigator.clipboard.writeText(summary);
      alert('Summary copied to clipboard!');
    }
  };

  return (
    <div className={`min-h-screen ${theme.bg} ${theme.text} transition-colors duration-300`}>
      <main className="p-4 max-w-2xl mx-auto flex flex-col gap-6">
        <header className="text-center py-4 flex flex-col gap-2">
          <h1 className="text-2xl font-bold">AI Document Summarizer</h1>
          <p className="opacity-70 text-sm">Generate instant summaries from text or camera snaps</p>
          
          {/* Theme Palette Switcher */}
          <div className="flex items-center justify-center gap-2 mt-2">
            <span className="text-xs opacity-60">Theme:</span>
            {Object.keys(themes).map((tKey) => (
              <button
                key={tKey}
                onClick={() => setActiveTheme(tKey as keyof typeof themes)}
                className={`w-6 h-6 rounded-full border-2 transition ${
                  activeTheme === tKey ? 'border-blue-400 scale-110' : 'border-transparent opacity-70'
                } ${
                  tKey === 'dark' ? 'bg-slate-900' :
                  tKey === 'navy' ? 'bg-blue-900' :
                  tKey === 'emerald' ? 'bg-emerald-900' :
                  tKey === 'purple' ? 'bg-purple-900' : 'bg-black'
                }`}
                title={themes[tKey as keyof typeof themes].name}
              />
            ))}
          </div>
        </header>

        {/* Language Selection */}
        <div className={`flex flex-col gap-1.5 ${theme.card} p-3 rounded-lg border ${theme.border}`}>
          <label className="text-xs opacity-70 font-semibold">Output Language:</label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className={`w-full ${theme.bg} border ${theme.border} rounded-md p-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500`}
          >
            {languages.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>

        {/* Format Selection */}
        <div className={`flex gap-2 ${theme.card} p-1 rounded-lg border ${theme.border}`}>
          {['bullets', 'brief', 'detailed'].map((type) => (
            <button
              key={type}
              onClick={() => setLength(type)}
              className={`flex-1 py-2 text-xs font-semibold rounded-md capitalize transition ${
                length === type ? 'bg-blue-600 text-white' : 'opacity-70 hover:opacity-100'
              }`}
            >
              {type === 'bullets' ? 'Bullet Points' : type === 'brief' ? 'Executive Brief' : 'Detailed Analysis'}
            </button>
          ))}
        </div>

        {/* Camera & File Input Actions */}
        <div className="grid grid-cols-2 gap-3">
          <input
            type="file"
            accept="image/*"
            capture="environment"
            ref={cameraInputRef}
            onChange={handleImageCapture}
            className="hidden"
          />
          <input
            type="file"
            accept="image/*,.pdf"
            ref={fileInputRef}
            onChange={handleImageCapture}
            className="hidden"
          />

          <button
            onClick={() => cameraInputRef.current?.click()}
            className={`${theme.card} border ${theme.border} hover:brightness-125 rounded-lg p-3 text-xs font-semibold flex items-center justify-center gap-2 transition`}
          >
            📷 Snap Photo
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className={`${theme.card} border ${theme.border} hover:brightness-125 rounded-lg p-3 text-xs font-semibold flex items-center justify-center gap-2 transition`}
          >
            📁 Upload Document
          </button>
        </div>

        {/* Preview Selected Image */}
        {imagePreview && (
          <div className={`relative ${theme.card} border ${theme.border} rounded-lg p-2 flex items-center justify-between`}>
            <div className="flex items-center gap-3">
              <img src={imagePreview} alt="Scan preview" className="w-12 h-12 object-cover rounded" />
              <span className="text-xs opacity-80">Document Image Loaded</span>
            </div>
            <button
              onClick={clearImage}
              className="text-xs text-red-400 hover:text-red-300 px-2 py-1"
            >
              Remove
            </button>
          </div>
        )}

        {/* Input Area */}
        <div className="flex flex-col gap-3">
          <textarea
            rows={5}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Paste text here, or snap/upload a document above..."
            className={`w-full ${theme.card} border ${theme.border} rounded-lg p-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500`}
          />

          <button
            onClick={handleSummarize}
            disabled={loading || (!prompt.trim() && !imagePreview)}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-3 rounded-lg text-sm transition"
          >
            {loading ? 'Summarizing...' : 'Summarize Document'}
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-900/50 border border-red-700 rounded-lg text-red-200 text-xs">
            {error}
          </div>
        )}

        {/* Summary Output */}
        {summary && (
          <div className={`${theme.card} border ${theme.border} rounded-lg p-4 flex flex-col gap-4`}>
            <div className={`flex justify-between items-center border-b ${theme.border} pb-2`}>
              <h2 className="text-sm font-bold opacity-80">Summary Result</h2>
              <button
                onClick={handleShare}
                className={`${theme.bg} hover:brightness-125 text-xs px-3 py-1.5 rounded-md border ${theme.border} transition`}
              >
                📲 Share to WhatsApp / Socials
              </button>
            </div>
            <div className="text-sm opacity-90 whitespace-pre-wrap leading-relaxed">
              {summary}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
