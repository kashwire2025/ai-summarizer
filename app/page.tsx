"use client";

import { useState } from "react";
import { translations } from "@/lib/translations";

export default function Home() {
  const [selectedLanguage, setSelectedLanguage] = useState<keyof typeof translations>("English");
  const [activeTab, setActiveTab] = useState("execSummary");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const t = translations[selectedLanguage] || translations["English"];

  const handleAction = async (actionType: string) => {
    setActiveTab(actionType);
    setLoading(true);
    try {
      const res = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: actionType, language: selectedLanguage }),
      });
      const data = await res.json();
      setOutput(data.result || "No response received.");
    } catch (err) {
      setOutput("Error generating response.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0b1120] text-white p-6 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header Controls */}
        <div className="flex justify-between items-center bg-[#131c31] p-4 rounded-xl border border-gray-800">
          <h1 className="text-xl font-bold text-blue-400">{t.title}</h1>
          <div className="flex items-center gap-3">
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value as keyof typeof translations)}
              className="bg-[#1b2744] text-white px-3 py-2 rounded-lg border border-gray-700 focus:outline-none"
            >
              <option value="English">🌐 English</option>
              <option value="Spanish">🌐 Spanish</option>
              <option value="Portuguese">🌐 Portuguese</option>
            </select>
            <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-medium">
              {t.signIn}
            </button>
          </div>
        </div>

        {/* Upload Box */}
        <div className="bg-[#131c31] p-6 rounded-xl border border-gray-800 space-y-3">
          <label className="block text-sm font-medium text-gray-300">{t.uploadLabel}</label>
          <div className="flex items-center gap-3 bg-[#1b2744] p-2 rounded-lg border border-gray-700">
            <label className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm cursor-pointer font-medium">
              {t.chooseFile}
              <input type="file" className="hidden" />
            </label>
            <span className="text-sm text-gray-400">{t.noFile}</span>
          </div>
        </div>

        {/* Dynamic Action Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button
            onClick={() => handleAction("execSummary")}
            className="bg-[#1b2744] hover:bg-blue-900 border border-gray-700 p-3 rounded-lg text-sm font-medium text-left"
          >
            📋 {t.execSummary}
          </button>
          <button
            onClick={() => handleAction("actionItems")}
            className="bg-[#1b2744] hover:bg-blue-900 border border-gray-700 p-3 rounded-lg text-sm font-medium text-left"
          >
            ✅ {t.actionItems}
          </button>
          <button
            onClick={() => handleAction("takeaways")}
            className="bg-[#1b2744] hover:bg-blue-900 border border-gray-700 p-3 rounded-lg text-sm font-medium text-left"
          >
            💡 {t.takeaways}
          </button>
          <button
            onClick={() => handleAction("analyzeTrends")}
            className="bg-[#1b2744] hover:bg-blue-900 border border-gray-700 p-3 rounded-lg text-sm font-medium text-left"
          >
            📊 {t.analyzeTrends}
          </button>
        </div>

        {/* Download Button */}
        <button className="bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
          📥 {t.download}
        </button>

        {/* Output Section */}
        <div className="bg-[#131c31] p-6 rounded-xl border border-gray-800 min-h-[200px]">
          {loading ? (
            <p className="text-gray-400 animate-pulse">Generating localized response...</p>
          ) : (
            <div className="whitespace-pre-wrap text-gray-200">{output || "Select an action above to see AI analysis."}</div>
          )}
        </div>

      </div>
    </main>
  );
}
