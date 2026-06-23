import { createContext, useContext, useState, useCallback, useRef } from "react";
import { createSandbox as createSandboxApi } from "@/services/sandboxApi";
import { waitForSandbox, waitForPreview } from "@/services/sandboxReady";

const SandboxContext = createContext(null);

/**
 * Startup stages — shown in the LandingPage as progress.
 */
const STAGES = [
  "Creating Sandbox…",
  "Starting Containers…",
  "Connecting Terminal…",
  "Starting Preview…",
  "Loading Files…",
  "Ready",
];

/**
 * Lean context — stores sandbox connection metadata + creation progress.
 *
 * Does NOT store: chat messages, terminal output, file contents, stream chunks.
 */
export function SandboxProvider({ children }) {
  const [sandboxId, setSandboxId] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [agentUrl, setAgentUrl] = useState(null);
  const [agentSocketUrl, setAgentSocketUrl] = useState(null);
  const [isSandboxReady, setIsSandboxReady] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState(null);

  // Staged progress: index into STAGES
  const [startupStage, setStartupStage] = useState(0);
  // Indicates preview server is ready (iframe can mount)
  const [isPreviewReady, setIsPreviewReady] = useState(false);

  const abortRef = useRef(null);

  const createSandbox = useCallback(async () => {
    // Abort any previous in-flight creation
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setIsCreating(true);
    setCreateError(null);
    setIsSandboxReady(false);
    setIsPreviewReady(false);
    setStartupStage(0);

    try {
      // Stage 0: Creating Sandbox
      const data = await createSandboxApi();
      console.log("[Sandbox] Created:", data);

      // Stage 1: Starting Containers
      setStartupStage(1);
      setSandboxId(data.sandboxId);
      setPreviewUrl(data.previewUrl);
      setAgentUrl(data.agentUrl);
      setAgentSocketUrl(data.agentSocketUrl);

      // Stage 2: Connecting Terminal (terminal will self-connect via socket)
      setStartupStage(2);

      // Stage 3: Waiting for agent (list-files 200)
      setStartupStage(3);
      await waitForSandbox(data.agentUrl, controller.signal);

      // Stage 4: Loading Files
      setStartupStage(4);

      // Mark sandbox as ready — workspace mounts
      setIsSandboxReady(true);
      setStartupStage(5);

      // Start polling preview in background (non-blocking)
      waitForPreview(data.previewUrl, controller.signal)
        .then(() => {
          console.log("[Sandbox] Preview ready");
          setIsPreviewReady(true);
        })
        .catch((err) => {
          if (err.name !== "AbortError") {
            console.warn("[Sandbox] Preview wait failed:", err.message);
          }
        });
    } catch (error) {
      if (error.name === "AbortError") return;
      setCreateError(
        error?.response?.data?.message ?? error?.message ?? "Failed to create sandbox"
      );
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
        isPreviewReady,
        isCreating,
        createError,
        startupStage,
        startupStages: STAGES,
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
