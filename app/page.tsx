'use client';

import { useState, useEffect } from 'react';
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

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() && !image) return;

    const userMessageText = prompt || 'Summarize this content.';
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

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 flex flex-col items-center">
      <div className="w-full max-w-3xl space-y-6">
        <h1 className="text-2xl font-bold text-blue-400 text-center">AI Document Workbench</h1>

        {selectedText && (
          <div className="sticky top-4 z-50 bg-blue-600 text-white p-3 rounded-lg shadow-lg flex items-center justify-between">
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

        <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
          <label className="block text-sm font-medium text-slate-300">Upload Context Document / Image</label>
          <input
            type="file"
            accept="image/*,application/pdf"
            onChange={handleFileUpload}
            className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-600 file:text-white file:font-medium hover:file:bg-blue-500 cursor-pointer"
          />
          {image && <p className="text-xs text-green-400">Document loaded into memory. Ask questions below.</p>}
        </div>

        <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 min-h-[300px] max-h-[500px] overflow-y-auto space-y-4">
          {messages.length === 0 ? (
            <p className="text-slate-500 italic text-center mt-12">Upload a file or send a message to start analyzing...</p>
          ) : (
            messages.map((msg, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg text-sm leading-relaxed ${
                  msg.role === 'user' ? 'bg-blue-950/60 border border-blue-900 ml-8 text-blue-100' : 'bg-slate-950 border border-slate-800 mr-8 text-slate-200'
                }`}
              >
                <div className="font-semibold text-xs mb-1 text-slate-400">
                  {msg.role === 'user' ? 'You' : 'AI Assistant'}
                </div>
                <ReactMarkdown>{msg.text}</ReactMarkdown>
              </div>
            ))
          )}
          {loading && <p className="text-xs text-blue-400 animate-pulse">AI is thinking...</p>}
        </div>

        {latestModelOutput && (
          <div className="flex flex-wrap gap-2 justify-end">
            <button
              onClick={() => downloadTextFile(latestModelOutput, 'ai-summary.txt')}
              className="bg-slate-800 hover:bg-slate-700 text-xs px-3 py-2 rounded-lg text-slate-300 border border-slate-700"
            >
              Download Full Output (.txt)
            </button>
            <button
              onClick={() => handleShare(latestModelOutput)}
              className="bg-blue-600 hover:bg-blue-500 text-xs px-3 py-2 rounded-lg text-white font-medium"
            >
              Share Output
            </button>
          </div>
        )}

        <form onSubmit={handleSend} className="flex gap-2">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ask a follow-up question or enter instructions..."
            className="flex-1 p-3 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 text-sm focus:outline-none focus:border-blue-500"
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
