// Catch-all route handler for NextAuth.
// Handles all auth requests: sign in, sign out, session, callbacks etc.
// Next.js routes everything under /api/auth/* to this file.

import { handlers } from "@/auth";

export const { GET, POST } = handlers;