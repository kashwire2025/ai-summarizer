"use client";

import { useState } from "react";
import { LANGUAGES, getTranslation } from "@/lib/translations";

export default function Home() {
  const [language, setLanguage] = useState("en");
  const [inputText, setInputText] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const t = getTranslation(language);

  const handleAction = async (promptType: string) => {
    if (!inputText.trim() || loading) return;
    setLoading(true);
    setResponse("");

    try {
      const res = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: inputText,
          promptType,
          language: LANGUAGES.find((l) => l.code === language)?.name || "English",
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setResponse(data.summary || data.result);
      } else {
        setResponse(`Error: ${data.error || "Failed to generate output."}`);
      }
    } catch (err: any) {
      setResponse(`Network Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0b101d] text-slate-100 p-4 max-w-2xl mx-auto space-y-4">
      {/* Top Header */}
      <div className="bg-[#131b2e] border border-slate-800 rounded-xl p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-white">{t.title}</h1>
        <button className="bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs px-4 py-2 rounded-lg transition-colors">
          {t.signIn}
        </button>
      </div>

      {/* Language & Theme Selectors */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[#131b2e] border border-slate-800 rounded-xl p-3">
          <label className="text-xs text-slate-400 block mb-1 font-medium">
            {t.langLabel}
          </label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full bg-[#0b101d] border border-slate-700 text-white rounded-lg p-2 text-sm focus:outline-none focus:border-blue-500"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>

        <div className="bg-[#131b2e] border border-slate-800 rounded-xl p-3">
          <label className="text-xs text-slate-400 block mb-2 font-medium">
            {t.themeLabel}
          </label>
          <div className="flex gap-2">
            <span className="w-6 h-6 rounded-full bg-blue-600 border-2 border-white inline-block cursor-pointer"></span>
            <span className="w-6 h-6 rounded-full bg-white inline-block cursor-pointer"></span>
          </div>
        </div>
      </div>

      {/* Upload Box */}
      <div className="bg-[#131b2e] border border-slate-800 rounded-xl p-4">
        <span className="text-xs text-slate-400 block mb-2">{t.uploadLabel}</span>
        <div className="border border-slate-800 bg-[#0b101d] p-2 rounded-lg flex items-center justify-between">
          <button className="bg-blue-600 text-xs px-3 py-1.5 rounded text-white font-medium">
            {t.chooseFile}
          </button>
          <span className="text-xs text-slate-500">{t.noFile}</span>
        </div>
      </div>

      {/* Preset Action Grid */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => handleAction("Executive Summary")}
          className="bg-[#131b2e] hover:bg-slate-800 border border-slate-800 rounded-xl p-3 text-left flex items-center gap-2 transition-colors"
        >
          <span>📋</span>
          <span className="text-xs font-semibold text-slate-200">{t.execSummary}</span>
        </button>

        <button
          onClick={() => handleAction("Key Action Items")}
          className="bg-[#131b2e] hover:bg-slate-800 border border-slate-800 rounded-xl p-3 text-left flex items-center gap-2 transition-colors"
        >
          <span>✅</span>
          <span className="text-xs font-semibold text-slate-200">{t.keyActions}</span>
        </button>

        <button
          onClick={() => handleAction("Top Takeaways")}
          className="bg-[#131b2e] hover:bg-slate-800 border border-slate-800 rounded-xl p-3 text-left flex items-center gap-2 transition-colors"
        >
          <span>💡</span>
          <span className="text-xs font-semibold text-slate-200">{t.topTakeaways}</span>
        </button>

        <button
          onClick={() => handleAction("Analyze Trends")}
          className="bg-[#131b2e] hover:bg-slate-800 border border-slate-800 rounded-xl p-3 text-left flex items-center gap-2 transition-colors"
        >
          <span>📊</span>
          <span className="text-xs font-semibold text-slate-200">{t.analyzeTrends}</span>
        </button>
      </div>

      {/* Input Area */}
      <div className="bg-[#131b2e] border border-slate-800 rounded-xl p-3">
        <textarea
          rows={4}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={t.placeholder}
          className="w-full bg-[#0b101d] border border-slate-800 rounded-lg p-3 text-sm text-slate-200 focus:outline-none focus:border-blue-500 resize-none"
        ></textarea>
      </div>

      {/* Output / Response Block */}
      {loading ? (
        <div className="bg-[#131b2e] border border-slate-800 rounded-xl p-4 text-xs text-blue-400 animate-pulse">
          {t.thinking}
        </div>
      ) : (
        response && (
          <div className="bg-[#131b2e] border border-slate-800 rounded-xl p-4 text-sm text-slate-300 whitespace-pre-wrap">
            {response}
          </div>
        )
      )}

      {/* Primary Submit Button */}
      <button
        onClick={() => handleAction("General Summary")}
        disabled={loading || !inputText.trim()}
        className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-medium py-3 rounded-xl text-sm transition-colors"
      >
        {t.summarizeBtn}
      </button>
    </main>
  );
}
