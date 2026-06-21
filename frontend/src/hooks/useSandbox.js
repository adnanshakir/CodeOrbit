import { useSandboxContext } from "@/context/SandboxContext";

/**
 * Thin hook exposing SandboxContext to components.
 */
export function useSandbox() {
  return useSandboxContext();
}
