// Sets up the MSW server with all handlers.
// Imported by setup.ts so it runs for every test file automatically.

import { setupServer } from "msw/node";
import { handlers } from "./handlers";

export const server = setupServer(...handlers);