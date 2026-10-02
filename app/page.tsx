import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import VoiceChatApp from "./voice-chat";

// Server-side auth gate: only authenticated users reach the tutor. The proxy
// also redirects anonymous requests, but this is the authoritative check close
// to the data.
export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return <VoiceChatApp />;
}
