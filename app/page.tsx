'use client';

import { useState, useRef } from 'react';

export default function Home() {
  const [language, setLanguage] = useState('English');
  const [format, setFormat] = useState('Bullet Points');
  const [prompt, setPrompt] = useState('');
  const [fileData, setFileData] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [summary, setSummary] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Guardrail: Vercel serverless functions block payloads over 4.5MB
    if (file.size > 4 * 1024 * 1024) {
      setError('File is too large. Please select a document or photo under 4MB.');
      return;
    }

    setFileName(file.name);
    setError('');

    const reader = new FileReader();
    reader.onloadend = () => {
      setFileData(reader.result as string);
    };
    reader.readAsDataURL(file); // Converts PDF, Text, and Images to base64
  };

  const removeFile = () => {
    setFileData(null);
    setFileName(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSummarize = async () => {
    if (!prompt.trim() && !fileData) {
      setError('Please provide text instructions or upload a document.');
      return;
    }

    setIsLoading(true);
    setError('');
    setSummary('');

    try {
      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, image: fileData, language, length: format }),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText || 'Failed to connect to AI server');
      }

      if (!response.body) throw new Error('No response body returned from server');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        if (value) {
          setSummary((prev) => prev + decoder.decode(value, { stream: true }));
        }
      }
    } catch (err: any) {
      setError(`Diagnostic Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white p-4 sm:p-6 font-sans">
      <div className="max-w-md mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-center mt-2 mb-8">AI Document Summarizer</h1>

        {/* Dropdowns */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col">
            <label className="text-sm mb-1 text-gray-300 font-medium">Language:</label>
            <select 
              value={language} 
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-gray-900 border border-gray-700 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500"
            >
              <option>English</option>
              <option>Spanish</option>
              <option>French</option>
              <option>German</option>
            </select>
          </div>
          <div className="flex flex-col">
            <label className="text-sm mb-1 text-gray-300 font-medium">Format:</label>
            <select 
              value={format} 
              onChange={(e) => setFormat(e.target.value)}
              className="bg-gray-900 border border-gray-700 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500"
            >
              <option>Bullet Points</option>
              <option>Detailed Analysis</option>
              <option>Short Summary</option>
            </select>
          </div>
        </div>

        {/* Upload Button */}
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-5 text-center shadow-sm">
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".pdf,image/*,.doc,.docx,.txt"
            className="hidden" 
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="bg-gray-800 hover:bg-gray-700 text-white font-medium py-4 px-6 rounded-xl w-full flex items-center justify-center gap-3 transition border border-gray-600"
          >
            <span className="text-xl">📁</span> Upload Document / Image
          </button>
          <p className="text-xs text-gray-400 mt-3 font-medium">Supports PDF, JPG, PNG, TXT (Max 4MB)</p>
        </div>

        {/* File Preview Status */}
        {fileName && (
          <div className="bg-gray-800 border border-gray-600 p-4 rounded-xl flex items-center justify-between shadow-sm">
            <span className="truncate text-sm text-blue-200 max-w-[75%] font-medium">{fileName}</span>
            <button onClick={removeFile} className="text-red-400 text-sm font-bold hover:text-red-300 transition">
              Remove
            </button>
          </div>
        )}

        {/* Expanded Text Box */}
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Paste text here, or type instructions when scanning a document..."
          className="w-full bg-gray-900 border border-gray-700 rounded-xl p-4 text-white focus:outline-none focus:border-blue-500 min-h-[220px] resize-y shadow-sm"
        ></textarea>

        {/* Action Button */}
        <button 
          onClick={handleSummarize}
          disabled={isLoading}
          className={`w-full font-bold py-4 rounded-xl transition shadow-md text-lg ${isLoading ? 'bg-blue-900 text-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500 text-white'}`}
        >
          {isLoading ? 'Processing Summary...' : 'Summarize Document'}
        </button>

        {/* Error Output */}
        {error && (
          <div className="bg-red-900/40 border border-red-800 text-red-200 p-4 rounded-xl text-sm break-words leading-relaxed shadow-sm">
            {error}
          </div>
        )}

        {/* Summary Result Box */}
        {summary && (
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 mt-6 shadow-sm">
            <h3 className="font-bold text-lg mb-4 text-blue-400 border-b border-gray-800 pb-2">Generated Output</h3>
            <div className="text-gray-200 whitespace-pre-wrap leading-relaxed text-sm sm:text-base">
              {summary}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
