import { useEffect } from "react";

function isModifierKey(e) {
  return e.metaKey || e.ctrlKey;
}

export function useWorkspaceShortcuts({
  enabled = true,
  onToggleExplorer,
  onToggleTerminal,
  onToggleChat,
  onOpenCommandPalette,
  onOpenQuickOpen,
  onOpenContentSearch,
}) {
  useEffect(() => {
    if (!enabled) return undefined;

    const handler = (e) => {
      if (!isModifierKey(e)) return;

      const key = e.key.toLowerCase();

      if (key === "b" && !e.shiftKey) {
        e.preventDefault();
        onToggleExplorer?.();
        return;
      }

      if (e.code === "Backquote" && !e.shiftKey) {
        e.preventDefault();
        onToggleTerminal?.();
        return;
      }

      if (key === "c" && e.shiftKey) {
        e.preventDefault();
        onToggleChat?.();
        return;
      }

      if (key === "k" && !e.shiftKey) {
        e.preventDefault();
        onOpenCommandPalette?.();
        return;
      }

      if (key === "p" && !e.shiftKey) {
        e.preventDefault();
        onOpenQuickOpen?.();
        return;
      }

      if (key === "f" && e.shiftKey) {
        e.preventDefault();
        onOpenContentSearch?.();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [
    enabled,
    onOpenCommandPalette,
    onOpenContentSearch,
    onOpenQuickOpen,
    onToggleChat,
    onToggleExplorer,
    onToggleTerminal,
  ]);
}