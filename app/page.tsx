"use client";

import { useState, useRef } from "react";

export default function Home() {
  const [inputText, setInputText] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [promptType, setPromptType] = useState("General Chat");
  const [fileData, setFileData] = useState<any>(null);
  const [fileName, setFileName] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLTextAreaElement>(null);

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
      setFileData({
        inlineData: {
          data: base64String,
          mimeType: file.type || "application/pdf",
        },
      });
      if (!inputText) {
        setInputText(`[Attached File: ${file.name}]`);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleGenerate = async (type?: string) => {
    const activePromptType = type || promptType;
    setPromptType(activePromptType);
    setLoading(true);
    setOutput("Processing request...");

    try {
      const res = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: inputText,
          fileData: fileData,
          promptType: activePromptType,
        }),
      });

      const data = await res.json();
      if (data.error) {
        setOutput(`Error: ${data.error}`);
      } else {
        setOutput(data.summary || "No response generated.");
      }
    } catch (err: any) {
      setOutput(`Error: ${err.message || "Failed to reach AI service"}`);
    } finally {
      setLoading(false);
    }
  };

  const getExportContent = () => {
    if (outputRef.current) {
      const textarea = outputRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      if (start !== undefined && end !== undefined && start !== end) {
        const selectedText = textarea.value.substring(start, end).trim();
        if (selectedText) return selectedText;
      }
    }
    const selection = window.getSelection()?.toString().trim();
    return selection && selection.length > 0 ? selection : output;
  };

  const downloadTxt = () => {
    const content = getExportContent();
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "export.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadMd = () => {
    const content = getExportContent();
    const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "export.md";
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadDoc = () => {
    const content = getExportContent();
    const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'></head><body>";
    const footer = "</body></html>";
    const sourceHTML = header + "<div>" + content.replace(/\n/g, "<br/>") + "</div>" + footer;
    const blob = new Blob([sourceHTML], { type: "application/msword" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "export.doc";
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadPng = () => {
    const content = getExportContent();
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = 800;
    canvas.height = 600;
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#ffffff";
    ctx.font = "16px sans-serif";

    const lines = content.split("\n");
    let y = 40;
    lines.forEach((line) => {
      if (y < 560) {
        ctx.fillText(line.substring(0, 80), 30, y);
        y += 24;
      }
    });

    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = "export.png";
    a.click();
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white p-4 max-w-5xl mx-auto flex flex-col gap-4">
      <h1 className="text-xl font-bold text-center my-2">AI Document Workbench</h1>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".txt,.md,.pdf,.doc,.docx,image/*"
        className="hidden"
      />

      {/* Header File Upload Selector */}
      <div className="flex items-center gap-3 bg-slate-900 p-3 rounded-xl border border-slate-800">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition"
        >
          Choose File
        </button>
        <span className="text-xs text-slate-400 truncate">
          {fileName || "No file chosen"}
        </span>
      </div>

      {/* Split Workbench Grid: Input Panel Left, Output Panel Right */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
        {/* Input Panel */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col gap-3">
          <label className="text-xs font-semibold text-slate-400">Input Prompt / Document:</label>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask a question, chat naturally, or paste document text..."
            className="w-full h-56 bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm focus:outline-none focus:border-blue-500 resize-none"
          />

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleGenerate("Executive Summary")}
              className="bg-slate-800 border border-slate-700 p-2.5 rounded-lg text-xs font-semibold text-left hover:bg-slate-700 transition"
            >
              📋 Executive Summary
            </button>
            <button
              onClick={() => handleGenerate("Key Action Items")}
              className="bg-slate-800 border border-slate-700 p-2.5 rounded-lg text-xs font-semibold text-left hover:bg-slate-700 transition"
            >
              ✅ Key Action Items
            </button>
            <button
              onClick={() => handleGenerate("Top Takeaways")}
              className="bg-slate-800 border border-slate-700 p-2.5 rounded-lg text-xs font-semibold text-left hover:bg-slate-700 transition"
            >
              💡 Top Takeaways
            </button>
            <button
              onClick={() => handleGenerate("Analyze Trends")}
              className="bg-slate-800 border border-slate-700 p-2.5 rounded-lg text-xs font-semibold text-left hover:bg-slate-700 transition"
            >
              📊 Analyze Trends
            </button>
          </div>

          <button
            onClick={() => handleGenerate("General Chat")}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 py-3 rounded-lg text-sm font-semibold transition"
          >
            {loading ? "Processing..." : "Summarize Document / Chat"}
          </button>
        </div>

        {/* Output Panel */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-slate-400">Editable Output:</span>
            <span className="text-[10px] text-slate-500">Highlight text to export selected section</span>
          </div>
          <textarea
            ref={outputRef}
            value={output}
            onChange={(e) => setOutput(e.target.value)}
            placeholder="AI response will appear here..."
            className="w-full h-56 bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm focus:outline-none resize-none font-mono text-slate-200"
          />

          <div className="grid grid-cols-2 gap-2 mt-[52px]">
            <button onClick={downloadTxt} className="bg-slate-800 text-xs py-2 rounded-lg hover:bg-slate-700 transition">
              📥 Download .TXT
            </button>
            <button onClick={downloadMd} className="bg-slate-800 text-xs py-2 rounded-lg hover:bg-slate-700 transition">
              📥 Download .MD
            </button>
            <button onClick={downloadDoc} className="bg-slate-800 text-xs py-2 rounded-lg hover:bg-slate-700 transition">
              📥 Download .DOC
            </button>
            <button onClick={downloadPng} className="bg-blue-600 text-xs py-2 rounded-lg font-semibold hover:bg-blue-500 transition">
              🖼️ Download .PNG
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
