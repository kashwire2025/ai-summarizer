'use client';

import { useState } from 'react';

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [length, setLength] = useState('bullets');
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSummarize = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setSummary('');
    setError('');

    try {
      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, length }),
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
    <main className="min-h-screen bg-slate-950 text-white p-4 max-w-2xl mx-auto flex flex-col gap-6">
      <header className="text-center py-4">
        <h1 className="text-2xl font-bold">AI Document Summarizer</h1>
        <p className="text-slate-400 text-sm">Generate instant summaries from text or camera snaps</p>
      </header>

      {/* Format Selection */}
      <div className="flex gap-2 bg-slate-900 p-1 rounded-lg border border-slate-800">
        {['bullets', 'brief', 'detailed'].map((type) => (
          <button
            key={type}
            onClick={() => setLength(type)}
            className={`flex-1 py-2 text-xs font-semibold rounded-md capitalize transition ${
              length === type ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            {type === 'bullets' ? 'Bullet Points' : type === 'brief' ? 'Executive Brief' : 'Detailed Analysis'}
          </button>
        ))}
      </div>

      {/* Input Area */}
      <div className="flex flex-col gap-3">
        <textarea
          rows={6}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Paste or type text here..."
          className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-sm focus:outline-none focus:border-blue-500"
        />

        <button
          onClick={handleSummarize}
          disabled={loading || !prompt.trim()}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-3 rounded-lg text-sm transition"
        >
          {loading ? 'Summarizing...' : 'Summarize Text'}
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
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex flex-col gap-4">
          <div className="flex justify-between items-center border-b border-slate-800 pb-2">
            <h2 className="text-sm font-bold text-slate-300">Summary Result</h2>
            <button
              onClick={handleShare}
              className="bg-slate-800 hover:bg-slate-700 text-xs px-3 py-1.5 rounded-md border border-slate-700 transition"
            >
              📲 Share to WhatsApp / Socials
            </button>
          </div>
          <div className="text-sm text-slate-200 whitespace-pre-wrap leading-relaxed">
            {summary}
          </div>
        </div>
      )}
    </main>
  );
}
