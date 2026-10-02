import { type NextRequest } from "next/server";
import { updateSession } from "@/utils/supabase/proxy";

// This fork of Next.js renames `middleware` to `proxy` (see
// node_modules/next/dist/docs/.../file-conventions/proxy.md). Runs on the
// Node.js runtime, so the Supabase server client works here.
export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico
     * - image/asset files
     * Keeps auth/redirect logic from blocking CSS, JS, and images, while still
     * covering /api/token so anonymous token requests are rejected.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
