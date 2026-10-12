"use client";

import { useEffect, useRef } from "react";

import { cn } from "@/lib/utils";

// Mic input visualizer. Driven by a `getFrequencies` prop so it stays decoupled
// from the audio source — today it reads the real ElevenLabs input frequency
// data; a different source just needs to return a Uint8Array.
//
// When not `active`, it shows a calm idle animation. Respects
// prefers-reduced-motion by rendering a static baseline instead of animating.

const BAR_COUNT = 48;

export function Waveform({
  getFrequencies,
  active = false,
  className,
}: {
  getFrequencies?: () => Uint8Array | null;
  active?: boolean;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let raf = 0;
    let t = 0;

    const accent =
      getComputedStyle(canvas).getPropertyValue("color").trim() || "#15803d";

    function draw() {
      // Non-null: guarded above, but re-check for TS inside the closure.
      if (!canvas || !ctx) return;
      const dpr = window.devicePixelRatio || 1;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        ctx.scale(dpr, dpr);
      }

      ctx.clearRect(0, 0, w, h);

      const freq = active ? getFrequencies?.() ?? null : null;
      const gap = 2;
      const barWidth = (w - gap * (BAR_COUNT - 1)) / BAR_COUNT;
      const mid = h / 2;

      for (let i = 0; i < BAR_COUNT; i++) {
        let amp: number;
        if (freq && freq.length > 0) {
          // Sample across the frequency bins.
          const v = freq[Math.floor((i / BAR_COUNT) * freq.length)] ?? 0;
          amp = (v / 255) * (h * 0.9);
        } else if (reduceMotion) {
          amp = h * 0.12;
        } else {
          // Calm idle wave.
          const base = active ? 0.25 : 0.14;
          amp =
            (base + 0.1 * Math.sin(t / 18 + i / 3) + 0.06 * Math.sin(i / 2)) * h;
        }
        amp = Math.max(2, Math.min(amp, h));
        const x = i * (barWidth + gap);
        ctx.fillStyle = accent;
        ctx.globalAlpha = freq ? 0.9 : 0.4;
        ctx.beginPath();
        const r = barWidth / 2;
        ctx.roundRect(x, mid - amp / 2, barWidth, amp, r);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      if (!reduceMotion) {
        t += 1;
        raf = window.requestAnimationFrame(draw);
      }
    }

    draw();
    return () => window.cancelAnimationFrame(raf);
  }, [active, getFrequencies]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={cn("h-16 w-full text-primary", className)}
    />
  );
}
