// Home page at /.
// Server Component — no "use client", no useState, no useEffect.
// Uses next/image for the hero illustration with priority prop
// because it is the largest element on first paint (LCP candidate).

import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <main className="mx-auto flex max-w-5xl flex-col items-center px-4 py-16">
      <div className="flex flex-col items-center gap-10 md:flex-row md:items-center md:justify-between w-full">

        {/* Left — text and buttons */}
        <div className="flex flex-col items-center text-center md:items-start md:text-left max-w-lg">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            Welcome to CareerHub
          </h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            CareerHub connects job seekers with great opportunities. Browse open
            roles as a candidate, or manage your listings as an employer.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/jobs"
              className="rounded-md bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              Browse Jobs
            </Link>
            <Link
              href="/dashboard/listings"
              className="rounded-md border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              Employer Dashboard
            </Link>
          </div>
        </div>

        {/* Right — hero illustration.
            priority is set because this is above the fold and the LCP element.
            width and height match the intrinsic SVG dimensions. */}
        <Image
          src="/hero.svg"
          alt="Job search illustration"
          width={800}
          height={400}
          priority
          className="w-full max-w-md"
        />
      </div>
    </main>
  );
}