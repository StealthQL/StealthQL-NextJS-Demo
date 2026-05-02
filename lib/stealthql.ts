import { createStealthNextClient } from "stealthql/next/client";
import type { StealthClientOptions } from "stealthql/next/client";

export { createStealthNextClient };

export function createStealthClient(options: StealthClientOptions = {}) {
  return createStealthNextClient({
    actor: "alice",
    ...options
  });
}
