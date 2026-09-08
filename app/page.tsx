"use client";

import React, { useState, useRef, useEffect } from "react";
import jsPDF from "jspdf";

const LOCALIZATION_DICT: Record<string, Record<string, string>> = {
  en: { title: "AI Document Workbench", chooseFile: "Choose File", execSummary: "Executive Summary", keyActions: "Key Action Items", takeaways: "Top Takeaways", trends: "Analyze Trends", placeholder: "Type command, query, or edit context...", sendBtn: "Summarize / Chat", clearBtn: "Clear Workbench", exportPdf: "Export Full Chat PDF", exportTxt: "Export Full TXT", exportMd: "Export Full MD" },
  es: { title: "Mesa de Trabajo Documental IA", chooseFile: "Elegir Archivo", execSummary: "Resumen Ejecutivo", keyActions: "Puntos Clave de Acción", takeaways: "Conclusiones Principales", trends: "Analizar Tendencias", placeholder: "Escriba un comando o consulta...", sendBtn: "Resumir / Chatear", clearBtn: "Limpiar Mesa", exportPdf: "Exportar PDF Completo", exportTxt: "Exportar TXT Completo", exportMd: "Exportar MD Completo" },
  fr: { title: "Espace de Travail IA Documentaire", chooseFile: "Choisir Fichier", execSummary: "Résumé Exécutif", keyActions: "Actions Clés", takeaways: "Points Essentiels", trends: "Analyser Tendances", placeholder: "Saisissez une commande ou question...", sendBtn: "Résumer / Discuter", clearBtn: "Effacer Tout", exportPdf: "Exporter PDF Complet", exportTxt: "Exporter TXT Complet", exportMd: "Exporter MD Complet" },
};

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  pdfUrl?: string;
  pdfFileName?: string;
}

interface FileDataPayload {
  inlineData: {
    mimeType: string;
    data: string;
  };
}

export default function AIWorkbench() {
  const [lang, setLang] = useState("en");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [fileData, setFileData] = useState<FileDataPayload | null>(null);
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

  const createPdfBlob = (text: string, title = "AI_Document"): string => {
    const doc = new jsPDF();
    doc.setFont("helvetica", "normal");
    doc.setFontSize(14);
    doc.text(title, 15, 20);
    
    doc.setFontSize(10);
    const cleanText = text.replace(/[*#]/g, "");
    const lines = doc.splitTextToSize(cleanText, 180);
    
    let y = 30;
    lines.forEach((line: string) => {
      if (y > 280) {
        doc.addPage();
        y = 20;
      }
      doc.text(line, 15, y);
      y += 6;
    });

    const blob = doc.output("blob");
    return URL.createObjectURL(blob);
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
      const replyText = data.reply || data.error || "No response generated.";

      const isPdfRequested = /pdf|download|document|file/i.test(promptToSend);
      let pdfUrl: string | undefined;
      let pdfFileName: string | undefined;

      if (isPdfRequested || replyText.length > 100) {
        pdfFileName = `Document_${Date.now()}.pdf`;
        pdfUrl = createPdfBlob(replyText, "Compiled AI Summary");
      }

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: replyText,
          timestamp: new Date().toLocaleTimeString(),
          pdfUrl,
          pdfFileName,
        },
      ]);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Network error";
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: `⚠️ Error: ${errorMsg}`,
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

  const downloadDirectPdf = (text: string, filename = "document.pdf") => {
    const doc = new jsPDF();
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    const cleanText = text.replace(/[*#]/g, "");
    const lines = doc.splitTextToSize(cleanText, 180);
    let y = 20;
    lines.forEach((line: string) => {
      if (y > 280) {
        doc.addPage();
        y = 20;
      }
      doc.text(line, 15, y);
      y += 6;
    });
    doc.save(filename);
  };

  const getFullContentText = () => {
    return messages.map((m) => `[${m.role.toUpperCase()} - ${m.timestamp}]\n${m.content}\n`).join("\n---\n\n");
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
                {msg.role === "assistant" && (
                  <div className="flex gap-1.5 bg-slate-900/80 px-2 py-0.5 rounded border border-slate-700">
                    <span className="text-[9px] text-slate-400 self-center font-normal">Download:</span>
                    <button onClick={() => downloadDirectPdf(msg.content, `response_${msg.id}.pdf`)} className="text-[10px] text-blue-400 hover:underline font-bold">PDF</button>
                    <button onClick={() => downloadFile(msg.content, `response_${msg.id}.txt`, "text/plain")} className="text-[10px] text-blue-400 hover:underline font-bold">TXT</button>
                    <button onClick={() => downloadFile(msg.content, `response_${msg.id}.md`, "text/markdown")} className="text-[10px] text-blue-400 hover:underline font-bold">MD</button>
                  </div>
                )}
              </div>

              {/* Claude-style PDF Attachment Box */}
              {msg.pdfUrl && (
                <div className="mb-3 p-2.5 bg-slate-900/90 border border-blue-500/40 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="bg-red-600 text-white text-[9px] font-bold px-2 py-0.5 rounded">PDF</span>
                    <span className="text-xs font-medium text-slate-200">{msg.pdfFileName}</span>
                  </div>
                  <a href={msg.pdfUrl} download={msg.pdfFileName} className="bg-blue-600 hover:bg-blue-500 text-white text-xs px-3 py-1 rounded transition font-semibold">
                    Download PDF
                  </a>
                </div>
              )}

              <div className="whitespace-pre-wrap">{msg.content}</div>
            </div>
          ))
        )}
        {loading && (
          <div className="text-xs text-blue-400 animate-pulse py-2">
            AI is analyzing input and compiling PDF document...
          </div>
        )}
      </div>

      {selectedText && (
        <div className="bg-blue-900/90 border border-blue-600 p-2.5 rounded-lg mb-3 flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="font-semibold text-white">✨ Export Selected Text:</span>
          <div className="flex gap-2">
            <button onClick={() => downloadDirectPdf(selectedText, "selected_text.pdf")} className="bg-blue-600 hover:bg-blue-500 px-2.5 py-1 rounded">PDF</button>
            <button onClick={() => downloadFile(selectedText, "selected_text.txt", "text/plain")} className="bg-blue-600 hover:bg-blue-500 px-2.5 py-1 rounded">TXT</button>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2 mb-4 justify-between items-center">
        <div className="flex flex-wrap gap-2">
          <button onClick={() => downloadDirectPdf(getFullContentText(), "full_chat.pdf")} className="bg-slate-800 hover:bg-slate-700 text-xs px-3 py-1.5 rounded border border-slate-700">Export Full PDF</button>
          <button onClick={() => downloadFile(getFullContentText(), "full_chat.txt", "text/plain")} className="bg-slate-800 hover:bg-slate-700 text-xs px-3 py-1.5 rounded border border-slate-700">Export Full TXT</button>
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
