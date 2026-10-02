import { createBrowserClient } from "@supabase/ssr";

// Browser-side Supabase client for use in Client Components. Reads the public
// env vars (safe to expose) and manages the auth session via cookies.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
}
