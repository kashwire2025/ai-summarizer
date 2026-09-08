// Text-to-Speech utility
export const speakText = (text: string) => {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  }
};

// Direct Telegram sharing utility
export const shareToTelegram = (text: string) => {
  if (typeof window !== "undefined") {
    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(text)}`;
    window.open(shareUrl, "_blank");
  }
};

// Direct WhatsApp sharing utility
export const shareToWhatsApp = (text: string) => {
  if (typeof window !== "undefined") {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  }
};

// Copy to clipboard utility
export const copyToClipboard = async (text: string) => {
  if (typeof navigator !== "undefined" && navigator.clipboard) {
    await navigator.clipboard.writeText(text);
  }
};

// History Utility: Save summary locally
export const saveSummaryToHistory = (title: string, summaryText: string) => {
  if (typeof window === "undefined") return;
  const existingHistory = getSummaryHistory();
  const newItem = {
    id: Date.now().toString(),
    title: title || "Document Summary",
    text: summaryText,
    date: new Date().toLocaleString(),
  };
  const updatedHistory = [newItem, ...existingHistory];
  localStorage.setItem("doc_workbench_history", JSON.stringify(updatedHistory));
};

// History Utility: Get all saved summaries
export const getSummaryHistory = () => {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem("doc_workbench_history");
  return stored ? JSON.parse(stored) : [];
};

// History Utility: Clear all saved history
export const clearSummaryHistory = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem("doc_workbench_history");
};
