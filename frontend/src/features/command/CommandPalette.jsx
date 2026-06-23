import { useEffect, useMemo, useRef, useState } from "react";
import {
  Keyboard,
  PanelLeftClose,
  PanelRightClose,
  FileCode2,
  FileSearch,
  Search,
  Terminal,
  X,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const COMMANDS = [
  { id: "toggle-explorer", label: "Toggle Explorer", hint: "⌘ B", icon: PanelLeftClose },
  { id: "toggle-terminal", label: "Toggle Terminal", hint: "⌘ `", icon: Terminal },
  { id: "toggle-chat", label: "Toggle Chat", hint: "⌘ + Shift + C", icon: PanelRightClose },
  { id: "quick-open", label: "Quick Open", hint: "⌘ P", icon: FileCode2 },
  { id: "search-files", label: "Search In Files", hint: "⌘ + Shift + F", icon: FileSearch },
  { id: "shortcuts", label: "Keyboard Shortcuts", hint: "Help", icon: Keyboard },
];

export default function CommandPalette({
  isOpen,
  query,
  onQueryChange,
  onClose,
  onToggleExplorer,
  onToggleTerminal,
  onToggleChat,
  onOpenQuickOpen,
  onOpenContentSearch,
  onOpenShortcuts,
}) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  const filteredCommands = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return COMMANDS;
    return COMMANDS.filter((command) =>
      [command.label, command.hint].some((value) => value.toLowerCase().includes(term))
    );
  }, [query]);

  useEffect(() => {
    if (isOpen) {
      setSelectedIndex(0);
      queueMicrotask(() => inputRef.current?.focus());
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    const item = listRef.current?.children[selectedIndex];
    item?.scrollIntoView({ block: "nearest" });
  }, [selectedIndex]);

  const runCommand = (commandId) => {
    onClose();

    switch (commandId) {
      case "toggle-explorer":
        onToggleExplorer?.();
        break;
      case "toggle-terminal":
        onToggleTerminal?.();
        break;
      case "toggle-chat":
        onToggleChat?.();
        break;
      case "quick-open":
        onOpenQuickOpen?.();
        break;
      case "search-files":
        onOpenContentSearch?.();
        break;
      case "shortcuts":
        onOpenShortcuts?.();
        break;
      default:
        break;
    }
  };

  const handleKeyDown = (e) => {
    if (filteredCommands.length === 0 && (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Enter")) {
      e.preventDefault();
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((index) => Math.min(index + 1, filteredCommands.length - 1));
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((index) => Math.max(index - 1, 0));
      return;
    }

    if (e.key === "Enter") {
      e.preventDefault();
      if (filteredCommands[selectedIndex]) {
        runCommand(filteredCommands[selectedIndex].id);
      }
      return;
    }

    if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent
        showCloseButton={false}
        className="top-[18%] w-[min(92vw,760px)] max-w-none translate-y-0 gap-0 overflow-hidden rounded-xl border border-border bg-zinc-950 p-0 text-foreground shadow-2xl data-[state=closed]:slide-out-to-top-2 data-[state=open]:slide-in-from-top-2 [&>button]:hidden"
      >
        <DialogHeader className="border-b border-border px-4 py-3">
          <DialogTitle className="text-xs font-medium uppercase tracking-[0.24em] text-muted-foreground">
            Command Palette
          </DialogTitle>
        </DialogHeader>

        <div className="flex items-center gap-2 border-b border-border px-4 py-3">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
          <Input
            ref={inputRef}
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search commands or actions..."
            className="h-8 border-0 bg-transparent px-0 text-sm shadow-none focus-visible:ring-0"
          />
          {query && (
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              className="text-muted-foreground hover:text-foreground"
              onClick={() => onQueryChange("")}
              aria-label="Clear command search"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>

        <div ref={listRef} className="max-h-96 overflow-y-auto p-2">
          {filteredCommands.length === 0 ? (
            <div className="px-3 py-8 text-center text-xs text-muted-foreground/60">
              No matching commands
            </div>
          ) : (
            filteredCommands.map((command, index) => {
              const Icon = command.icon;
              const isSelected = index === selectedIndex;

              return (
                <button
                  key={command.id}
                  onClick={() => runCommand(command.id)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors",
                    isSelected ? "bg-accent text-foreground" : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                  )}
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border bg-background/40">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{command.label}</span>
                  </span>
                  <kbd className="shrink-0 rounded border border-border bg-muted px-2 py-0.5 font-mono text-[11px] text-muted-foreground">
                    {command.hint}
                  </kbd>
                </button>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
