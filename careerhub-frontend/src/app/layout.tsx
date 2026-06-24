// Root layout — wraps every page in the app.
// Server Component — no "use client" needed. The header has no interactivity;
// ThemeToggle is a Client Component imported inside a Server Component, which is fine.

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import ThemeToggle from "@/components/ui/ThemeToggle";
import Providers from "./providers";
import HeaderClient from "@/components/HeaderClient";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CareerHub",
  description: "Find your next role",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-gray-50 dark:bg-gray-900">

<Providers>
    {/* Header — visible on every page */}
    <header className="border-b border-gray-200 bg-white px-8 py-3 dark:border-gray-700 dark:bg-gray-900">
      <div className="mx-auto flex max-w-5xl items-center justify-between">
        <Link
          href="/"
          className="text-lg font-semibold text-gray-900 hover:text-gray-700 dark:text-gray-100 dark:hover:text-gray-300"
        >
          CareerHub
        </Link>
        <div className="flex items-center gap-6">
          <nav className="flex items-center gap-4">
            <Link
              href="/jobs"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
            >
              Jobs
            </Link>
            <Link
              href="/dashboard/listings"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
            >
              Dashboard
            </Link>
          </nav>
          <HeaderClient />
        </div>
      </div>
    </header>

    {/* Page content */}
    {children}
  </Providers>
      </body>
    </html>
  );
}

