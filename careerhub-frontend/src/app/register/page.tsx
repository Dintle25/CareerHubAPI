"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { registerUser } from "@/lib/api";

export default function RegisterPage() {
  const { login } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await registerUser(form);
      login(result.token, {
        id: "",
        email: result.email,
        firstName: result.firstName,
      });
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  const fields = [
    { name: "firstName", label: "First name", type: "text" },
    { name: "lastName",  label: "Last name",  type: "text" },
    { name: "email",     label: "Email",       type: "email" },
    { name: "password",  label: "Password",    type: "password" },
  ] as const;

  return (
    <main className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="mb-6 text-2xl font-semibold text-gray-900 dark:text-gray-100">
          Create an account
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {fields.map(({ name, label, type }) => (
            <div key={name}>
              <label
                htmlFor={name}
                className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                {label}
              </label>
              <input
                id={name}
                name={name}
                type={type}
                required
                value={form[name]}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
                           focus:outline-none focus:ring-2 focus:ring-blue-500
                           dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
              />
            </div>
          ))}

          {error && (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium
                       text-white hover:bg-blue-700 disabled:opacity-50
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {loading ? "Creating account…" : "Create account"}
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
