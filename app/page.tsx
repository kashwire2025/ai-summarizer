"use client";

import React, { useState, useRef, useEffect } from "react";

// 25 Languages Dictionary covering all interface buttons and labels
const LOCALIZATION_DICT: Record<string, Record<string, string>> = {
  en: { title: "AI Document Workbench", chooseFile: "Choose File", execSummary: "Executive Summary", keyActions: "Key Action Items", takeaways: "Top Takeaways", trends: "Analyze Trends", placeholder: "Type command, query, or edit context...", sendBtn: "Summarize / Chat", clearBtn: "Clear Workbench", exportPdf: "Export PDF", exportPng: "Export PNG", exportDoc: "Export DOC", exportTxt: "Export TXT", exportMd: "Export MD", exportSelected: "Export Highlighted Text" },
  es: { title: "Mesa de Trabajo Documental IA", chooseFile: "Elegir Archivo", execSummary: "Resumen Ejecutivo", keyActions: "Puntos Clave de Acción", takeaways: "Conclusiones Principales", trends: "Analizar Tendencias", placeholder: "Escriba un comando o consulta...", sendBtn: "Resumir / Chatear", clearBtn: "Limpiar Mesa", exportPdf: "Exportar PDF", exportPng: "Exportar PNG", exportDoc: "Exportar DOC", exportTxt: "Exportar TXT", exportMd: "Exportar MD", exportSelected: "Exportar Texto Seleccionado" },
  fr: { title: "Espace de Travail IA Documentaire", chooseFile: "Choisir Fichier", execSummary: "Résumé Exécutif", keyActions: "Actions Clés", takeaways: "Points Essentiels", trends: "Analyser Tendances", placeholder: "Saisissez une commande ou question...", sendBtn: "Résumer / Discuter", clearBtn: "Effacer Tout", exportPdf: "Exporter PDF", exportPng: "Exporter PNG", exportDoc: "Exporter DOC", exportTxt: "Exporter TXT", exportMd: "Exporter MD", exportSelected: "Exporter Texte Sélectionné" },
  de: { title: "KI Dokumenten-Arbeitsbereich", chooseFile: "Datei Auswählen", execSummary: "Zusammenfassung", keyActions: "Wichtige Aktionen", takeaways: "Wichtigste Erkenntnisse", trends: "Trends Analysieren", placeholder: "Befehl oder Frage eingeben...", sendBtn: "Zusammenfassen / Chat", clearBtn: "Bereich Leeren", exportPdf: "PDF Exportieren", exportPng: "PNG Exportieren", exportDoc: "DOC Exportieren", exportTxt: "TXT Exportieren", exportMd: "MD Exportieren", exportSelected: "Markierten Text Exportieren" },
  zh: { title: "AI 文档智能工作台", chooseFile: "选择文件", execSummary: "执行摘要", keyActions: "关键行动项", takeaways: "核心要点", trends: "趋势分析", placeholder: "输入命令、问题或修改意见...", sendBtn: "生成摘要 / 对话", clearBtn: "清空工作台", exportPdf: "导出 PDF", exportPng: "导出 PNG", exportDoc: "导出 DOC", exportTxt: "导出 TXT", exportMd: "导出 MD", exportSelected: "导出选中文本" },
  ja: { title: "AI ドキュメント ワークベンチ", chooseFile: "ファイルを選択", execSummary: "要約", keyActions: "主要アクション", takeaways: "重要なポイント", trends: "トレンド分析", placeholder: "指示や質問を入力...", sendBtn: "要約 / チャット", clearBtn: "消去", exportPdf: "PDF出力", exportPng: "PNG出力", exportDoc: "DOC出力", exportTxt: "TXT出力", exportMd: "MD出力", exportSelected: "選択テキストを出力" },
  ar: { title: "منصة المستندات بالذكاء الاصطناعي", chooseFile: "اختر ملف", execSummary: "ملخص تنفيذي", keyActions: "إجراءات رئيسية", takeaways: "أهم النقاط", trends: "تحليل الاتجاهات", placeholder: "اكتب أمراً أو استفساراً...", sendBtn: "تلخيص / محادثة", clearBtn: "مسح الكل", exportPdf: "تصدير PDF", exportPng: "تصدير PNG", exportDoc: "تصدير DOC", exportTxt: "تصدير TXT", exportMd: "تصدير MD", exportSelected: "تصدير النص المحدد" },
  pt: { title: "Bancada de Documentos IA", chooseFile: "Escolher Ficheiro", execSummary: "Resumo Executivo", keyActions: "Ações Chave", takeaways: "Principais Conclusões", trends: "Analisar Tendências", placeholder: "Digite um comando ou dúvida...", sendBtn: "Resumir / Conversar", clearBtn: "Limpar Tudo", exportPdf: "Exportar PDF", exportPng: "Exportar PNG", exportDoc: "Exportar DOC", exportTxt: "Exportar TXT", exportMd: "Exportar MD", exportSelected: "Exportar Texto Selecionado" },
  ru: { title: "ИИ Рабочий Стол Документов", chooseFile: "Выбрать Файл", execSummary: "Краткий Обзор", keyActions: "Главные Действия", takeaways: "Ключевые Выводы", trends: "Анализ Трендов", placeholder: "Введите команду или вопрос...", sendBtn: "Суммаризовать / Чат", clearBtn: "Очистить", exportPdf: "Экспорт PDF", exportPng: "Экспорт PNG", exportDoc: "Экспорт DOC", exportTxt: "Экспорт TXT", exportMd: "Экспорт MD", exportSelected: "Экспорт Выделенного Текста" },
  hi: { title: "एआई दस्तावेज़ वर्कबेंच", chooseFile: "फ़ाइल चुनें", execSummary: "कार्यकारी सारांश", keyActions: "प्रमुख कार्रवाई", takeaways: "मुख्य निष्कर्ष", trends: "रूझान विश्लेषण", placeholder: "कमांड या प्रश्न टाइप करें...", sendBtn: "सारांश / चैट", clearBtn: "साफ़ करें", exportPdf: "PDF निर्यात", exportPng: "PNG निर्यात", exportDoc: "DOC निर्यात", exportTxt: "TXT निर्यात", exportMd: "MD निर्यात", exportSelected: "चयनित पाठ निर्यात करें" },
  ko: { title: "AI 문서 워크벤치", chooseFile: "파일 선택", execSummary: "요약 보고서", keyActions: "핵심 실행 항목", takeaways: "주요 시사점", trends: "트렌드 분석", placeholder: "명령어나 질문을 입력하세요...", sendBtn: "요약 / 대화", clearBtn: "초기화", exportPdf: "PDF 내보내기", exportPng: "PNG 내보내기", exportDoc: "DOC 내보내기", exportTxt: "TXT 내보내기", exportMd: "MD 내보내기", exportSelected: "선택한 텍스트 내보내기" },
  it: { title: "Banco di Lavoro Documenti IA", chooseFile: "Scegli File", execSummary: "Sintesi Esecutiva", keyActions: "Azioni Chiave", takeaways: "Punti Chiave", trends: "Analisi Tendenze", placeholder: "Digita un comando o domanda...", sendBtn: "Riassumi / Chat", clearBtn: "Pulisci", exportPdf: "Esporta PDF", exportPng: "Esporta PNG", exportDoc: "Esporta DOC", exportTxt: "Esporta TXT", exportMd: "Esporta MD", exportSelected: "Esporta Testo Selezionato" },
  nl: { title: "AI Documenten Werkbank", chooseFile: "Kies Bestand", execSummary: "Managementsamenvatting", keyActions: "Belangrijkste Acties", takeaways: "Belangrijkste Inzichten", trends: "Trends Analyseren", placeholder: "Typ een opdracht of vraag...", sendBtn: "Samenvatten / Chat", clearBtn: "Wis Alles", exportPdf: "Exporteren PDF", exportPng: "Exporteren PNG", exportDoc: "Exporteren DOC", exportTxt: "Exporteren TXT", exportMd: "Exporteren MD", exportSelected: "Geselecteerde Tekst Exporteren" },
  tr: { title: "Yapay Zeka Belge Çalışma Alanı", chooseFile: "Dosya Seç", execSummary: "Yönetici Özeti", keyActions: "Önemli Eylemler", takeaways: "Ana Çıkarımlar", trends: "Trend Analizi", placeholder: "Komut veya soru yazın...", sendBtn: "Özetle / Sohbet", clearBtn: "Temizle", exportPdf: "PDF Dışa Aktar", exportPng: "PNG Dışa Aktar", exportDoc: "DOC Dışa Aktar", exportTxt: "TXT Dışa Aktar", exportMd: "MD Dışa Aktar", exportSelected: "Seçili Metni Dışa Aktar" },
  pl: { title: "Pulpit Dokumentów AI", chooseFile: "Wybierz Plik", execSummary: "Podsumowanie Menedżerskie", keyActions: "Kluczowe Działania", takeaways: "Główne Wnioski", trends: "Analiza Trendów", placeholder: "Wpisz polecenie lub pytanie...", sendBtn: "Podsumuj / Czat", clearBtn: "Wyczyść", exportPdf: "Eksportuj PDF", exportPng: "Eksportuj PNG", exportDoc: "Eksportuj DOC", exportTxt: "Eksportuj TXT", exportMd: "Eksportuj MD", exportSelected: "Eksportuj Zaznaczony Tekst" },
  vi: { title: "Bàn Làm Việc Tài Liệu AI", chooseFile: "Chọn Tệp", execSummary: "Tóm Tắt Tổng Quan", keyActions: "Hành Động Chính", takeaways: "Điểm Cốt Lõi", trends: "Phân Tích Xu Hướng", placeholder: "Nhập lệnh hoặc câu hỏi...", sendBtn: "Tóm Tắt / Trò Chuyện", clearBtn: "Xóa Sạch", exportPdf: "Xuất PDF", exportPng: "Xuất PNG", exportDoc: "Xuất DOC", exportTxt: "Xuất TXT", exportMd: "Xuất MD", exportSelected: "Xuất Văn Bản Đã Chọn" },
  th: { title: "พื้นที่ทำงานเอกสาร AI", chooseFile: "เลือกไฟล์", execSummary: "สรุปสำหรับผู้บริหาร", keyActions: "การดำเนินการสำคัญ", takeaways: "ข้อสรุปหลัก", trends: "วิเคราะห์แนวโน้ม", placeholder: "พิมพ์คำสั่งหรือคำถาม...", sendBtn: "สรุป / แชท", clearBtn: "ล้างข้อมูล", exportPdf: "ส่งออก PDF", exportPng: "ส่งออก PNG", exportDoc: "ส่งออก DOC", exportTxt: "ส่งออก TXT", exportMd: "ส่งออก MD", exportSelected: "ส่งออกข้อความที่เลือก" },
  id: { title: "Lembar Kerja Dokumen AI", chooseFile: "Pilih Berkas", execSummary: "Ringkasan Eksekutif", keyActions: "Tindakan Utama", takeaways: "Poin Penting", trends: "Analisis Tren", placeholder: "Ketik perintah atau pertanyaan...", sendBtn: "Ringkas / Obrolan", clearBtn: "Bersihkan", exportPdf: "Ekspor PDF", exportPng: "Ekspor PNG", exportDoc: "Ekspor DOC", exportTxt: "Ekspor TXT", exportMd: "Ekspor MD", exportSelected: "Ekspor Teks Terpilih" },
  sw: { title: "Uwanja wa Kazi wa Nyaraka za AI", chooseFile: "Chagua Faili", execSummary: "Muhtasari Mkuu", keyActions: "Hatua Muhimu", takeaways: "Mambo Makuu", trends: "Changanua Mwelekeo", placeholder: "Andika amri au swali...", sendBtn: "Muhtasari / Mazungumzo", clearBtn: "Safisha", exportPdf: "Pakua PDF", exportPng: "Pakua PNG", exportDoc: "Pakua DOC", exportTxt: "Pakua TXT", exportMd: "Pakua MD", exportSelected: "Pakua Maandishi Yaliyochaguliwa" },
  am: { title: "የኤአይ ሰነድ ሥራ ቦታ", chooseFile: "ፋይል ይምረጡ", execSummary: "ዋና ማጠቃለያ", keyActions: "ዋና እርምጃዎች", takeaways: "ቁልፍ ነጥቦች", trends: "ትሬንድ ትንተና", placeholder: "ትዕዛዝ ወይም ጥያቄ ይጻፉ...", sendBtn: "ማጠቃለያ / ውይይት", clearBtn: "አጽዳ", exportPdf: "PDF ወደ ውጭ ላክ", exportPng: "PNG ወደ ውጭ ላክ", exportDoc: "DOC ወደ ውጭ ላክ", exportTxt: "TXT ወደ ውጭ ላክ", exportMd: "MD ወደ ውጭ ላክ", exportSelected: "የተመረጠውን ጽሑፍ ላክ" },
  yo: { title: "Agbègbè Iṣẹ́ Àkọsílẹ̀ AI", chooseFile: "Yan File", execSummary: "Àkópọ̀ Aṣojú", keyActions: "Àwọn Ìgbésẹ̀ Pataki", takeaways: "Àwọn Òtítọ́ Kókó", trends: "Ṣàyẹ̀wò Àwọn Àṣà", placeholder: "Kọ àṣẹ tàbí ìbéèrè rẹ...", sendBtn: "Ṣàkópọ̀ / Sọ̀rọ̀", clearBtn: "Nu Kúrò", exportPdf: "Jadade PDF", exportPng: "Jadade PNG", exportDoc: "Jadade DOC", exportTxt: "Jadade TXT", exportMd: "Jadade MD", exportSelected: "Jadade Ọ̀rọ̀ Aṣàyàn" },
  ha: { title: "Dandalin Aiki na Takardun AI", chooseFile: "Zaɓi Fayil", execSummary: "Takaitaccen Bayani", keyActions: "Matakan Aiki", takeaways: "Mabuɗan Bayanai", trends: "Binciken Hanyoyi", placeholder: "Rubuta umarni ko tambaya...", sendBtn: "Takaice / Tattaunawa", clearBtn: "Goge Duka", exportPdf: "Fitar da PDF", exportPng: "Fitar da PNG", exportDoc: "Fitar da DOC", exportTxt: "Fitar da TXT", exportMd: "Fitar da MD", exportSelected: "Fitar da Zaɓaɓɓen Rubutu" },
  bn: { title: "এআই ডকুমেন্ট ওয়ার্কবেঞ্চ", chooseFile: "ফাইল নির্বাচন করুন", execSummary: "নির্বাহী সারসংক্ষেপ", keyActions: "মূল পদক্ষেপ", takeaways: "প্রধান সারসংক্ষেপ", trends: "ট্রেন্ড বিশ্লেষণ", placeholder: "কমান্ড বা প্রশ্ন লিখুন...", sendBtn: "সারসংক্ষেপ / চ্যাট", clearBtn: "পরিষ্কার করুন", exportPdf: "PDF এক্সপোর্ট", exportPng: "PNG এক্সপোর্ট", exportDoc: "DOC এক্সপোর্ট", exportTxt: "TXT এক্সপোর্ট", exportMd: "MD এক্সপোর্ট", exportSelected: "সিলেক্ট করা লেখা এক্সপোর্ট" },
  ur: { title: "اے آئی دستاویز ورک بینچ", chooseFile: "فائل منتخب کریں", execSummary: "ایگزیکٹو خلاصہ", keyActions: "اہم اقدامات", takeaways: "اہم نتائج", trends: "رجحانات کا تجزیہ", placeholder: "حکم یا سوال تحریر کریں...", sendBtn: "خلاصہ / بات چیت", clearBtn: "صاف کریں", exportPdf: "PDF ایکسپورٹ", exportPng: "PNG ایکسپورٹ", exportDoc: "DOC ایکسپورٹ", exportTxt: "TXT ایکسپورٹ", exportMd: "MD ایکسپورٹ", exportSelected: "منتخب متن ایکسپورٹ کریں" },
  fa: { title: "میز کار اسناد هوش مصنوعی", chooseFile: "انتخاب فایل", execSummary: "خلاصه مدیریتی", keyActions: "اقدامات کلیدی", takeaways: "نکات برجسته", trends: "تحلیل روندها", placeholder: "دستور یا سوال خود را بنویسید...", sendBtn: "خلاصه / گفتگو", clearBtn: "پاکسازی", exportPdf: "خروجی PDF", exportPng: "خروجی PNG", exportDoc: "خروجی DOC", exportTxt: "خروجی TXT", exportMd: "خروجی MD", exportSelected: "خروجی متن انتخاب شده" },
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

  // Auto-scroll output box on new message
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

  const exportAsTxt = (targetText = getFullContentText()) => {
    downloadFile(targetText, "workbench-export.txt", "text/plain;charset=utf-8");
  };

  const exportAsMd = (targetText = getFullContentText()) => {
    downloadFile(targetText, "workbench-export.md", "text/markdown;charset=utf-8");
  };

  const exportAsDoc = (targetText = getFullContentText()) => {
    const htmlContent = `<html><head><meta charset='utf-8'></head><body><pre style="font-family:sans-serif; white-space:pre-wrap;">${targetText}</pre></body></html>`;
    downloadFile(htmlContent, "workbench-export.doc", "application/msword");
  };

  const exportAsPdf = (targetText = getFullContentText()) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>Export PDF</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; color: #111; line-height: 1.6; }
            pre { white-space: pre-wrap; font-family: inherit; }
          </style>
        </head>
        <body>
          <h2>AI Workbench Export</h2>
          <hr/>
          <pre>${targetText}</pre>
          <script>window.onload = function() { window.print(); window.close(); }</script>
        </body>
      </html>
    `);
    printWindow.document.close();
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
    a.download = "workbench-export.png";
    a.click();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 max-w-4xl mx-auto flex flex-col font-sans">
      {/* Dynamic 25 Language UI Switcher */}
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

      {/* File Upload & Prompt Buttons */}
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

      {/* Persistent Continuous Interactive Output Canvas */}
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
              <div className="text-[10px] text-slate-400 mb-1 font-semibold flex justify-between">
                <span>{msg.role === "user" ? "USER" : "AI ASSISTANT"}</span>
                <span>{msg.timestamp}</span>
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

      {/* Highlighted Selection Toolbar */}
      {selectedText && (
        <div className="bg-blue-900/90 border border-blue-600 p-2.5 rounded-lg mb-3 flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="font-semibold text-white">✨ {labels.exportSelected}:</span>
          <div className="flex gap-2">
            <button onClick={() => exportAsPdf(selectedText)} className="bg-blue-600 hover:bg-blue-500 px-2.5 py-1 rounded">PDF</button>
            <button onClick={() => exportAsDoc(selectedText)} className="bg-blue-600 hover:bg-blue-500 px-2.5 py-1 rounded">DOC</button>
            <button onClick={() => exportAsTxt(selectedText)} className="bg-blue-600 hover:bg-blue-500 px-2.5 py-1 rounded">TXT</button>
            <button onClick={() => exportAsMd(selectedText)} className="bg-blue-600 hover:bg-blue-500 px-2.5 py-1 rounded">MD</button>
            <button onClick={() => exportAsPng(selectedText)} className="bg-blue-600 hover:bg-blue-500 px-2.5 py-1 rounded">PNG</button>
          </div>
        </div>
      )}

      {/* Full Canvas Document Exporters */}
      <div className="flex flex-wrap gap-2 mb-4 justify-between items-center">
        <div className="flex flex-wrap gap-2">
          <button onClick={() => exportAsPdf()} className="bg-slate-800 hover:bg-slate-700 text-xs px-3 py-1.5 rounded border border-slate-700">{labels.exportPdf}</button>
          <button onClick={() => exportAsPng()} className="bg-slate-800 hover:bg-slate-700 text-xs px-3 py-1.5 rounded border border-slate-700">{labels.exportPng}</button>
          <button onClick={() => exportAsDoc()} className="bg-slate-800 hover:bg-slate-700 text-xs px-3 py-1.5 rounded border border-slate-700">{labels.exportDoc}</button>
          <button onClick={() => exportAsTxt()} className="bg-slate-800 hover:bg-slate-700 text-xs px-3 py-1.5 rounded border border-slate-700">{labels.exportTxt}</button>
          <button onClick={() => exportAsMd()} className="bg-slate-800 hover:bg-slate-700 text-xs px-3 py-1.5 rounded border border-slate-700">{labels.exportMd}</button>
        </div>
        <button onClick={() => setMessages([])} className="text-xs text-red-400 hover:underline">
          {labels.clearBtn}
        </button>
      </div>

      {/* Input Box & Submit Button */}
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
