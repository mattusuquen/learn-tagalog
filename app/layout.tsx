import type { Metadata } from "next";
import { Open_Sans } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

// Open Sans is the app's UI font; shadcn tokens read it via --font-sans.
const openSans = Open_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Learn Tagalog",
  description: "A voice-based Tagalog tutor.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={cn("h-full antialiased font-sans", openSans.variable)}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
