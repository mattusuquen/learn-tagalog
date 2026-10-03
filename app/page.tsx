import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

// Public landing page at "/". Lives OUTSIDE the (app) route group, so neither
// the app shell nor the group's auth gate wraps it — logged-out visitors can
// see it. The proxy now treats "/" as public (utils/supabase/proxy.ts).
//
// Server component: it does its own server-side getUser() read. Signed-in
// users never see the landing page — they're redirected into the app at /home.
// (The proxy lets them through because they have a session; this check is what
// actually bounces them.)
export default async function LandingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/home");
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#f7f8f6]">
      {/* Top bar: brand left, login button top-right */}
      <header className="flex items-center justify-between px-6 py-5 sm:px-10">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-[#15803d] text-white">
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
              <path d="M4 20h3v-6H4zM10.5 20h3V4h-3zM17 20h3v-10h-3z" />
            </svg>
          </span>
          <span className="text-lg font-semibold tracking-tight text-[#1a1a1a]">
            Learn Tagalog
          </span>
        </div>

        <Link
          href="/login"
          className="rounded-lg bg-[#15803d] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#126c34]"
        >
          Log in
        </Link>
      </header>

      {/* Hero */}
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
        <span className="mb-5 rounded-full bg-[#e8f5ef] px-3 py-1 text-xs font-medium text-[#15803d]">
          Voice-first Tagalog practice
        </span>
        <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-[#1a1a1a] sm:text-5xl">
          Speak Tagalog with Kuya, your AI tutor
        </h1>
        <p className="mt-5 max-w-xl text-lg text-[#4b5563]">
          Have real spoken conversations, get gentle corrections, and build
          confidence one lesson at a time — just talk, and Kuya listens.
        </p>
        <Link
          href="/login"
          className="mt-8 rounded-lg bg-[#15803d] px-6 py-3 font-medium text-white transition hover:bg-[#126c34]"
        >
          Get started
        </Link>
      </main>

      <footer className="px-6 py-6 text-center text-sm text-[#9ca3af]">
        Learn Tagalog
      </footer>
    </div>
  );
}
