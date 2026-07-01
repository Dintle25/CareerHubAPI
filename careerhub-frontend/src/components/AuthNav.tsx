"use client";

import Link from "next/link";

export function AuthNav() {
  const { user, logout, isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return (
      <div className="flex items-center gap-4 text-sm">
        <span className="text-gray-600 dark:text-gray-400">
          Hi, {user?.firstName}
        </span>
        <button
          onClick={logout}
          className="rounded bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700
                     hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 text-sm">
      <Link
        href="/login"
        className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
      >
        Sign in
      </Link>
      <Link
        href="/register"
        className="rounded bg-blue-600 px-3 py-1.5 font-medium text-white hover:bg-blue-700"
      >
        Register
      </Link>
    </div>
  );
}
function useAuth(): { user: any; logout: any; isAuthenticated: any; } {
  throw new Error("Function not implemented.");
}

