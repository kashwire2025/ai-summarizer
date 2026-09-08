"use client";

import React, { useState, useRef, useEffect } from "react";
import jsPDF from "jspdf";

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface LocaleConfig {
  name: string;
  speechCode: string;
  title: string;
  chooseFile: string;
  execSummary: string;
  keyActions: string;
  takeaways: string;
  trends: string;
  placeholder: string;
  sendBtn: string;
  clearBtn: string;
  exportPdf: string;
  exportTxt: string;
  copyBtn: string;
  shareBtn: string;
  noFile: string;
}

const LOCALIZATION_DICT: Record<string, LocaleConfig> = {
  en: {
    name: "English",
    speechCode: "en-US",
    title: "AI Document Workbench",
    chooseFile: "Choose File",
    execSummary: "Executive Summary",
    keyActions: "Key Action Items",
    takeaways: "Top Takeaways",
    trends: "Analyze Trends",
    placeholder: "Type command, query, or speak...",
    sendBtn: "Summarize / Chat",
    clearBtn: "Clear Workbench",
    exportPdf: "Export Full Chat PDF",
    exportTxt: "Export Full TXT",
    copyBtn: "Copy",
    shareBtn: "Share",
    noFile: "No file chosen",
  },
  es: {
    name: "Español (Spanish)",
    speechCode: "es-ES",
    title: "Mesa de Trabajo Documental IA",
    chooseFile: "Elegir Archivo",
    execSummary: "Resumen Ejecutivo",
    keyActions: "Puntos Clave",
    takeaways: "Conclusiones",
    trends: "Analizar Tendencias",
    placeholder: "Escriba un comando o hable...",
    sendBtn: "Resumir / Chatear",
    clearBtn: "Limpiar Mesa",
    exportPdf: "Exportar PDF Completo",
    exportTxt: "Exportar TXT Completo",
    copyBtn: "Copiar",
    shareBtn: "Compartir",
    noFile: "Sin archivo seleccionado",
  },
  fr: {
    name: "Français (French)",
    speechCode: "fr-FR",
    title: "Espace de Travail IA Documentaire",
    chooseFile: "Choisir Fichier",
    execSummary: "Résumé Exécutif",
    keyActions: "Actions Clés",
    takeaways: "Points Essentiels",
    trends: "Analyser Tendances",
    placeholder: "Saisissez une commande ou parlez...",
    sendBtn: "Résumer / Discuter",
    clearBtn: "Effacer Tout",
    exportPdf: "Exporter PDF Complet",
    exportTxt: "Exporter TXT Complet",
    copyBtn: "Copier",
    shareBtn: "Partager",
    noFile: "Aucun fichier choisi",
  },
  de: {
    name: "Deutsch (German)",
    speechCode: "de-DE",
    title: "KI-Dokumenten-Werkbank",
    chooseFile: "Datei auswählen",
    execSummary: "Zusammenfassung",
    keyActions: "Wichtige Aktionen",
    takeaways: "Haupterkenntnisse",
    trends: "Trends analysieren",
    placeholder: "Befehl eingeben oder sprechen...",
    sendBtn: "Zusammenfassen / Chatten",
    clearBtn: "Werkbank leeren",
    exportPdf: "Gesamten Chat-PDF exportieren",
    exportTxt: "Gesamten TXT exportieren",
    copyBtn: "Kopieren",
    shareBtn: "Teilen",
    noFile: "Keine Datei ausgewählt",
  },
  zh: {
    name: "中文 (Chinese Simplified)",
    speechCode: "zh-CN",
    title: "AI 文档工作台",
    chooseFile: "选择文件",
    execSummary: "执行摘要",
    keyActions: "关键行动项",
    takeaways: "核心要点",
    trends: "分析趋势",
    placeholder: "输入指令、提问或语音...",
    sendBtn: "总结 / 对话",
    clearBtn: "清空工作台",
    exportPdf: "导出完整 PDF",
    exportTxt: "导出完整 TXT",
    copyBtn: "复制",
    shareBtn: "分享",
    noFile: "未选择文件",
  },
  ja: {
    name: "日本語 (Japanese)",
    speechCode: "ja-JP",
    title: "AI ドキュメント ワークベンチ",
    chooseFile: "ファイルを選択",
    execSummary: "要約サマリー",
    keyActions: "主要アクション",
    takeaways: "重要ポイント",
    trends: "トレンド分析",
    placeholder: "コマンド、質問、または音声入力...",
    sendBtn: "要約 / チャット",
    clearBtn: "ワークベンチを消去",
    exportPdf: "全文 PDF 出力",
    exportTxt: "全文 TXT 出力",
    copyBtn: "コピー",
    shareBtn: "共有",
    noFile: "文件未选择",
  },
  ar: {
    name: "العربية (Arabic)",
    speechCode: "ar-SA",
    title: "منصة عمل المستندات بالذكاء الاصطناعي",
    chooseFile: "اختيار ملف",
    execSummary: "ملخص تنفيذي",
    keyActions: "إجراءات رئيسية",
    takeaways: "أهم النقاط",
    trends: "تحليل الاتجاهات",
    placeholder: "اكتب أمراً أو سؤالاً أو تحدث...",
    sendBtn: "تلخيص / محادثة",
    clearBtn: "مسح مساحة العمل",
    exportPdf: "تصدير المحادثة PDF",
    exportTxt: "تصدير النص TXT",
    copyBtn: "نسخ",
    shareBtn: "مشاركة",
    noFile: "لم يتم اختيار ملف",
  },
  pt: {
    name: "Português (Portuguese)",
    speechCode: "pt-BR",
    title: "Bancada de Documentos IA",
    chooseFile: "Escolher Arquivo",
    execSummary: "Resumo Executivo",
    keyActions: "Ações Chave",
    takeaways: "Principais Conclusões",
    trends: "Analisar Tendências",
    placeholder: "Digite um comando ou fale...",
    sendBtn: "Resumir / Conversar",
    clearBtn: "Limpar Bancada",
    exportPdf: "Exportar PDF Completo",
    exportTxt: "Exportar TXT Completo",
    copyBtn: "Copiar",
    shareBtn: "Compartilhar",
    noFile: "Nenhum arquivo escolhido",
  },
  hi: {
    name: "हिन्दी (Hindi)",
    speechCode: "hi-IN",
    title: "एआई दस्तावेज़ कार्यक्षेत्र",
    chooseFile: "फ़ाइल चुनें",
    execSummary: "कार्यकारी सारांश",
    keyActions: "प्रमुख कार्य",
    takeaways: "मुख्य निष्कर्ष",
    trends: "रुझानों का विश्लेषण",
    placeholder: "कमांड टाइप करें या बोलें...",
    sendBtn: "सारांश / बातचीत",
    clearBtn: "कार्यक्षेत्र साफ़ करें",
    exportPdf: "पूरा पीडीएफ निर्यात करें",
    exportTxt: "पूरा TXT निर्यात करें",
    copyBtn: "कॉपी",
    shareBtn: "शेयर",
    noFile: "कोई फ़ाइल नहीं चुनी गई",
  },
  ru: {
    name: "Русский (Russian)",
    speechCode: "ru-RU",
    title: "ИИ Рабочий стол документов",
    chooseFile: "Выбрать файл",
    execSummary: "Краткое содержание",
    keyActions: "Ключевые действия",
    takeaways: "Главные выводы",
    trends: "Анализ трендов",
    placeholder: "Введите команду или говорите...",
    sendBtn: "Сводка / Чат",
    clearBtn: "Очистить стол",
    exportPdf: "Экспорт всего PDF",
    exportTxt: "Экспорт всего TXT",
    copyBtn: "Копировать",
    shareBtn: "Поделиться",
    noFile: "Файл не выбран",
  },
  it: {
    name: "Italiano (Italian)",
    speechCode: "it-IT",
    title: "Banco di Lavoro Documenti IA",
    chooseFile: "Scegli File",
    execSummary: "Sintesi Esecutiva",
    keyActions: "Azioni Chiave",
    takeaways: "Punti Principali",
    trends: "Analizza Tendenze",
    placeholder: "Scrivi un comando o parla...",
    sendBtn: "Riassumi / Chatta",
    clearBtn: "Pulisci Banco",
    exportPdf: "Esporta PDF Completo",
    exportTxt: "Esporta TXT Completo",
    copyBtn: "Copia",
    shareBtn: "Condividi",
    noFile: "Nessun file selezionato",
  },
  ko: {
    name: "한국어 (Korean)",
    speechCode: "ko-KR",
    title: "AI 문서 워크벤치",
    chooseFile: "파일 선택",
    execSummary: "요약 보고서",
    keyActions: "핵심 실행 항목",
    takeaways: "주요 시사점",
    trends: "트렌드 분석",
    placeholder: "명령어 입력 또는 음성 말하기...",
    sendBtn: "요약 / 대화",
    clearBtn: "작업대 초기화",
    exportPdf: "전체 PDF 내보내기",
    exportTxt: "전체 TXT 내보내기",
    copyBtn: "복사",
    shareBtn: "공유",
    noFile: "선택된 파일 없음",
  },
  nl: {
    name: "Nederlands (Dutch)",
    speechCode: "nl-NL",
    title: "AI Documenten Werkbank",
    chooseFile: "Kies Bestand",
    execSummary: "Managementsamenvatting",
    keyActions: "Belangrijkste Acties",
    takeaways: "Belangrijkste Inzichten",
    trends: "Trends Analyseren",
    placeholder: "Typ een opdracht of spreek...",
    sendBtn: "Samenvatten / Chatten",
    clearBtn: "Werkbank Wisschen",
    exportPdf: "Exporteer Volledige PDF",
    exportTxt: "Exporteer Volledige TXT",
    copyBtn: "Kopiëren",
    shareBtn: "Delen",
    noFile: "Geen bestand gekozen",
  },
  tr: {
    name: "Türkçe (Turkish)",
    speechCode: "tr-TR",
    title: "Yapay Zeka Belge Çalışma Alanı",
    chooseFile: "Dosya Seç",
    execSummary: "Yönetici Özeti",
    keyActions: "Temel Eylemler",
    takeaways: "Önemli Çıkarımlar",
    trends: "Trend Analizi",
    placeholder: "Komut yazın veya konuşun...",
    sendBtn: "Özetle / Sohbet Et",
    clearBtn: "Alanı Temizle",
    exportPdf: "Tüm Sohbeti PDF İndir",
    exportTxt: "Tüm Sohbeti TXT İndir",
    copyBtn: "Kopyala",
    shareBtn: "Paylaş",
    noFile: "Dosya seçilmedi",
  },
  vi: {
    name: "Tiếng Việt (Vietnamese)",
    speechCode: "vi-VN",
    title: "Bàn Làm Việc Tài Liệu AI",
    chooseFile: "Chọn Tệp",
    execSummary: "Tóm Tắt Điều Hành",
    keyActions: "Hành Động Chính",
    takeaways: "Điểm Cốt Lõi",
    trends: "Phân Tích Xu Hướng",
    placeholder: "Nhập lệnh, câu hỏi hoặc nói...",
    sendBtn: "Tóm Tắt / Trò Chuyện",
    clearBtn: "Xóa Bàn Làm Việc",
    exportPdf: "Xuất Toàn Bộ PDF",
    exportTxt: "Xuất Toàn Bộ TXT",
    copyBtn: "Sao chép",
    shareBtn: "Chia sẻ",
    noFile: "Chưa chọn tệp nào",
  },
  pl: {
    name: "Polski (Polish)",
    speechCode: "pl-PL",
    title: "Pulpit Dokumentów AI",
    chooseFile: "Wybierz Plik",
    execSummary: "Podsumowanie Menedżerskie",
    keyActions: "Kluczowe Działania",
    takeaways: "Główne Wnioski",
    trends: "Analiza Trendów",
    placeholder: "Wpisz polecenie lub mów...",
    sendBtn: "Podsumuj / Czatuj",
    clearBtn: "Wyczyść Pulpit",
    exportPdf: "Eksportuj Cały PDF",
    exportTxt: "Eksportuj Cały TXT",
    copyBtn: "Kopiuj",
    shareBtn: "Udostępnij",
    noFile: "Nie wybrano pliku",
  },
  sv: {
    name: "Svenska (Swedish)",
    speechCode: "sv-SE",
    title: "AI Dokumentarbetsbänk",
    chooseFile: "Välj Fil",
    execSummary: "Sammanfattning",
    keyActions: "Viktiga Åtgärder",
    takeaways: "Huvudinsikter",
    trends: "Analysera Trender",
    placeholder: "Skriv kommando eller tala...",
    sendBtn: "Sammanfatta / Chatta",
    clearBtn: "Rensa Arbetsbänk",
    exportPdf: "Exportera Hela PDF",
    exportTxt: "Exportera Hela TXT",
    copyBtn: "Kopiera",
    shareBtn: "Dela",
    noFile: "Ingen fil vald",
  },
  id: {
    name: "Bahasa Indonesia",
    speechCode: "id-ID",
    title: "Meja Kerja Dokumen AI",
    chooseFile: "Pilih Berkas",
    execSummary: "Ringkasan Eksekutif",
    keyActions: "Tindakan Utama",
    takeaways: "Poin Poin Penting",
    trends: "Analisis Tren",
    placeholder: "Ketik perintah atau bicara...",
    sendBtn: "Rangkum / Obrolan",
    clearBtn: "Bersihkan Meja Kerja",
    exportPdf: "Ekspor Seluruh PDF",
    exportTxt: "Ekspor Seluruh TXT",
    copyBtn: "Salin",
    shareBtn: "Bagikan",
    noFile: "Tidak ada berkas dipilih",
  },
  ha: {
    name: "Hausa",
    speechCode: "ha-NG",
    title: "Dandalin AI Na Takardu",
    chooseFile: "Zaɓi Fayil",
    execSummary: "Takaitaccen Bayani",
    keyActions: "Ayyuka Masu Mahimmanci",
    takeaways: "Babban Sakamako",
    trends: "Binciken Yanayi",
    placeholder: "Rubuta umurni ko yi magana...",
    sendBtn: "Takaita / Tattaunawa",
    clearBtn: "Goge Dandalin",
    exportPdf: "Fitarda Cikakken PDF",
    exportTxt: "Fitarda Cikakken TXT",
    copyBtn: "Kwafi",
    shareBtn: "Rarraba",
    noFile: "Babu fayil da aka zaɓa",
  },
  yo: {
    name: "Yorùbá",
    speechCode: "yo-NG",
    title: "Agbègbè İşẹ́ Àkọsílẹ̀ AI",
    chooseFile: "Yan Fayili",
    execSummary: "Àkópọ̀ Aláṣẹ",
    keyActions: "Àwọn Iṣẹ́ Kókó",
    takeaways: "Àwọn Ìmọ̀ 💡",
    trends: "Àyẹ̀wò Trend",
    placeholder: "Kọ àṣẹ tàbí sọ̀rọ̀...",
    sendBtn: "Ṣe Àkópọ̀ / Sọ̀rọ̀",
    clearBtn: "Nu Agbègbè İşẹ́",
    exportPdf: "Sọ Dá PDF Kíkún",
    exportTxt: "Sọ Dá TXT Kíkún",
    copyBtn: "Dàkọ",
    shareBtn: "Pin",
    noFile: "Kò sí fayili ti a yan",
  },
  ig: {
    name: "Asụsụ Igbo",
    speechCode: "ig-NG",
    title: "Ebe Ọrụ Akwụkwọ AI",
    chooseFile: "Rọrọ Faịlụ",
    execSummary: "Nchịkọta Ndị Inyefe",
    keyActions: "Akwụkwọ Omume Ndị Isi",
    takeaways: "Ihe Ndị Dị Mkpa",
    trends: "Nyochaa Usoro",
    placeholder: "Pịnye iwu ma ọ bụ kwuo okwu...",
    sendBtn: "Nchịkọta / Sụọ Đa",
    clearBtn: "Hichaa Ebe Ọrụ",
    exportPdf: "Mepụta PDF Chat Niile",
    exportTxt: "Mepụta TXT Chat Niile",
    copyBtn: "Nalata",
    shareBtn: "Kesaara",
    noFile: "Enweghị faịlụ a rọrọ",
  },
  sw: {
    name: "Kiswahili (Swahili)",
    speechCode: "sw-KE",
    title: "Dawati la Nyaraka za AI",
    chooseFile: "Chagua Faili",
    execSummary: "Muhtasari Mkuu",
    keyActions: "Hatua Muhimu",
    takeaways: "Mambo Makuu",
    trends: "Changanua Mwenendo",
    placeholder: "Andika amri au zungumza...",
    sendBtn: "Fanya Muhtasari / Zungumza",
    clearBtn: "Futa Dawati",
    exportPdf: "Pakua PDF Yote",
    exportTxt: "Pakua TXT Yote",
    copyBtn: "Nakili",
    shareBtn: "Shirikisha",
    noFile: "Hakuna faili iliyochaguliwa",
  },
  fil: {
    name: "Filipino (Tagalog)",
    speechCode: "fil-PH",
    title: "AI Workbench ng Dokumento",
    chooseFile: "Pumili ng File",
    execSummary: "Buod ng Ehekutibo",
    keyActions: "Pangunahing Aksyon",
    takeaways: "Mahahalagang Points",
    trends: "Suriin ang Trend",
    placeholder: "Mag-type ng utos o magsalita...",
    sendBtn: "I-buod / Makipag-chat",
    clearBtn: "Linisin ang Workbench",
    exportPdf: "I-export ang Buong PDF",
    exportTxt: "I-export ang Buong TXT",
    copyBtn: "Kopyahin",
    shareBtn: "I-bahagi",
    noFile: "Walang napiling file",
  },
  th: {
    name: "ไทย (Thai)",
    speechCode: "th-TH",
    title: "โต๊ะทำงานเอกสาร AI",
    chooseFile: "เลือกไฟล์",
    execSummary: "บทสรุปผู้บริหาร",
    keyActions: "การดำเนินการสำคัญ",
    takeaways: "ประเด็นสำคัญ",
    trends: "วิเคราะห์แนวโน้ม",
    placeholder: "พิมพ์คำสั่ง หรือพูด...",
    sendBtn: "สรุป / พูดคุย",
    clearBtn: "ล้างโต๊ะทำงาน",
    exportPdf: "ส่งออก PDF ทั้งหมด",
    exportTxt: "ส่งออก TXT ทั้งหมด",
    copyBtn: "คัดลอก",
    shareBtn: "แชร์",
    noFile: "ไม่ได้เลือกไฟล์",
  },
  uk: {
    name: "Українська (Ukrainian)",
    speechCode: "uk-UA",
    title: "Робочий стіл документів AI",
    chooseFile: "Обрати файл",
    execSummary: "Короткий звіт",
    keyActions: "Ключові дії",
    takeaways: "Головні висновки",
    trends: "Аналіз трендів",
    placeholder: "Введіть команду або говоріть...",
    sendBtn: "Зробити summary / Чат",
    clearBtn: "Oчистити стіл",
    exportPdf: "Експорт всього PDF",
    exportTxt: "Експорт всього TXT",
    copyBtn: "Копіювати",
    shareBtn: "Поділитися",
    noFile: "Файл не обрано",
  },
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
  const [toast, setToast] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [shareMenuMsgId, setShareMenuMsgId] = useState<string | null>(null);
  const outputBoxRef = useRef<HTMLDivElement>(null);

  const labels = LOCALIZATION_DICT[lang] || LOCALIZATION_DICT["en"];

  // Restore Chat History on mount
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem("ai_workbench_history");
      if (savedHistory) {
        setMessages(JSON.parse(savedHistory));
      }
    } catch (e) {
      console.error("Failed to load saved history", e);
    }
  }, []);

  // Save Chat History on state update
  useEffect(() => {
    try {
      localStorage.setItem("ai_workbench_history", JSON.stringify(messages));
    } catch (e) {
      console.error("Failed to persist history", e);
    }
    if (outputBoxRef.current) {
      outputBoxRef.current.scrollTop = outputBoxRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast("📋 Copied to clipboard!");
  };

  // Speech-to-Text Voice Input with dynamic language sync
  const toggleVoiceInput = () => {
    if (typeof window === "undefined") return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      showToast("⚠️ Voice input not supported on this browser.");
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = labels.speechCode || "en-US";

    recognition.onstart = () => {
      setIsListening(true);
      showToast(`🎙️ Listening (${labels.name})... Speak now.`);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
      showToast("⚠️ Speech recognition error.");
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

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
    showToast(`📄 Loaded: ${file.name}`);
  };

  const createAdvancedPdf = (text: string, title = "AI Document Summary"): string => {
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    const usableWidth = pageWidth - margin * 2;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.setTextColor(30, 58, 138);
    doc.text(title, margin, 20);

    doc.setDrawColor(226, 232, 240);
    doc.line(margin, 24, pageWidth - margin, 24);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(30, 41, 59);

    const cleanText = text.replace(/[*#]/g, "");
    const lines = doc.splitTextToSize(cleanText, usableWidth);

    let y = 32;
    lines.forEach((line: string) => {
      if (y > pageHeight - 20) {
        doc.addPage();
        y = 25;
      }
      doc.text(line, margin, y);
      y += 5.5;
    });

    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);

      doc.text(
        `Generated via AI Document Workbench (${labels.name}) | Page ${i} of ${totalPages}`,
        margin,
        pageHeight - 10
      );
      doc.text(new Date().toLocaleDateString(), pageWidth - margin - 20, pageHeight - 10);
    }

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

      const isPdfRequested = /pdf|download|document|file|report|summary/i.test(promptToSend);
      let pdfUrl: string | undefined;
      let pdfFileName: string | undefined;

      if (isPdfRequested || replyText.length > 80) {
        pdfFileName = `Document_${Date.now()}.pdf`;
        pdfUrl = createAdvancedPdf(replyText, `${labels.title} Summary`);
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

  const shareToPlatform = (platform: string, text: string) => {
    const encodedText = encodeURIComponent(text.substring(0, 500) + "...\n\nGenerated via AI Workbench");
    let url = "";

    switch (platform) {
      case "whatsapp":
        url = `https://api.whatsapp.com/send?text=${encodedText}`;
        break;
      case "telegram":
        url = `https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodedText}`;
        break;
      case "twitter":
        url = `https://twitter.com/intent/tweet?text=${encodedText}`;
        break;
      case "native":
        if (navigator.share) {
          navigator.share({ title: labels.title, text: text.substring(0, 300) }).catch(() => {});
          return;
        }
        break;
    }

    if (url) window.open(url, "_blank");
    setShareMenuMsgId(null);
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
    const url = createAdvancedPdf(text, labels.title);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
  };

  const clearHistory = () => {
    setMessages([]);
    localStorage.removeItem("ai_workbench_history");
    showToast("🗑️ Workbench cleared.");
  };

  const getFullContentText = () => {
    return messages.map((m) => `[${m.role.toUpperCase()} - ${m.timestamp}]\n${m.content}\n`).join("\n---\n\n");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 max-w-4xl mx-auto flex flex-col font-sans relative">
      {/* Toast Alert */}
      {toast && (
        <div className="fixed top-4 right-4 bg-blue-600 text-white text-xs px-4 py-2.5 rounded-xl shadow-2xl z-50 animate-bounce">
          {toast}
        </div>
      )}

      {/* Header with 25 Language Selector */}
      <div className="flex flex-wrap justify-between items-center mb-6 border-b border-slate-800 pb-4 gap-3">
        <h1 className="text-xl font-bold text-blue-400">{labels.title}</h1>
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-400 font-medium">🌐 Language:</label>
          <select
            value={lang}
            onChange={(e) => {
              setLang(e.target.value);
              showToast(`🌐 Switched to ${LOCALIZATION_DICT[e.target.value].name}`);
            }}
            className="bg-slate-900 border border-blue-500/50 text-white text-xs rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none max-w-[180px] truncate"
          >
            {Object.entries(LOCALIZATION_DICT).map(([code, dict]) => (
              <option key={code} value={code}>
                {dict.name}
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
            {fileName || labels.noFile}
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
                  : "bg-slate-800/80 border border-slate-700/60 text-slate-100 mr-8 relative"
              }`}
            >
              <div className="text-[10px] text-slate-400 mb-2 font-semibold flex justify-between items-center border-b border-slate-700/40 pb-1">
                <span>{msg.role === "user" ? "USER" : "AI ASSISTANT"} - {msg.timestamp}</span>
                {msg.role === "assistant" && (
                  <div className="flex gap-2 items-center">
                    <button onClick={() => copyToClipboard(msg.content)} className="text-[10px] text-slate-300 hover:text-white font-medium">📋 {labels.copyBtn}</button>
                    <button onClick={() => setShareMenuMsgId(shareMenuMsgId === msg.id ? null : msg.id)} className="text-[10px] text-blue-400 hover:underline font-bold">📲 {labels.shareBtn}</button>
                    <button onClick={() => downloadDirectPdf(msg.content, `doc_${msg.id}.pdf`)} className="text-[10px] text-blue-400 hover:underline font-bold">PDF</button>
                    <button onClick={() => downloadFile(msg.content, `doc_${msg.id}.txt`, "text/plain")} className="text-[10px] text-blue-400 hover:underline font-bold">TXT</button>
                  </div>
                )}
              </div>

              {/* Social Share Menu */}
              {shareMenuMsgId === msg.id && (
                <div className="bg-slate-900 border border-blue-500/50 p-2.5 rounded-lg mb-2 flex gap-3 text-xs justify-around items-center">
                  <span className="text-[10px] text-slate-400 font-semibold">{labels.shareBtn}:</span>
                  <button onClick={() => shareToPlatform("whatsapp", msg.content)} className="text-emerald-400 hover:underline font-bold">WhatsApp</button>
                  <button onClick={() => shareToPlatform("telegram", msg.content)} className="text-sky-400 hover:underline font-bold">Telegram</button>
                  <button onClick={() => shareToPlatform("twitter", msg.content)} className="text-slate-200 hover:underline font-bold">X/Twitter</button>
                  <button onClick={() => shareToPlatform("native", msg.content)} className="text-blue-400 hover:underline font-bold">More</button>
                </div>
              )}

              {/* PDF Attachment Box */}
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
            AI processing in {labels.name}...
          </div>
        )}
      </div>

      {selectedText && (
        <div className="bg-blue-900/90 border border-blue-600 p-2.5 rounded-lg mb-3 flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="font-semibold text-white">✨ Selected Text Actions:</span>
          <div className="flex gap-2">
            <button onClick={() => copyToClipboard(selectedText)} className="bg-blue-600 hover:bg-blue-500 px-2.5 py-1 rounded">{labels.copyBtn}</button>
            <button onClick={() => downloadDirectPdf(selectedText, "selected.pdf")} className="bg-blue-600 hover:bg-blue-500 px-2.5 py-1 rounded">PDF</button>
            <button onClick={() => downloadFile(selectedText, "selected.txt", "text/plain")} className="bg-blue-600 hover:bg-blue-500 px-2.5 py-1 rounded">TXT</button>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2 mb-4 justify-between items-center">
        <div className="flex flex-wrap gap-2">
          <button onClick={() => downloadDirectPdf(getFullContentText(), "full_chat.pdf")} className="bg-slate-800 hover:bg-slate-700 text-xs px-3 py-1.5 rounded border border-slate-700">{labels.exportPdf}</button>
          <button onClick={() => downloadFile(getFullContentText(), "full_chat.txt", "text/plain")} className="bg-slate-800 hover:bg-slate-700 text-xs px-3 py-1.5 rounded border border-slate-700">{labels.exportTxt}</button>
        </div>
        <button onClick={clearHistory} className="text-xs text-red-400 hover:underline">
          {labels.clearBtn}
        </button>
      </div>

      <div className="space-y-3">
        <div className="relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={labels.placeholder}
            rows={3}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-slate-100 pr-12"
          />
          <button
            onClick={toggleVoiceInput}
            title={`Speech to Text (${labels.name})`}
            className={`absolute right-3 top-3 p-2 rounded-lg text-xs font-bold transition ${
              isListening ? "bg-red-600 text-white animate-ping" : "bg-slate-800 hover:bg-slate-700 text-slate-300"
            }`}
          >
            🎙️
          </button>
        </div>
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
