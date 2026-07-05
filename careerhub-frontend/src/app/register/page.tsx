"use client";

// Registration page — candidates and employers both register here.
// After successful registration, redirects to /login so the user
// can sign in with their new credentials and select their role.

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const registerSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["candidate", "employer"]),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

//   const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterFormData>({
//     resolver: zodResolver(registerSchema),
//   });

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: "candidate" },
  });

  const selectedRole = watch("role");

  async function onSubmit(data: RegisterFormData) {
    setError(null);

    // Register with the real API
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
      }),
    });

    if (!res.ok) {
      const problem = await res.json().catch(() => ({}));
      setError(problem.detail ?? problem.title ?? "Registration failed. Please try again.");
      return;
    }

    // Show success message and redirect to login
    toast.success("Account created! Please sign in.");
    router.push("/login");
  }

  return (
    <main className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="mb-6 text-2xl font-semibold text-gray-900 dark:text-gray-100">
          Create your account
        </h1>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 dark:border-red-800 dark:bg-red-950">
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}


        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

           {/* Role selection */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              I am a
            </label>
            <div className="flex gap-3">
              {(["candidate", "employer"] as const).map((role) => (
                <label
                  key={role}
                  className={cn(
                    "flex flex-1 cursor-pointer items-center justify-center rounded-lg border px-4 py-2 text-sm font-medium transition-colors",
                    selectedRole === role
                      ? "border-blue-600 bg-blue-50 text-blue-700 dark:border-blue-400 dark:bg-blue-950 dark:text-blue-300"
                      : "border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                  )}
                >
                  <input type="radio" value={role} {...register("role")} className="sr-only" />
                  {role === "candidate" ? "Job Seeker" : "Employer"}
                </label>
              ))}
            </div>
            {errors.role && <p className="mt-1 text-xs text-red-600">{errors.role.message}</p>}
          </div> 

          {/* First name */}
          <div>
            <label htmlFor="firstName" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              First Name
            </label>
            <input
              id="firstName"
              type="text"
              {...register("firstName")}
              className={cn(
                "w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500",
                "dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100",
                errors.firstName ? "border-red-500" : "border-gray-300"
              )}
            />
            {errors.firstName && <p className="mt-1 text-xs text-red-600">{errors.firstName.message}</p>}
          </div>

          {/* Last name */}
          <div>
            <label htmlFor="lastName" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Last Name
            </label>
            <input
              id="lastName"
              type="text"
              {...register("lastName")}
              className={cn(
                "w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500",
                "dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100",
                errors.lastName ? "border-red-500" : "border-gray-300"
              )}
            />
            {errors.lastName && <p className="mt-1 text-xs text-red-600">{errors.lastName.message}</p>}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Email
            </label>
            <input
              id="email"
              type="email"
              {...register("email")}
              className={cn(
                "w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500",
                "dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100",
                errors.email ? "border-red-500" : "border-gray-300"
              )}
            />
            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Password
            </label>
            <input
              id="password"
              type="password"
              {...register("password")}
              className={cn(
                "w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500",
                "dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100",
                errors.password ? "border-red-500" : "border-gray-300"
              )}
            />
            {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {isSubmitting ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-600 hover:underline dark:text-blue-400">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}







// "use client";

// // Registration page — candidates and employers both register here.
// // After successful registration, signs in automatically and redirects
// // based on role: employers go to /dashboard, candidates go to /jobs.

// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import Link from "next/link";
// import { signIn } from "next-auth/react";
// import { z } from "zod";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { cn } from "@/lib/utils";

// const registerSchema = z.object({
//   firstName: z.string().min(1, "First name is required"),
//   lastName: z.string().min(1, "Last name is required"),
//   email: z.string().email("Please enter a valid email address"),
//   password: z.string().min(8, "Password must be at least 8 characters"),
//   role: z.enum(["candidate", "employer"]),
// });

// type RegisterFormData = z.infer<typeof registerSchema>;

// export default function RegisterPage() {
//   const router = useRouter();
//   const [error, setError] = useState<string | null>(null);

//   const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<RegisterFormData>({
//     resolver: zodResolver(registerSchema),
//     defaultValues: { role: "candidate" },
//   });

//   const selectedRole = watch("role");

//   async function onSubmit(data: RegisterFormData) {
//     setError(null);

//     // Register with the real API
//     const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/register`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         firstName: data.firstName,
//         lastName: data.lastName,
//         email: data.email,
//         password: data.password,
//       }),
//     });

//     if (!res.ok) {
//       const problem = await res.json().catch(() => ({}));
//       setError(problem.detail ?? problem.title ?? "Registration failed. Please try again.");
//       return;
//     }

//     // Auto sign in after registration using NextAuth mock users
//     // For the demo we use the mock credentials from auth.ts
//     // In production this would use the real API token
//     const signInResult = await signIn("credentials", {
//       username: data.email,
//       password: data.password,
//       redirect: false,
//     });

//     if (signInResult?.error) {
//       // Registration succeeded but auto-login failed — redirect to login
//       router.push("/login");
//       return;
//     }

//     // Redirect based on role
//     if (data.role === "employer") {
//       router.push("/dashboard/listings");
//     } else {
//       router.push("/jobs");
//     }
//   }

//   return (
//     <main className="flex min-h-[80vh] items-center justify-center px-4">
//       <div className="w-full max-w-sm">
//         <h1 className="mb-6 text-2xl font-semibold text-gray-900 dark:text-gray-100">
//           Create your account
//         </h1>

//         {error && (
//           <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 dark:border-red-800 dark:bg-red-950">
//             <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
//           </div>
//         )}

//         <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

//           {/* Role selection */}
//           <div>
//             <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
//               I am a
//             </label>
//             <div className="flex gap-3">
//               {(["candidate", "employer"] as const).map((role) => (
//                 <label
//                   key={role}
//                   className={cn(
//                     "flex flex-1 cursor-pointer items-center justify-center rounded-lg border px-4 py-2 text-sm font-medium transition-colors",
//                     selectedRole === role
//                       ? "border-blue-600 bg-blue-50 text-blue-700 dark:border-blue-400 dark:bg-blue-950 dark:text-blue-300"
//                       : "border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
//                   )}
//                 >
//                   <input type="radio" value={role} {...register("role")} className="sr-only" />
//                   {role === "candidate" ? "Job Seeker" : "Employer"}
//                 </label>
//               ))}
//             </div>
//             {errors.role && <p className="mt-1 text-xs text-red-600">{errors.role.message}</p>}
//           </div>

//           {/* First name */}
//           <div>
//             <label htmlFor="firstName" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
//               First Name
//             </label>
//             <input
//               id="firstName"
//               type="text"
//               {...register("firstName")}
//               className={cn(
//                 "w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500",
//                 "dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100",
//                 errors.firstName ? "border-red-500" : "border-gray-300"
//               )}
//             />
//             {errors.firstName && <p className="mt-1 text-xs text-red-600">{errors.firstName.message}</p>}
//           </div>

//           {/* Last name */}
//           <div>
//             <label htmlFor="lastName" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
//               Last Name
//             </label>
//             <input
//               id="lastName"
//               type="text"
//               {...register("lastName")}
//               className={cn(
//                 "w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500",
//                 "dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100",
//                 errors.lastName ? "border-red-500" : "border-gray-300"
//               )}
//             />
//             {errors.lastName && <p className="mt-1 text-xs text-red-600">{errors.lastName.message}</p>}
//           </div>

//           {/* Email */}
//           <div>
//             <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
//               Email
//             </label>
//             <input
//               id="email"
//               type="email"
//               {...register("email")}
//               className={cn(
//                 "w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500",
//                 "dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100",
//                 errors.email ? "border-red-500" : "border-gray-300"
//               )}
//             />
//             {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
//           </div>

//           {/* Password */}
//           <div>
//             <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
//               Password
//             </label>
//             <input
//               id="password"
//               type="password"
//               {...register("password")}
//               className={cn(
//                 "w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500",
//                 "dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100",
//                 errors.password ? "border-red-500" : "border-gray-300"
//               )}
//             />
//             {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
//           </div>

//           <button
//             type="submit"
//             disabled={isSubmitting}
//             className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
//           >
//             {isSubmitting ? "Creating account…" : "Create account"}
//           </button>
//         </form>

//         <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
//           Already have an account?{" "}
//           <Link href="/login" className="text-blue-600 hover:underline dark:text-blue-400">
//             Sign in
//           </Link>
//         </p>
//       </div>
//     </main>
//   );
// }