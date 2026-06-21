import api from "@/lib/axios";

/**
 * Creates a new sandbox environment.
 * @returns {{ sandboxId, previewUrl, agentUrl, agentSocketUrl }}
 */
export async function createSandbox() {
  const response = await api.post("/api/sandbox/start");
  return response.data;
}
