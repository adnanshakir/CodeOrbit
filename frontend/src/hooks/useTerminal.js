import { useEffect, useRef, useCallback, useState } from "react";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import { createSocket } from "@/services/socket";
import "@xterm/xterm/css/xterm.css";

/**
 * Initializes an XTerm terminal, connects to the socket, and handles resize.
 * Returns { isDisconnected, fitTerminal } for parent to use.
 *
 * @param {string | null} agentSocketUrl - Full socket URL from backend
 * @param {React.RefObject<HTMLDivElement>} containerRef - DOM ref to mount terminal into
 */
export function useTerminal(agentSocketUrl, containerRef) {
  const terminalRef = useRef(null);
  const fitAddonRef = useRef(null);
  const socketRef = useRef(null);
  const [isDisconnected, setIsDisconnected] = useState(false);

  const fitTerminal = useCallback(() => {
    if (fitAddonRef.current) {
      try {
        fitAddonRef.current.fit();
      } catch (_) {
        // fit may throw if container has no dimensions yet
      }
    }
  }, []);

  useEffect(() => {
    if (!containerRef.current || !agentSocketUrl) return;

    // Initialize XTerm
    const terminal = new Terminal({
      theme: {
        background: "#0a0a0a",
        foreground: "#e4e4e7",
        cursor: "#a1a1aa",
        selectionBackground: "#3f3f46",
        black: "#18181b",
        red: "#ef4444",
        green: "#22c55e",
        yellow: "#eab308",
        blue: "#3b82f6",
        magenta: "#a855f7",
        cyan: "#06b6d4",
        white: "#e4e4e7",
        brightBlack: "#3f3f46",
        brightWhite: "#fafafa",
      },
      fontFamily: '"GeistMono Variable", "Geist Mono", "Cascadia Code", "Fira Code", Consolas, monospace',
      fontSize: 13,
      lineHeight: 1.5,
      cursorBlink: true,
      cursorStyle: "block",
      allowTransparency: true,
      scrollback: 5000,
    });

    const fitAddon = new FitAddon();
    terminal.loadAddon(fitAddon);
    terminal.open(containerRef.current);

    terminalRef.current = terminal;
    fitAddonRef.current = fitAddon;

    const fitTimeout = setTimeout(fitTerminal, 50);

    // Connect socket using agentSocketUrl directly from backend
    const socket = createSocket(agentSocketUrl);
    socketRef.current = socket;

    socket.on("connect", () => {
      setIsDisconnected(false);
      terminal.writeln("\r\n\x1b[32m● Connected to sandbox terminal\x1b[0m\r\n");
    });

    socket.on("terminal-output", (data) => {
      terminal.write(data);
    });

    socket.on("disconnect", (reason) => {
      setIsDisconnected(true);
      terminal.writeln(`\r\n\x1b[33m⚠ Disconnected: ${reason}\x1b[0m`);
    });

    socket.on("connect_error", () => {
      setIsDisconnected(true);
      terminal.writeln("\r\n\x1b[31m✗ Connection error — retrying...\x1b[0m");
    });

    socket.on("reconnect", () => {
      setIsDisconnected(false);
    });

    terminal.onData((data) => {
      if (socket.connected) {
        socket.emit("terminal-input", data);
      }
    });

    // Auto-fit when container resizes (handles collapse/expand transitions)
    const observer = new ResizeObserver(() => {
      fitTerminal();
    });
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      clearTimeout(fitTimeout);
      observer.disconnect();
      socket.disconnect();
      terminal.dispose();
      terminalRef.current = null;
      fitAddonRef.current = null;
      socketRef.current = null;
    };
  }, [agentSocketUrl]); // eslint-disable-line react-hooks/exhaustive-deps

  return { fitTerminal, isDisconnected };
}
