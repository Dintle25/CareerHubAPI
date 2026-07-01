// Shared test utilities.
// renderWithProviders wraps components with the providers they need to work in tests.
// useSession is mocked here so components that call it get a fake session.

import React from "react";
import { render } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import type { Session } from "next-auth";

// Mock next-auth/react at the module level
vi.mock("next-auth/react", () => ({
  useSession: vi.fn(),
  SessionProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Default session — a signed-in candidate
const DEFAULT_SESSION: Session = {
  user: {
    name: "alice",
    email: "alice@test.com",
    role: "candidate",
  },
  expires: "2099-01-01",
};

interface RenderOptions {
  session?: Session | null;
}

export function renderWithProviders(
  ui: React.ReactElement,
  { session = DEFAULT_SESSION }: RenderOptions = {}
) {
  vi.mocked(useSession).mockReturnValue({
    data: session,
    status: session ? "authenticated" : "unauthenticated",
    update: vi.fn(),
  } as ReturnType<typeof useSession>);

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      {ui}
    </QueryClientProvider>
  );
}