import { useEffect, useState, useCallback, useRef } from "react";
import {
  ChevronRight,
  File,
  FileCode,
  FileCode2,
  FileJson,
  FileText,
  Folder,
  FolderOpen,
  Loader2,
  PanelLeftClose,
  RefreshCw,
  Search,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { listFiles } from "@/services/filesApi";
// ── File icon mapping ───────────────────────────────────────────────────────
function getFileIcon(filename) {
  const ext = filename.split(".").pop()?.toLowerCase();
  const map = {
    jsx: FileCode2,
    tsx: FileCode2,
    js: FileCode,
    ts: FileCode,
    mjs: FileCode,
    css: FileText,
    scss: FileText,
    html: FileText,
    json: FileJson,
    md: FileText,
    mdx: FileText,
  };
  return map[ext] || File;
}

// ── Tree builder ────────────────────────────────────────────────────────────
function buildTree(files) {
  const tree = {};
  const sorted = [...files].sort((a, b) => a.localeCompare(b));
  sorted.forEach((filePath) => {
    const normalized = filePath.replace(/^\.\//, "").replace(/^\//, "");
    const parts = normalized.split("/").filter(Boolean);
    let current = tree;
    parts.forEach((part, i) => {
      if (i === parts.length - 1) {
        current[part] = { type: "file", path: filePath };
      } else {
        if (!current[part]) current[part] = { type: "dir", children: {} };
        current = current[part].children;
      }
    });
  });
  return tree;
}

function sortEntries(entries) {
  return [...entries].sort(([, a], [, b]) => {
    if (a.type !== b.type) return a.type === "dir" ? -1 : 1;
    return 0;
  });
}

// ── Recursive tree node ─────────────────────────────────────────────────────
function TreeNode({ name, node, depth, onFileSelect, selectedFile, forceOpen }) {
  const [isOpen, setIsOpen] = useState(depth < 2);

  useEffect(() => {
    if (forceOpen) {
      setIsOpen(true);
    }
  }, [forceOpen]);

  if (node.type === "file") {
    const Icon = getFileIcon(name);
    const isSelected = selectedFile === node.path;
    return (
      <button
        className={cn(
          "flex w-full min-w-0 items-center gap-1.5 rounded-none py-1 pr-2 text-left text-[12px] leading-5 transition-colors",
          "hover:bg-accent/60 hover:text-foreground",
          isSelected
            ? "bg-accent text-foreground"
            : "text-muted-foreground"
        )}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
        onClick={() => onFileSelect(node.path)}
      >
        <Icon className="h-3.5 w-3.5 shrink-0 opacity-70" />
        <span className="truncate">{name}</span>
      </button>
    );
  }

  // Directory
  return (
    <div>
      <button
        className="flex w-full items-center gap-1 rounded-none py-1 pr-2 text-left text-[12px] leading-5 text-muted-foreground transition-colors hover:bg-accent/60 hover:text-foreground"
        style={{ paddingLeft: `${depth * 12 + 4}px` }}
        onClick={() => setIsOpen((o) => !o)}
      >
        <ChevronRight
          className={cn(
            "h-3 w-3 shrink-0 transition-transform duration-100",
            isOpen && "rotate-90"
          )}
        />
        {isOpen ? (
          <FolderOpen className="h-3.5 w-3.5 shrink-0 text-yellow-400/70" />
        ) : (
          <Folder className="h-3.5 w-3.5 shrink-0 text-yellow-400/70" />
        )}
        <span className="truncate font-medium text-foreground/80">{name}</span>
      </button>
      {isOpen && (
        <div>
          {sortEntries(Object.entries(node.children)).map(([childName, childNode]) => (
            <TreeNode
              key={childName}
              name={childName}
              node={childNode}
              depth={depth + 1}
              onFileSelect={onFileSelect}
              selectedFile={selectedFile}
              forceOpen={forceOpen}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Collapsed icon column ───────────────────────────────────────────────────
function CollapsedView({ onToggle }) {
  return (
    <div className="flex h-full flex-col items-center gap-1 border-r border-border py-2">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onToggle}>
            <Folder className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right">Files</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onToggle}>
            <FileCode className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right">Explorer</TooltipContent>
      </Tooltip>
    </div>
  );
}

// ── Main FileExplorer ───────────────────────────────────────────────────────
export default function FileExplorer({
  agentUrl,
  isCollapsed,
  selectedFile,
  onFileSelect,
  onToggleCollapse,
  onFilesLoaded,
}) {
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const hasAutoSelected = useRef(false);

  const fetchFiles = useCallback(async () => {
    if (!agentUrl) return;
    setIsLoading(true);
    setError(null);
    try {
      const result = await listFiles(agentUrl);
      setFiles(result);
      onFilesLoaded?.(result);

      // Auto-open first file on initial load
      if (!hasAutoSelected.current && result.length > 0 && !selectedFile) {
        hasAutoSelected.current = true;
        // Prefer App.jsx / App.tsx, else first file
        const appFile = result.find((f) => /App\.(jsx|tsx|js|ts)$/.test(f));
        onFileSelect(appFile || result[0]);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [agentUrl, selectedFile, onFileSelect]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  if (isCollapsed) {
    return <CollapsedView onToggle={onToggleCollapse} />;
  }

  const filteredFiles = searchTerm
    ? files.filter((f) => f.toLowerCase().includes(searchTerm.toLowerCase()))
    : files;

  const tree = buildTree(filteredFiles);

  return (
    <div className="flex h-full min-w-0 flex-col border-r border-border bg-background">
      {/* Header */}
      <div className="flex h-9 shrink-0 items-center justify-between border-b border-border px-3">
        <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          Explorer
        </span>
        <div className="flex items-center gap-0.5">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={fetchFiles}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <RefreshCw className="h-3 w-3" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>Refresh</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={onToggleCollapse}
              >
                <PanelLeftClose className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Collapse Explorer</TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* Search */}
      <div className="shrink-0 px-2 py-1.5">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search files…"
            className="h-7 pl-6 pr-8 text-xs bg-muted/40 border-border focus-visible:ring-1"
          />
          {searchTerm && (
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              className="absolute right-0 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              onClick={() => setSearchTerm("")}
              aria-label="Clear explorer search"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      {/* Tree content */}
      <ScrollArea className="flex-1">
        {isLoading && files.length === 0 && (
          <div className="space-y-1 px-3 py-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-4 w-full" style={{ width: `${60 + Math.random() * 40}%` }} />
            ))}
          </div>
        )}

        {error && (
          <div className="px-3 py-4 text-center">
            <p className="text-xs text-destructive">{error}</p>
            <Button variant="ghost" size="sm" className="mt-2 text-xs" onClick={fetchFiles}>
              Retry
            </Button>
          </div>
        )}

        {!isLoading && !error && filteredFiles.length === 0 && (
          <div className="px-3 py-8 text-center">
            <p className="text-xs text-muted-foreground/60">
              {searchTerm ? "No matching files" : "No files found"}
            </p>
          </div>
        )}

        {!error && filteredFiles.length > 0 && (
          <div className="py-1">
            {sortEntries(Object.entries(tree)).map(([name, node]) => (
              <TreeNode
                key={name}
                name={name}
                node={node}
                depth={0}
                onFileSelect={onFileSelect}
                selectedFile={selectedFile}
                forceOpen={Boolean(searchTerm)}
              />
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
