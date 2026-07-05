"use client";

// Login page — authenticates against the real .NET API to get a JWT token,
// then signs in via NextAuth so the session is available everywhere.
// The role selection tells the app where to redirect after login.

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
  role: z.enum(["candidate", "employer"]),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { role: "candidate" },
  });

  const selectedRole = watch("role");

  async function onSubmit(data: LoginFormData) {
    setError(null);

    // Step 1 — authenticate against the real .NET API to get a JWT token
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: data.email, password: data.password }),
    });

    if (!res.ok) {
      const problem = await res.json().catch(() => ({}));
      setError(problem.detail ?? problem.title ?? "Invalid email or password. Please try again.");
      return;
    }

    const result = await res.json();

    // Store the real JWT so API calls can use it for authenticated requests
    localStorage.setItem("ch_token", result.token);

    // Step 2 — sign in via NextAuth using email as username and the selected role.
    // We add the real user's email as a mock NextAuth user so the session
    // is available to auth() in Server Components and useSession() in Client Components.
    // We pass the role via a custom credential field.
    const signInResult = await signIn("credentials", {
      username: data.email,
      password: data.password,
      role: data.role,
      redirect: false,
    });

    if (signInResult?.error) {
      // NextAuth mock failed — still redirect since real API auth succeeded
      // The user is authenticated with the real API even if mock session fails
    }


     router.refresh(); // force header to re-render with new session
    // Redirect based on role
    if (data.role === "employer") {
      router.push("/dashboard/listings");
    } else {
      router.push("/jobs");
     
    }
  }

  return (
    <main className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="mb-6 text-2xl font-semibold text-gray-900 dark:text-gray-100">
          Sign in to CareerHub
        </h1>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 dark:border-red-800 dark:bg-red-950">
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

          {/* Role selection */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">I am a</label>
            <div className="flex gap-3">
              {(["candidate", "employer"] as const).map((role) => (
                <label key={role} className={cn(
                  "flex flex-1 cursor-pointer items-center justify-center rounded-lg border px-4 py-2 text-sm font-medium transition-colors",
                  selectedRole === role
                    ? "border-blue-600 bg-blue-50 text-blue-700 dark:border-blue-400 dark:bg-blue-950 dark:text-blue-300"
                    : "border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                )}>
                  <input type="radio" value={role} {...register("role")} className="sr-only" />
                  {role === "candidate" ? "Job Seeker" : "Employer"}
                </label>
              ))}
            </div>
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
            <input id="email" type="email" {...register("email")}
              className={cn("w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100", errors.email ? "border-red-500" : "border-gray-300")} />
            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
            <input id="password" type="password" {...register("password")}
              className={cn("w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100", errors.password ? "border-red-500" : "border-gray-300")} />
            {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
          </div>

          <button type="submit" disabled={isSubmitting}
            className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
            {isSubmitting ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
          No account?{" "}
          <Link href="/register" className="text-blue-600 hover:underline dark:text-blue-400">Register</Link>
        </p>
      </div>
    </main>
  );
}








// // Login page — Server Component.
// // The form uses an inline Server Action so no "use client" is needed.
// // signIn() from auth.ts runs on the server and handles the redirect.

// import { signIn } from "@/auth";
// import { AuthError } from "next-auth";
// import { redirect } from "next/navigation";
// import Link from "next/link";

// interface LoginPageProps {
//   searchParams: Promise<{ error?: string }>;
// }

// export default async function LoginPage({ searchParams }: LoginPageProps) {
//   const { error } = await searchParams;

//   // Inline Server Action — runs on the server when the form is submitted.
//   // We read the role from the JWT callback result via auth() after signIn
//   // by passing redirectTo based on what authorize() returned through callbacks.
//   async function handleLogin(formData: FormData) {
//     "use server";

//     const username = formData.get("username") as string;
//     const password = formData.get("password") as string;

//     try {
//       // Sign in with credentials — this calls authorize() in src/auth.ts.
//       // We pass redirectTo: "/" first, then use the jwt callback to get the role.
//       // Auth.js exposes the role through the jwt callback before the session cookie
//       // is written, so we use a temporary redirect and check the session after.
//       await signIn("credentials", {
//         username,
//         password,
//         redirect: false,
//       });
//     } catch (e) {
//       // CredentialsSignin error means wrong username or password
//       if (e instanceof AuthError) {
//         redirect(`/login?error=CredentialsSignin`);
//       }
//       throw e;
//     }

//     // After successful sign in, get the session to read the role
//     const { auth } = await import("@/auth");
//     const session = await auth();
//     const role = session?.user?.role;

//     // Redirect based on role — employers go to dashboard, candidates go to jobs
//     if (role === "employer") {
//       redirect("/dashboard/listings");
//     } else {
//       redirect("/jobs");
//     }
//   }

//   return (
//     <main className="flex min-h-[80vh] items-center justify-center px-4">
//       <div className="w-full max-w-sm">
//         <h1 className="mb-6 text-2xl font-semibold text-gray-900 dark:text-gray-100">
//           Sign in to CareerHub
//         </h1>

//         {/* Error panel — shown when searchParams.error === "CredentialsSignin" */}
//         {error === "CredentialsSignin" && (
//           <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 dark:border-red-800 dark:bg-red-950">
//             <p className="text-sm text-red-700 dark:text-red-300">
//               Invalid username or password. Please try again.
//             </p>
//           </div>
//         )}

//         {/* Form action points to the Server Action above */}
//         <form action={handleLogin} className="space-y-4">
//           <div>
//             <label
//               htmlFor="username"
//               className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
//             >
//               Username
//             </label>
//             {/* Field must be named "username" — read by formData.get("username") */}
//             <input
//               id="username"
//               name="username"
//               type="text"
//               required
//               className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
//                          focus:outline-none focus:ring-2 focus:ring-blue-500
//                          dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
//             />
//           </div>

//           <div>
//             <label
//               htmlFor="password"
//               className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
//             >
//               Password
//             </label>
//             <input
//               id="password"
//               name="password"
//               type="password"
//               required
//               className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
//                          focus:outline-none focus:ring-2 focus:ring-blue-500
//                          dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
//             />
//           </div>

//           <button
//             type="submit"
//             className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium
//                        text-white hover:bg-blue-700
//                        focus:outline-none focus:ring-2 focus:ring-blue-500"
//           >
//             Sign in
//           </button>
//         </form>

//         <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
//           No account?{" "}
//           <Link href="/register" className="text-blue-600 hover:underline dark:text-blue-400">
//             Register
//           </Link>
//         </p>
//       </div>
//     </main>
//   );
// }