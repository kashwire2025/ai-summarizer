"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { translations, Language } from "@/lib/dictionary";

const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co").trim();
const supabaseKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder").trim();
const supabase = createClient(supabaseUrl, supabaseKey);

export default function Home() {
  const [selectedLang, setSelectedLang] = useState<Language>("English");
  const t = translations[selectedLang];

  const [promptText, setPromptText] = useState("");
  const [fileData, setFileData] = useState<{ name: string; base64: string; type: string } | null>(null);
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  // Auth States
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [user, setUser] = useState<any>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64String = (event.target?.result as string).split(",")[1];
      setFileData({
        name: file.name,
        base64: base64String,
        type: file.type || "application/pdf",
      });
    };
    reader.readAsDataURL(file);
  };

  const handleAction = async (actionType: string = "execSummary") => {
    if (!promptText.trim() && !fileData) {
      setResult("Please provide text input or upload a document to process.");
      return;
    }

    setLoading(true);
    setResult("Processing document...");

    try {
      const res = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: promptText.trim(),
          file: fileData,
          action: actionType,
          language: selectedLang,
        }),
      });

      const data = await res.json();
      if (res.ok && data.result) {
        setResult(data.result);
      } else {
        setResult(data.error || "Failed to process request.");
      }
    } catch (err) {
      setResult("Error connecting to server.");
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");

    const cleanEmail = email.trim().replace(/[^\x00-\x7F]/g, "");
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      setAuthError("Please input a valid email and password.");
      return;
    }

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password: cleanPassword,
        });
        if (error) throw error;
        alert("Verification link sent! Check your inbox.");
        setIsAuthOpen(false);
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: cleanPassword,
        });
        if (error) throw error;
        setUser(data.user);
        setIsAuthOpen(false);
      }
    } catch (err: any) {
      setAuthError(err.message || "Authentication failed.");
    }
  };

  return (
    <main className="min-h-screen bg-[#0b1120] text-white p-4 md:p-6 font-sans">
      <div className="max-w-4xl mx-auto space-y-5">
        
        {/* Navigation & Language Picker */}
        <div className="flex flex-wrap justify-between items-center bg-[#131c31] p-4 rounded-xl border border-gray-800 gap-3">
          <h1 className="text-xl font-bold text-blue-400">{t.title}</h1>
          <div className="flex items-center gap-3">
            <select
              value={selectedLang}
              onChange={(e) => setSelectedLang(e.target.value as Language)}
              className="bg-[#1b2744] border border-gray-700 text-sm rounded-lg px-3 py-2 text-white focus:outline-none"
            >
              <option value="English">English</option>
              <option value="French">Français</option>
              <option value="Hausa">Hausa</option>
              <option value="Yoruba">Yorùbá</option>
              <option value="Igbo">Igbo</option>
            </select>

            {user ? (
              <span className="text-sm text-green-400 font-medium">{user.email}</span>
            ) : (
              <button
                onClick={() => setIsAuthOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-medium transition"
              >
                {t.signInUp}
              </button>
            )}
          </div>
        </div>

        {/* Upload Card */}
        <div className="bg-[#131c31] p-5 rounded-xl border border-gray-800 space-y-2">
          <label className="block text-sm font-medium text-gray-300">{t.uploadLabel}</label>
          <div className="flex items-center gap-3 bg-[#1b2744] p-2 rounded-lg border border-gray-700">
            <label className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm cursor-pointer font-medium">
              {t.chooseFile}
              <input type="file" onChange={handleFileUpload} className="hidden" accept=".pdf,.txt,.md" />
            </label>
            <span className="text-sm text-gray-400">{fileData?.name || t.noFile}</span>
          </div>
        </div>

        {/* Action Presets */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button onClick={() => handleAction("execSummary")} disabled={loading} className="bg-[#131c31] hover:bg-[#1b2744] p-3 rounded-xl border border-gray-800 text-sm font-medium">
            {t.execSummary}
          </button>
          <button onClick={() => handleAction("actionItems")} disabled={loading} className="bg-[#131c31] hover:bg-[#1b2744] p-3 rounded-xl border border-gray-800 text-sm font-medium">
            {t.actionItems}
          </button>
          <button onClick={() => handleAction("takeaways")} disabled={loading} className="bg-[#131c31] hover:bg-[#1b2744] p-3 rounded-xl border border-gray-800 text-sm font-medium">
            {t.takeaways}
          </button>
          <button onClick={() => handleAction("analyzeTrends")} disabled={loading} className="bg-[#131c31] hover:bg-[#1b2744] p-3 rounded-xl border border-gray-800 text-sm font-medium">
            {t.analyzeTrends}
          </button>
        </div>

        {/* Output Box */}
        <div className="bg-[#131c31] p-5 rounded-xl border border-gray-800 min-h-[160px]">
          <pre className="whitespace-pre-wrap font-sans text-sm text-gray-200">
            {result || t.outputPlaceholder}
          </pre>
        </div>

        {/* Text Input & Submit Button */}
        <div className="bg-[#131c31] p-5 rounded-xl border border-gray-800 space-y-3">
          <label className="block text-sm font-medium text-gray-300">{t.promptLabel}</label>
          <textarea
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            placeholder={t.promptPlaceholder}
            className="w-full bg-[#1b2744] border border-gray-700 rounded-lg p-3 text-sm focus:outline-none focus:border-blue-500 h-28 text-white"
          />
          <div className="flex justify-end">
            <button
              onClick={() => handleAction("execSummary")}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 px-6 py-2.5 rounded-lg text-sm font-semibold transition flex items-center gap-2"
            >
              {t.sendBtn}
            </button>
          </div>
        </div>

      </div>

      {/* Auth Modal */}
      {isAuthOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-[#131c31] border border-gray-700 w-full max-w-md rounded-xl p-6 space-y-4 relative">
            <button
              onClick={() => setIsAuthOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              ✕
            </button>
            <h2 className="text-lg font-bold text-blue-400">
              {isSignUp ? t.createAccount : t.signIn}
            </h2>

            {authError && (
              <div className="p-3 bg-red-900/40 border border-red-700 text-red-300 text-xs rounded-lg">
                {authError}
              </div>
            )}

            <form onSubmit={handleAuth} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">{t.email}</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#1b2744] border border-gray-700 rounded-lg p-2.5 text-sm text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">{t.password}</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#1b2744] border border-gray-700 rounded-lg p-2.5 text-sm text-white focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 py-2.5 rounded-lg text-sm font-semibold transition"
              >
                {isSignUp ? t.createAccount : t.signIn}
              </button>
            </form>

            <div className="text-center text-xs text-gray-400">
              {isSignUp ? t.hasAccount : t.noAccount}{" "}
              <button
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setAuthError("");
                }}
                className="text-blue-400 hover:underline font-medium"
              >
                {isSignUp ? t.signIn : t.createAccount}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
