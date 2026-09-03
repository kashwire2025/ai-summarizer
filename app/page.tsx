'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSummarize = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setOutput('');

    try {
      const res = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt || 'Summarize this file/text.',
          image: image || undefined,
          language: 'English',
          length: 'Bullet Points'
        })
      });

      const data = await res.json();

      if (data.result) {
        setOutput(data.result);
      } else if (data.error) {
        setOutput(`Error: ${data.error}`);
      } else {
        setOutput('Unexpected response format.');
      }
    } catch (err: any) {
      setOutput(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 flex flex-col items-center">
      <div className="w-full max-w-2xl space-y-6">
        <h1 className="text-2xl font-bold text-blue-400 text-center">AI Document Summarizer</h1>

        <form onSubmit={handleSummarize} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-slate-300">File Upload (PDF / Image)</label>
            <input 
              type="file" 
              accept="image/*,application/pdf"
              onChange={handleFileUpload} 
              className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-600 file:text-white file:font-medium hover:file:bg-blue-500 cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-slate-300">Prompt / Instructions</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter instructions or paste raw text here..."
              rows={3}
              className="w-full p-3 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500 text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white font-medium py-2.5 rounded-lg transition"
          >
            {loading ? 'Processing Document...' : 'Summarize Document'}
          </button>
        </form>

        <div className="p-4 bg-slate-900 rounded-xl border border-slate-800">
          <h2 className="text-lg font-semibold text-blue-400 mb-3">Generated Output</h2>
          <div className="text-slate-200 text-sm space-y-2 leading-relaxed">
            {output ? (
              <ReactMarkdown>{output}</ReactMarkdown>
            ) : (
              <p className="text-slate-500 italic">Your clean summary will appear here...</p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
