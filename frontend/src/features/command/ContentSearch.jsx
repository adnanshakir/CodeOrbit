import { useCallback, useEffect, useRef, useState } from "react";
import { FileCode, Loader2, Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { readFile } from "@/services/filesApi";

function getBasename(filePath) {
  return filePath.split("/").pop() || filePath;
}

/**
 * @typedef {{ file: string, line: number, content: string }} SearchMatch
 */

/**
 * VS Code-style content search (Ctrl+Shift+F).
 * Reads all files and searches their contents for the query.
 */
export default function ContentSearch({ isOpen, onClose, files, agentUrl, onFileSelect }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(/** @type {SearchMatch[]} */ ([]));
  const [isSearching, setIsSearching] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setResults([]);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const doSearch = useCallback(
    async (searchQuery) => {
      if (!searchQuery || searchQuery.length < 2 || !agentUrl) {
        setResults([]);
        return;
      }

      setIsSearching(true);
      const matches = [];

      // Search through all files — read each and scan
      const filesToSearch = files.filter((f) => {
        const ext = f.split(".").pop()?.toLowerCase();
        // Only search text files
        return ["js", "jsx", "ts", "tsx", "css", "html", "json", "md", "txt", "yml", "yaml", "env", "mjs", "scss"].includes(ext);
      });

      // Read files in parallel (batches of 5)
      for (let i = 0; i < filesToSearch.length; i += 5) {
        const batch = filesToSearch.slice(i, i + 5);
        const contents = await Promise.allSettled(
          batch.map((f) => readFile(agentUrl, f).then((content) => ({ file: f, content })))
        );

        for (const result of contents) {
          if (result.status !== "fulfilled") continue;
          const { file, content } = result.value;
          if (!content) continue;

          const lines = content.split("\n");
          const lowerQuery = searchQuery.toLowerCase();
          for (let lineNum = 0; lineNum < lines.length; lineNum++) {
            if (lines[lineNum].toLowerCase().includes(lowerQuery)) {
              matches.push({
                file,
                line: lineNum + 1,
                content: lines[lineNum].trim(),
              });
              if (matches.length >= 100) break; // cap results
            }
          }
          if (matches.length >= 100) break;
        }
      }

      setResults(matches);
      setSelectedIndex(0);
      setIsSearching(false);
    },
    [agentUrl, files]
  );

  // Debounced search
  useEffect(() => {
    clearTimeout(debounceRef.current);
    if (query.length >= 2) {
      debounceRef.current = setTimeout(() => doSearch(query), 400);
    } else {
      setResults([]);
    }
    return () => clearTimeout(debounceRef.current);
  }, [query, doSearch]);

  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (results[selectedIndex]) {
        onFileSelect(results[selectedIndex].file);
        onClose();
      }
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  // Highlight matching text
  const highlightMatch = (text, q) => {
    if (!q) return text;
    const idx = text.toLowerCase().indexOf(q.toLowerCase());
    if (idx === -1) return text;
    return (
      <>
        {text.slice(0, idx)}
        <span className="rounded bg-yellow-500/30 text-yellow-200">{text.slice(idx, idx + q.length)}</span>
        {text.slice(idx + q.length)}
      </>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="top-[20%] max-w-xl translate-y-0 gap-0 p-0 data-[state=closed]:slide-out-to-top-2 data-[state=open]:slide-in-from-top-2 [&>button]:hidden">
        {/* Search input */}
        <div className="flex items-center gap-2 border-b border-border px-3 py-2">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
          <Input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search in files…"
            className="h-7 border-0 bg-transparent px-0 text-sm shadow-none focus-visible:ring-0"
          />
          {isSearching && <Loader2 className="h-4 w-4 shrink-0 animate-spin text-muted-foreground" />}
        </div>

        {/* Results */}
        <ScrollArea className="max-h-[350px]">
          {query.length < 2 && (
            <div className="px-3 py-6 text-center text-xs text-muted-foreground/50">
              Type at least 2 characters to search
            </div>
          )}

          {query.length >= 2 && !isSearching && results.length === 0 && (
            <div className="px-3 py-6 text-center text-xs text-muted-foreground/60">
              No results found
            </div>
          )}

          <div className="py-1">
            {results.map((match, i) => (
              <button
                key={`${match.file}:${match.line}:${i}`}
                onClick={() => { onFileSelect(match.file); onClose(); }}
                onMouseEnter={() => setSelectedIndex(i)}
                className={cn(
                  "flex w-full items-start gap-2 px-3 py-1.5 text-left transition-colors",
                  i === selectedIndex ? "bg-accent" : "hover:bg-accent/50"
                )}
              >
                <FileCode className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground/60" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-xs font-medium text-foreground">
                      {getBasename(match.file)}
                    </span>
                    <span className="text-[10px] text-muted-foreground/50">
                      :{match.line}
                    </span>
                    <span className="ml-auto text-[10px] text-muted-foreground/40 truncate max-w-[200px]">
                      {match.file}
                    </span>
                  </div>
                  <div className="mt-0.5 truncate font-mono text-[11px] text-muted-foreground">
                    {highlightMatch(match.content, query)}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
