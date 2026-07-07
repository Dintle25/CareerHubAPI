// Middleware — runs on every request before the page renders.
// Protects routes based on session state and user role.
// Unauthenticated users are sent to /login.
// Candidates trying to access /dashboard are sent to /jobs.
// Logged-in users trying to visit /login are redirected away.

import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { nextUrl, auth: session } = req;
  const pathname = nextUrl.pathname;

  const isLoggedIn = !!session;
  const role = session?.user?.role;

  //  /dashboard and everything under it ----------------------------------------------------------------------------
  if (pathname.startsWith("/dashboard")) {
    // Not logged in — send to login page
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login", nextUrl));
    }

    // Logged in but not an employer — candidates go to /jobs
    if (role !== "employer") {
      return NextResponse.redirect(new URL("/jobs", nextUrl));
    }
  }

  //  /login — redirect already logged-in users away --------------------------------------------------------------
  if (pathname === "/login") {
    if (isLoggedIn) {
      // Employers go to dashboard, candidates go to jobs
      if (role === "employer") {
        return NextResponse.redirect(new URL("/dashboard/listings", nextUrl));
      }
      return NextResponse.redirect(new URL("/jobs", nextUrl));
    }
  }

  // All other routes — allow through with no redirect
  return NextResponse.next();
});

export const config = {
  matcher: [
    // Run middleware on all routes except static files and auth API
    "/((?!_next/static|_next/image|favicon.ico|api/auth).*)",
  ],
};