"use client";

import { useState } from "react";
import {
  ConversationProvider,
  useConversation,
} from "@elevenlabs/react";
import { ThinkingOrb, type OrbState } from "thinking-orbs";

type Message = {
  role: "user" | "assistant";
  content: string;
};

// Overrides the agent's opening line for this session. Requires "First message"
// overrides to be enabled in the agent's Security settings in the ElevenLabs
// dashboard, otherwise it is ignored.
const FIRST_MESSAGE =
  "Kumusta! Ako si Kuya Tutor. Handa ka na bang mag-aral ng Tagalog ngayon?";

function VoiceChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [voiceError, setVoiceError] = useState<string | null>(null);

  const conversation = useConversation({
    onMessage: ({ message, source }) => {
      setMessages((prev) => [
        ...prev,
        { role: source === "ai" ? "assistant" : "user", content: message },
      ]);
    },
    onError: (message, context) => {
      console.error("conversation error:", message, context);
      setVoiceError(
        `Voice connection error: ${typeof message === "string" ? message : JSON.stringify(message)
        }`,
      );
    },
    onDisconnect: (details) => {
      console.error("conversation disconnected:", JSON.stringify(details, null, 2));
    },
  });

  const { status, isSpeaking, startSession, endSession } = conversation;
  const connected = status === "connected";
  const connecting = status === "connecting";

  async function handleOrbTap() {
    setVoiceError(null);

    if (connected || connecting) {
      await endSession();
      return;
    }

    try {
      // The SDK prompts for mic access and negotiates the WebRTC connection.
      await navigator.mediaDevices.getUserMedia({ audio: true });

      // Fetch a short-lived token from our server, which holds the API key and
      // agent ID — the browser never sees either.
      const res = await fetch("/api/token");
      const data = await res.json();
      if (!res.ok || !data.token) {
        throw new Error(data.error ?? "Couldn't get a conversation token");
      }

      await startSession({
        conversationToken: data.token,
        connectionType: "webrtc",
        overrides: {
          agent: {
            firstMessage: FIRST_MESSAGE,
          },
        },
      });
    } catch (err) {
      console.error(err);
      setVoiceError("Couldn't start the conversation. Check microphone access.");
    }
  }

  // Orb reflects the live agent state: connecting → searching, agent talking →
  // solving, listening for the student → listening, otherwise idle.
  const orbState: OrbState = connecting
    ? "searching"
    : connected
      ? isSpeaking
        ? "solving"
        : "listening"
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
        </div>

        {/* Composer — the orb is the single control: tap to connect/disconnect the agent */}
        <div className="grid grid-cols-3 items-center gap-2 px-4 pb-8 pt-4">
          <div className="col-start-2 flex flex-col items-center justify-self-center gap-2">
            <button
              type="button"
              onClick={handleOrbTap}
              aria-label={connected ? "End conversation" : "Tap to speak"}
              className="flex h-20 w-20 cursor-pointer items-center justify-center transition disabled:cursor-not-allowed disabled:opacity-60"
            >
              <ThinkingOrb state={orbState} size={64} theme="dark" color="#60a5fa" />
            </button>
            <span className="text-sm text-gray-400">
              {connected ? "Tap to end" : connecting ? "Connecting…" : "Tap to speak"}
            </span>
          </div>
        </div>
        {/* Short inline error for mic/voice failures */}
        {voiceError && <div className="px-4 pb-4 text-center text-sm text-red-400">{voiceError}</div>}
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <ConversationProvider>
      <VoiceChat />
    </ConversationProvider>
  );
}
