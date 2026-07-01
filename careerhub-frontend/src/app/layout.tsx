// Root layout — async so we can call auth() to read the session.
// The nav changes based on whether the user is signed in and their role.
// Toaster is placed at the bottom-right so it never conflicts with the top nav.

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { auth, signOut } from "@/auth";
import HeaderClient from "@/components/HeaderClient";
import Providers from "./providers";
import { Toaster } from "sonner";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CareerHub",
  description: "Find your next role",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  //shows the right nav links per role
  const session = await auth();
  const role = session?.user?.role;
  const username = session?.user?.name;

  async function handleSignOut() {
    "use server";
    await signOut({ redirectTo: "/" });
  }

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-gray-50 dark:bg-gray-900">
        <Providers>
          <header className="border-b border-gray-200 bg-white px-8 py-3 dark:border-gray-700 dark:bg-gray-900">
            <div className="mx-auto flex max-w-5xl items-center justify-between">

              <Link
                href="/"
                className="text-lg font-semibold text-gray-900 hover:text-gray-700 dark:text-gray-100 dark:hover:text-gray-300"
              >
                CareerHub
              </Link>

              <div className="flex items-center gap-4">

                {/* Signed out — show Sign In link only */}
                {!session && (
                  <Link
                    href="/login"
                    className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                  >
                    Sign In
                  </Link>
                )}

                {/* Candidate — Jobs link, username badge, sign out */}
                {session && role === "candidate" && (
                  <>
                    <Link
                      href="/jobs"
                      className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                    >
                      Jobs
                    </Link>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-700 dark:text-gray-300">{username}</span>
                      <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                        candidate
                      </span>
                    </div>
                    <form action={handleSignOut}>
                      <button type="submit" className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100">
                        Sign Out
                      </button>
                    </form>
                  </>
                )}

                {/* Employer — Dashboard link, username badge, sign out */}
                {session && role === "employer" && (
                  <>
                    <Link
                      href="/dashboard/listings"
                      className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                    >
                      Dashboard
                    </Link>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-700 dark:text-gray-300">{username}</span>
                      <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-semibold text-purple-700 dark:bg-purple-900 dark:text-purple-300">
                        employer
                      </span>
                    </div>
                    <form action={handleSignOut}>
                      <button type="submit" className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100">
                        Sign Out
                      </button>
                    </form>
                  </>
                )}

                <HeaderClient />
              </div>
            </div>
          </header>

          {children}

          {/* Toast notifications — bottom-right so they never cover the nav bar */}
          <Toaster position="bottom-right" richColors />
        </Providers>
      </body>
    </html>
  );
}
