/**
 * Fetches the list of files in the sandbox project.
 * @param {string} agentUrl
 * @returns {Promise<string[]>} Flat array of file paths
 */
export async function listFiles(agentUrl) {
  const response = await fetch(`${agentUrl}/list-files`);
  if (!response.ok) throw new Error(`Failed to list files: ${response.status}`);
  const data = await response.json();
  if (!Array.isArray(data.files)) return [];
  // Normalize: files may be strings or objects with path/name fields
  return data.files.map((f) =>
    typeof f === "string" ? f : f.path || f.name || ""
  ).filter(Boolean);
}

/**
 * Reads the content of a single file from the sandbox agent.
 * @param {string} agentUrl
 * @param {string} filePath
 * @returns {Promise<string>} File content as string
 */
export async function readFile(agentUrl, filePath) {
  const url = `${agentUrl}/read-files?files=${encodeURIComponent(filePath)}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to read file: ${response.status}`);
  }

  const data = await response.json();

  if (Array.isArray(data.files) && data.files.length > 0) {
    const file = data.files[0];

    if (typeof file === "string") {
      return file;
    }

    const value = Object.values(file)[0];
    return typeof value === "string" ? value : "";
  }

  return data.content ?? "";
}
