import { useEffect, useRef, useState } from "react";
import { File, FileCode, FileCode2, FileJson, FileText, Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

function getFileIcon(filename) {
  const ext = filename.split(".").pop()?.toLowerCase();
  const map = {
    jsx: FileCode2, tsx: FileCode2,
    js: FileCode, ts: FileCode, mjs: FileCode,
    css: FileText, scss: FileText, html: FileText,
    json: FileJson, md: FileText, mdx: FileText,
  };
  return map[ext] || File;
}

function getBasename(filePath) {
  return filePath.split("/").pop() || filePath;
}

/**
 * VS Code-style Quick Open (Ctrl+P).
 * Searches filenames and opens the selected file.
 */
export default function QuickOpen({ isOpen, onClose, files, onFileSelect }) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  // Filter files
  const filtered = query
    ? files.filter((f) => f.toLowerCase().includes(query.toLowerCase()))
    : files;

  // Reset selection when query/open changes
  useEffect(() => {
    setSelectedIndex(0);
    if (isOpen) {
      setQuery("");
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Scroll selected item into view
  useEffect(() => {
    if (listRef.current) {
      const item = listRef.current.children[selectedIndex];
      item?.scrollIntoView({ block: "nearest" });
    }
  }, [selectedIndex]);

  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filtered[selectedIndex]) {
        onFileSelect(filtered[selectedIndex]);
        onClose();
      }
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="top-[20%] max-w-lg translate-y-0 gap-0 p-0 data-[state=closed]:slide-out-to-top-2 data-[state=open]:slide-in-from-top-2 [&>button]:hidden">
        {/* Search input */}
        <div className="flex items-center gap-2 border-b border-border px-3 py-2">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
          <Input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search files by name…"
            className="h-7 border-0 bg-transparent px-0 text-sm shadow-none focus-visible:ring-0"
          />
        </div>

        {/* Results */}
        <div ref={listRef} className="max-h-[300px] overflow-y-auto py-1">
          {filtered.length === 0 && (
            <div className="px-3 py-6 text-center text-xs text-muted-foreground/60">
              {query ? "No matching files" : "No files available"}
            </div>
          )}
          {filtered.map((filePath, i) => {
            const Icon = getFileIcon(getBasename(filePath));
            const isSelected = i === selectedIndex;
            return (
              <button
                key={filePath}
                onClick={() => { onFileSelect(filePath); onClose(); }}
                onMouseEnter={() => setSelectedIndex(i)}
                className={cn(
                  "flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm transition-colors",
                  isSelected ? "bg-accent text-foreground" : "text-muted-foreground hover:bg-accent/50"
                )}
              >
                <Icon className="h-3.5 w-3.5 shrink-0 opacity-60" />
                <span className="flex-1 truncate">{filePath}</span>
                <span className="shrink-0 text-[10px] text-muted-foreground/40">
                  {getBasename(filePath)}
                </span>
              </button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
