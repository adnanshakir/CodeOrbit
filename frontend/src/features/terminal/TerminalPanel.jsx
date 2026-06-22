import { useRef } from "react";
import { ChevronDown, ChevronUp, Terminal as TerminalIcon, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useTerminal } from "@/hooks/useTerminal";
import { useSandbox } from "@/hooks/useSandbox";

/**
 * VS Code-style terminal panel.
 * When collapsed, only the 40px header is visible.
 * XTerm stays mounted (hidden) so the socket session is preserved.
 */
export default function TerminalPanel({ isCollapsed, onToggleCollapse }) {
  const { agentSocketUrl } = useSandbox();
  const containerRef = useRef(null);

  const { isDisconnected } = useTerminal(agentSocketUrl, containerRef);

  return (
    <div className="flex h-full min-w-0 flex-col">
      {/* Header — solid background, clear border, sticky */}
      <div
        className="flex h-10 shrink-0 cursor-pointer select-none items-center justify-between border-b border-border bg-zinc-900 px-4"
        onClick={onToggleCollapse}
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <TerminalIcon className="h-3.5 w-3.5 text-foreground" />
            <span className="text-xs font-medium text-foreground">Terminal</span>
          </div>
          {isDisconnected && (
            <span className="flex items-center gap-1 rounded-full bg-destructive/20 px-2 py-0.5 text-[10px] text-destructive">
              <WifiOff className="h-2.5 w-2.5" />
              Disconnected
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          <span className="mr-2 text-[10px] text-muted-foreground/50">
            {isCollapsed ? "Ctrl+`" : ""}
          </span>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 shrink-0"
                onClick={(e) => { e.stopPropagation(); onToggleCollapse(); }}
              >
                {isCollapsed ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>{isCollapsed ? "Expand (Ctrl+`)" : "Collapse (Ctrl+`)"}</TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* Disconnect banner */}
      {!isCollapsed && isDisconnected && (
        <div className="flex shrink-0 items-center gap-2 border-b border-destructive/20 bg-destructive/10 px-4 py-1.5 text-xs text-destructive">
          <WifiOff className="h-3 w-3 shrink-0" />
          <span>Terminal disconnected — session will resume if the socket reconnects.</span>
        </div>
      )}

      {/* XTerm container — hidden when collapsed, never unmounted */}
      <div
        ref={containerRef}
        className="min-w-0 flex-1 overflow-hidden bg-[#0a0a0a] p-1"
        style={{
          minHeight: 0,
          display: isCollapsed ? "none" : undefined,
        }}
      />
    </div>
  );
}
