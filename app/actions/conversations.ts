"use server";

import { createClient } from "@/utils/supabase/server";

type Role = "user" | "assistant";

// Creates a new conversation row for the signed-in user and returns its id.
// Returns null if unauthenticated or the insert fails (persistence is
// best-effort and must never break the live voice session).
export async function createConversation(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("conversations")
    .insert({ user_id: user.id })
    .select("id")
    .single();

  if (error) {
    console.error("createConversation failed", error);
    return null;
  }

  return data.id;
}

// Appends a single transcript line to a conversation. RLS ensures the
// conversation belongs to the caller.
export async function saveMessage(
  conversationId: string,
  role: Role,
  content: string,
): Promise<void> {
  if (!conversationId || !content) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase
    .from("messages")
    .insert({ conversation_id: conversationId, role, content });

  if (error) {
    console.error("saveMessage failed", error);
  }
}
