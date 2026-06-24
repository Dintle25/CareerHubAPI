// "use client";

// import React, { useState } from "react";
// import {
//   QueryClient,
//   QueryClientProvider,
// } from "@tanstack/react-query";
// import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

// interface ProvidersProps {
//   children: React.ReactNode;
// }

// export default function Providers({ children }: ProvidersProps) {
//   // Create one QueryClient instance.
//   // useState makes sure it is only created once and reused.
//   const [queryClient] = useState(() => new QueryClient());

//   return (
//      // Give the QueryClient to the whole application
//     <QueryClientProvider client={queryClient}>
//       {children}
//       {/* Show the TanStack Query DevTools in the browser. */}
//       <ReactQueryDevtools initialIsOpen={false} />
//     </QueryClientProvider>
//   );
// }

"use client";

import React, { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { AuthProvider } from "@/context/AuthContext";
import { AuthNav } from "@/components/AuthNav";
import ThemeToggle from "@/components/ui/ThemeToggle";

interface ProvidersProps {
  children: React.ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <header className="border-b border-gray-200 bg-white px-8 py-3 dark:border-gray-700 dark:bg-gray-900">
          <div className="mx-auto flex max-w-5xl items-center justify-between">
            <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              CareerHub
            </span>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <AuthNav />
            </div>
          </div>
        </header>
        {children}
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </AuthProvider>
  );
}
