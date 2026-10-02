"use client";

import { useActionState } from "react";
import { authenticate } from "./actions";

export default function LoginPage() {
  const [state, action, pending] = useActionState(authenticate, undefined);

  return (
    <div className="flex flex-1 items-center justify-center bg-[#0f1115] px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#1e2a3a]">
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-7 w-7 text-[#60a5fa]"
            >
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          </div>
          <h1 className="text-lg font-semibold text-gray-100">
            Learn Tagalog
          </h1>
          <p className="text-sm text-gray-400">Sign in to start your lesson</p>
        </div>

        <form action={action} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="email" className="text-sm text-gray-300">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="rounded-lg bg-[#1c1f24] px-3 py-2 text-gray-100 outline-none ring-1 ring-[#2a2f36] focus:ring-[#60a5fa]"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="password" className="text-sm text-gray-300">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="rounded-lg bg-[#1c1f24] px-3 py-2 text-gray-100 outline-none ring-1 ring-[#2a2f36] focus:ring-[#60a5fa]"
            />
          </div>

          {state?.error && (
            <p className="text-sm text-red-400">{state.error}</p>
          )}

          <div className="mt-2 flex flex-col gap-2">
            <button
              type="submit"
              name="intent"
              value="login"
              disabled={pending}
              className="rounded-lg bg-[#60a5fa] px-3 py-2 font-medium text-[#0f1115] transition hover:bg-[#4b94f0] disabled:opacity-60"
            >
              {pending ? "…" : "Log in"}
            </button>
            <button
              type="submit"
              name="intent"
              value="signup"
              disabled={pending}
              className="rounded-lg bg-[#1e2a3a] px-3 py-2 font-medium text-gray-100 transition hover:bg-[#263648] disabled:opacity-60"
            >
              Sign up
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
