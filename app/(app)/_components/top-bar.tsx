// Shared top bar (server component — all static for now). The left title is
// practice-specific per our Pile-A scope; the streak count and language pill are
// decorative placeholders (no tracking / no language switching yet).
export function TopBar() {
  return (
    <header className="flex items-center justify-between border-b border-[#e5e7eb] bg-white px-6 py-3">
      <div className="leading-tight">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-[#9ca3af]">
          Today&apos;s practice
        </div>
        <div className="text-sm font-semibold text-[#1a1a1a]">
          At the coffee shop
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 text-sm text-[#6b7280]">
          <span aria-hidden>🔥</span>
          <span className="font-semibold text-[#1a1a1a]">12</span>
          <span>day streak</span>
        </div>

        <button
          type="button"
          className="flex items-center gap-2 rounded-lg border border-[#e5e7eb] px-3 py-1.5 text-sm text-[#1a1a1a] transition hover:bg-[#f9fafb]"
        >
          <span aria-hidden>🇵🇭</span>
          Tagalog
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4 text-[#9ca3af]"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>
      </div>
    </header>
  );
}
