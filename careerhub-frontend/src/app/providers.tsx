"use client";

import React, { useState } from "react";
import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

interface ProvidersProps {
  children: React.ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  // Create one QueryClient instance.
  // useState makes sure it is only created once and reused.
  const [queryClient] = useState(() => new QueryClient());

  return (
     // Give the QueryClient to the whole application
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Show the TanStack Query DevTools in the browser. */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
