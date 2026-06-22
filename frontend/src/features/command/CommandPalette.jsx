import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const SHORTCUTS = [
  { keys: "Ctrl+B", description: "Toggle Explorer" },
  { keys: "Ctrl+`", description: "Toggle Terminal" },
  { keys: "Ctrl+Shift+C", description: "Toggle Chat" },
  { keys: "Ctrl+K", description: "Command Palette" },
  { keys: "Ctrl+P", description: "Quick Open (Search Files)" },
  { keys: "Ctrl+Shift+F", description: "Search in Files" },
];

/**
 * Command palette showing keyboard shortcuts.
 * Opened via Ctrl+K.
 */
export default function CommandPalette({ isOpen, onClose }) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-md gap-0 p-0">
        <DialogHeader className="border-b border-border px-4 py-3">
          <DialogTitle className="text-sm font-medium">Keyboard Shortcuts</DialogTitle>
        </DialogHeader>

        <div className="py-2">
          {SHORTCUTS.map(({ keys, description }) => (
            <div
              key={keys}
              className="flex items-center justify-between px-4 py-2 text-sm hover:bg-muted/50"
            >
              <span className="text-foreground">{description}</span>
              <kbd className="rounded border border-border bg-muted px-2 py-0.5 font-mono text-[11px] text-muted-foreground">
                {keys}
              </kbd>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
