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
