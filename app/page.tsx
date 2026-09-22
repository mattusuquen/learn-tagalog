"use client";

import { useRef, useState } from "react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
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

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    await sendText(text);
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

  function handleMicClick() {
    if (recording) {
      stopRecording();
    } else {
      startRecording();
    }
  }

  return (
    // Page wrapper — centers the chat column horizontally
    <div className="flex flex-1 flex-col items-center">
      {/* Chat container — capped width, fills available height, padded */}
      <div className="flex w-full max-w-2xl flex-1 flex-col p-4">
        {/* Message history — scrolls independently as messages pile up */}
        <div className="flex-1 space-y-3 overflow-y-auto py-4">
          {messages.map((m, i) => (
            // One row per message; user messages align right, assistant left
            <div
              key={i}
              className={m.role === "user" ? "text-right" : "text-left"}
            >
              {/* Message bubble — color/alignment differ by sender */}
              <span
                className={
                  "inline-block max-w-[80%] whitespace-pre-wrap rounded-lg px-3 py-2 " +
                  (m.role === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-black")
                }
              >
                {m.content}
              </span>
            </div>
          ))}
          {/* Transient "typing" indicator shown while awaiting the API response */}
          {loading && <div className="text-left text-sm text-gray-500">Thinking…</div>}
        </div>

        {/* Composer — text input + send button, submits via sendMessage */}
        <form onSubmit={sendMessage} className="flex gap-2 pt-2">
          {/* Message input, controlled by the `input` state */}
          <input
            className="flex-1 rounded border border-gray-300 px-3 py-2 focus:outline-none"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message…"
            disabled={loading || recording}
          />
          {/* Mic button — push-to-talk voice input */}
          <button
            type="button"
            onClick={handleMicClick}
            disabled={loading || transcribing}
            className={
              "rounded px-4 py-2 text-white disabled:opacity-50 " +
              (recording ? "bg-red-600" : "bg-gray-600")
            }
          >
            {recording ? "Stop" : transcribing ? "…" : "🎤"}
          </button>
          {/* Send button — disabled while loading or when input is empty */}
          <button
            type="submit"
            className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
            disabled={loading || recording || !input.trim()}
          >
            Send
          </button>
        </form>
        {/* Short inline error for mic/voice failures */}
        {voiceError && <div className="pt-1 text-sm text-red-600">{voiceError}</div>}
      </div>
    </div>
  );
}
