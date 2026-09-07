"use client";

import { useState, useRef } from "react";

const LANGUAGES = [
  "English", "Français", "Español", "Deutsch", "中文", 
  "العربية", "Português", "Русский", "日本語", "한국어", 
  "Italiano", "Nederlands", "Türkçe", "हिन्दी", "Bahasa Indonesia", 
  "Polski", "Svenska", "Tiếng Việt", "Українська", "Ελληνικά", 
  "Čeština", "Română", "Magyar", "Dansk", "Suomi"
];

const I18N: Record<string, Record<string, string>> = {
  English: { title: "AI Document Workbench", submit: "Summarize / Chat", dlTxt: "📥 Download .TXT", dlMd: "📥 Download .MD", dlDoc: "📥 Download .DOC", dlPng: "🖼️ Download .PNG" },
  Français: { title: "Espace Document IA", submit: "Résumer / Discuter", dlTxt: "📥 Télécharger .TXT", dlMd: "📥 Télécharger .MD", dlDoc: "📥 Télécharger .DOC", dlPng: "🖼️ Télécharger .PNG" },
  Español: { title: "Panel de Documentos IA", submit: "Resumir / Chatear", dlTxt: "📥 Descargar .TXT", dlMd: "📥 Descargar .MD", dlDoc: "📥 Descargar .DOC", dlPng: "🖼️ Descargar .PNG" },
  Deutsch: { title: "KI-Dokumenten-Workbench", submit: "Zusammenfassen", dlTxt: "📥 Herunterladen .TXT", dlMd: "📥 Herunterladen .MD", dlDoc: "📥 Herunterladen .DOC", dlPng: "🖼️ Herunterladen .PNG" },
  中文: { title: "AI 文档工作台", submit: "生成摘要 / 聊天", dlTxt: "📥 下载 .TXT", dlMd: "📥 下载 .MD", dlDoc: "📥 下载 .DOC", dlPng: "🖼️ 下载 .PNG" },
  العربية: { title: "مساحة عمل مستندات الذكاء الاصطناعي", submit: "تلخيص / محادثة", dlTxt: "📥 تنزيل .TXT", dlMd: "📥 تنزيل .MD", dlDoc: "📥 تنزيل .DOC", dlPng: "🖼️ تنزيل .PNG" },
  Português: { title: "Painel de Documentos IA", submit: "Resumir / Conversar", dlTxt: "📥 Baixar .TXT", dlMd: "📥 Baixar .MD", dlDoc: "📥 Baixar .DOC", dlPng: "🖼️ Baixar .PNG" },
  Русский: { title: "Рабочая область ИИ", submit: "Сформировать / Чат", dlTxt: "📥 Скачать .TXT", dlMd: "📥 Скачать .MD", dlDoc: "📥 Скачать .DOC", dlPng: "🖼️ Скачать .PNG" },
  日本語: { title: "AI ドキュメント ワークベンチ", submit: "要約 / チャット", dlTxt: "📥 ダウンロード .TXT", dlMd: "📥 ダウンロード .MD", dlDoc: "📥 ダウンロード .DOC", dlPng: "🖼️ ダウンロード .PNG" },
  한국어: { title: "AI 문서 워크벤치", submit: "요약하기 / 대화", dlTxt: "📥 다운로드 .TXT", dlMd: "📥 다운로드 .MD", dlDoc: "📥 다운로드 .DOC", dlPng: "🖼️ 다운로드 .PNG" }
};

export default function Home() {
  const [inputText, setInputText] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [promptType, setPromptType] = useState("General Chat");
  const [language, setLanguage] = useState("English");
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [fileData, setFileData] = useState<any>(null);
  const [fileName, setFileName] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLTextAreaElement>(null);

  const t = I18N[language] || I18N["English"];

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);

    if (file.type.startsWith("text/") || file.name.endsWith(".txt") || file.name.endsWith(".md")) {
      const text = await file.text();
      setInputText(text);
      setFileData(null);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64String = (reader.result as string).split(",")[1];
      setFileData({ inlineData: { data: base64String, mimeType: file.type || "application/pdf" } });
    };
    reader.readAsDataURL(file);
  };

  const handleGenerate = async (type?: string) => {
    const activePromptType = type || promptType;
    setPromptType(activePromptType);
    setLoading(true);
    setOutput("Processing...");

    try {
      const res = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: inputText, fileData, promptType: activePromptType, language }),
      });
      const data = await res.json();
      setOutput(data.error ? `Error: ${data.error}` : data.summary);
    } catch (err: any) {
      setOutput(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const isDark = theme === "dark";

  return (
    <main className={`min-h-screen ${isDark ? "bg-slate-950 text-white" : "bg-slate-100 text-slate-900"} p-4 max-w-lg mx-auto flex flex-col gap-3`}>
      <div className={`${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"} border p-4 rounded-2xl flex justify-between items-center`}>
        <h1 className="text-xl font-bold">{t.title}</h1>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className={`${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"} border p-3.5 rounded-2xl`}>
          <label className="text-xs text-slate-400 font-medium">Language:</label>
          <select value={language} onChange={(e) => setLanguage(e.target.value)} className="w-full mt-1 bg-transparent text-xs font-medium outline-none">
            {LANGUAGES.map((lang) => <option key={lang} value={lang} className="bg-slate-900 text-white">{lang}</option>)}
          </select>
        </div>
        <div className={`${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"} border p-3.5 rounded-2xl flex items-center gap-3`}>
          <button onClick={() => setTheme("dark")} className={`w-8 h-8 rounded-full bg-slate-950 border-2 ${isDark ? "border-blue-500" : "border-slate-700"}`} />
          <button onClick={() => setTheme("light")} className={`w-8 h-8 rounded-full bg-white border-2 ${!isDark ? "border-blue-500" : "border-slate-300"}`} />
        </div>
      </div>

      <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
      <div className={`${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"} border p-4 rounded-2xl flex justify-between items-center`}>
        <button onClick={() => fileInputRef.current?.click()} className="bg-blue-600 text-white text-xs px-4 py-2 rounded-lg font-semibold">Choose File</button>
        <span className="text-xs text-slate-400 truncate max-w-[160px]">{fileName || "No file chosen"}</span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button onClick={() => handleGenerate("Executive Summary")} className={`${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"} border p-4 rounded-2xl text-xs font-semibold text-left`}>📋 Executive Summary</button>
        <button onClick={() => handleGenerate("Key Action Items")} className={`${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"} border p-4 rounded-2xl text-xs font-semibold text-left`}>✅ Key Action Items</button>
        <button onClick={() => handleGenerate("Top Takeaways")} className={`${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"} border p-4 rounded-2xl text-xs font-semibold text-left`}>💡 Top Takeaways</button>
        <button onClick={() => handleGenerate("Analyze Trends")} className={`${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"} border p-4 rounded-2xl text-xs font-semibold text-left`}>📊 Analyze Trends</button>
      </div>

      <div className={`${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"} border p-4 rounded-2xl flex flex-col gap-2`}>
        <textarea ref={outputRef} value={output} onChange={(e) => setOutput(e.target.value)} placeholder="Editable Output" className="w-full h-36 bg-transparent text-sm font-mono outline-none resize-none" />
      </div>

      <div className={`${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"} border p-4 rounded-2xl flex flex-col gap-2`}>
        <textarea value={inputText} onChange={(e) => setInputText(e.target.value)} placeholder="Ask a question or paste document text..." className="w-full h-28 bg-transparent text-sm outline-none resize-none" />
        <button onClick={() => handleGenerate("General Chat")} disabled={loading} className="w-full bg-blue-600 text-white py-3 rounded-xl text-sm font-semibold">{loading ? "Processing..." : t.submit}</button>
      </div>
    </main>
  );
}
