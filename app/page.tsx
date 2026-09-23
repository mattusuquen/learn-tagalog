"use client";

import { useRef, useState } from "react";
import { ThinkingOrb, type OrbState } from "thinking-orbs";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  async function sendText(text: string) {
    const nextMessages: Message[] = [...messages, { role: "user", content: text }];
    setMessages(nextMessages);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Request failed");
      }

      setMessages([...nextMessages, { role: "assistant", content: data.text }]);
      playReply(data.text);
    } catch (err) {
      setMessages([
        ...nextMessages,
        {
          role: "assistant",
          content: `Error: ${err instanceof Error ? err.message : "Something went wrong"}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function playReply(text: string) {
    try {
      const res = await fetch("/api/text-to-speech", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) {
        throw new Error("Text-to-speech request failed");
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.onended = () => URL.revokeObjectURL(url);
      await audio.play();
    } catch (err) {
      console.error(err);
      setVoiceError("Couldn't play the voice reply.");
    }
  }

  async function startRecording() {
    setVoiceError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
        await transcribeAndSend(blob);
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      setRecording(true);
    } catch (err) {
      console.error(err);
      setVoiceError("Couldn't access the microphone.");
    }
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  }

  async function transcribeAndSend(blob: Blob) {
    setTranscribing(true);
    try {
      const formData = new FormData();
      formData.append("audio", blob, "recording.webm");

      const res = await fetch("/api/speech-to-text", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Transcription failed");
      }

      const text = (data.text ?? "").trim();
      if (text) {
        await sendText(text);
      }
    } catch (err) {
      console.error(err);
      setVoiceError("Couldn't transcribe audio.");
    } finally {
      setTranscribing(false);
    }
  }

  function handleOrbTap() {
    if (recording) {
      stopRecording();
    } else {
      startRecording();
    }
  }

  const orbState: OrbState = recording
    ? "listening"
    : transcribing
      ? "searching"
      : loading
        ? "solving"
        : "breathing";

  return (
    // Page wrapper — dark color scheme with a blue accent, centers the chat column horizontally
    <div className="flex flex-1 flex-col items-center bg-[#0f1115]">
      {/* Chat container — capped width, fills available height */}
      <div className="flex w-full max-w-2xl flex-1 flex-col">
        {/* Header — agent icon centered at the top */}
        <header className="flex items-center justify-center px-4 py-4">
          {/* Generic user icon standing in for the tutor's avatar */}
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#1e2a3a]">
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7 text-[#60a5fa]">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          </div>
        </header>

        {/* Message history — scrolls independently as messages pile up */}
        <div className="flex-1 space-y-3 overflow-y-auto px-4 py-2">
          {messages.map((m, i) => (
            // One row per message; user messages align right, assistant left
            <div
              key={i}
              className={m.role === "user" ? "text-right" : "text-left"}
            >
              {/* Message bubble — color/alignment differ by sender */}
              <span
                className={
                  "inline-block max-w-[80%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-gray-100 " +
                  (m.role === "user" ? "bg-[#1e2a3a]" : "bg-[#1c1f24]")
                }
              >
                {m.content}
              </span>
            </div>
          ))}
          {/* Transient "typing" indicator shown while awaiting the API response */}
          {loading && (
            <div className="text-left">
              <span className="inline-flex items-center gap-1 rounded-2xl bg-[#1c1f24] px-4 py-3">
                <span className="h-2 w-2 animate-bounce rounded-full bg-gray-500" style={{ animationDelay: "0ms" }} />
                <span className="h-2 w-2 animate-bounce rounded-full bg-gray-500" style={{ animationDelay: "150ms" }} />
                <span className="h-2 w-2 animate-bounce rounded-full bg-gray-500" style={{ animationDelay: "300ms" }} />
              </span>
            </div>
          )}
        </div>

        {/* Composer — Show Translation and End Chat are decorative only; the orb is the real control */}
        <div className="grid grid-cols-3 items-center gap-2 px-4 pb-8 pt-4">
          

          <div className="col-start-2 flex flex-col items-center justify-self-center gap-2">
            <button
              type="button"
              onClick={handleOrbTap}
              disabled={loading || transcribing}
              aria-label={recording ? "Stop recording" : "Tap to speak"}
              className="flex h-20 w-20 cursor-pointer items-center justify-center transition disabled:cursor-not-allowed disabled:opacity-60"
            >
              <ThinkingOrb state={orbState} size={64} theme="dark" color="#60a5fa" />
            </button>
            <span className="text-sm text-gray-400">Tap to speak</span>
          </div>

          
        </div>
        {/* Short inline error for mic/voice failures */}
        {voiceError && <div className="px-4 pb-4 text-center text-sm text-red-400">{voiceError}</div>}
      </div>
    </div>
  );
}
