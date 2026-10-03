"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signout } from "@/app/login/actions";

// Client island: needs usePathname() to highlight the active route, so it must
// run in the browser. The parent (app) layout stays a server component and just
// renders this. The signed-in user's email is fetched on the server and passed
// in as a prop — the client never does its own auth read.

type NavItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
};

const NAV_ITEMS: NavItem[] = [
  {
    href: "/home",
    label: "Home",
    icon: (
      <path d="M3 10.5 12 3l9 7.5M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5" />
    ),
  },
  {
    href: "/practice",
    label: "Practice",
    icon: (
      <path d="M12 3v3m0 12v3m9-9h-3M6 12H3m14.5-6.5-2 2m-7 7-2 2m11 0-2-2m-7-7-2-2" />
    ),
  },
  {
    href: "/vocabulary",
    label: "Vocabulary",
    icon: (
      <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H18a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5.5A1.5 1.5 0 0 1 4 18.5zM8 4v16" />
    ),
  },
  {
    href: "/progress",
    label: "Progress",
    icon: <path d="M4 20h16M7 20v-6m5 6V8m5 12v-9" />,
  },
];

function Icon({ children }: { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5 shrink-0"
    >
      {children}
    </svg>
  );
}

export function Sidebar({ userEmail }: { userEmail: string }) {
  const pathname = usePathname();
  const name = userEmail ? userEmail.split("@")[0] : "Account";
  const initials = (userEmail || "?").slice(0, 2).toUpperCase();

  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-[#e5e7eb] bg-white">
      {/* Brand */}
      <div className="flex items-center gap-2 px-5 py-5">
        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[#15803d] text-white">
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
            <path d="M4 20h3v-6H4zM10.5 20h3V4h-3zM17 20h3v-10h-3z" />
          </svg>
        </span>
        <span className="text-lg font-semibold tracking-tight text-[#1a1a1a]">
          Learn Tagalog
        </span>
      </div>

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-1 px-3 py-2">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition " +
                (active
                  ? "bg-[#e8f5ef] font-medium text-[#15803d]"
                  : "text-[#4b5563] hover:bg-[#f3f4f6] hover:text-[#1a1a1a]")
              }
            >
              <Icon>{item.icon}</Icon>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer: settings + user */}
      <div className="border-t border-[#e5e7eb] px-3 py-3">
        <button
          type="button"
          className="mb-1 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-[#4b5563] transition hover:bg-[#f3f4f6] hover:text-[#1a1a1a]"
        >
          <Icon>
            <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </Icon>
          Settings
        </button>

        <div className="flex items-center gap-3 rounded-lg px-3 py-2">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#fde8e8] text-xs font-semibold text-[#9b4a4a]">
            {initials}
          </span>
          <div className="min-w-0">
            <div className="truncate text-sm font-medium text-[#1a1a1a]">
              {name}
            </div>
            <div className="truncate text-xs text-[#6b7280]">{userEmail}</div>
          </div>
        </div>

        {/* Sign out — server action, relocated here from the voice chat */}
        <form action={signout}>
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-[#4b5563] transition hover:bg-[#f3f4f6] hover:text-[#1a1a1a]"
          >
            <Icon>
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <path d="m16 17 5-5-5-5M21 12H9" />
            </Icon>
            Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}
