import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { Sidebar } from "./_components/sidebar";
import { TopBar } from "./_components/top-bar";

// Server-component shell for the authenticated app. This is the authoritative
// auth gate for every page in the (app) route group — one check covers Home,
// Practice, Vocabulary, and Progress, so individual pages don't repeat it.
// (The proxy still does a coarse redirect; this is the close-to-data check.)
// The user's email is read here on the server and handed to the client Sidebar.
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen w-full">
      <Sidebar userEmail={user.email ?? ""} />

      <div className="flex flex-1 flex-col">
        <TopBar />
        <main className="flex flex-1 flex-col">{children}</main>
      </div>
    </div>
  );
}
