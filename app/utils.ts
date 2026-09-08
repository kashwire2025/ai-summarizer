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
