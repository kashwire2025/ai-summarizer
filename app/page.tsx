"use client";

import React, { useState, useRef, useEffect } from "react";

const LOCALIZATION_DICT: Record<string, Record<string, string>> = {
  en: { title: "AI Document Workbench", chooseFile: "Choose File", execSummary: "Executive Summary", keyActions: "Key Action Items", takeaways: "Top Takeaways", trends: "Analyze Trends", placeholder: "Type command, query, or edit context...", sendBtn: "Summarize / Chat", clearBtn: "Clear Workbench", exportPdf: "Export Full Chat PDF", exportPng: "Export PNG", exportDoc: "Export Full DOC", exportTxt: "Export Full TXT", exportMd: "Export Full MD", exportSelected: "Export Highlighted Text" },
  es: { title: "Mesa de Trabajo Documental IA", chooseFile: "Elegir Archivo", execSummary: "Resumen Ejecutivo", keyActions: "Puntos Clave de Acción", takeaways: "Conclusiones Principales", trends: "Analizar Tendencias", placeholder: "Escriba un comando o consulta...", sendBtn: "Resumir / Chatear", clearBtn: "Limpiar Mesa", exportPdf: "Exportar PDF Completo", exportPng: "Exportar PNG", exportDoc: "Exportar DOC Completo", exportTxt: "Exportar TXT Completo", exportMd: "Exportar MD Completo", exportSelected: "Exportar Texto Seleccionado" },
  fr: { title: "Espace de Travail IA Documentaire", chooseFile: "Choisir Fichier", execSummary: "Résumé Exécutif", keyActions: "Actions Clés", takeaways: "Points Essentiels", trends: "Analyser Tendances", placeholder: "Saisissez une commande ou question...", sendBtn: "Résumer / Discuter", clearBtn: "Effacer Tout", exportPdf: "Exporter PDF Complet", exportPng: "Exporter PNG", exportDoc: "Exporter DOC Complet", exportTxt: "Exporter TXT Complet", exportMd: "Exporter MD Complet", exportSelected: "Exporter Texte Sélectionné" },
};

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export default function AIWorkbench() {
  const [lang, setLang] = useState("en");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [fileData, setFileData] = useState<any>(null);
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedText, setSelectedText] = useState("");
  const outputBoxRef = useRef<HTMLDivElement>(null);

  const labels = LOCALIZATION_DICT[lang] || LOCALIZATION_DICT["en"];

  useEffect(() => {
    if (outputBoxRef.current) {
      outputBoxRef.current.scrollTop = outputBoxRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim().length > 0) {
      setSelectedText(selection.toString().trim());
    } else {
      setSelectedText("");
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      const base64String = (reader.result as string).split(",")[1];
      setFileData({
        inlineData: { mimeType: file.type, data: base64String },
      });
    };
    reader.readAsDataURL(file);
  };

  const executeAction = async (promptType = "General Chat", customPrompt = "") => {
    const promptToSend = customPrompt || input || promptType;
    if (!promptToSend && !fileData) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: promptToSend + (fileName ? ` [File: ${fileName}]` : ""),
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: promptToSend,
          history: messages,
          fileData,
          promptType,
          language: lang,
        }),
      });

      const data = await response.json();

      if (data.error) {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: `⚠️ Error: ${data.error}`,
            timestamp: new Date().toLocaleTimeString(),
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: data.reply,
            timestamp: new Date().toLocaleTimeString(),
          },
        ]);
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: `⚠️ Network Error: ${err.message}`,
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getFullContentText = () => {
    return messages.map((m) => `[${m.role.toUpperCase()} - ${m.timestamp}]\n${m.content}\n`).join("\n---\n\n");
  };

  // Parses Markdown into HTML for clean printing
  const parseMarkdownForPrint = (str: string) => {
    return str
      .replace(/^### (.*$)/gim, '<h3 style="font-size: 15px; font-weight: bold; margin: 12px 0 6px 0; color: #1e293b;">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 style="font-size: 17px; font-weight: bold; margin: 14px 0 8px 0; color: #0f172a;">$1</h2>')
      .replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
      .replace(/\*\*(.*?)\*\*/g, '<strong style="color: #0f172a;">$1</strong>')
      .replace(/^\* (.*$)/gim, '<li style="margin-left: 18px; list-style-type: disc;">$1</li>')
      .replace(/\n\n/g, '<br/><br/>')
      .replace(/\n/g, '<br/>');
  };

  // Fixed PDF exporter: exports ONLY the specified text when provided
  const exportAsPdf = (targetText?: string, isFullChat: boolean = false) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    let bodyContent = "";

    if (isFullChat) {
      bodyContent = messages.map((m) => {
        const isUser = m.role === "user";
        return `
          <div style="margin-bottom: 12px; padding: 12px 14px; border-radius: 8px; background-color: ${isUser ? "#f1f5f9" : "#ffffff"}; border: 1px solid ${isUser ? "#cbd5e1" : "#e2e8f0"}; page-break-inside: avoid;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 10px; font-weight: bold; color: ${isUser ? "#0284c7" : "#475569"}; text-transform: uppercase;">
              <span>${isUser ? "USER" : "AI ASSISTANT"}</span>
              <span style="float: right;">${m.timestamp}</span>
            </div>
            <div style="font-size: 12px; line-height: 1.5; color: #1e293b;">
              ${parseMarkdownForPrint(m.content)}
            </div>
          </div>
        `;
      }).join("");
    } else {
      const textToExport = targetText || (messages.length > 0 ? messages[messages.length - 1].content : "");
      bodyContent = `
        <div style="padding: 16px; background: #fff; border-radius: 8px; border: 1px solid #e2e8f0; font-size: 12px; line-height: 1.6; color: #1e293b;">
          ${parseMarkdownForPrint(textToExport)}
        </div>
      `;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>AI Workbench Export</title>
          <style>
            @page { size: letter; margin: 15mm; }
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #0f172a; background: #fff; margin: 0; padding: 0; }
            .header { border-bottom: 2px solid #2563eb; padding-bottom: 8px; margin-bottom: 16px; }
            .header h1 { font-size: 18px; margin: 0; color: #2563eb; }
            .header p { font-size: 10px; color: #64748b; margin: 4px 0 0 0; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>AI Document Workbench Export</h1>
            <p>Generated on ${new Date().toLocaleString()}</p>
          </div>
          <div>${bodyContent}</div>
          <script>
            window.onload = function() { window.print(); window.close(); };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const exportAsTxt = (targetText = getFullContentText()) => {
    downloadFile(targetText, "document-export.txt", "text/plain;charset=utf-8");
  };

  const exportAsMd = (targetText = getFullContentText()) => {
    downloadFile(targetText, "document-export.md", "text/markdown;charset=utf-8");
  };

  const exportAsDoc = (targetText = getFullContentText()) => {
    const htmlContent = `<html><head><meta charset='utf-8'></head><body><div style="font-family:sans-serif;">${parseMarkdownForPrint(targetText)}</div></body></html>`;
    downloadFile(htmlContent, "document-export.doc", "application/msword");
  };

  const exportAsPng = (targetText = getFullContentText()) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = 800;
    const lines = targetText.split("\n");
    canvas.height = Math.max(400, lines.length * 22 + 80);

    ctx.fillStyle = "#0f172a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#f8fafc";
    ctx.font = "14px monospace";

    let y = 40;
    lines.forEach((line) => {
      ctx.fillText(line.substring(0, 90), 20, y);
      y += 22;
    });

    const image = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = image;
    a.download = "document-export.png";
    a.click();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 max-w-4xl mx-auto flex flex-col font-sans">
      <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
        <h1 className="text-xl font-bold text-blue-400">{labels.title}</h1>
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-400">Language:</label>
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-white text-xs rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
          >
            {Object.keys(LOCALIZATION_DICT).map((key) => (
              <option key={key} value={key}>
                {key.toUpperCase()}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-4 mb-4">
        <div className="flex items-center gap-3 bg-slate-900 p-3 rounded-xl border border-slate-800">
          <label className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2 rounded-lg cursor-pointer transition">
            {labels.chooseFile}
            <input type="file" onChange={handleFileUpload} className="hidden" />
          </label>
          <span className="text-xs text-slate-400 truncate max-w-xs">
            {fileName || "No file chosen"}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button onClick={() => executeAction("Executive Summary", labels.execSummary)} className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs py-2.5 px-3 rounded-lg font-medium transition">
            📋 {labels.execSummary}
          </button>
          <button onClick={() => executeAction("Key Action Items", labels.keyActions)} className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs py-2.5 px-3 rounded-lg font-medium transition">
            ✅ {labels.keyActions}
          </button>
          <button onClick={() => executeAction("Top Takeaways", labels.takeaways)} className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs py-2.5 px-3 rounded-lg font-medium transition">
            💡 {labels.takeaways}
          </button>
          <button onClick={() => executeAction("Analyze Trends", labels.trends)} className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs py-2.5 px-3 rounded-lg font-medium transition">
            📊 {labels.trends}
          </button>
        </div>
      </div>

      <div
        ref={outputBoxRef}
        onMouseUp={handleTextSelection}
        className="flex-1 bg-slate-900/90 border border-slate-800 rounded-xl p-4 min-h-[340px] max-h-[500px] overflow-y-auto mb-4 space-y-4 shadow-inner"
      >
        {messages.length === 0 ? (
          <p className="text-slate-500 text-xs italic text-center mt-32">
            Continuous chat history and summaries accumulate here...
          </p>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`p-3 rounded-lg text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-blue-950/60 border border-blue-900/50 text-blue-100 ml-8"
                  : "bg-slate-800/80 border border-slate-700/60 text-slate-100 mr-8"
              }`}
            >
              <div className="text-[10px] text-slate-400 mb-2 font-semibold flex justify-between items-center border-b border-slate-700/40 pb-1">
                <span>{msg.role === "user" ? "USER" : "AI ASSISTANT"} - {msg.timestamp}</span>
                {/* Per-response direct export toolbar for AI messages */}
                {msg.role === "assistant" && (
                  <div className="flex gap-1.5 bg-slate-900/80 px-2 py-0.5 rounded border border-slate-700">
                    <span className="text-[9px] text-slate-400 self-center font-normal">Download Response:</span>
                    <button onClick={() => exportAsPdf(msg.content, false)} className="text-[10px] text-blue-400 hover:underline font-bold">PDF</button>
                    <button onClick={() => exportAsDoc(msg.content)} className="text-[10px] text-blue-400 hover:underline font-bold">DOC</button>
                    <button onClick={() => exportAsTxt(msg.content)} className="text-[10px] text-blue-400 hover:underline font-bold">TXT</button>
                    <button onClick={() => exportAsMd(msg.content)} className="text-[10px] text-blue-400 hover:underline font-bold">MD</button>
                  </div>
                )}
              </div>
              <div contentEditable suppressContentEditableWarning className="outline-none whitespace-pre-wrap">
                {msg.content}
              </div>
            </div>
          ))
        )}
        {loading && (
          <div className="text-xs text-blue-400 animate-pulse py-2">
            AI is analyzing input and generating response...
          </div>
        )}
      </div>

      {selectedText && (
        <div className="bg-blue-900/90 border border-blue-600 p-2.5 rounded-lg mb-3 flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="font-semibold text-white">✨ {labels.exportSelected}:</span>
          <div className="flex gap-2">
            <button onClick={() => exportAsPdf(selectedText, false)} className="bg-blue-600 hover:bg-blue-500 px-2.5 py-1 rounded">PDF</button>
            <button onClick={() => exportAsDoc(selectedText)} className="bg-blue-600 hover:bg-blue-500 px-2.5 py-1 rounded">DOC</button>
            <button onClick={() => exportAsTxt(selectedText)} className="bg-blue-600 hover:bg-blue-500 px-2.5 py-1 rounded">TXT</button>
            <button onClick={() => exportAsMd(selectedText)} className="bg-blue-600 hover:bg-blue-500 px-2.5 py-1 rounded">MD</button>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2 mb-4 justify-between items-center">
        <div className="flex flex-wrap gap-2">
          <button onClick={() => exportAsPdf(undefined, true)} className="bg-slate-800 hover:bg-slate-700 text-xs px-3 py-1.5 rounded border border-slate-700">{labels.exportPdf}</button>
          <button onClick={() => exportAsPng()} className="bg-slate-800 hover:bg-slate-700 text-xs px-3 py-1.5 rounded border border-slate-700">{labels.exportPng}</button>
          <button onClick={() => exportAsDoc()} className="bg-slate-800 hover:bg-slate-700 text-xs px-3 py-1.5 rounded border border-slate-700">{labels.exportDoc}</button>
          <button onClick={() => exportAsTxt()} className="bg-slate-800 hover:bg-slate-700 text-xs px-3 py-1.5 rounded border border-slate-700">{labels.exportTxt}</button>
          <button onClick={() => exportAsMd()} className="bg-slate-800 hover:bg-slate-700 text-xs px-3 py-1.5 rounded border border-slate-700">{labels.exportMd}</button>
        </div>
        <button onClick={() => setMessages([])} className="text-xs text-red-400 hover:underline">
          {labels.clearBtn}
        </button>
      </div>

      <div className="space-y-3">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={labels.placeholder}
          rows={3}
          className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-slate-100"
        />
        <button
          onClick={() => executeAction("General Conversation")}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-xl transition shadow-lg disabled:opacity-50"
        >
          {loading ? "Processing..." : labels.sendBtn}
        </button>
      </div>
    </div>
  );
}
