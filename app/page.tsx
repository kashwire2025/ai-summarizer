"use client";

import { useState, useEffect } from "react";
import { translations, languagesList } from "@/lib/translations";
import { createClient } from "@supabase/supabase-js";

export default function Home() {
  const [selectedLanguage, setSelectedLanguage] = useState("English");
  const [inputText, setInputText] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState("");
  const [downloadFormat, setDownloadFormat] = useState("md");
  const [user, setUser] = useState<any>(null);

  // Auth Modal State
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authMessage, setAuthMessage] = useState("");

  const t = translations[selectedLanguage] || translations["English"];

  const getSupabase = () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder";
    return createClient(supabaseUrl, supabaseAnonKey);
  };

  useEffect(() => {
    const supabase = getSupabase();
    
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) setUser(data.user);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthMessage("");
    const supabase = getSupabase();

    if (isSignUp) {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setAuthMessage(error.message);
      } else {
        setAuthMessage("Account created! Check your email or sign in directly.");
      }
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setAuthMessage(error.message);
      } else {
        setShowAuthModal(false);
        setEmail("");
        setPassword("");
      }
    }
  };

  const handleSignOut = async () => {
    const supabase = getSupabase();
    await supabase.auth.signOut();
    setUser(null);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);

    if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
      try {
        const fileData = await file.arrayBuffer();
        // @ts-ignore
        const pdfjsLib = await import("pdfjs-dist/build/pdf.mjs");
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

        const loadingTask = pdfjsLib.getDocument({ data: fileData });
        const pdf = await loadingTask.promise;
        let extractedText = "";

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          const pageText = content.items.map((item: any) => item.str).join(" ");
          extractedText += `\n--- Page ${i} ---\n` + pageText;
        }

        setInputText(extractedText.trim());
      } catch (err) {
        setOutput("Error reading PDF file. Try pasting text directly.");
      }
    } else {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setInputText(text);
      };
      reader.readAsText(file);
    }
  };

  const handleDownload = () => {
    if (!output) return;
    const blob = new Blob([output], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `summary.${downloadFormat}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleAction = async (actionType: string) => {
    if (!inputText.trim()) {
      setOutput("Please enter document text, upload a file, or type a prompt first.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          prompt: inputText, 
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
      setOutput("Error connecting to AI service.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0b1120] text-white p-4 md:p-6 font-sans">
      <div className="max-w-4xl mx-auto space-y-5">
        
        {/* Header Controls */}
        <div className="flex justify-between items-center bg-[#131c31] p-4 rounded-xl border border-gray-800">
          <h1 className="text-xl font-bold text-blue-400">{t.title}</h1>
          <div className="flex items-center gap-3">
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="bg-[#1b2744] text-white px-3 py-2 rounded-lg border border-gray-700 text-sm focus:outline-none"
            >
              {languagesList.map((lang) => (
                <option key={lang} value={lang}>🌐 {lang}</option>
              ))}
            </select>
            {user ? (
              <button 
                onClick={handleSignOut}
                className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-sm font-medium transition"
              >
                Sign Out ({user.email?.slice(0, 10)}...)
              </button>
            ) : (
              <button 
                onClick={() => setShowAuthModal(true)}
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-medium transition"
              >
                {t.signIn}
              </button>
            )}
          </div>
        </div>

        {/* Auth Modal */}
        {showAuthModal && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
            <div className="bg-[#131c31] p-6 rounded-xl border border-gray-800 w-full max-w-md space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-blue-400">
                  {isSignUp ? "Create Account" : "Sign In"}
                </h2>
                <button 
                  onClick={() => setShowAuthModal(false)}
                  className="text-gray-400 hover:text-white text-sm"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleAuth} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full bg-[#1b2744] text-white p-2.5 rounded-lg border border-gray-700 text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">Password</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#1b2744] text-white p-2.5 rounded-lg border border-gray-700 text-sm focus:outline-none"
                  />
                </div>

                {authMessage && (
                  <p className="text-xs text-blue-400 leading-relaxed">{authMessage}</p>
                )}

                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 py-2.5 rounded-lg text-sm font-semibold transition"
                >
                  {isSignUp ? "Sign Up" : "Sign In"}
                </button>
              </form>

              <div className="text-center text-xs text-gray-400 pt-2 border-t border-gray-800">
                {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setAuthMessage("");
                  }}
                  className="text-blue-400 hover:underline font-medium"
                >
                  {isSignUp ? "Sign In" : "Sign Up"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Upload Box */}
        <div className="bg-[#131c31] p-5 rounded-xl border border-gray-800 space-y-2">
          <label className="block text-sm font-medium text-gray-300">{t.uploadLabel}</label>
          <div className="flex items-center gap-3 bg-[#1b2744] p-2 rounded-lg border border-gray-700">
            <label className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm cursor-pointer font-medium">
              {t.chooseFile}
              <input 
                type="file" 
                accept=".txt,.md,.csv,.json,.pdf" 
                onChange={handleFileUpload} 
                className="hidden" 
              />
            </label>
            <span className="text-sm text-gray-400">{fileName || t.noFile}</span>
          </div>
        </div>

        {/* Action Preset Buttons */}
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

        {/* Export / Download Bar */}
        <div className="flex items-center gap-3">
          <select
            value={downloadFormat}
            onChange={(e) => setDownloadFormat(e.target.value)}
            className="bg-[#1b2744] text-white px-3 py-2 rounded-lg border border-gray-700 text-sm focus:outline-none"
          >
            <option value="md">Markdown (.md)</option>
            <option value="txt">Plain Text (.txt)</option>
            <option value="pdf">Document (.pdf)</option>
          </select>
          <button 
            onClick={handleDownload}
            disabled={!output}
            className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
          >
            📥 Download File (.{downloadFormat})
          </button>
        </div>

        {/* AI Output Box */}
        <div className="bg-[#131c31] p-6 rounded-xl border border-gray-800 min-h-[220px]">
          {loading ? (
            <p className="text-blue-400 animate-pulse text-sm">Processing in {selectedLanguage}...</p>
          ) : (
            <div className="whitespace-pre-wrap text-gray-200 text-sm leading-relaxed">
              {output || "Select an action or type in the prompt box below and click Send to analyze context."}
            </div>
          )}
        </div>

        {/* Bottom Input Chat Box */}
        <div className="bg-[#131c31] p-4 rounded-xl border border-gray-800 space-y-3">
          <label className="block text-sm font-medium text-gray-300">{t.inputTextLabel}</label>
          <textarea
            rows={4}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={t.placeholder}
            className="w-full bg-[#1b2744] text-gray-100 p-3 rounded-lg border border-gray-700 focus:outline-none focus:border-blue-500 text-sm font-mono"
          />
          <div className="flex justify-end">
            <button
              onClick={() => handleAction("customPrompt")}
              className="bg-blue-600 hover:bg-blue-700 px-6 py-2.5 rounded-lg text-sm font-semibold transition flex items-center gap-2"
            >
              🚀 Send / Analyze
            </button>
          </div>
        </div>

      </div>
    </main>
  );
}
