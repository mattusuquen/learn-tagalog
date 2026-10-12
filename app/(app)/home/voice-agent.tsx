"use client";

import { useEffect, useRef } from "react";
import { ConversationProvider } from "@elevenlabs/react";
import { Loader2, Mic, MicOff, PhoneOff } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Toggle } from "@/components/ui/toggle";
import { cn } from "@/lib/utils";
import type { VoiceStatus } from "@/lib/types";

import { TutorAvatar, type TutorAvatarState } from "./tutor-avatar";
import { useVoiceSession } from "./use-voice-session";
import { Waveform } from "./waveform";

function avatarState(status: VoiceStatus): TutorAvatarState {
  if (status === "speaking") return "speaking";
  if (status === "listening") return "listening";
  return "idle";
}

const STATUS_LABEL: Record<VoiceStatus, string> = {
  idle: "Idle",
  connecting: "Connecting…",
  listening: "Listening",
  speaking: "Speaking",
  ended: "Session ended",
};

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function VoiceAgentInner() {
  const session = useVoiceSession();
  const { status } = session;
  const live = status === "connecting" || status === "listening" || status === "speaking";
  const connecting = status === "connecting";

  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [session.transcript.length]);

  return (
    <div className="flex flex-col gap-4">
      {/* Stage: avatar, waveform, controls */}
      <Card>
        <CardContent className="flex flex-col items-center gap-6 py-8">
          <div className="flex w-full items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="leading-tight">
                <div className="text-sm font-semibold">Meet Kuya</div>
                <div className="text-xs text-muted-foreground">
                  Your AI Tagalog tutor
                </div>
              </div>
            </div>
            <Badge
              variant={live ? "default" : "secondary"}
              className={cn("gap-1.5", !live && "text-muted-foreground")}
            >
              <span
                className={cn(
                  "size-1.5 rounded-full",
                  live ? "bg-primary-foreground" : "bg-muted-foreground",
                )}
              />
              {STATUS_LABEL[status]}
            </Badge>
          </div>

          <TutorAvatar state={avatarState(status)} className="my-2" />

          <Waveform
            active={status === "listening" || status === "speaking"}
            getFrequencies={session.getInputFrequencies}
            className="max-w-sm"
          />

          {/* Controls */}
          <div className="flex items-center gap-4">
            <Toggle
              aria-label={session.isMuted ? "Unmute microphone" : "Mute microphone"}
              pressed={session.isMuted}
              onPressedChange={session.toggleMute}
              disabled={!live}
              variant="outline"
              size="lg"
            >
              {session.isMuted ? <MicOff /> : <Mic />}
            </Toggle>

            <Button
              size="lg"
              variant={live ? "destructive" : "default"}
              className="h-14 min-w-44 rounded-full text-base"
              onClick={() => (live ? session.end() : session.start())}
              disabled={connecting}
            >
              {connecting ? (
                <>
                  <Loader2 className="animate-spin" /> Connecting…
                </>
              ) : live ? (
                <>
                  <PhoneOff /> End session
                </>
              ) : (
                <>
                  <Mic /> Start session
                </>
              )}
            </Button>

            <span
              className="min-w-12 text-sm tabular-nums text-muted-foreground"
              aria-label="Session time"
            >
              {formatTime(session.elapsedSeconds)}
            </span>
          </div>

          {session.error && (
            <p className="text-center text-sm text-destructive">{session.error}</p>
          )}
        </CardContent>
      </Card>

      {/* Transcript */}
      <Card>
        <CardContent className="py-4">
          <div className="mb-2 text-sm font-semibold">Transcript</div>
          <ScrollArea className="h-72 pr-3">
            {session.transcript.length === 0 ? (
              <div className="flex h-64 flex-col items-center justify-center gap-1 text-center text-sm text-muted-foreground">
                <p>No conversation yet.</p>
                <p className="text-xs">
                  Start a session and your turns with Kuya will appear here.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {session.transcript.map((turn) => {
                  const tutor = turn.role === "tutor";
                  return (
                    <div
                      key={turn.id}
                      className={cn("flex", tutor ? "justify-start" : "justify-end")}
                    >
                      <div
                        className={cn(
                          "max-w-[85%] rounded-xl px-3 py-2 text-sm",
                          tutor
                            ? "bg-accent text-accent-foreground"
                            : "bg-primary text-primary-foreground",
                        )}
                      >
                        <div className="mb-0.5 text-xs opacity-70">
                          {tutor ? "Kuya" : "You"}
                        </div>
                        {turn.text}
                      </div>
                    </div>
                  );
                })}
                <div ref={endRef} />
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}

export function VoiceAgent() {
  return (
    <ConversationProvider>
      <VoiceAgentInner />
    </ConversationProvider>
  );
}
