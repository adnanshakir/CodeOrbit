/**
 * Streams an AI response via SSE over a POST fetch request.
 *
 * @param {{ message: string, projectId: string }} params
 * @param {(chunk: string) => void} onChunk - called for each text chunk
 * @param {() => void} onDone - called when the stream closes cleanly
 * @param {(error: Error) => void} onError - called on network/parse error
 * @returns {() => void} abort function to cancel the stream
 */
export function streamAI({ message, projectId }, onChunk, onDone, onError) {
  const controller = new AbortController();

  const run = async () => {
    try {
      const response = await fetch("/api/ai/invoke", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, projectId }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`AI request failed: ${response.status} ${response.statusText}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value, { stream: true });

        // Handle SSE format: lines starting with "data: "
        const lines = text.split("\n");
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6).trim();
            if (data === "[DONE]") {
              onDone();
              return;
            }
            if (data) {
              onChunk(data + "\n");
            }
          } else if (line.trim() && !line.startsWith(":") && !line.startsWith("event:")) {
            // Plain text stream (non-SSE format)
            onChunk(line + "\n");
          }
        }
      }

      onDone();
    } catch (error) {
      if (error.name === "AbortError") return;
      onError(error);
    }
  };

  run();

  return () => controller.abort();
}
