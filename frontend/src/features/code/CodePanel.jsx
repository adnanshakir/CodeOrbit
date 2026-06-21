import { useCallback, useEffect, useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { FileCode, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { readFile } from "@/services/filesApi";

// ── Language detection ──────────────────────────────────────────────────────
function getLanguage(filename) {
  const ext = filename.split(".").pop()?.toLowerCase();
  const map = {
    js: "javascript",
    jsx: "jsx",
    ts: "typescript",
    tsx: "tsx",
    css: "css",
    scss: "scss",
    html: "html",
    json: "json",
    md: "markdown",
    mdx: "markdown",
    py: "python",
    sh: "bash",
    bash: "bash",
    yml: "yaml",
    yaml: "yaml",
    xml: "xml",
    svg: "xml",
    txt: "text",
    env: "text",
    gitignore: "text",
  };
  return map[ext] || "text";
}

function getBasename(filePath) {
  return filePath.split("/").pop() || filePath;
}

// ── Syntax Highlighter theme override (transparent bg to match our theme) ───
const customStyle = vscDarkPlus;

// ── Empty state ─────────────────────────────────────────────────────────────
function EmptyState() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
      <FileCode className="h-10 w-10 text-muted-foreground/20" />
      <div className="space-y-1">
        <p className="text-sm font-medium text-muted-foreground/60">No file selected</p>
        <p className="text-xs text-muted-foreground/40">
          Click a file in the explorer to view its contents
        </p>
      </div>
    </div>
  );
}

// ── Main CodePanel ──────────────────────────────────────────────────────────
export default function CodePanel({ agentUrl, selectedFile }) {
  // openFiles: { [path]: content | null (loading) | Error }
  const [openFiles, setOpenFiles] = useState({});
  // tabs: ordered list of open paths
  const [tabs, setTabs] = useState([]);
  const [activeTab, setActiveTab] = useState(null);
  const [loadingFiles, setLoadingFiles] = useState(new Set());
  const [errorFiles, setErrorFiles] = useState({});

  const openTab = useCallback(
    async (filePath) => {
      // Bring existing tab to front
      if (tabs.includes(filePath)) {
        setActiveTab(filePath);
        return;
      }

      // Add new tab (content fetches)
      setTabs((prev) => [...prev, filePath]);
      setActiveTab(filePath);
      setLoadingFiles((prev) => new Set(prev).add(filePath));

      try {
        const content = await readFile(agentUrl, filePath);
        setOpenFiles((prev) => ({ ...prev, [filePath]: content }));
      } catch (err) {
        setErrorFiles((prev) => ({ ...prev, [filePath]: err.message }));
        setOpenFiles((prev) => ({ ...prev, [filePath]: null }));
      } finally {
        setLoadingFiles((prev) => {
          const next = new Set(prev);
          next.delete(filePath);
          return next;
        });
      }
    },
    [agentUrl, tabs]
  );

  const closeTab = useCallback(
    (filePath, e) => {
      e?.stopPropagation();
      const newTabs = tabs.filter((t) => t !== filePath);
      setTabs(newTabs);
      setOpenFiles((prev) => {
        const next = { ...prev };
        delete next[filePath];
        return next;
      });
      setErrorFiles((prev) => {
        const next = { ...prev };
        delete next[filePath];
        return next;
      });
      // Switch to adjacent tab
      if (activeTab === filePath) {
        const idx = tabs.indexOf(filePath);
        setActiveTab(newTabs[Math.max(0, idx - 1)] ?? null);
      }
    },
    [tabs, activeTab]
  );

  // When parent changes selectedFile, open it
  useEffect(() => {
    if (selectedFile && agentUrl) {
      openTab(selectedFile);
    }
  }, [selectedFile, agentUrl]); // eslint-disable-line react-hooks/exhaustive-deps

  const isLoading = activeTab && loadingFiles.has(activeTab);
  const hasError = activeTab && errorFiles[activeTab];
  const content = activeTab ? openFiles[activeTab] : null;
  const language = activeTab ? getLanguage(getBasename(activeTab)) : "text";

  return (
    <div className="flex h-full min-w-0 flex-col bg-background">
      {/* Tab bar */}
      {tabs.length > 0 && (
        <div className="flex shrink-0 items-end overflow-x-auto border-b border-border bg-background scrollbar-none">
          {tabs.map((filePath) => {
            const isActive = filePath === activeTab;
            const loading = loadingFiles.has(filePath);
            const basename = getBasename(filePath);
            return (
              <button
                key={filePath}
                onClick={() => setActiveTab(filePath)}
                title={filePath}
                className={cn(
                  "group flex h-8 shrink-0 max-w-[180px] items-center gap-1.5 border-r border-border px-3 text-[12px] transition-colors",
                  isActive
                    ? "border-t border-t-primary bg-background text-foreground"
                    : "bg-muted/30 text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                )}
              >
                {loading && <Loader2 className="h-3 w-3 animate-spin shrink-0" />}
                <span className="truncate">{basename}</span>
                <span
                  role="button"
                  tabIndex={-1}
                  onClick={(e) => closeTab(filePath, e)}
                  className={cn(
                    "ml-auto flex h-4 w-4 shrink-0 items-center justify-center rounded hover:bg-muted",
                    isActive ? "opacity-60 hover:opacity-100" : "opacity-0 group-hover:opacity-60"
                  )}
                >
                  <X className="h-2.5 w-2.5" />
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Content area */}
      <div className="flex min-h-0 flex-1 flex-col">
        {/* Breadcrumb / file path */}
        {activeTab && (
          <div className="shrink-0 border-b border-border px-4 py-1">
            <span className="font-mono text-[11px] text-muted-foreground/70">
              {activeTab}
            </span>
          </div>
        )}

        {/* No tabs open */}
        {tabs.length === 0 && <EmptyState />}

        {/* Loading */}
        {isLoading && (
          <div className="flex-1 space-y-2 p-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <Skeleton
                key={i}
                className="h-4"
                style={{ width: `${30 + Math.random() * 60}%` }}
              />
            ))}
          </div>
        )}

        {/* Error */}
        {!isLoading && hasError && (
          <div className="flex flex-1 flex-col items-center justify-center gap-2">
            <p className="text-xs text-destructive">{errorFiles[activeTab]}</p>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs"
              onClick={() => {
                // Remove error state and retry
                setErrorFiles((prev) => {
                  const next = { ...prev };
                  delete next[activeTab];
                  return next;
                });
                setTabs((prev) => prev.filter((t) => t !== activeTab));
                const retry = activeTab;
                setActiveTab(null);
                setTimeout(() => openTab(retry), 50);
              }}
            >
              Retry
            </Button>
          </div>
        )}

        {/* Code content */}
        {!isLoading && !hasError && content != null && activeTab && (
          <ScrollArea className="flex-1">
            <SyntaxHighlighter
              language={language}
              style={customStyle}
              showLineNumbers
              lineNumberStyle={{
                minWidth: "2.5em",
                paddingRight: "1em",
                color: "#4d4d4d",
                userSelect: "none",
                fontSize: "12px",
              }}
              customStyle={{
                margin: 0,
                padding: "12px 0",
                background: "transparent",
                fontSize: "13px",
                lineHeight: "1.6",
                fontFamily: '"GeistMono Variable", "Geist Mono", "Cascadia Code", "Fira Code", Consolas, monospace',
              }}
              codeTagProps={{
                style: { fontFamily: "inherit" },
              }}
              wrapLongLines={false}
            >
              {content}
            </SyntaxHighlighter>
          </ScrollArea>
        )}

        {/* Empty tab content (null content, no error, not loading) */}
        {!isLoading && !hasError && content == null && activeTab && (
          <div className="flex flex-1 items-center justify-center">
            <p className="text-xs text-muted-foreground/50">File is empty</p>
          </div>
        )}
      </div>
    </div>
  );
}
