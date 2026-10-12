import { GraduationCap } from "lucide-react";

import { cn } from "@/lib/utils";

// Placeholder tutor avatar with a deliberately small prop surface so a real
// lip-syncing avatar can drop in later.
// TODO(integration): replace the inner circle with a rendered/animated avatar
// driven by `state` (and, eventually, an audio-level/viseme stream).

export type TutorAvatarState = "idle" | "listening" | "speaking";

export function TutorAvatar({
  state,
  className,
}: {
  state: TutorAvatarState;
  className?: string;
}) {
  const speaking = state === "speaking";
  const listening = state === "listening";

  return (
    <div
      className={cn("relative flex items-center justify-center", className)}
      role="img"
      aria-label={`Tutor is ${state}`}
    >
      {/* Ripple rings while speaking */}
      {speaking && (
        <>
          <span className="absolute inline-flex size-32 animate-ping rounded-full bg-primary/20 [animation-duration:1.6s] motion-reduce:animate-none" />
          <span className="absolute inline-flex size-40 animate-ping rounded-full bg-primary/10 [animation-duration:1.6s] [animation-delay:0.4s] motion-reduce:animate-none" />
        </>
      )}

      {/* Soft pulse while listening */}
      {listening && (
        <span className="absolute inline-flex size-36 animate-pulse rounded-full bg-primary/15 motion-reduce:animate-none" />
      )}

      {/* Static halo at idle */}
      <span
        className={cn(
          "absolute size-32 rounded-full border transition-colors",
          state === "idle" ? "border-border" : "border-primary/30",
        )}
      />

      <div
        className={cn(
          "relative flex size-28 items-center justify-center rounded-full bg-gradient-to-br from-primary to-emerald-700 text-primary-foreground shadow-sm transition-transform",
          speaking && "scale-105",
        )}
      >
        <GraduationCap className="size-12" />
      </div>
    </div>
  );
}
