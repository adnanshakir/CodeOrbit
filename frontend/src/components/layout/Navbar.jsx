import {
  Box,
  Search,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSandbox } from "@/hooks/useSandbox";

/**
 * @param {{
 *   commandQuery: string,
 *   onClearCommandQuery: () => void,
 *   onOpenCommandPalette: () => void,
 * }} props
 */
export default function Navbar({
  commandQuery,
  onClearCommandQuery,
  onOpenCommandPalette,
}) {
  const { isSandboxReady } = useSandbox();

  return (
    <header className="grid h-10 shrink-0 grid-cols-[1fr_auto_1fr] items-center border-b border-border bg-background px-3">
      <div className="flex min-w-0 items-center gap-2.5">
        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded border border-border bg-muted">
          <Box className="h-3.5 w-3.5" />
        </div>
        <span className="truncate text-sm font-semibold tracking-tight">Sandbox Builder</span>
        {isSandboxReady && (
          <span className="flex items-center gap-1.5 rounded-full border border-green-800/40 bg-green-500/10 px-2 py-0.5 text-[10px] text-green-400">
            <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
            Active
          </span>
        )}
      </div>

      <div className="flex justify-center px-4">
        {isSandboxReady && (
          <div className="relative w-[clamp(320px,34vw,400px)]">
            <button
              type="button"
              onClick={onOpenCommandPalette}
              className="flex h-8 w-full items-center gap-2 rounded-lg border border-border bg-zinc-950/80 px-3 text-left text-xs text-muted-foreground shadow-sm transition-colors hover:border-border/80 hover:bg-zinc-900"
            >
              <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground/80" />
              <span className="min-w-0 flex-1 truncate">
                {commandQuery || "Search content..."}
              </span>
              <kbd className="shrink-0 rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                ⌘ K
              </kbd>
            </button>

            {commandQuery && (
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                className="absolute right-[3.25rem] top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={(e) => {
                  e.stopPropagation();
                  onClearCommandQuery();
                }}
                aria-label="Clear search"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        )}
      </div>

      <div aria-hidden="true" />
    </header>
  );
}
