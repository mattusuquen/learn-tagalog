"use client";

import { useRef, useState } from "react";
import { ConversationProvider, useConversation } from "@elevenlabs/react";
import { createConversation, saveMessage } from "@/app/actions/conversations";

// Overrides the agent's opening line for this session. Requires "First message"
// overrides to be enabled in the agent's Security settings in the ElevenLabs
// dashboard, otherwise it is ignored. Also used as the preview text in the tutor
// box before a session connects.
const FIRST_MESSAGE =
  "Hi, I am your personal Tagalog coach. Let's start off by understanding your proficiency. Would you like me to continue in english or switch to tagalog for the lessons?";

// Static, decorative waveform (the volume-reactive version is a deferred feature).
// A fixed set of bar heights rendered as thin rounded columns.
const BAR_HEIGHTS = [6, 10, 14, 8, 16, 11, 7, 13, 9, 15, 10, 6, 12, 8, 14, 9];

function Waveform() {
  return (
    <div className="flex items-center gap-0.5" aria-hidden>
      {BAR_HEIGHTS.map((h, i) => (
        <span
          key={i}
          className="w-0.5 rounded-full bg-[#86c7a6]"
          style={{ height: `${h}px` }}
        />
      ))}
    </div>
  );
}

function Card() {
  // Only the latest tutor line is shown in the box (design choice). The full
  // transcript is still persisted turn-by-turn via saveMessage below.
  const [latestAssistant, setLatestAssistant] = useState<string | null>(null);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  // Holds the current conversation's DB id so each transcript line can be
  // persisted. Kept in a ref so the onMessage callback always sees the latest.
  const conversationIdRef = useRef<string | null>(null);

  const conversation = useConversation({
    onMessage: ({ message, source }) => {
      const role = source === "ai" ? "assistant" : "user";

      // Show only the tutor's most recent line in the card.
      if (role === "assistant") {
        setLatestAssistant(message);
      }

      // Best-effort persistence — never block or break the live session.
      const convId = conversationIdRef.current;
      if (convId) {
        void saveMessage(convId, role, message).catch((err) =>
          console.error("saveMessage error", err),
        );
      }
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

  async function handleMicTap() {
    setVoiceError(null);

    if (connected || connecting) {
      await endSession();
      conversationIdRef.current = null;
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

      // Start a DB conversation so transcript lines can be saved as they arrive.
      conversationIdRef.current = await createConversation();

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

  // Status badge reflects the live session.
  const statusLabel = connecting
    ? "Connecting…"
    : connected
      ? isSpeaking
        ? "Speaking"
        : "Listening"
      : "Idle";
  const live = connected || connecting;

  const micLabel = connecting
    ? "Connecting…"
    : connected
      ? "Tap to end"
      : "Tap to speak";

  // Before the tutor has said anything, preview the opening line.
  const tutorText = latestAssistant ?? FIRST_MESSAGE;

  return (
    <div className="rounded-2xl border border-[#e5e7eb] bg-white p-5 shadow-sm">
      {/* Card header: tutor identity + live status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#fde8e8]">
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6 text-[#c98a8a]">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold text-[#1a1a1a]">Meet Kuya</div>
            <div className="text-xs text-[#6b7280]">Your AI Tagalog tutor</div>
          </div>
        </div>

        <span
          className={
            "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium " +
            (live
              ? "bg-[#e8f5ef] text-[#15803d]"
              : "bg-[#f3f4f6] text-[#6b7280]")
          }
        >
          <span
            className={
              "h-1.5 w-1.5 rounded-full " +
              (live ? "bg-[#15803d]" : "bg-[#9ca3af]")
            }
          />
          {statusLabel}
        </span>
      </div>

      {/* Tutor message box: latest tutor line. Play/speaker are decorative —
          audio replay is a cut Pile-B feature, not wired up. */}
      <div className="mt-4 rounded-xl border border-[#d9efe3] bg-[#f1faf5] p-4">
        <div className="flex items-start gap-3">
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#15803d] text-white"
            aria-hidden
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-base font-medium text-[#1a1a1a]">{tutorText}</p>
            <div className="mt-2">
              <Waveform />
            </div>
          </div>

          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.75}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4 shrink-0 text-[#9ca3af]"
            aria-hidden
          >
            <path d="M11 5 6 9H2v6h4l5 4zM15.5 8.5a5 5 0 0 1 0 7M19 5a8 8 0 0 1 0 14" />
          </svg>
        </div>
      </div>

      {/* Respond prompt + mic control */}
      <div className="mt-6 flex flex-col items-center">
        <span className="text-xs text-[#9ca3af]">Respond in Tagalog</span>

        <button
          type="button"
          onClick={handleMicTap}
          aria-label={connected ? "End conversation" : "Tap to speak"}
          className={
            "mt-3 flex h-16 w-16 items-center justify-center rounded-full bg-[#15803d] text-white shadow-sm transition hover:bg-[#126c34] " +
            (live ? "ring-4 ring-[#15803d]/20 " + (connected ? "animate-pulse" : "") : "")
          }
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.75}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-7 w-7"
          >
            <path d="M12 15a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v3" />
          </svg>
        </button>

        <span className="mt-2 text-sm font-medium text-[#1a1a1a]">{micLabel}</span>
        <span className="mt-0.5 text-xs text-[#9ca3af]">
          Try: &ldquo;Gusto ko ng kape, pakiusap.&rdquo;
        </span>
      </div>

      {voiceError && (
        <div className="mt-3 text-center text-sm text-red-500">{voiceError}</div>
      )}

      {/* Footer: hint + continue (both static / decorative for now) */}
      <div className="mt-5 flex items-center justify-between border-t border-[#e5e7eb] pt-4">
        <button
          type="button"
          className="flex items-center gap-1.5 text-sm text-[#6b7280] transition hover:text-[#1a1a1a]"
        >
          <span aria-hidden>💡</span> Need a hint?
        </button>
        <button
          type="button"
          className="flex items-center gap-1.5 rounded-lg bg-[#1a1a1a] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#333]"
        >
          Continue
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
          >
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default function LessonCard() {
  return (
    <ConversationProvider>
      <Card />
    </ConversationProvider>
  );
}
