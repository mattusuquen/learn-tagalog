// Speak a Tagalog string using the browser's built-in speech synthesis. This is
// a zero-backend stand-in for pronunciation audio.
// TODO(integration): swap for recorded native-speaker audio when available.
export function speakTagalog(text: string): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "fil-PH"; // Filipino; falls back to a default voice if absent.
  utterance.rate = 0.95;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}
