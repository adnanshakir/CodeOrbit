import { io } from "socket.io-client";

/**
 * Creates a Socket.IO connection using the exact URL returned by the backend.
 * The backend URL already contains all necessary query params (sandboxId, etc.).
 *
 * @param {string} agentSocketUrl - Full socket URL from sandbox creation response
 * @returns {import("socket.io-client").Socket}
 */
export function createSocket(agentSocketUrl) {
  return io(agentSocketUrl, {
    transports: ["websocket"],
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });
}
