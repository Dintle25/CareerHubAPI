import "@testing-library/jest-dom";
import { server } from "./msw/server";
import { beforeAll, afterEach, afterAll } from "vitest";

// Mock Next.js server functions that don't work in jsdom
vi.mock("next/cache", () => ({
  revalidateTag: vi.fn(),
  revalidatePath: vi.fn(),
}));

// Mock next/navigation used by some components
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
  usePathname: () => "/",
  redirect: vi.fn(),
}));

// Start MSW before all tests
beforeAll(() => {
  process.on("unhandledRejection", () => {});
  server.listen({ onUnhandledRequest: "warn" });
});

// Reset handlers after each test so overrides don't leak between tests
afterEach(() => server.resetHandlers());

// Shut down MSW after all tests
afterAll(() => server.close());

// Clear localStorage before each test so draft state doesn't bleed between tests
beforeEach(() => {
  localStorage.clear();
});