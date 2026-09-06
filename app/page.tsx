"use client";

import { useState, useEffect } from "react";
import { LANGUAGES, getTranslation } from "@/lib/translations";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";

export default function Home() {
  const [language, setLanguage] = useState("en");
  const [inputText, setInputText] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const t = getTranslation(language);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

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

  const downloadFile = (format: "txt" | "md" | "doc") => {
    if (!response) return;

    let mimeType = "text/plain";
    let extension = format;
    let content = response;

    if (format === "md") {
      mimeType = "text/markdown";
    } else if (format === "doc") {
      mimeType = "application/msword";
      content = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head><title>Summary Export</title></head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>AI Summary Export</h2>
          <p>${response.replace(/\n/g, "<br/>")}</p>
        </body>
        </html>
      `;
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `summary-${Date.now()}.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const downloadImage = () => {
    if (!response) return;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = 800;
    const padding = 40;
    const fontSize = 16;
    const lineHeight = 24;

    ctx.font = `${fontSize}px sans-serif`;

    // Word wrap algorithm for Canvas
    const paragraphs = response.split("\n");
    const lines: string[] = [];

    paragraphs.forEach((p) => {
      if (!p.trim()) {
        lines.push("");
        return;
      }
      const words = p.split(" ");
      let currentLine = "";

      words.forEach((word) => {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        if (ctx.measureText(testLine).width > width - padding * 2) {
          lines.push(currentLine);
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      });
      if (currentLine) lines.push(currentLine);
    });

    const height = padding * 2 + lines.length * lineHeight + 60;
    canvas.width = width;
    canvas.height = Math.max(height, 300);

    // Canvas styling: Dark theme canvas output
    ctx.fillStyle = "#131b2e";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Top Header Banner
    ctx.fillStyle = "#2563eb";
    ctx.fillRect(0, 0, canvas.width, 8);

    ctx.fillStyle = "#94a3b8";
    ctx.font = "bold 14px sans-serif";
    ctx.fillText("AI SUMMARY EXPORT", padding, padding);

    // Render Text Lines
    ctx.fillStyle = "#f8fafc";
    ctx.font = `${fontSize}px sans-serif`;
    lines.forEach((line, idx) => {
      ctx.fillText(line, padding, padding + 35 + idx * lineHeight);
    });

    // Download PNG
    const link = document.createElement("a");
    link.download = `summary-${Date.now()}.png`;
    link.href = canvas.toDataURL("image/png");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <main className="min-h-screen bg-[#0b101d] text-slate-100 p-4 max-w-2xl mx-auto space-y-4">
      {/* Top Header */}
      <div className="bg-[#131b2e] border border-slate-800 rounded-xl p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-white">{t.title}</h1>
        {user ? (
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400 font-medium truncate max-w-[120px]">
              {user.email}
            </span>
            <button
              onClick={handleSignOut}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-700 transition-colors"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <a
            href="/login"
            className="bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs px-4 py-2 rounded-lg transition-colors"
          >
            {t.signIn}
          </a>
        )}
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

      {/* Output / Response Block with Export Controls */}
      {loading ? (
        <div className="bg-[#131b2e] border border-slate-800 rounded-xl p-4 text-xs text-blue-400 animate-pulse">
          {t.thinking}
        </div>
      ) : (
        response && (
          <div className="bg-[#131b2e] border border-slate-800 rounded-xl p-4 space-y-3">
            <span className="text-xs text-slate-400 font-medium block">
              {t.editNotice}
            </span>
            <textarea
              rows={6}
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              className="w-full bg-[#0b101d] border border-slate-800 rounded-lg p-3 text-sm text-slate-200 focus:outline-none focus:border-blue-500 resize-y"
            ></textarea>
            
            {/* Download Buttons */}
            <div className="flex flex-wrap gap-2 pt-1">
              <button
                onClick={() => downloadFile("txt")}
                className="bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700 transition-colors"
              >
                📥 {t.downloadTxt}
              </button>
              <button
                onClick={() => downloadFile("md")}
                className="bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700 transition-colors"
              >
                📥 {t.downloadMd}
              </button>
              <button
                onClick={() => downloadFile("doc")}
                className="bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700 transition-colors"
              >
                📥 {t.downloadDoc}
              </button>
              <button
                onClick={downloadImage}
                className="bg-blue-600 hover:bg-blue-500 text-xs text-white font-medium px-3 py-1.5 rounded-lg transition-colors"
              >
                🖼️ {t.downloadPng}
              </button>
            </div>
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
