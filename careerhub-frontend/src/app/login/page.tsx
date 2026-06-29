// Login page — Server Component.
// The form uses an inline Server Action so no "use client" is needed.
// signIn() from auth.ts runs on the server and handles the redirect.

import { signIn } from "@/auth";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";

interface LoginPageProps {
  searchParams: Promise<{ error?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { error } = await searchParams;

  // Inline Server Action — runs on the server when the form is submitted.
  // We read the role from the JWT callback result via auth() after signIn
  // by passing redirectTo based on what authorize() returned through callbacks.
  async function handleLogin(formData: FormData) {
    "use server";

    const username = formData.get("username") as string;
    const password = formData.get("password") as string;

    try {
      // Sign in with credentials — this calls authorize() in src/auth.ts.
      // We pass redirectTo: "/" first, then use the jwt callback to get the role.
      // Auth.js exposes the role through the jwt callback before the session cookie
      // is written, so we use a temporary redirect and check the session after.
      await signIn("credentials", {
        username,
        password,
        redirect: false,
      });
    } catch (e) {
      // CredentialsSignin error means wrong username or password
      if (e instanceof AuthError) {
        redirect(`/login?error=CredentialsSignin`);
      }
      throw e;
    }

    // After successful sign in, get the session to read the role
    const { auth } = await import("@/auth");
    const session = await auth();
    const role = session?.user?.role;

    // Redirect based on role — employers go to dashboard, candidates go to jobs
    if (role === "employer") {
      redirect("/dashboard/listings");
    } else {
      redirect("/jobs");
    }
  }

  return (
    <main className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="mb-6 text-2xl font-semibold text-gray-900 dark:text-gray-100">
          Sign in to CareerHub
        </h1>

        {/* Error panel — shown when searchParams.error === "CredentialsSignin" */}
        {error === "CredentialsSignin" && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 dark:border-red-800 dark:bg-red-950">
            <p className="text-sm text-red-700 dark:text-red-300">
              Invalid username or password. Please try again.
            </p>
          </div>
        )}

        {/* Form action points to the Server Action above */}
        <form action={handleLogin} className="space-y-4">
          <div>
            <label
              htmlFor="username"
              className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Username
            </label>
            {/* Field must be named "username" — read by formData.get("username") */}
            <input
              id="username"
              name="username"
              type="text"
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
                         focus:outline-none focus:ring-2 focus:ring-blue-500
                         dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
                         focus:outline-none focus:ring-2 focus:ring-blue-500
                         dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium
                       text-white hover:bg-blue-700
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Sign in
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
          No account?{" "}
          <Link href="/register" className="text-blue-600 hover:underline dark:text-blue-400">
            Register
          </Link>
        </p>
      </div>
    </main>
  );
}