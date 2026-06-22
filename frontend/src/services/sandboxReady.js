/**
 * Polls an endpoint until it responds with 200.
 * Used for both sandbox agent readiness and preview Vite server readiness.
 *
 * @param {string} url - Full URL to poll
 * @param {{ interval?: number, timeout?: number, signal?: AbortSignal }} opts
 * @returns {Promise<boolean>}
 */
export async function pollUntilReady(url, { interval = 2000, timeout = 60000, signal } = {}) {
  const deadline = Date.now() + timeout;

  while (Date.now() < deadline) {
    if (signal?.aborted) throw new Error("Aborted");
    try {
      const response = await fetch(url, { signal });
      if (response.ok) return true;
    } catch (err) {
      if (err.name === "AbortError") throw err;
      // Network error — keep retrying
    }
    await new Promise((resolve) => setTimeout(resolve, interval));
  }

  throw new Error(`Timed out waiting for ${url}`);
}

/**
 * Wait for the sandbox agent to be ready (list-files responds 200).
 */
export async function waitForSandbox(agentUrl, signal) {
  return pollUntilReady(`${agentUrl}/list-files`, {
    interval: 2000,
    timeout: 60000,
    signal,
  });
}

/**
 * Wait for the preview Vite dev server to be ready (responds 200).
 */
export async function waitForPreview(previewUrl, signal) {
  return pollUntilReady(previewUrl, {
    interval: 2000,
    timeout: 60000,
    signal,
  });
}
