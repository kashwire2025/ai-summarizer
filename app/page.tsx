"type client";
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

const LANGUAGES = [
  "English", "Français", "Español", "Deutsch", "中文",
  "العربية", "Português", "Русский", "日本語", "한국어",
  "हिन्दी", "Italiano", "Nederlands", "Türkçe", "Tiếng Việt",
  "Polski", "Bahasa Indonesia", "Tagalog", "Українська", "Yorùbá",
  "Igbo", "Hausa", "Kiswahili", "Ελληνικά", "Română"
];

const ACTIONS = [
  { id: "execSummary", label: "Executive Summary", icon: "📋" },
  { id: "keyActions", label: "Key Action Items", icon: "✅" },
  { id: "takeaways", label: "Top Takeaways", icon: "💡" },
  { id: "trends", label: "Analyze Trends", icon: "📊" },
];

export default function Home() {
  const [language, setLanguage] = useState("English");
  const [format, setFormat] = useState("Bullet Points");
  const [theme, setTheme] = useState("dark");
  const [prompt, setPrompt] = useState("");
  const [file, setFile] = useState<{ name: string; base64: string; type: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("Please provide text input or upload a document to process.");
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64String = (reader.result as string).split(",")[1];
      setFile({
        name: uploadedFile.name,
        base64: base64String,
        type: uploadedFile.type,
      });
    };
    reader.readAsDataURL(uploadedFile);
  };

  const handleAction = async (actionId: string) => {
    setLoading(true);
    setError(null);
    setResult("Processing request...");

    try {
      const res = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          file,
          action: actionId,
          language,
          format,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to process request.");

      setResult(data.result);
    } catch (err: any) {
      setError(err.message || "Error connecting to server.");
      setResult("Error processing request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={`min-h-screen p-4 md:p-8 flex flex-col items-center ${theme === 'light' ? 'bg-gray-100 text-gray-900' : 'bg-[#0b0f19] text-white'}`}>
      <div className="w-full max-w-xl space-y-6">
        
        {/* Header */}
        <div className="flex justify-between items-center bg-[#131b2e] p-4 rounded-xl border border-gray-800 shadow-lg">
          <h1 className="text-xl font-bold tracking-wide">AI Document Workbench</h1>
          <Link href="/login" className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
            Sign In / Sign Up
          </Link>
        </div>

        {/* Controls Bar */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[#131b2e] p-3 rounded-xl border border-gray-800">
            <label className="block text-xs text-gray-400 mb-1">Language ({LANGUAGES.length} supported):</label>
            <select 
              value={language} 
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full bg-[#0b0f19] text-white border border-gray-700 rounded-lg p-2 text-sm focus:outline-none focus:border-blue-500"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
          </div>

          <div className="bg-[#131b2e] p-3 rounded-xl border border-gray-800">
            <label className="block text-xs text-gray-400 mb-1">Theme:</label>
            <div className="flex gap-2 mt-1">
              <button onClick={() => setTheme('dark')} className={`w-7 h-7 rounded-full bg-black border ${theme === 'dark' ? 'border-blue-500 ring-2 ring-blue-500' : 'border-gray-700'}`} />
              <button onClick={() => setTheme('light')} className={`w-7 h-7 rounded-full bg-white border ${theme === 'light' ? 'border-blue-500 ring-2 ring-blue-500' : 'border-gray-700'}`} />
            </div>
          </div>
        </div>

        {/* File Upload Box */}
        <div className="bg-[#131b2e] p-4 rounded-xl border border-gray-800 flex flex-col gap-2">
          <span className="text-xs text-gray-400">Upload Document / Image</span>
          <label className="flex items-center justify-between bg-[#0b0f19] border border-gray-700 hover:border-blue-500 rounded-lg p-2 cursor-pointer transition">
            <span className="bg-blue-600 text-white px-3 py-1.5 rounded-md text-xs font-semibold">Choose File</span>
            <span className="text-xs text-gray-300 truncate max-w-[200px]">{file ? file.name : "No file chosen"}</span>
            <input type="file" onChange={handleFileChange} className="hidden" />
          </label>
        </div>

        {/* Action Grid */}
        <div className="grid grid-cols-2 gap-3">
          {ACTIONS.map((act) => (
            <button
              key={act.id}
              onClick={() => handleAction(act.id)}
              disabled={loading}
              className="bg-[#131b2e] hover:bg-[#1a2540] border border-gray-800 hover:border-blue-500 p-4 rounded-xl text-left transition flex items-center gap-3 disabled:opacity-50"
            >
              <span className="text-xl">{act.icon}</span>
              <span className="text-sm font-semibold">{act.label}</span>
            </button>
          ))}
        </div>

        {/* Result Area */}
        <div className="bg-[#131b2e] p-4 rounded-xl border border-gray-800 min-h-[140px] text-sm text-gray-200 whitespace-pre-wrap">
          {error ? <span className="text-red-400">Error: {error}</span> : result}
        </div>

        {/* Text Prompt Input */}
        <div className="bg-[#131b2e] p-4 rounded-xl border border-gray-800">
          <label className="block text-xs text-gray-400 mb-2">Paste Document Text or Prompt</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Type your prompt or paste text here..."
            className="w-full bg-[#0b0f19] text-white border border-gray-700 rounded-lg p-3 text-sm focus:outline-none focus:border-blue-500 min-h-[100px]"
          />
        </div>

        {/* Submit Button */}
        <button
          onClick={() => handleAction("summarize")}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 rounded-xl shadow-lg transition disabled:opacity-50"
        >
          {loading ? "Processing..." : "Summarize Document"}
        </button>

      </div>
    </main>
  );
}
