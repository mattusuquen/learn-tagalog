"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useConversation } from "@elevenlabs/react";

import { createConversation, saveMessage } from "@/app/actions/conversations";
import type { TranscriptTurn, VoiceStatus } from "@/lib/types";

// The ONE seam that hides ElevenLabs. Components import this hook and the clean
// interface below; none of them touch @elevenlabs/react directly. Swapping the
// provider (or mocking it in tests) means rewriting only this file.
//
// Must be called inside a <ConversationProvider> (see voice-agent.tsx).

// Overrides the agent's opening line. Requires "First message" overrides enabled
// in the agent's Security settings in the ElevenLabs dashboard, else ignored.
const FIRST_MESSAGE =
  "Hi, I am your personal Tagalog coach. Let's start off by understanding your proficiency. Would you like me to continue in english or switch to tagalog for the lessons?";

export interface VoiceSession {
  status: VoiceStatus;
  isMuted: boolean;
  /** Both tutor and learner turns, in arrival order. */
  transcript: TranscriptTurn[];
  /** Seconds since the current session connected (0 when not live). */
  elapsedSeconds: number;
  error: string | null;
  /** The opening line the tutor will say — useful as a pre-session preview. */
  firstMessage: string;
  start: () => Promise<void>;
  end: () => Promise<void>;
  toggleMute: () => void;
  /** Live mic frequency data for the waveform, or null when not connected. */
  getInputFrequencies: () => Uint8Array | null;
}

export function useVoiceSession(): VoiceSession {
  const [transcript, setTranscript] = useState<TranscriptTurn[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // DB conversation id for this session, kept in a ref so onMessage always sees
  // the latest value. Persistence is best-effort and must never break the call.
  const conversationIdRef = useRef<string | null>(null);
  const turnSeq = useRef(0);

  const conversation = useConversation({
    onMessage: ({ message, source }) => {
      const role = source === "ai" ? "tutor" : "learner";
      setTranscript((prev) => [
        ...prev,
        {
          id: `${Date.now()}-${turnSeq.current++}`,
          role,
          text: message,
          timestamp: Date.now(),
        },
      ]);

      const convId = conversationIdRef.current;
      if (convId) {
        void saveMessage(
          convId,
          role === "tutor" ? "assistant" : "user",
          message,
        ).catch((err) => console.error("saveMessage error", err));
      }
    },
    onError: (message) => {
      console.error("conversation error:", message);
      setError(
        `Voice connection error: ${
          typeof message === "string" ? message : JSON.stringify(message)
        }`,
      );
    },
  });

  const {
    status,
    isSpeaking,
    isMuted,
    setMuted,
    startSession,
    endSession,
    getInputByteFrequencyData,
  } = conversation;

  const connected = status === "connected";
  const connecting = status === "connecting";

  // Session timer: tick once a second while connected, reset when it ends.
  useEffect(() => {
    if (!connected) return;
    const startedAt = Date.now();
    const id = window.setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startedAt) / 1000));
    }, 1000);
    return () => window.clearInterval(id);
  }, [connected]);

  const start = useCallback(async () => {
    setError(null);
    setTranscript([]);
    setElapsedSeconds(0);
    try {
      // Prompt for mic + negotiate WebRTC.
      await navigator.mediaDevices.getUserMedia({ audio: true });

      // Short-lived token from our server, which holds the API key + agent id —
      // the browser never sees either.
      const res = await fetch("/api/token");
      const data = await res.json();
      if (!res.ok || !data.token) {
        throw new Error(data.error ?? "Couldn't get a conversation token");
      }

      // Open a DB conversation so transcript lines can be saved as they arrive.
      conversationIdRef.current = await createConversation();

      await startSession({
        conversationToken: data.token,
        connectionType: "webrtc",
        overrides: { agent: { firstMessage: FIRST_MESSAGE } },
      });
    } catch (err) {
      console.error(err);
      setError("Couldn't start the conversation. Check microphone access.");
      conversationIdRef.current = null;
    }
  }, [startSession]);

  const end = useCallback(async () => {
    await endSession();
    conversationIdRef.current = null;
  }, [endSession]);

  const toggleMute = useCallback(() => {
    setMuted(!isMuted);
  }, [setMuted, isMuted]);

  const getInputFrequencies = useCallback((): Uint8Array | null => {
    if (!connected) return null;
    try {
      return getInputByteFrequencyData();
    } catch {
      return null;
    }
  }, [connected, getInputByteFrequencyData]);

  // Map the SDK status onto our SDK-agnostic VoiceStatus.
  let voiceStatus: VoiceStatus;
  if (connecting) voiceStatus = "connecting";
  else if (connected) voiceStatus = isSpeaking ? "speaking" : "listening";
  // Disconnected: "ended" once there are turns from a finished session, else idle.
  else voiceStatus = transcript.length > 0 ? "ended" : "idle";

  return {
    status: voiceStatus,
    isMuted,
    transcript,
    elapsedSeconds,
    error,
    firstMessage: FIRST_MESSAGE,
    start,
    end,
    toggleMute,
    getInputFrequencies,
  };
}
