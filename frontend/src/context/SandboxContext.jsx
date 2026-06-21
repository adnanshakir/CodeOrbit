import { createContext, useContext, useState, useCallback } from "react";
import { createSandbox as createSandboxApi } from "@/services/sandboxApi";
import { waitForSandbox } from "@/services/sandboxReady";

const SandboxContext = createContext(null);

/**
 * Lean context — stores only sandbox connection metadata.
 * Chat messages, terminal output, and streaming state live in their own components.
 */
export function SandboxProvider({ children }) {
  const [sandboxId, setSandboxId] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [agentUrl, setAgentUrl] = useState(null);
  const [agentSocketUrl, setAgentSocketUrl] = useState(null);
  const [isSandboxReady, setIsSandboxReady] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState(null);

  const createSandbox = useCallback(async () => {
    setIsCreating(true);
    setCreateError(null);
    setIsSandboxReady(false);
    
    try {
      const data = await createSandboxApi();

      await waitForSandbox(data.agentUrl);

      setSandboxId(data.sandboxId);
      setPreviewUrl(data.previewUrl);
      setAgentUrl(data.agentUrl);
      setAgentSocketUrl(data.agentSocketUrl);
      setIsSandboxReady(true);
    } catch (error) {
      setCreateError(error?.response?.data?.message ?? error?.message ?? "Failed to create sandbox");
    } finally {
      setIsCreating(false);
    }
  }, []);

  return (
    <SandboxContext.Provider
      value={{
        sandboxId,
        previewUrl,
        agentUrl,
        agentSocketUrl,
        isSandboxReady,
        isCreating,
        createError,
        createSandbox,
      }}
    >
      {children}
    </SandboxContext.Provider>
  );
}

export function useSandboxContext() {
  const ctx = useContext(SandboxContext);
  if (!ctx) throw new Error("useSandboxContext must be used within SandboxProvider");
  return ctx;
}
