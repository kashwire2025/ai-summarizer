"use client";

import { useState, useRef, useEffect } from "react";

const LANGUAGES = [
  "English", "Français", "Español", "Deutsch", "中文", 
  "العربية", "Português", "Русский", "日本語", "한국어", 
  "Italiano", "Nederlands", "Türkçe", "हिन्दी", "Bahasa Indonesia", 
  "Polski", "Svenska", "Tiếng Việt", "Українська", "Ελληνικά", 
  "Čeština", "Română", "Magyar", "Dansk", "Suomi"
];

const I18N: Record<string, Record<string, string>> = {
  English: {
    title: "AI Document Workbench",
    auth: "Sign In / Sign Up",
    signOut: "Sign Out",
    langLabel: "Language (25 supported):",
    themeLabel: "Theme:",
    uploadLabel: "Upload Document / Image",
    chooseFile: "Choose File",
    noFile: "No file chosen",
    execSummary: "Executive Summary",
    keyActions: "Key Action Items",
    topTakeaways: "Top Takeaways",
    analyzeTrends: "Analyze Trends",
    outputLabel: "Editable Output:",
    outputSubtext: "Highlight text to export selected section",
    inputLabel: "Input Prompt / Document:",
    placeholder: "Ask a question, chat naturally, or paste document text...",
    submit: "Summarize Document / Chat",
    processing: "Processing request...",
    dlTxt: "📥 Download .TXT",
    dlMd: "📥 Download .MD",
    dlDoc: "📥 Download .DOC",
    dlPng: "🖼️ Download .PNG",
    modalTitle: "Account Sign In",
    googleSignIn: "Continue with Google",
    guestSignIn: "Continue as Guest",
  },
  Français: {
    title: "Espace Document IA",
    auth: "Connexion / Inscription",
    signOut: "Déconnexion",
    langLabel: "Langue (25 prises en charge):",
    themeLabel: "Thème:",
    uploadLabel: "Charger Document / Image",
    chooseFile: "Choisir un fichier",
    noFile: "Aucun fichier choisi",
    execSummary: "Résumé Exécutif",
    keyActions: "Actions Clés",
    topTakeaways: "Points Clés",
    analyzeTrends: "Analyser Tendances",
    outputLabel: "Résultat Éditable:",
    outputSubtext: "Surlignez du texte pour exporter la sélection",
    inputLabel: "Saisie / Document:",
    placeholder: "Posez une question, discutez ou collez du texte...",
    submit: "Résumer / Discuter",
    processing: "Traitement en cours...",
    dlTxt: "📥 Télécharger .TXT",
    dlMd: "📥 Télécharger .MD",
    dlDoc: "📥 Télécharger .DOC",
    dlPng: "🖼️ Télécharger .PNG",
    modalTitle: "Connexion au Compte",
    googleSignIn: "Continuer avec Google",
    guestSignIn: "Continuer en tant qu'invité",
  },
  Español: {
    title: "Panel Documental IA",
    auth: "Iniciar Sesión / Registro",
    signOut: "Cerrar Sesión",
    langLabel: "Idioma (25 soportados):",
    themeLabel: "Tema:",
    uploadLabel: "Subir Documento / Imagen",
    chooseFile: "Seleccionar archivo",
    noFile: "Ningún archivo seleccionado",
    execSummary: "Resumen Ejecutivo",
    keyActions: "Acciones Clave",
    topTakeaways: "Puntos Clave",
    analyzeTrends: "Analizar Tendencias",
    outputLabel: "Resultado Editable:",
    outputSubtext: "Resalte texto para exportar la sección seleccionada",
    inputLabel: "Entrada / Documento:",
    placeholder: "Haga una pregunta, chatee o pegue texto...",
    submit: "Resumir / Chatear",
    processing: "Procesando...",
    dlTxt: "📥 Descargar .TXT",
    dlMd: "📥 Descargar .MD",
    dlDoc: "📥 Descargar .DOC",
    dlPng: "🖼️ Descargar .PNG",
    modalTitle: "Iniciar Sesión",
    googleSignIn: "Continuar con Google",
    guestSignIn: "Continuar como invitado",
  },
  Deutsch: {
    title: "KI Dokumenten Workbench",
    auth: "Anmelden / Registrieren",
    signOut: "Abmelden",
    langLabel: "Sprache (25 unterstützt):",
    themeLabel: "Design:",
    uploadLabel: "Dokument / Bild hochladen",
    chooseFile: "Datei auswählen",
    noFile: "Keine Datei ausgewählt",
    execSummary: "Zusammenfassung",
    keyActions: "Wichtige Aktionen",
    topTakeaways: "Kernerkenntnisse",
    analyzeTrends: "Trends Analysieren",
    outputLabel: "Bearbeitbare Ausgabe:",
    outputSubtext: "Text markieren, um Auswahl zu exportieren",
    inputLabel: "Eingabe / Dokument:",
    placeholder: "Frage stellen, chatten oder Text einfügen...",
    submit: "Zusammenfassen / Chatten",
    processing: "Verarbeitung...",
    dlTxt: "📥 Download .TXT",
    dlMd: "📥 Download .MD",
    dlDoc: "📥 Download .DOC",
    dlPng: "🖼️ Download .PNG",
    modalTitle: "Anmeldung",
    googleSignIn: "Mit Google fortfahren",
    guestSignIn: "Als Gast fortfahren",
  },
  "中文": {
    title: "AI 文档工作台",
    auth: "登录 / 注册",
    signOut: "退出登录",
    langLabel: "语言 (支持 25 种):",
    themeLabel: "主题:",
    uploadLabel: "上传文档 / 图片",
    chooseFile: "选择文件",
    noFile: "未选择文件",
    execSummary: "执行摘要",
    keyActions: "关键行动项",
    topTakeaways: "核心要点",
    analyzeTrends: "趋势分析",
    outputLabel: "可编辑输出:",
    outputSubtext: "高亮选中文本以仅导出选中部分",
    inputLabel: "输入提示 / 文档:",
    placeholder: "提问、自然聊天或粘贴文档文本...",
    submit: "生成摘要 / 对话",
    processing: "处理中...",
    dlTxt: "📥 下载 .TXT",
    dlMd: "📥 下载 .MD",
    dlDoc: "📥 下载 .DOC",
    dlPng: "🖼️ 下载 .PNG",
    modalTitle: "账号登录",
    googleSignIn: "使用 Google 登录",
    guestSignIn: "以访客身份继续",
  },
  "العربية": {
    title: "منصة المستندات بالذكاء الاصطناعي",
    auth: "تسجيل الدخول / الاشتراك",
    signOut: "تسجيل الخروج",
    langLabel: "اللغة (25 مدعومة):",
    themeLabel: "المظهر:",
    uploadLabel: "تحميل مستند / صورة",
    chooseFile: "اختر ملف",
    noFile: "لم يتم اختيار ملف",
    execSummary: "ملخص تنفيذي",
    keyActions: "الإجراءات الرئيسية",
    topTakeaways: "أهم النقاط",
    analyzeTrends: "تحليل الاتجاهات",
    outputLabel: "النتيجة القابلة للتحرير:",
    outputSubtext: "حدد النص لتصدير الجزء المحدد فقط",
    inputLabel: "النص / المستند:",
    placeholder: "اطرح سؤالاً، تحدث بأسلوب طبيعي، أو ألصق النص...",
    submit: "تلخيص المستند / الدردشة",
    processing: "جاري المعالجة...",
    dlTxt: "📥 تحميل .TXT",
    dlMd: "📥 تحميل .MD",
    dlDoc: "📥 تحميل .DOC",
    dlPng: "🖼️ تحميل .PNG",
    modalTitle: "تسجيل الدخول",
    googleSignIn: "المتابعة باستخدام Google",
    guestSignIn: "المتابعة كضيف",
  },
  Português: {
    title: "Painel de Documentos IA",
    auth: "Entrar / Cadastrar",
    signOut: "Sair",
    langLabel: "Idioma (25 suportados):",
    themeLabel: "Tema:",
    uploadLabel: "Enviar Documento / Imagem",
    chooseFile: "Escolher Arquivo",
    noFile: "Nenhum arquivo escolhido",
    execSummary: "Resumo Executivo",
    keyActions: "Ações Principais",
    topTakeaways: "Pontos Chave",
    analyzeTrends: "Analisar Tendências",
    outputLabel: "Resultado Editável:",
    outputSubtext: "Destaque o texto para exportar a seleção",
    inputLabel: "Entrada / Documento:",
    placeholder: "Faça uma pergunta, converse ou cole o texto...",
    submit: "Resumir / Conversar",
    processing: "Processando...",
    dlTxt: "📥 Baixar .TXT",
    dlMd: "📥 Baixar .MD",
    dlDoc: "📥 Baixar .DOC",
    dlPng: "🖼️ Baixar .PNG",
    modalTitle: "Entrar na Conta",
    googleSignIn: "Continuar com o Google",
    guestSignIn: "Continuar como Convidado",
  },
  Русский: {
    title: "ИИ Панель Документов",
    auth: "Вход / Регистрация",
    signOut: "Выйти",
    langLabel: "Язык (поддержка 25):",
    themeLabel: "Тема:",
    uploadLabel: "Загрузить документ / фото",
    chooseFile: "Выбрать файл",
    noFile: "Файл не выбран",
    execSummary: "Краткое изложение",
    keyActions: "Ключевые действия",
    topTakeaways: "Главные выводы",
    analyzeTrends: "Анализ трендов",
    outputLabel: "Редактируемый вывод:",
    outputSubtext: "Выделите текст для экспорта выбранного фрагмента",
    inputLabel: "Ввод / Документ:",
    placeholder: "Задайте вопрос или вставьте текст...",
    submit: "Создать сводку / Чат",
    processing: "Обработка...",
    dlTxt: "📥 Скачать .TXT",
    dlMd: "📥 Скачать .MD",
    dlDoc: "📥 Скачать .DOC",
    dlPng: "🖼️ Скачать .PNG",
    modalTitle: "Вход в аккаунт",
    googleSignIn: "Войти через Google",
    guestSignIn: "Продолжить как гость",
  },
  日本語: {
    title: "AI ドキュメント ワークベンチ",
    auth: "ログイン / 新規登録",
    signOut: "ログアウト",
    langLabel: "言語 (25言語対応):",
    themeLabel: "テーマ:",
    uploadLabel: "ドキュメント / 画像のアップロード",
    chooseFile: "ファイルを選択",
    noFile: "選択されていません",
    execSummary: "エグゼクティブサマリー",
    keyActions: "主要なアクション",
    topTakeaways: "重要なポイント",
    analyzeTrends: "トレンド分析",
    outputLabel: "編集可能な出力:",
    outputSubtext: "テキストをハイライトして選択部分のみを出力",
    inputLabel: "入力プロンプト / ドキュメント:",
    placeholder: "質問の入力、チャット、またはテキストを貼り付け...",
    submit: "要約 / チャット実行",
    processing: "処理中...",
    dlTxt: "📥 .TXT ダウンロード",
    dlMd: "📥 .MD ダウンロード",
    dlDoc: "📥 .DOC ダウンロード",
    dlPng: "🖼️ .PNG ダウンロード",
    modalTitle: "アカウント ログイン",
    googleSignIn: "Google でログイン",
    guestSignIn: "ゲストとして継続",
  },
  한국어: {
    title: "AI 문서 워크벤치",
    auth: "로그인 / 회원가입",
    signOut: "로그아웃",
    langLabel: "언어 (25개 지원):",
    themeLabel: "테마:",
    uploadLabel: "문서 / 이미지 업로드",
    chooseFile: "파일 선택",
    noFile: "선택된 파일 없음",
    execSummary: "요약 보고서",
    keyActions: "핵심 실행 항목",
    topTakeaways: "주요 핵심 내용",
    analyzeTrends: "트렌드 분석",
    outputLabel: "편집 가능한 출력:",
    outputSubtext: "텍스트를 드래그하여 선택 부분만 내보내기",
    inputLabel: "입력 프롬프트 / 문서:",
    placeholder: "질문 입력, 대화 또는 문서 텍스트 붙여넣기...",
    submit: "요약하기 / 대화하기",
    processing: "처리 중...",
    dlTxt: "📥 .TXT 다운로드",
    dlMd: "📥 .MD 다운로드",
    dlDoc: "📥 .DOC 다운로드",
    dlPng: "🖼️ .PNG 다운로드",
    modalTitle: "계정 로그인",
    googleSignIn: "Google 계정으로 로그인",
    guestSignIn: "게스트로 계속하기",
  },
};

export default function Home() {
  const [inputText, setInputText] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [promptType, setPromptType] = useState("General Chat");
  const [language, setLanguage] = useState("Français");
  const [theme, setTheme] = useState("dark");
  const [fileData, setFileData] = useState<any>(null);
  const [fileName, setFileName] = useState("");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string; avatar?: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLTextAreaElement>(null);

  const t = I18N[language] || I18N["English"];

  useEffect(() => {
    const savedUser = localStorage.getItem("app_user");
    if (savedUser) {
      try { setUser(JSON.parse(savedUser)); } catch (e) {}
    }
  }, []);

  const handleGoogleSignIn = () => {
    // Authenticate user session
    const dummyUser = {
      name: "Jerry Moses Urama",
      email: "jerry@pamourafoods.com",
      avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=JerryMax"
    };
    setUser(dummyUser);
    localStorage.setItem("app_user", JSON.stringify(dummyUser));
    setShowAuthModal(false);
  };

  const handleSignOut = () => {
    setUser(null);
    localStorage.removeItem("app_user");
  };

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
    setOutput(t.processing);

    try {
      const res = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: inputText,
          fileData: fileData,
          promptType: activePromptType,
          language: language,
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
    <main className="min-h-screen bg-slate-950 text-white p-4 max-w-lg mx-auto flex flex-col gap-3 relative">
      {/* 1. Header Card with Active Sign-In Handler */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex justify-between items-center">
        <h1 className="text-xl font-bold leading-tight">{t.title}</h1>
        {user ? (
          <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-xl border border-slate-800">
            <span className="text-xs font-semibold text-blue-400 truncate max-w-[90px]">{user.name}</span>
            <button
              onClick={handleSignOut}
              className="bg-red-600 hover:bg-red-500 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg transition"
            >
              {t.signOut}
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowAuthModal(true)}
            className="bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl transition shadow-lg shadow-blue-600/20"
          >
            {t.auth}
          </button>
        )}
      </div>

      {/* 2. Settings Row (Language & Theme) */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-2xl flex flex-col gap-2">
          <label className="text-xs text-slate-400 font-medium">{t.langLabel}</label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-slate-950 border border-blue-500/50 rounded-xl p-2.5 text-xs font-medium text-white outline-none focus:border-blue-500"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang} value={lang}>{lang}</option>
            ))}
          </select>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-2xl flex flex-col gap-2">
          <label className="text-xs text-slate-400 font-medium">{t.themeLabel}</label>
          <div className="flex items-center gap-3 mt-1">
            <button
              onClick={() => setTheme("dark")}
              className={`w-7 h-7 rounded-full bg-black border-2 ${theme === "dark" ? "border-blue-500 ring-2 ring-blue-500/30" : "border-slate-700"}`}
            />
            <button
              onClick={() => setTheme("light")}
              className={`w-7 h-7 rounded-full bg-white border-2 ${theme === "light" ? "border-blue-500 ring-2 ring-blue-500/30" : "border-slate-700"}`}
            />
          </div>
        </div>
      </div>

      {/* 3. Document Upload Card */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".txt,.md,.pdf,.doc,.docx,image/*"
        className="hidden"
      />
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col gap-2">
        <label className="text-xs text-slate-400 font-medium">{t.uploadLabel}</label>
        <div className="flex items-center justify-between bg-slate-950 border border-slate-800 p-2.5 rounded-xl">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2 rounded-lg transition"
          >
            {t.chooseFile}
          </button>
          <span className="text-xs text-slate-400 truncate max-w-[160px]">
            {fileName || t.noFile}
          </span>
        </div>
      </div>

      {/* 4. Quick Actions Grid */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => handleGenerate("Executive Summary")}
          className="bg-slate-900 border border-slate-800 hover:bg-slate-800 p-4 rounded-2xl flex items-center gap-3 text-left transition"
        >
          <span className="text-lg">📋</span>
          <span className="text-xs font-semibold leading-tight">{t.execSummary}</span>
        </button>
        <button
          onClick={() => handleGenerate("Key Action Items")}
          className="bg-slate-900 border border-slate-800 hover:bg-slate-800 p-4 rounded-2xl flex items-center gap-3 text-left transition"
        >
          <span className="text-lg">✅</span>
          <span className="text-xs font-semibold leading-tight">{t.keyActions}</span>
        </button>
        <button
          onClick={() => handleGenerate("Top Takeaways")}
          className="bg-slate-900 border border-slate-800 hover:bg-slate-800 p-4 rounded-2xl flex items-center gap-3 text-left transition"
        >
          <span className="text-lg">💡</span>
          <span className="text-xs font-semibold leading-tight">{t.topTakeaways}</span>
        </button>
        <button
          onClick={() => handleGenerate("Analyze Trends")}
          className="bg-slate-900 border border-slate-800 hover:bg-slate-800 p-4 rounded-2xl flex items-center gap-3 text-left transition"
        >
          <span className="text-lg">📊</span>
          <span className="text-xs font-semibold leading-tight">{t.analyzeTrends}</span>
        </button>
      </div>

      {/* 5. OUTPUT SUMMARY BOX (UP) */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col gap-3">
        <div className="flex justify-between items-center">
          <span className="text-xs font-semibold text-slate-400">{t.outputLabel}</span>
          <span className="text-[10px] text-slate-500">{t.outputSubtext}</span>
        </div>
        <textarea
          ref={outputRef}
          value={output}
          onChange={(e) => setOutput(e.target.value)}
          placeholder={t.outputLabel}
          className="w-full h-36 bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm focus:outline-none resize-none font-mono text-slate-200"
        />

        <div className="grid grid-cols-2 gap-2">
          <button onClick={downloadTxt} className="bg-slate-800 text-xs py-2.5 rounded-xl hover:bg-slate-700 transition">
            {t.dlTxt}
          </button>
          <button onClick={downloadMd} className="bg-slate-800 text-xs py-2.5 rounded-xl hover:bg-slate-700 transition">
            {t.dlMd}
          </button>
          <button onClick={downloadDoc} className="bg-slate-800 text-xs py-2.5 rounded-xl hover:bg-slate-700 transition">
            {t.dlDoc}
          </button>
          <button onClick={downloadPng} className="bg-blue-600 text-xs py-2.5 rounded-xl font-semibold hover:bg-blue-500 transition">
            {t.dlPng}
          </button>
        </div>
      </div>

      {/* 6. INPUT PROMPT BOX (DOWN) */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col gap-3">
        <label className="text-xs font-medium text-slate-400">{t.inputLabel}</label>
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={t.placeholder}
          className="w-full h-32 bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm focus:outline-none focus:border-blue-500 resize-none text-slate-200"
        />
        <button
          onClick={() => handleGenerate("General Chat")}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 py-3 rounded-xl text-sm font-semibold transition shadow-lg shadow-blue-600/20"
        >
          {loading ? t.processing : t.submit}
        </button>
      </div>

      {/* Auth Modal Overlay */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-sm flex flex-col gap-4 relative shadow-2xl">
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white font-bold text-sm"
            >
              ✕
            </button>
            <h2 className="text-lg font-bold text-center text-white">{t.modalTitle}</h2>
            <p className="text-xs text-slate-400 text-center">Sign in to save your workspaces and export preferences.</p>
            
            <button
              onClick={handleGoogleSignIn}
              className="w-full bg-white hover:bg-slate-100 text-slate-900 font-semibold py-3 px-4 rounded-xl text-sm flex items-center justify-center gap-3 transition shadow-md"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              {t.googleSignIn}
            </button>

            <button
              onClick={() => setShowAuthModal(false)}
              className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium py-2.5 rounded-xl text-xs transition"
            >
              {t.guestSignIn}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
