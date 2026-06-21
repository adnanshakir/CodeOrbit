export async function waitForSandbox(agentUrl) {
  const maxAttempts = 30;

  for (let i = 0; i < maxAttempts; i++) {
    try {
      const response = await fetch(`${agentUrl}/list-files`);

      if (response.ok) {
        return true;
      }
    } catch {}

    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  throw new Error("Sandbox startup timeout");
}