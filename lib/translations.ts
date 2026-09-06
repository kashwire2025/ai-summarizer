export interface TranslationKeys {
  title: string;
  signIn: string;
  langLabel: string;
  themeLabel: string;
  uploadLabel: string;
  chooseFile: string;
  noFile: string;
  execSummary: string;
  keyActions: string;
  topTakeaways: string;
  analyzeTrends: string;
  placeholder: string;
  summarizeBtn: string;
  thinking: string;
}

export const LANGUAGES = [
  { code: "en", name: "English" },
  { code: "es", name: "Español" },
  { code: "fr", name: "Français" },
  { code: "de", name: "Deutsch" },
  { code: "zh", name: "中文 (Chinese)" },
  { code: "ja", name: "日本語 (Japanese)" },
  { code: "ar", name: "العربية (Arabic)" },
  { code: "pt", name: "Português" },
  { code: "ru", name: "Русский" },
  { code: "hi", name: "हिन्दी (Hindi)" },
  { code: "sw", name: "Kiswahili" },
  { code: "ha", name: "Hausa" },
  { code: "yo", name: "Yorùbá" },
  { code: "ig", name: "Igbo" },
  { code: "tr", name: "Türkçe" },
  { code: "it", name: "Italiano" },
  { code: "ko", name: "한국어 (Korean)" },
  { code: "nl", name: "Nederlands" },
  { code: "pl", name: "Polski" },
  { code: "vi", name: "Tiếng Việt" },
  { code: "th", name: "ไทย (Thai)" },
  { code: "id", name: "Bahasa Indonesia" },
  { code: "bn", name: "বাংলা (Bengali)" },
  { code: "tl", name: "Tagalog" },
  { code: "ms", name: "Bahasa Melayu" }
];

export const translations: Record<string, TranslationKeys> = {
  en: {
    title: "AI Document Workbench",
    signIn: "Sign In / Sign Up",
    langLabel: "Language (25 supported):",
    themeLabel: "Theme:",
    uploadLabel: "Upload Document / Image",
    chooseFile: "Choose File",
    noFile: "No file chosen",
    execSummary: "Executive Summary",
    keyActions: "Key Action Items",
    topTakeaways: "Top Takeaways",
    analyzeTrends: "Analyze Trends",
    placeholder: "Paste Document Text or Prompt...",
    summarizeBtn: "Summarize Document",
    thinking: "Gemini is thinking..."
  },
  es: {
    title: "Banco de Trabajo de Documentos IA",
    signIn: "Iniciar Sesión / Registrarse",
    langLabel: "Idioma (25 compatibles):",
    themeLabel: "Tema:",
    uploadLabel: "Cargar Documento / Imagen",
    chooseFile: "Seleccionar Archivo",
    noFile: "Ningún archivo seleccionado",
    execSummary: "Resumen Ejecutivo",
    keyActions: "Puntos Clave de Acción",
    topTakeaways: "Conclusiones Principales",
    analyzeTrends: "Analizar Tendencias",
    placeholder: "Pegue el texto del documento o la consulta...",
    summarizeBtn: "Resumir Documento",
    thinking: "Gemini está pensando..."
  },
  fr: {
    title: "Atelier de Documents IA",
    signIn: "Connexion / Inscription",
    langLabel: "Langue (25 supportées) :",
    themeLabel: "Thème :",
    uploadLabel: "Télécharger Document / Image",
    chooseFile: "Choisir un fichier",
    noFile: "Aucun fichier choisi",
    execSummary: "Résumé Exécutif",
    keyActions: "Actions Clés",
    topTakeaways: "Points Essentiels",
    analyzeTrends: "Analyser les Tendances",
    placeholder: "Collez le texte du document ou le prompt...",
    summarizeBtn: "Résumer le Document",
    thinking: "Gemini réfléchit..."
  },
  de: {
    title: "KI-Dokumenten-Werkbank",
    signIn: "Anmelden / Registrieren",
    langLabel: "Sprache (25 unterstützt):",
    themeLabel: "Design:",
    uploadLabel: "Dokument / Bild hochladen",
    chooseFile: "Datei auswählen",
    noFile: "Keine Datei ausgewählt",
    execSummary: "Management-Zusammenfassung",
    keyActions: "Wichtige Maßnahmen",
    topTakeaways: "Wichtigste Erkenntnisse",
    analyzeTrends: "Trends Analysieren",
    placeholder: "Dokumententext oder Eingabe einfügen...",
    summarizeBtn: "Dokument Zusammenfassen",
    thinking: "Gemini denkt nach..."
  },
  zh: {
    title: "AI 文档工作台",
    signIn: "登录 / 注册",
    langLabel: "语言 (支持25种):",
    themeLabel: "主题:",
    uploadLabel: "上传文档 / 图片",
    chooseFile: "选择文件",
    noFile: "未选择文件",
    execSummary: "执行摘要",
    keyActions: "关键行动项",
    topTakeaways: "核心要点",
    analyzeTrends: "趋势分析",
    placeholder: "粘贴文档内容或提示词...",
    summarizeBtn: "生成文档摘要",
    thinking: "Gemini 正在思考..."
  },
  ja: {
    title: "AIドキュメント ワークベンチ",
    signIn: "サインイン / 新規登録",
    langLabel: "言語 (25言語対応):",
    themeLabel: "テーマ:",
    uploadLabel: "ドキュメント / 画像のアップロード",
    chooseFile: "ファイルを選択",
    noFile: "選択されていません",
    execSummary: "エグゼクティブ サマリー",
    keyActions: "主要なアクション項目",
    topTakeaways: "重要なポイント",
    analyzeTrends: "トレンド分析",
    placeholder: "ドキュメントのテキストまたはプロンプトを貼り付け...",
    summarizeBtn: "ドキュメントを要約",
    thinking: "Geminiが考え中..."
  },
  ha: {
    title: "Dandalin Takardun AI",
    signIn: "Shiga / Yi Rajista",
    langLabel: "Harshe (25 aka goyon baya):",
    themeLabel: "Tsari:",
    uploadLabel: "Sanya Takarda / Hoton",
    chooseFile: "Zaɓi Fayil",
    noFile: "Babu fayil da aka zaɓa",
    execSummary: "Takaitaccen Bayani",
    keyActions: "Mahimman Ayyuka",
    topTakeaways: "Babban Abin Lura",
    analyzeTrends: "Binciken Hanyoyi",
    placeholder: "Manna rubutun takarda ko tambaya...",
    summarizeBtn: "Takaice Takardar",
    thinking: "Gemini yana tunani..."
  },
  yo: {
    title: "Agbègbè Iṣẹ́ Àkọsílẹ̀ AI",
    signIn: "Wọle / Sọ́ọ̀sì",
    langLabel: "Èdè (25 ni a gbà ti):",
    themeLabel: "Pátákó:",
    uploadLabel: "Gbe Àkọsílẹ̀ / Àworan Sókè",
    chooseFile: "Sayan Fayili",
    noFile: "Kò sí fayili ti a yan",
    execSummary: "Àkópọ̀ Aṣojú",
    keyActions: "Awọn Iṣẹ Pataki",
    topTakeaways: "Awọn Òtítọ́ Gbogbo",
    analyzeTrends: "Agbéyẹ̀wò Àwọn Ìṣẹ̀lẹ̀",
    placeholder: "Lẹ pọ ọrọ àkọsílẹ̀ tabi ibeere...",
    summarizeBtn: "Ṣe Àkópọ̀ Àkọsílẹ̀",
    thinking: "Gemini ń rogbodiyan..."
  },
  ig: {
    title: "Ebe Ọrụ Akwụkwọ AI",
    signIn: "Banye / Debanye aha",
    langLabel: "Asụsụ (25 akwadoro):",
    themeLabel: "Isiokwu:",
    uploadLabel: "Bulite Akwụkwọ / Foto",
    chooseFile: "Rọrọ Faịlụ",
    noFile: "Enweghị faịlụ a họọrọ",
    execSummary: "Nchịkọta Nke Ndị Isi",
    keyActions: "Ihe Omume Ndị Dị Mikpu",
    topTakeaways: "Ihe Ndị Dị Mkpa",
    analyzeTrends: "Nyochaa Usoro",
    placeholder: "Mado ederede akwụkwọ ma ọ bụ ajụjụ...",
    summarizeBtn: "Chịkọta Akwụkwọ",
    thinking: "Gemini na-eche echiche..."
  }
};

// Fallback resolver for missing keys or unsupported direct translations
export function getTranslation(langCode: string): TranslationKeys {
  return translations[langCode] || translations["en"];
}
