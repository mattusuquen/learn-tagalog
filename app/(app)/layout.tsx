import { redirect } from "next/navigation";

import { createClient } from "@/utils/supabase/server";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppHeader } from "./_components/app-header";
import { AppSidebar } from "./_components/app-sidebar";

// Server-component shell for the authenticated app. This is the authoritative
// auth gate for every page in the (app) route group — one check covers Home,
// Practice, Vocabulary, and Progress, so individual pages don't repeat it.
// (The proxy still does a coarse redirect; this is the close-to-data check.)
// The user's email is read here on the server and handed to the client shell.
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

  const email = user.email ?? "";

  return (
    <TooltipProvider delayDuration={0}>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <AppHeader userEmail={email} />
          <main className="flex flex-1 flex-col">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
