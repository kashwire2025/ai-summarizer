"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

// Safe Supabase initialization avoiding non-ISO characters in headers
const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim();
const supabaseKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "").trim();
const supabase = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseKey || "placeholder"
);

export default function Home() {
  const [selectedLang, setSelectedLang] = useState("English");
  const [promptText, setPromptText] = useState("");
  const [fileData, setFileData] = useState<{ name: string; base64: string; type: string } | null>(null);
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  // Auth Modal States
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
      setResult("Please enter text or upload a document first.");
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

    // Clean inputs to ensure strict ISO-8859-1 compatibility in headers
    const cleanEmail = email.trim().replace(/[^\x00-\x7F]/g, "");
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      setAuthError("Please provide valid email and password.");
      return;
    }

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password: cleanPassword,
        });
        if (error) throw error;
        alert("Account created successfully! Check your email to confirm.");
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
        
        {/* Navigation Bar */}
        <div className="flex justify-between items-center bg-[#131c31] p-4 rounded-xl border border-gray-800">
          <h1 className="text-xl font-bold text-blue-400">AI Document Workbench</h1>
          <div className="flex items-center gap-3">
            {user ? (
              <span className="text-sm text-green-400">{user.email}</span>
            ) : (
              <button
                onClick={() => setIsAuthOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-medium transition"
              >
                Sign In / Sign Up
              </button>
            )}
          </div>
        </div>

        {/* Upload Card */}
        <div className="bg-[#131c31] p-5 rounded-xl border border-gray-800 space-y-2">
          <label className="block text-sm font-medium text-gray-300">
            Upload Document / Image
          </label>
          <div className="flex items-center gap-3 bg-[#1b2744] p-2 rounded-lg border border-gray-700">
            <label className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm cursor-pointer font-medium">
              Choose File
              <input type="file" onChange={handleFileUpload} className="hidden" accept=".pdf,.txt,.md" />
            </label>
            <span className="text-sm text-gray-400">
              {fileData?.name || "No file chosen"}
            </span>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button onClick={() => handleAction("execSummary")} disabled={loading} className="bg-[#131c31] hover:bg-[#1b2744] p-3 rounded-xl border border-gray-800 text-sm font-medium">
            📋 Executive Summary
          </button>
          <button onClick={() => handleAction("actionItems")} disabled={loading} className="bg-[#131c31] hover:bg-[#1b2744] p-3 rounded-xl border border-gray-800 text-sm font-medium">
            ✅ Key Action Items
          </button>
          <button onClick={() => handleAction("takeaways")} disabled={loading} className="bg-[#131c31] hover:bg-[#1b2744] p-3 rounded-xl border border-gray-800 text-sm font-medium">
            💡 Top Takeaways
          </button>
          <button onClick={() => handleAction("analyzeTrends")} disabled={loading} className="bg-[#131c31] hover:bg-[#1b2744] p-3 rounded-xl border border-gray-800 text-sm font-medium">
            📊 Analyze Trends
          </button>
        </div>

        {/* Output Summary Display */}
        <div className="bg-[#131c31] p-5 rounded-xl border border-gray-800 min-h-[160px]">
          <pre className="whitespace-pre-wrap font-sans text-sm text-gray-200">
            {result || "Output summary will appear here after selecting an option or clicking Send below..."}
          </pre>
        </div>

        {/* Text Area & SUBMIT BUTTON */}
        <div className="bg-[#131c31] p-5 rounded-xl border border-gray-800 space-y-3">
          <label className="block text-sm font-medium text-gray-300">
            Paste Document Text or Prompt
          </label>
          <textarea
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            placeholder="Paste document text or type your context here..."
            className="w-full bg-[#1b2744] border border-gray-700 rounded-lg p-3 text-sm focus:outline-none focus:border-blue-500 h-28 text-white"
          />
          <div className="flex justify-end">
            <button
              onClick={() => handleAction("execSummary")}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 px-6 py-2.5 rounded-lg text-sm font-semibold transition flex items-center gap-2 shadow-lg"
            >
              🚀 Send / Analyze
            </button>
          </div>
        </div>

      </div>

      {/* Email/Password Auth Modal */}
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
              {isSignUp ? "Create Account" : "Sign In"}
            </h2>

            {authError && (
              <div className="p-3 bg-red-900/40 border border-red-700 text-red-300 text-xs rounded-lg">
                {authError}
              </div>
            )}

            <form onSubmit={handleAuth} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#1b2744] border border-gray-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#1b2744] border border-gray-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 py-2.5 rounded-lg text-sm font-semibold transition"
              >
                {isSignUp ? "Sign Up" : "Sign In"}
              </button>
            </form>

            <div className="text-center text-xs text-gray-400">
              {isSignUp ? "Already have an account? " : "Don't have an account? "}
              <button
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setAuthError("");
                }}
                className="text-blue-400 hover:underline font-medium"
              >
                {isSignUp ? "Sign In" : "Sign Up"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
