"use client";

// Wraps the app with all required providers:
// - NuqsAdapter: makes nuqs URL state work throughout the app
// - SessionProvider: makes NextAuth session available to Client Components
// - QueryClientProvider: makes TanStack Query available for data fetching

import React, { useState } from "react";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { SessionProvider } from "next-auth/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

interface ProvidersProps {
  children: React.ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <NuqsAdapter>
      <SessionProvider>
        <QueryClientProvider client={queryClient}>
          {children}
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </SessionProvider>
    </NuqsAdapter>
  );
}