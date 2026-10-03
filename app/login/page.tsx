"use client";

import { useActionState } from "react";
import { authenticate } from "./actions";

export default function LoginPage() {
  const [state, action, pending] = useActionState(authenticate, undefined);

  return (
    <div className="flex flex-1 items-center justify-center bg-[#f7f8f6] px-4">
      <div className="w-full max-w-sm rounded-2xl border border-[#e5e7eb] bg-white p-8 shadow-sm">
        <div className="mb-8 flex flex-col items-center gap-3">
          {/* Brand mark — matches the sidebar logo */}
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#15803d] text-white">
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
              <path d="M4 20h3v-6H4zM10.5 20h3V4h-3zM17 20h3v-10h-3z" />
            </svg>
          </span>
          <h1 className="text-lg font-semibold text-[#1a1a1a]">Learn Tagalog</h1>
          <p className="text-sm text-[#6b7280]">Sign in to start your lesson</p>
        </div>

        <form action={action} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="email" className="text-sm text-[#374151]">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="rounded-lg border border-[#e5e7eb] bg-white px-3 py-2 text-[#1a1a1a] outline-none transition focus:border-[#15803d] focus:ring-2 focus:ring-[#15803d]/20"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="password" className="text-sm text-[#374151]">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="rounded-lg border border-[#e5e7eb] bg-white px-3 py-2 text-[#1a1a1a] outline-none transition focus:border-[#15803d] focus:ring-2 focus:ring-[#15803d]/20"
            />
          </div>

          {state?.error && <p className="text-sm text-red-500">{state.error}</p>}

          <div className="mt-2 flex flex-col gap-2">
            <button
              type="submit"
              name="intent"
              value="login"
              disabled={pending}
              className="rounded-lg bg-[#15803d] px-3 py-2 font-medium text-white transition hover:bg-[#126c34] disabled:opacity-60"
            >
              {pending ? "…" : "Log in"}
            </button>
            <button
              type="submit"
              name="intent"
              value="signup"
              disabled={pending}
              className="rounded-lg border border-[#e5e7eb] bg-white px-3 py-2 font-medium text-[#1a1a1a] transition hover:bg-[#f9fafb] disabled:opacity-60"
            >
              Sign up
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
