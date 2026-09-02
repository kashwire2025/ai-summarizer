'use client';

import { useCompletion } from '@ai-sdk/react';
import { useState, useRef } from 'react';

export default function Home() {
  const [summaryType, setSummaryType] = useState('bullets');
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { completion, input, setInput, handleInputChange, handleSubmit, isLoading } = useCompletion({
    api: '/api/summarize',
    body: { length: summaryType },
  });

  const copyToClipboard = () => {
    if (completion) {
      navigator.clipboard.writeText(completion);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleNativeShare = async () => {
    if (!completion) return;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'AI Document Summary',
          text: completion,
        });
      } catch (err) {
        console.log('Share dismissed');
      }
    } else {
      const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(completion)}`;
      window.open(waUrl, '_blank');
    }
  };

  const handleCameraCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type.startsWith('text/') || file.name.endsWith('.txt')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setInput(event.target.result as string);
        }
      };
      reader.readAsText(file);
    } else {
      alert("Photo attached! Optical document reading enabled.");
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-8 max-w-4xl mx-auto">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-white sm:text-4xl">AI Document Summarizer</h1>
        <p className="text-slate-400 mt-2">Generate tailored summaries from text or physical documents.</p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Summary Format</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'bullets', label: 'Bullet Points' },
              { id: 'brief', label: 'Executive Brief' },
              { id: 'detailed', label: 'Detailed Analysis' },
            ].map((type) => (
              <button
                key={type.id}
                type="button"
                onClick={() => setSummaryType(type.id)}
                className={`py-2 px-3 rounded-lg text-sm font-medium transition ${
                  summaryType === type.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <input
            type="file"
            accept="image/*,.txt"
            capture="environment"
            ref={fileInputRef}
            onChange={handleCameraCapture}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-2.5 px-4 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 font-medium hover:bg-slate-800 flex items-center justify-center gap-2 transition"
          >
            📷 Scan Document / Snap Photo
          </button>
        </div>

        <textarea
          value={input}
          onChange={handleInputChange}
          placeholder="Paste text here or tap 'Scan Document' above to capture paper with your camera..."
          rows={7}
          className="w-full rounded-lg border border-slate-800 bg-slate-900 p-4 text-slate-100 placeholder-slate-500 focus:border-blue-500 focus:outline-none"
        />

        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-500 disabled:opacity-50 transition"
        >
          {isLoading ? 'Processing Summary...' : 'Summarize Text'}
        </button>
      </form>

      {completion && (
        <section className="mt-8 rounded-lg border border-slate-800 bg-slate-900/50 p-6 relative space-y-4">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <h2 className="text-lg font-semibold text-white">Summary Result</h2>
            <div className="flex gap-2">
              <button
                onClick={copyToClipboard}
                className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-md border border-slate-700 transition"
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
              <button
                onClick={handleNativeShare}
                className="text-xs bg-green-600 hover:bg-green-500 text-white px-3 py-1.5 rounded-md font-medium transition"
              >
                📲 Share to WhatsApp / Socials
              </button>
            </div>
          </div>
          <div className="whitespace-pre-wrap text-slate-300 text-sm leading-relaxed">
            {completion}
          </div>
        </section>
      )}
    </main>
  );
}
