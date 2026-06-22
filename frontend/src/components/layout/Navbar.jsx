import {
  Box,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useSandbox } from "@/hooks/useSandbox";

/**
 * @param {{
 *   explorerCollapsed: boolean,
 *   chatCollapsed: boolean,
 *   onToggleExplorer: () => void,
 *   onToggleChat: () => void,
 *   onOpenQuickOpen: () => void,
 * }} props
 */
export default function Navbar({
  explorerCollapsed,
  chatCollapsed,
  onToggleExplorer,
  onToggleChat,
  onOpenQuickOpen,
}) {
  const { isSandboxReady } = useSandbox();

  return (
    <header className="flex h-10 shrink-0 items-center border-b border-border bg-background px-3">
      {/* Left: brand + status */}
      <div className="flex flex-1 items-center gap-2.5">
        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded border border-border bg-muted">
          <Box className="h-3.5 w-3.5" />
        </div>
        <span className="text-sm font-semibold tracking-tight">Sandbox Builder</span>
        {isSandboxReady && (
          <span className="flex items-center gap-1.5 rounded-full border border-green-800/40 bg-green-500/10 px-2 py-0.5 text-[10px] text-green-400">
            <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
            Active
          </span>
        )}
      </div>

      {/* Center: Search bar (Ctrl+P trigger) */}
      <div className="flex flex-1 justify-center">
        {isSandboxReady && (
          <button
            onClick={onOpenQuickOpen}
            className="flex h-7 w-full max-w-xs items-center gap-2 rounded border border-border bg-muted/40 px-3 text-xs text-muted-foreground transition-colors hover:bg-muted/60"
          >
            <Search className="h-3 w-3 shrink-0" />
            <span className="flex-1 text-left">Search files…</span>
            <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px]">
              Ctrl+P
            </kbd>
          </button>
        )}
      </div>

      {/* Right: panel toggles */}
      <div className="flex flex-1 items-center justify-end gap-0.5">
        {isSandboxReady && (
          <>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onToggleExplorer}>
                  {explorerCollapsed
                    ? <PanelLeftOpen className="h-4 w-4" />
                    : <PanelLeftClose className="h-4 w-4" />
                  }
                </Button>
              </TooltipTrigger>
              <TooltipContent>{explorerCollapsed ? "Show Explorer (Ctrl+B)" : "Hide Explorer (Ctrl+B)"}</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onToggleChat}>
                  {chatCollapsed
                    ? <PanelRightOpen className="h-4 w-4" />
                    : <PanelRightClose className="h-4 w-4" />
                  }
                </Button>
              </TooltipTrigger>
              <TooltipContent>{chatCollapsed ? "Show Chat (Ctrl+Shift+C)" : "Hide Chat (Ctrl+Shift+C)"}</TooltipContent>
            </Tooltip>
          </>
        )}
      </div>
    </header>
  );
}
