"use client";

import { useState, useRef, useEffect } from "react";
import Script from "next/script";

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
    auth: "Sign in with Google",
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
    modalTitle: "Sign in with Google",
    modalSub: "Choose an option to access your saved workspaces",
    emailPlaceholder: "Enter your Google Email",
    continueBtn: "Continue",
    guestSignIn: "Continue as Guest",
  },
  Français: {
    title: "Espace Document IA",
    auth: "Se connecter avec Google",
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
    placeholder: "Posez une question ou collez du texte...",
    submit: "Résumer / Discuter",
    processing: "Traitement en cours...",
    dlTxt: "📥 Télécharger .TXT",
    dlMd: "📥 Télécharger .MD",
    dlDoc: "📥 Télécharger .DOC",
    dlPng: "🖼️ Télécharger .PNG",
    modalTitle: "Se connecter avec Google",
    modalSub: "Choisissez une option pour accéder à vos espaces",
    emailPlaceholder: "Entrez votre email Google",
    continueBtn: "Continuer",
    guestSignIn: "Continuer en tant qu'invité",
  },
  Español: {
    title: "Panel de Documentos IA",
    auth: "Iniciar sesión con Google",
    signOut: "Cerrar sesión",
    langLabel: "Idioma (25 compatibles):",
    themeLabel: "Tema:",
    uploadLabel: "Subir Documento / Imagen",
    chooseFile: "Seleccionar archivo",
    noFile: "Ningún archivo seleccionado",
    execSummary: "Resumen Ejecutivo",
    keyActions: "Puntos de Acción",
    topTakeaways: "Conclusiones Clave",
    analyzeTrends: "Analizar Tendencias",
    outputLabel: "Resultado Editable:",
    outputSubtext: "Resalte texto para exportar la selección",
    inputLabel: "Entrada / Documento:",
    placeholder: "Haga una pregunta o pegue texto...",
    submit: "Resumir / Chatear",
    processing: "Procesando...",
    dlTxt: "📥 Descargar .TXT",
    dlMd: "📥 Descargar .MD",
    dlDoc: "📥 Descargar .DOC",
    dlPng: "🖼️ Descargar .PNG",
    modalTitle: "Iniciar sesión con Google",
    modalSub: "Acceda a sus áreas de trabajo guardadas",
    emailPlaceholder: "Ingrese su correo de Google",
    continueBtn: "Continuar",
    guestSignIn: "Continuar como invitado",
  },
  Deutsch: {
    title: "KI-Dokumenten-Workbench",
    auth: "Mit Google anmelden",
    signOut: "Abmelden",
    langLabel: "Sprache (25 unterstützt):",
    themeLabel: "Design:",
    uploadLabel: "Dokument / Bild hochladen",
    chooseFile: "Datei auswählen",
    noFile: "Keine Datei ausgewählt",
    execSummary: "Zusammenfassung",
    keyActions: "Wichtige Aktionen",
    topTakeaways: "Haupterkenntnisse",
    analyzeTrends: "Trends analysieren",
    outputLabel: "Bearbeitbare Ausgabe:",
    outputSubtext: "Text markieren zum Exportieren des Auswahls",
    inputLabel: "Eingabe / Dokument:",
    placeholder: "Frage stellen oder Text einfügen...",
    submit: "Zusammenfassen / Chatten",
    processing: "Verarbeitung...",
    dlTxt: "📥 Herunterladen .TXT",
    dlMd: "📥 Herunterladen .MD",
    dlDoc: "📥 Herunterladen .DOC",
    dlPng: "🖼️ Herunterladen .PNG",
    modalTitle: "Mit Google anmelden",
    modalSub: "Wählen Sie eine Option für den Zugriff",
    emailPlaceholder: "Geben Sie Ihre Google-E-Mail ein",
    continueBtn: "Weiter",
    guestSignIn: "Als Gast fortfahren",
  },
  中文: {
    title: "AI 文档工作台",
    auth: "使用 Google 登录",
    signOut: "退出登录",
    langLabel: "语言 (支持25种):",
    themeLabel: "主题:",
    uploadLabel: "上传文档 / 图片",
    chooseFile: "选择文件",
    noFile: "未选择文件",
    execSummary: "执行摘要",
    keyActions: "关键行动项",
    topTakeaways: "核心要点",
    analyzeTrends: "趋势分析",
    outputLabel: "可编辑输出:",
    outputSubtext: "高亮选中文本即可导出特定内容",
    inputLabel: "输入提示词 / 文档:",
    placeholder: "输入问题、聊天或粘贴文本...",
    submit: "生成摘要 / 聊天",
    processing: "正在处理...",
    dlTxt: "📥 下载 .TXT",
    dlMd: "📥 下载 .MD",
    dlDoc: "📥 下载 .DOC",
    dlPng: "🖼️ 下载 .PNG",
    modalTitle: "使用 Google 登录",
    modalSub: "选择登录方式以访问保存的工作区",
    emailPlaceholder: "输入您的 Google 邮箱",
    continueBtn: "继续",
    guestSignIn: "以访客身份继续",
  },
  العربية: {
    title: "مساحة عمل مستندات الذكاء الاصطناعي",
    auth: "تسجيل الدخول باستخدام Google",
    signOut: "تسجيل الخروج",
    langLabel: "اللغات (25 مدعومة):",
    themeLabel: "المظهر:",
    uploadLabel: "تحميل مستند / صورة",
    chooseFile: "اختر ملفًا",
    noFile: "لم يتم اختيار ملف",
    execSummary: "ملخص تنفيذي",
    keyActions: "إجراءات رئيسية",
    topTakeaways: "أهم النقاط",
    analyzeTrends: "تحليل الاتجاهات",
    outputLabel: "المخرجات القابلة للتعديل:",
    outputSubtext: "قم بتظليل النص لتصدير الجزء المحدد",
    inputLabel: "المستند / النص المدخل:",
    placeholder: "اطرح سؤالاً أو ألصق النص هنا...",
    submit: "تلخيص / محادثة",
    processing: "جاري المعالجة...",
    dlTxt: "📥 تنزيل .TXT",
    dlMd: "📥 تنزيل .MD",
    dlDoc: "📥 تنزيل .DOC",
    dlPng: "🖼️ تنزيل .PNG",
    modalTitle: "تسجيل الدخول باستخدام Google",
    modalSub: "اختر خيارًا للوصول إلى مساحات العمل",
    emailPlaceholder: "أدخل بريد Google الإلكتروني",
    continueBtn: "متابعة",
    guestSignIn: "المتابعة كضيف",
  },
  Português: {
    title: "Painel de Documentos IA",
    auth: "Fazer login com o Google",
    signOut: "Sair",
    langLabel: "Idioma (25 suportados):",
    themeLabel: "Tema:",
    uploadLabel: "Enviar Documento / Imagem",
    chooseFile: "Escolher arquivo",
    noFile: "Nenhum arquivo selecionado",
    execSummary: "Resumo Executivo",
    keyActions: "Ações Principais",
    topTakeaways: "Principais Conclusões",
    analyzeTrends: "Analisar Tendências",
    outputLabel: "Resultado Editável:",
    outputSubtext: "Destaque o texto para exportar a seleção",
    inputLabel: "Entrada / Documento:",
    placeholder: "Faça uma pergunta ou cole um texto...",
    submit: "Resumir / Conversar",
    processing: "Processando...",
    dlTxt: "📥 Baixar .TXT",
    dlMd: "📥 Baixar .MD",
    dlDoc: "📥 Baixar .DOC",
    dlPng: "🖼️ Baixar .PNG",
    modalTitle: "Fazer login com o Google",
    modalSub: "Acesse suas áreas de trabalho salvas",
    emailPlaceholder: "Digite seu e-mail do Google",
    continueBtn: "Continuar",
    guestSignIn: "Continuar como convidado",
  },
  Русский: {
    title: "Рабочая область ИИ",
    auth: "Войти через Google",
    signOut: "Выйти",
    langLabel: "Язык (25 поддерживается):",
    themeLabel: "Тема:",
    uploadLabel: "Загрузить документ / фото",
    chooseFile: "Выбрать файл",
    noFile: "Файл не выбран",
    execSummary: "Краткое содержание",
    keyActions: "Ключевые действия",
    topTakeaways: "Главные выводы",
    analyzeTrends: "Анализ трендов",
    outputLabel: "Редактируемый вывод:",
    outputSubtext: "Выделите текст для экспорта фрагмента",
    inputLabel: "Ввод / Документ:",
    placeholder: "Задайте вопрос или вставьте текст...",
    submit: "Сформировать / Чат",
    processing: "Обработка...",
    dlTxt: "📥 Скачать .TXT",
    dlMd: "📥 Скачать .MD",
    dlDoc: "📥 Скачать .DOC",
    dlPng: "🖼️ Скачать .PNG",
    modalTitle: "Войти через Google",
    modalSub: "Выберите вариант для входа",
    emailPlaceholder: "Введите email Google",
    continueBtn: "Продолжить",
    guestSignIn: "Продолжить как гость",
  },
  日本語: {
    title: "AI ドキュメント ワークベンチ",
    auth: "Google でログイン",
    signOut: "ログアウト",
    langLabel: "言語 (25言語対応):",
    themeLabel: "テーマ:",
    uploadLabel: "ドキュメント / 画像のアップロード",
    chooseFile: "ファイルを選択",
    noFile: "選択されていません",
    execSummary: "要約サマリー",
    keyActions: "要対応アクション",
    topTakeaways: "主要なポイント",
    analyzeTrends: "トレンド分析",
    outputLabel: "編集可能出力:",
    outputSubtext: "テキストをハイライトして選択部分のみをエクスポート",
    inputLabel: "入力プロンプト / ドキュメント:",
    placeholder: "質問を入力するかテキストを貼り付けてください...",
    submit: "要約 / チャット",
    processing: "処理中...",
    dlTxt: "📥 下载 .TXT",
    dlMd: "📥 下载 .MD",
    dlDoc: "📥 下载 .DOC",
    dlPng: "🖼️ 下载 .PNG",
    modalTitle: "Google でログイン",
    modalSub: "保存されたワークスペースにアクセス",
    emailPlaceholder: "Googleメールアドレスを入力",
    continueBtn: "次へ",
    guestSignIn: "ゲストとして継続",
  },
  한국어: {
    title: "AI 문서 워크벤치",
    auth: "Google로 로그인",
    signOut: "로그아웃",
    langLabel: "언어 (25개 지원):",
    themeLabel: "테마:",
    uploadLabel: "문서 / 이미지 업로드",
    chooseFile: "파일 선택",
    noFile: "선택된 파일 없음",
    execSummary: "핵심 요약",
    keyActions: "주요 실행 항목",
    topTakeaways: "핵심 인사이트",
    analyzeTrends: "트렌드 분석",
    outputLabel: "편집 가능한 출력:",
    outputSubtext: "선택한 섹션을 내보내려면 텍스트를 강조표시하세요",
    inputLabel: "입력 프롬프트 / 문서:",
    placeholder: "질문을 입력하거나 텍스트를 붙여넣으세요...",
    submit: "요약하기 / 대화",
    processing: "처리 중...",
    dlTxt: "📥 다운로드 .TXT",
    dlMd: "📥 다운로드 .MD",
    dlDoc: "📥 다운로드 .DOC",
    dlPng: "🖼️ 다운로드 .PNG",
    modalTitle: "Google로 로그인",
    modalSub: "저장된 작업 공간에 액세스하세요",
    emailPlaceholder: "Google 이메일 입력",
    continueBtn: "계속",
    guestSignIn: "게스트로 계속하기",
  },
  Italiano: {
    title: "Workbench Documenti IA",
    auth: "Accedi con Google",
    signOut: "Esci",
    langLabel: "Lingua (25 supportate):",
    themeLabel: "Tema:",
    uploadLabel: "Carica Documento / Immagine",
    chooseFile: "Scegli file",
    noFile: "Nessun file selezionato",
    execSummary: "Riepilogo Esecutivo",
    keyActions: "Azioni Chiave",
    topTakeaways: "Punti Chiave",
    analyzeTrends: "Analizza Tendenze",
    outputLabel: "Risultato Modificabile:",
    outputSubtext: "Evidenzia il testo per esportare la selezione",
    inputLabel: "Input / Documento:",
    placeholder: "Fai una domanda o incolla il testo...",
    submit: "Riepiloga / Chatta",
    processing: "Elaborazione...",
    dlTxt: "📥 Scarica .TXT",
    dlMd: "📥 Scarica .MD",
    dlDoc: "📥 Scarica .DOC",
    dlPng: "🖼️ Scarica .PNG",
    modalTitle: "Accedi con Google",
    modalSub: "Scegli un'opzione per accedere",
    emailPlaceholder: "Inserisci la tua email Google",
    continueBtn: "Continua",
    guestSignIn: "Continua come ospite",
  },
  Nederlands: {
    title: "AI Documenten Workbench",
    auth: "Inloggen met Google",
    signOut: "Uitloggen",
    langLabel: "Taal (25 ondersteund):",
    themeLabel: "Thema:",
    uploadLabel: "Document / Afbeelding Uploaden",
    chooseFile: "Kies bestand",
    noFile: "Geen bestand gekozen",
    execSummary: "Managementsamenvatting",
    keyActions: "Belangrijkste Actiepunten",
    topTakeaways: "Belangrijkste Inzichten",
    analyzeTrends: "Trends Analyseren",
    outputLabel: "Bewerking Uitvoer:",
    outputSubtext: "Selecteer tekst om alleen die selectie te exporteren",
    inputLabel: "Invoer / Document:",
    placeholder: "Stel een vraag of plak tekst...",
    submit: "Samenvatten / Chatten",
    processing: "Verwerken...",
    dlTxt: "📥 Download .TXT",
    dlMd: "📥 Download .MD",
    dlDoc: "📥 Download .DOC",
    dlPng: "🖼️ Download .PNG",
    modalTitle: "Inloggen met Google",
    modalSub: "Open uw opgeslagen werkruimten",
    emailPlaceholder: "Voer uw Google e-mailadres in",
    continueBtn: "Doorgaan",
    guestSignIn: "Doorgaan als gast",
  },
  Türkçe: {
    title: "Yapay Zeka Belge Çalışma Alanı",
    auth: "Google ile Giriş Yap",
    signOut: "Çıkış Yap",
    langLabel: "Dil (25 destekleniyor):",
    themeLabel: "Tema:",
    uploadLabel: "Belge / Görsel Yükle",
    chooseFile: "Dosya Seç",
    noFile: "Dosya seçilmedi",
    execSummary: "Yönetici Özeti",
    keyActions: "Eylem Maddeleri",
    topTakeaways: "Önemli Çıkarımlar",
    analyzeTrends: "Trend Analizi",
    outputLabel: "Düzenlenebilir Çıktı:",
    outputSubtext: "Seçili bölümü dışa aktarmak için metni vurgulayın",
    inputLabel: "Girdi / Belge:",
    placeholder: "Bir soru sorun veya metin yapıştırın...",
    submit: "Özetle / Sohbet Et",
    processing: "İşleniyor...",
    dlTxt: "📥 İndir .TXT",
    dlMd: "📥 İndir .MD",
    dlDoc: "📥 İndir .DOC",
    dlPng: "🖼️ İndir .PNG",
    modalTitle: "Google ile Giriş Yap",
    modalSub: "Kayıtlı çalışma alanlarına erişin",
    emailPlaceholder: "Google e-postanızı girin",
    continueBtn: "Devam Et",
    guestSignIn: "Misafir olarak devam et",
  },
  हिन्दी: {
    title: "एआई दस्तावेज़ वर्कबेंच",
    auth: "Google के साथ साइन इन करें",
    signOut: "साइन आउट",
    langLabel: "भाषा (25 समर्थित):",
    themeLabel: "थीम:",
    uploadLabel: "दस्तावेज़ / छवि अपलोड करें",
    chooseFile: "फ़ाइल चुनें",
    noFile: "कोई फ़ाइल नहीं चुनी गई",
    execSummary: "कार्यकारी सारांश",
    keyActions: "मुख्य कार्रवाई बिंदु",
    topTakeaways: "प्रमुख निष्कर्ष",
    analyzeTrends: "रुझानों का विश्लेषण",
    outputLabel: "संपादन योग्य आउटपुट:",
    outputSubtext: "चयनित अनुभाग निर्यात करने के लिए टेक्स्ट हाइलाइट करें",
    inputLabel: "इनपुट / दस्तावेज़:",
    placeholder: "प्रश्न पूछें या टेक्स्ट पेस्ट करें...",
    submit: "सारांश / चैट",
    processing: "प्रसंस्करण जारी है...",
    dlTxt: "📥 डाउनलोड .TXT",
    dlMd: "📥 डाउनलोड .MD",
    dlDoc: "📥 डाउनलोड .DOC",
    dlPng: "🖼️ डाउनलोड .PNG",
    modalTitle: "Google के साथ साइन इन करें",
    modalSub: "अपने सहेजे गए कार्यक्षेत्र तक पहुँचें",
    emailPlaceholder: "अपना Google ईमेल दर्ज करें",
    continueBtn: "जारी रखें",
    guestSignIn: "अतिथि के रूप में जारी रखें",
  },
  "Bahasa Indonesia": {
    title: "Workbench Dokumen AI",
    auth: "Masuk dengan Google",
    signOut: "Keluar",
    langLabel: "Bahasa (25 didukung):",
    themeLabel: "Tema:",
    uploadLabel: "Unggah Dokumen / Gambar",
    chooseFile: "Pilih File",
    noFile: "Tidak ada file dipilih",
    execSummary: "Ringkasan Eksekutif",
    keyActions: "Tindakan Utama",
    topTakeaways: "Poin Poin Penting",
    analyzeTrends: "Analisis Tren",
    outputLabel: "Hasil Dapat Diedit:",
    outputSubtext: "Sorot teks untuk mengekspor bagian terpilih",
    inputLabel: "Input / Dokumen:",
    placeholder: "Ajukan pertanyaan atau tempel teks...",
    submit: "Ringkas / Chat",
    processing: "Memproses...",
    dlTxt: "📥 Unduh .TXT",
    dlMd: "📥 Unduh .MD",
    dlDoc: "📥 Unduh .DOC",
    dlPng: "🖼️ Unduh .PNG",
    modalTitle: "Masuk dengan Google",
    modalSub: "Akses ruang kerja yang disimpan",
    emailPlaceholder: "Masukkan Email Google Anda",
    continueBtn: "Lanjutkan",
    guestSignIn: "Lanjutkan sebagai Tamu",
  },
  Polski: {
    title: "Pulpit Dokumentów AI",
    auth: "Zaloguj się przez Google",
    signOut: "Wyloguj się",
    langLabel: "Język (25 obsługiwanych):",
    themeLabel: "Motyw:",
    uploadLabel: "Prześlij Dokument / Obraz",
    chooseFile: "Wybierz plik",
    noFile: "Nie wybrano pliku",
    execSummary: "Podsumowanie Menedżerskie",
    keyActions: "Kluczowe Działania",
    topTakeaways: "Główne Wnioski",
    analyzeTrends: "Analiza Trendów",
    outputLabel: "Edytowalne Wyniki:",
    outputSubtext: "Zaznacz tekst, aby wyeksportować fragment",
    inputLabel: "Dane Wejściowe / Dokument:",
    placeholder: "Zadaj pytanie lub wklej tekst...",
    submit: "Podsumuj / Czat",
    processing: "Przetwarzanie...",
    dlTxt: "📥 Pobierz .TXT",
    dlMd: "📥 Pobierz .MD",
    dlDoc: "📥 Pobierz .DOC",
    dlPng: "🖼️ Pobierz .PNG",
    modalTitle: "Zaloguj się przez Google",
    modalSub: "Uzyskaj dostęp do zapisanych obszarów",
    emailPlaceholder: "Wprowadź e-mail Google",
    continueBtn: "Kontynuuj",
    guestSignIn: "Kontynuuj jako Gość",
  },
  Svenska: {
    title: "AI-dokumentarbetsyta",
    auth: "Logga in med Google",
    signOut: "Logga ut",
    langLabel: "Språk (25 stöds):",
    themeLabel: "Tema:",
    uploadLabel: "Ladda upp dokument / bild",
    chooseFile: "Välj fil",
    noFile: "Ingen fil vald",
    execSummary: "Sammanfattning",
    keyActions: "Viktiga Åtgärder",
    topTakeaways: "Huvudinsikter",
    analyzeTrends: "Analysera Trender",
    outputLabel: "Redigerbar Utdata:",
    outputSubtext: "Markera text för att exportera vald del",
    inputLabel: "Inmatning / Dokument:",
    placeholder: "Ställ en fråga eller klistra in text...",
    submit: "Sammanfatta / Chatta",
    processing: "Bearbetar...",
    dlTxt: "📥 Ladda ner .TXT",
    dlMd: "📥 Ladda ner .MD",
    dlDoc: "📥 Ladda ner .DOC",
    dlPng: "🖼️ Ladda ner .PNG",
    modalTitle: "Logga in med Google",
    modalSub: "Få tillgång till dina sparade ytor",
    emailPlaceholder: "Ange din Google-e-post",
    continueBtn: "Fortsätt",
    guestSignIn: "Fortsätt som gäst",
  },
  Tiếng Việt: {
    title: "Bàn làm việc tài liệu AI",
    auth: "Đăng nhập bằng Google",
    signOut: "Đăng xuất",
    langLabel: "Ngôn ngữ (Hỗ trợ 25):",
    themeLabel: "Giao diện:",
    uploadLabel: "Tải lên Tài liệu / Hình ảnh",
    chooseFile: "Chọn tệp",
    noFile: "Chưa chọn tệp",
    execSummary: "Tóm tắt Điều hành",
    keyActions: "Hành động Chính",
    topTakeaways: "Điểm then chốt",
    analyzeTrends: "Phân tích Xu hướng",
    outputLabel: "Kết quả có thể chỉnh sửa:",
    outputSubtext: "Bôi đen văn bản để xuất phần đã chọn",
    inputLabel: "Văn bản nhập / Tài liệu:",
    placeholder: "Đặt câu hỏi hoặc dán văn bản...",
    submit: "Tóm tắt / Trò chuyện",
    processing: "Đang xử lý...",
    dlTxt: "📥 Tải về .TXT",
    dlMd: "📥 Tải về .MD",
    dlDoc: "📥 Tải về .DOC",
    dlPng: "🖼️ Tải về .PNG",
    modalTitle: "Đăng nhập bằng Google",
    modalSub: "Truy cập không gian làm việc của bạn",
    emailPlaceholder: "Nhập Email Google của bạn",
    continueBtn: "Tiếp tục",
    guestSignIn: "Tiếp tục với tư cách Khách",
  },
  Українська: {
    title: "Робоча область ІІ",
    auth: "Увійти через Google",
    signOut: "Вийти",
    langLabel: "Мова (підтримується 25):",
    themeLabel: "Тема:",
    uploadLabel: "Завантажити документ / фото",
    chooseFile: "Обрати файл",
    noFile: "Файл не обрано",
    execSummary: "Короткий зміст",
    keyActions: "Ключові дії",
    topTakeaways: "Головні висновки",
    analyzeTrends: "Аналіз трендів",
    outputLabel: "Редагований вивід:",
    outputSubtext: "Виділіть текст для експорту фрагмента",
    inputLabel: "Введення / Документ:",
    placeholder: "Задайте питання або вставте текст...",
    submit: "Згенерувати / Чат",
    processing: "Обробка...",
    dlTxt: "📥 Завантажити .TXT",
    dlMd: "📥 Завантажити .MD",
    dlDoc: "📥 Завантажити .DOC",
    dlPng: "🖼️ Завантажити .PNG",
    modalTitle: "Увійти через Google",
    modalSub: "Отримайте доступ до збережених проектів",
    emailPlaceholder: "Введіть email Google",
    continueBtn: "Продовжити",
    guestSignIn: "Продовжити як гість",
  },
  Ελληνικά: {
    title: "Χώρος Εργασίας Εγγράφων AI",
    auth: "Σύνδεση με Google",
    signOut: "Αποσύνδεση",
    langLabel: "Γλώσσα (25 υποστηρίζονται):",
    themeLabel: "Θέμα:",
    uploadLabel: "Μεταφόρτωση Εγγράφου / Εικόνας",
    chooseFile: "Επιλογή αρχείου",
    noFile: "Δεν επιλέχθηκε αρχείο",
    execSummary: "Περίληψη Στελεχών",
    keyActions: "Βασικές Ενέργειες",
    topTakeaways: "Κύρια Σημεία",
    analyzeTrends: "Ανάλυση Τάσεων",
    outputLabel: "Επεξεργάσιμο Αποτέλεσμα:",
    outputSubtext: "Επιλέξτε κείμενο για εξαγωγή του τμήματος",
    inputLabel: "Είσοδος / Έγγραφο:",
    placeholder: "Κάντε μια ερώτηση ή επικολλούμενο κείμενο...",
    submit: "Περίληψη / Συνομιλία",
    processing: "Επεξεργασία...",
    dlTxt: "📥 Λήψη .TXT",
    dlMd: "📥 Λήψη .MD",
    dlDoc: "📥 Λήψη .DOC",
    dlPng: "🖼️ Λήψη .PNG",
    modalTitle: "Σύνδεση με Google",
    modalSub: "Αποκτήστε πρόσβαση στους χώρους σας",
    emailPlaceholder: "Εισαγάγετε το Google Email",
    continueBtn: "Συνέχεια",
    guestSignIn: "Συνέχεια ως Επισκέπτης",
  },
  Čeština: {
    title: "AI Pracovní plocha",
    auth: "Přihlásit se přes Google",
    signOut: "Odhlásit se",
    langLabel: "Jazyk (25 podporováno):",
    themeLabel: "Motiv:",
    uploadLabel: "Nahrát Dokument / Obrázek",
    chooseFile: "Vybrat soubor",
    noFile: "Soubor nevybrán",
    execSummary: "Manažerské Shrnutí",
    keyActions: "Klíčové Akce",
    topTakeaways: "Hlavní Poznatky",
    analyzeTrends: "Analýza Trendů",
    outputLabel: "Upravitelný Výstup:",
    outputSubtext: "Zvýrazněte text pro export vybrané části",
    inputLabel: "Vstup / Dokument:",
    placeholder: "Položte dotaz nebo vložit text...",
    submit: "Shrnout / Chatovat",
    processing: "Zpracování...",
    dlTxt: "📥 Stáhnout .TXT",
    dlMd: "📥 Stáhnout .MD",
    dlDoc: "📥 Stáhnout .DOC",
    dlPng: "🖼️ Stáhnout .PNG",
    modalTitle: "Přihlásit se přes Google",
    modalSub: "Získejte přístup k uloženým složkám",
    emailPlaceholder: "Zadejte váš Google Email",
    continueBtn: "Pokračovat",
    guestSignIn: "Pokračovat jako host",
  },
  Română: {
    title: "Spațiu de Lucru Documente AI",
    auth: "Conectați-vă cu Google",
    signOut: "Deconectare",
    langLabel: "Limbă (25 suportate):",
    themeLabel: "Təmă:",
    uploadLabel: "Încărcați Document / Imagine",
    chooseFile: "Alege fișierul",
    noFile: "Niciun fișier selectat",
    execSummary: "Rezumat Executiv",
    keyActions: "Acțiuni Cheie",
    topTakeaways: "Idei Principale",
    analyzeTrends: "Analiza Trendurilor",
    outputLabel: "Rezultat Editabil:",
    outputSubtext: "Selectați textul pentru a exporta selecția",
    inputLabel: "Introducere / Document:",
    placeholder: "Puneți o întrebare sau lipiți textul...",
    submit: "Rezumat / Chat",
    processing: "Se procesează...",
    dlTxt: "📥 Descarcă .TXT",
    dlMd: "📥 Descarcă .MD",
    dlDoc: "📥 Descarcă .DOC",
    dlPng: "🖼️ Descarcă .PNG",
    modalTitle: "Conectați-vă cu Google",
    modalSub: "Accesați spațiile dvs. salvate",
    emailPlaceholder: "Introduceți e-mailul Google",
    continueBtn: "Continuă",
    guestSignIn: "Continuă ca Oaspete",
  },
  Magyar: {
    title: "AI Dokumentum Munkaterület",
    auth: "Bejelentkezés Google-fiókkal",
    signOut: "Kijelentkezés",
    langLabel: "Nyelv (25 támogatott):",
    themeLabel: "Téma:",
    uploadLabel: "Dokumentum / Kép feltöltése",
    chooseFile: "Fájl kiválasztása",
    noFile: "Nincs fájl kiválasztva",
    execSummary: "Vezetői Összefoglaló",
    keyActions: "Kulcsfontosságú Lépések",
    topTakeaways: "Fő Tanulságok",
    analyzeTrends: "Trendek Elemzése",
    outputLabel: "Szerkeszthető Eredmény:",
    outputSubtext: "Jelölje ki a szöveget a kijelölés exportálásához",
    inputLabel: "Bemenet / Dokumentum:",
    placeholder: "Tegyen fel egy kérdést vagy illessze be a szöveget...",
    submit: "Összegzés / Csevegés",
    processing: "Feldolgozás...",
    dlTxt: "📥 Letöltés .TXT",
    dlMd: "📥 Letöltés .MD",
    dlDoc: "📥 Letöltés .DOC",
    dlPng: "🖼️ Letöltés .PNG",
    modalTitle: "Bejelentkezés Google-fiókkal",
    modalSub: "Lépjen be a mentett munkaterületekre",
    emailPlaceholder: "Adja meg Google e-mail címét",
    continueBtn: "Folytatás",
    guestSignIn: "Folytatás vendégként",
  },
  Dansk: {
    title: "AI Dokument-arbejdsrum",
    auth: "Log ind med Google",
    signOut: "Log ud",
    langLabel: "Sprog (25 understøttet):",
    themeLabel: "Tema:",
    uploadLabel: "Upload Dokument / Billede",
    chooseFile: "Vælg fil",
    noFile: "Ingen fil valgt",
    execSummary: "Resumé",
    keyActions: "Vigtige Handlinger",
    topTakeaways: "Hovedpointer",
    analyzeTrends: "Analyser Tendenser",
    outputLabel: "Redigerbart Output:",
    outputSubtext: "Markér tekst for kun at eksportere det valgte",
    inputLabel: "Input / Dokument:",
    placeholder: "Stil et spørgsmål eller indsæt tekst...",
    submit: "Opsummer / Chat",
    processing: "Behandler...",
    dlTxt: "📥 Download .TXT",
    dlMd: "📥 Download .MD",
    dlDoc: "📥 Download .DOC",
    dlPng: "🖼️ Download .PNG",
    modalTitle: "Log ind med Google",
    modalSub: "Få adgang til dine gemte arbejdsområder",
    emailPlaceholder: "Indtast din Google-e-mail",
    continueBtn: "Fortsæt",
    guestSignIn: "Fortsæt som gæst",
  },
  Suomi: {
    title: "Tekoälyasiakirjan Työtila",
    auth: "Kirjaudu Google-tilillä",
    signOut: "Kirjaudu ulos",
    langLabel: "Kieli (25 tuettua):",
    themeLabel: "Teema:",
    uploadLabel: "Lataa Asiakirja / Kuva",
    chooseFile: "Valitse tiedosto",
    noFile: "Ei valittua tiedostoa",
    execSummary: "Tiivistelmä",
    keyActions: "Tärkeimmät Toimenpiteet",
    topTakeaways: "Keskeiset Havainnot",
    analyzeTrends: "Analysoi Trendit",
    outputLabel: "Muokattava Tuloste:",
    outputSubtext: "Korosta tekstiä viödäksesi vain valitun osion",
    inputLabel: "Syöte / Asiakirja:",
    placeholder: "Kysy kysymys tai liitä tekstiä...",
    submit: "Tiivistä / Chattaile",
    processing: "Käsitellään...",
    dlTxt: "📥 Lataa .TXT",
    dlMd: "📥 Lataa .MD",
    dlDoc: "📥 Lataa .DOC",
    dlPng: "🖼️ Lataa .PNG",
    modalTitle: "Kirjaudu Google-tilillä",
    modalSub: "Käytä tallennettuja työtilojasi",
    emailPlaceholder: "Syötä Google-sähköpostisi",
    continueBtn: "Jatka",
    guestSignIn: "Jatka vieraana",
  }
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
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLTextAreaElement>(null);

  const t = I18N[language] || I18N["English"];

  useEffect(() => {
    const savedUser = localStorage.getItem("app_user");
    if (savedUser) {
      try { setUser(JSON.parse(savedUser)); } catch (e) {}
    }
  }, []);

  const handleCustomSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;
    
    const newUser = { 
      name: emailInput.split("@")[0], 
      email: emailInput.trim() 
    };
    setUser(newUser);
    localStorage.setItem("app_user", JSON.stringify(newUser));
    setShowAuthModal(false);
    setEmailInput("");
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
    return output;
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
    ctx.fillStyle = theme === "dark" ? "#0f172a" : "#f8fafc";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = theme === "dark" ? "#ffffff" : "#0f172a";
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

  const isDark = theme === "dark";
  const bgMain = isDark ? "bg-slate-950 text-white" : "bg-slate-100 text-slate-900";
  const bgCard = isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm";
  const bgInner = isDark ? "bg-slate-950 border-slate-800 text-slate-200" : "bg-slate-50 border-slate-200 text-slate-900";
  const textMuted = isDark ? "text-slate-400" : "text-slate-500";
  const btnSecondary = isDark ? "bg-slate-800 hover:bg-slate-700 text-slate-200" : "bg-slate-200 hover:bg-slate-300 text-slate-800";

  return (
    <main className={`min-h-screen ${bgMain} p-4 max-w-lg mx-auto flex flex-col gap-3 relative transition-colors duration-200`}>
      <Script src="https://accounts.google.com/gsi/client" strategy="lazyOnload" />

      {/* Header */}
      <div className={`${bgCard} border p-4 rounded-2xl flex justify-between items-center`}>
        <h1 className="text-xl font-bold leading-tight">{t.title}</h1>
        {user ? (
          <div className={`flex items-center gap-2 ${bgInner} p-2 rounded-xl border`}>
            <span className="text-xs font-semibold text-blue-500 truncate max-w-[90px]">{user.name}</span>
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
            className="bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-semibold px-3 py-2.5 rounded-xl transition shadow-lg shadow-blue-600/20 text-center"
          >
            {t.auth}
          </button>
        )}
      </div>

      {/* Controls */}
      <div className="grid grid-cols-2 gap-3">
        <div className={`${bgCard} border p-3.5 rounded-2xl flex flex-col gap-2`}>
          <label className={`text-xs ${textMuted} font-medium`}>{t.langLabel}</label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className={`${bgInner} border rounded-xl p-2.5 text-xs font-medium outline-none focus:border-blue-500`}
          >
            {LANGUAGES.map((lang) => (
              <option key={lang} value={lang}>{lang}</option>
            ))}
          </select>
        </div>

        <div className={`${bgCard} border p-3.5 rounded-2xl flex flex-col gap-2`}>
          <label className={`text-xs ${textMuted} font-medium`}>{t.themeLabel}</label>
          <div className="flex items-center gap-3 mt-1">
            <button
              onClick={() => setTheme("dark")}
              className={`w-8 h-8 rounded-full bg-slate-950 border-2 transition ${isDark ? "border-blue-500 ring-2 ring-blue-500/30 scale-105" : "border-slate-700 opacity-60"}`}
            />
            <button
              onClick={() => setTheme("light")}
              className={`w-8 h-8 rounded-full bg-white border-2 transition ${!isDark ? "border-blue-500 ring-2 ring-blue-500/30 scale-105" : "border-slate-300 opacity-60"}`}
            />
          </div>
        </div>
      </div>

      {/* File Upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".txt,.md,.pdf,.doc,.docx,image/*"
        className="hidden"
      />
      <div className={`${bgCard} border p-4 rounded-2xl flex flex-col gap-2`}>
        <label className={`text-xs ${textMuted} font-medium`}>{t.uploadLabel}</label>
        <div className={`flex items-center justify-between ${bgInner} border p-2.5 rounded-xl`}>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2 rounded-lg transition"
          >
            {t.chooseFile}
          </button>
          <span className={`text-xs ${textMuted} truncate max-w-[160px]`}>
            {fileName || t.noFile}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => handleGenerate("Executive Summary")}
          className={`${bgCard} border hover:border-blue-500/50 p-4 rounded-2xl flex items-center gap-3 text-left transition`}
        >
          <span className="text-lg">📋</span>
          <span className="text-xs font-semibold leading-tight">{t.execSummary}</span>
        </button>
        <button
          onClick={() => handleGenerate("Key Action Items")}
          className={`${bgCard} border hover:border-blue-500/50 p-4 rounded-2xl flex items-center gap-3 text-left transition`}
        >
          <span className="text-lg">✅</span>
          <span className="text-xs font-semibold leading-tight">{t.keyActions}</span>
        </button>
        <button
          onClick={() => handleGenerate("Top Takeaways")}
          className={`${bgCard} border hover:border-blue-500/50 p-4 rounded-2xl flex items-center gap-3 text-left transition`}
        >
          <span className="text-lg">💡</span>
          <span className="text-xs font-semibold leading-tight">{t.topTakeaways}</span>
        </button>
        <button
          onClick={() => handleGenerate("Analyze Trends")}
          className={`${bgCard} border hover:border-blue-500/50 p-4 rounded-2xl flex items-center gap-3 text-left transition`}
        >
          <span className="text-lg">📊</span>
          <span className="text-xs font-semibold leading-tight">{t.analyzeTrends}</span>
        </button>
      </div>

      {/* Output Panel */}
      <div className={`${bgCard} border p-4 rounded-2xl flex flex-col gap-3`}>
        <div className="flex justify-between items-center">
          <span className={`text-xs font-semibold ${textMuted}`}>{t.outputLabel}</span>
          <span className={`text-[10px] ${textMuted}`}>{t.outputSubtext}</span>
        </div>
        <textarea
          ref={outputRef}
          value={output}
          onChange={(e) => setOutput(e.target.value)}
          placeholder={t.outputLabel}
          className={`w-full h-36 ${bgInner} border rounded-xl p-3 text-sm focus:outline-none resize-none font-mono`}
        />

        <div className="grid grid-cols-2 gap-2">
          <button onClick={downloadTxt} className={`${btnSecondary} text-xs py-2.5 rounded-xl transition`}>{t.dlTxt}</button>
          <button onClick={downloadMd} className={`${btnSecondary} text-xs py-2.5 rounded-xl transition`}>{t.dlMd}</button>
          <button onClick={downloadDoc} className={`${btnSecondary} text-xs py-2.5 rounded-xl transition`}>{t.dlDoc}</button>
          <button onClick={downloadPng} className="bg-blue-600 text-xs py-2.5 rounded-xl font-semibold text-white hover:bg-blue-500 transition">{t.dlPng}</button>
        </div>
      </div>

      {/* Input Panel */}
      <div className={`${bgCard} border p-4 rounded-2xl flex flex-col gap-3`}>
        <label className={`text-xs font-medium ${textMuted}`}>{t.inputLabel}</label>
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={t.placeholder}
          className={`w-full h-32 ${bgInner} border rounded-xl p-3 text-sm focus:outline-none focus:border-blue-500 resize-none`}
        />
        <button
          onClick={() => handleGenerate("General Chat")}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-50 py-3 rounded-xl text-sm font-semibold transition shadow-lg shadow-blue-600/20"
        >
          {loading ? t.processing : t.submit}
        </button>
      </div>

      {/* Auth Modal Overlay */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`${bgCard} border rounded-2xl p-6 w-full max-w-sm flex flex-col gap-4 relative shadow-2xl`}>
            <button
              onClick={() => setShowAuthModal(false)}
              className={`absolute top-4 right-4 ${textMuted} hover:text-red-500 font-bold text-sm`}
            >
              ✕
            </button>

            <div className="flex flex-col items-center text-center gap-1">
              <svg className="w-8 h-8 my-1" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <h2 className="text-lg font-bold">{t.modalTitle}</h2>
              <p className={`text-xs ${textMuted}`}>{t.modalSub}</p>
            </div>

            <form onSubmit={handleCustomSignIn} className="flex flex-col gap-3">
              <input
                type="email"
                required
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder={t.emailPlaceholder}
                className={`w-full ${bgInner} border rounded-xl p-3 text-sm outline-none focus:border-blue-500`}
              />
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2.5 rounded-xl text-sm transition"
              >
                {t.continueBtn}
              </button>
            </form>

            <button
              onClick={() => setShowAuthModal(false)}
              className={`${btnSecondary} w-full py-2.5 rounded-xl text-xs transition`}
            >
              {t.guestSignIn}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
