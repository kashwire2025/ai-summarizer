"use client";

import { useState } from "react";
import { translations, languagesList } from "@/lib/translations";

export default function Home() {
  const [selectedLanguage, setSelectedLanguage] = useState("English");
  const [inputText, setInputText] = useState("");
  const [activeTab, setActiveTab] = useState("execSummary");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  // Dynamic localization with fallback to English for unmapped keys
  const t = translations[selectedLanguage] || translations["English"];

  const handleAction = async (actionType: string) => {
    if (!inputText.trim()) {
      setOutput("Please enter document text or upload a file first.");
      return;
    }

    setActiveTab(actionType);
    setLoading(true);
    setOutput("");

    try {
      const res = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          text: inputText, 
          action: actionType, 
          language: selectedLanguage 
        }),
      });

      const data = await res.json();
      if (res.ok && data.result) {
        setOutput(data.result);
      } else {
        setOutput(data.error || "Failed to generate AI response.");
      }
    } catch (err) {
      setOutput("Error connecting to AI failover service.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0b1120] text-white p-4 md:p-6 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header Controls */}
        <div className="flex flex-wrap justify-between items-center bg-[#131c31] p-4 rounded-xl border border-gray-800 gap-4">
          <h1 className="text-xl font-bold text-blue-400">{t.title}</h1>
          <div className="flex items-center gap-3">
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="bg-[#1b2744] text-white px-3 py-2 rounded-lg border border-gray-700 focus:outline-none text-sm"
            >
              {languagesList.map((lang) => (
                <option key={lang} value={lang}>
                  🌐 {lang}
                </option>
              ))}
            </select>
            <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-medium">
              {t.signIn}
            </button>
          </div>
        </div>

        {/* Upload & Text Input Box */}
        <div className="bg-[#131c31] p-6 rounded-xl border border-gray-800 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">{t.uploadLabel}</label>
            <div className="flex items-center gap-3 bg-[#1b2744] p-2 rounded-lg border border-gray-700">
              <label className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm cursor-pointer font-medium">
                {t.chooseFile}
                <input type="file" className="hidden" />
              </label>
              <span className="text-sm text-gray-400">{t.noFile}</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">{t.inputTextLabel}</label>
            <textarea
              rows={5}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={t.placeholder}
              className="w-full bg-[#1b2744] text-gray-100 p-4 rounded-lg border border-gray-700 focus:outline-none focus:border-blue-500 text-sm"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button
            onClick={() => handleAction("execSummary")}
            className="bg-[#1b2744] hover:bg-blue-900 border border-gray-700 p-3 rounded-lg text-sm font-medium text-left transition"
          >
            📋 {t.execSummary}
          </button>
          <button
            onClick={() => handleAction("actionItems")}
            className="bg-[#1b2744] hover:bg-blue-900 border border-gray-700 p-3 rounded-lg text-sm font-medium text-left transition"
          >
            ✅ {t.actionItems}
          </button>
          <button
            onClick={() => handleAction("takeaways")}
            className="bg-[#1b2744] hover:bg-blue-900 border border-gray-700 p-3 rounded-lg text-sm font-medium text-left transition"
          >
            💡 {t.takeaways}
          </button>
          <button
            onClick={() => handleAction("analyzeTrends")}
            className="bg-[#1b2744] hover:bg-blue-900 border border-gray-700 p-3 rounded-lg text-sm font-medium text-left transition"
          >
            📊 {t.analyzeTrends}
          </button>
        </div>

        {/* Download Action */}
        <button className="bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
          📥 {t.download}
        </button>

        {/* AI Response Output Box */}
        <div className="bg-[#131c31] p-6 rounded-xl border border-gray-800 min-h-[220px]">
          {loading ? (
            <div className="flex items-center gap-2 text-blue-400 animate-pulse">
              <span>Generating AI response in {selectedLanguage}...</span>
            </div>
          ) : (
            <div className="whitespace-pre-wrap text-gray-200 text-sm leading-relaxed">
              {output || "Select an action above after pasting text to see AI analysis."}
            </div>
          )}
        </div>

      </div>
    </main>
  );
}
