"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const languages = [
  "English", "Spanish", "French", "German", "Chinese", "Japanese", "Korean",
  "Portuguese", "Italian", "Russian", "Arabic", "Hindi", "Bengali", "Turkish",
  "Dutch", "Polish", "Swedish", "Indonesian", "Vietnamese", "Thai", "Greek",
  "Hebrew", "Czech", "Hungarian", "Romanian"
];

export default function Home() {
  const [selectedLang, setSelectedLang] = useState("English");
  const [promptText, setPromptText] = useState("");
  const [fileText, setFileText] = useState("");
  const [fileName, setFileName] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // File upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();

    reader.onload = (event) => {
      const content = event.target?.result as string;
      setFileText(content || "");
    };

    reader.readAsText(file);
  };

  const handleAction = async (actionType: string) => {
    if (!promptText.trim() && !fileText.trim()) {
      setResult("Please enter document text or upload a file first.");
      return;
    }

    setLoading(true);
    setResult("Processing document...");

    try {
      const res = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: promptText,
          fileText: fileText,
          action: actionType,
          language: selectedLang,
        }),
      });

      const data = await res.json();

      if (res.ok && data.result) {
        setResult(data.result);
      } else {
        setResult(data.error || "Failed to generate AI response.");
      }
    } catch (err) {
      setResult("Error connecting to AI service.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!result) return;
    const blob = new Blob([result], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "summary.md";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="min-h-screen bg-[#0b1120] text-white p-4 md:p-6 font-sans">
      <div className="max-w-4xl mx-auto space-y-5">
        
        {/* Navigation Bar */}
        <div className="flex justify-between items-center bg-[#131c31] p-4 rounded-xl border border-gray-800">
          <h1 className="text-xl font-bold text-blue-400">AI Document Workbench</h1>
          <div className="flex items-center gap-3">
            <select
              value={selectedLang}
              onChange={(e) => setSelectedLang(e.target.value)}
              className="bg-[#1b2744] text-white px-3 py-2 rounded-lg border border-gray-700 text-sm focus:outline-none"
            >
              {languages.map((lang) => (
                <option key={lang} value={lang}>
                  🌐 {lang}
                </option>
              ))}
            </select>
            <button
              onClick={() => alert("Redirecting to Email/Password Sign-In...")}
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-medium transition"
            >
              Sign In / Sign Up
            </button>
          </div>
        </div>

        {/* Upload Card */}
        <div className="bg-[#131c31] p-5 rounded-xl border border-gray-800 space-y-2">
          <label className="block text-sm font-medium text-gray-300">
            Upload Context Document / Image
          </label>
          <div className="flex items-center gap-3 bg-[#1b2744] p-2 rounded-lg border border-gray-700">
            <label className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm cursor-pointer font-medium">
              Choose File
              <input type="file" onChange={handleFileUpload} className="hidden" />
            </label>
            <span className="text-sm text-gray-400">
              {fileName || "No file chosen"}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button
            onClick={() => handleAction("execSummary")}
            disabled={loading}
            className="bg-[#131c31] hover:bg-[#1b2744] p-3 rounded-xl border border-gray-800 text-left font-medium text-sm flex items-center gap-2"
          >
            📋 Executive Summary
          </button>
          <button
            onClick={() => handleAction("actionItems")}
            disabled={loading}
            className="bg-[#131c31] hover:bg-[#1b2744] p-3 rounded-xl border border-gray-800 text-left font-medium text-sm flex items-center gap-2"
          >
            ✅ Key Action Items
          </button>
          <button
            onClick={() => handleAction("takeaways")}
            disabled={loading}
            className="bg-[#131c31] hover:bg-[#1b2744] p-3 rounded-xl border border-gray-800 text-left font-medium text-sm flex items-center gap-2"
          >
            💡 Top Takeaways
          </button>
          <button
            onClick={() => handleAction("analyzeTrends")}
            disabled={loading}
            className="bg-[#131c31] hover:bg-[#1b2744] p-3 rounded-xl border border-gray-800 text-left font-medium text-sm flex items-center gap-2"
          >
            📊 Analyze Trends & Data
          </button>
        </div>

        {/* Export Options */}
        <div className="flex justify-between items-center gap-4">
          <select className="bg-[#131c31] text-white px-3 py-2 rounded-lg border border-gray-800 text-sm">
            <option>Markdown (.md)</option>
          </select>
          <button
            onClick={handleDownload}
            className="bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
          >
            📥 Download File (.md)
          </button>
        </div>

        {/* Output Area */}
        <div className="bg-[#131c31] p-5 rounded-xl border border-gray-800 min-h-[160px]">
          <pre className="whitespace-pre-wrap font-sans text-sm text-gray-200">
            {result || "Output summary will appear here after selection..."}
          </pre>
        </div>

        {/* Text Input Area */}
        <div className="bg-[#131c31] p-5 rounded-xl border border-gray-800 space-y-2">
          <label className="block text-sm font-medium text-gray-300">
            Paste Document Text or Prompt
          </label>
          <textarea
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            placeholder="Paste document text or type your context here..."
            className="w-full bg-[#1b2744] border border-gray-700 rounded-lg p-3 text-sm focus:outline-none focus:border-blue-500 h-28 text-white"
          />
        </div>

      </div>
    </main>
  );
}
