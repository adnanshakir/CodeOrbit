import {
  Box,
  MessageSquare,
  Monitor,
  PanelBottomClose,
  PanelBottomOpen,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useSandbox } from "@/hooks/useSandbox";

/**
 * @param {{
 *   explorerCollapsed: boolean,
 *   chatCollapsed: boolean,
 *   terminalCollapsed: boolean,
 *   onToggleExplorer: () => void,
 *   onToggleChat: () => void,
 *   onToggleTerminal: () => void,
 *   onOpenPreview: () => void,
 * }} props
 */
export default function Navbar({
  explorerCollapsed,
  chatCollapsed,
  terminalCollapsed,
  onToggleExplorer,
  onToggleChat,
  onToggleTerminal,
  onOpenPreview,
}) {
  const { sandboxId, isSandboxReady } = useSandbox();

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

      {/* Center: sandbox ID */}
      <div className="flex flex-1 justify-center">
        {sandboxId && (
          <span className="rounded border border-border bg-muted/40 px-2.5 py-0.5 font-mono text-[11px] text-muted-foreground">
            {sandboxId.length > 28 ? `${sandboxId.slice(0, 28)}…` : sandboxId}
          </span>
        )}
      </div>

      {/* Right: actions */}
      <div className="flex flex-1 items-center justify-end gap-0.5">
        {isSandboxReady && (
          <>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 gap-1.5 px-2 text-xs"
                  onClick={onOpenPreview}
                >
                  <Monitor className="h-3.5 w-3.5" />
                  Preview
                </Button>
              </TooltipTrigger>
              <TooltipContent>Switch to Preview tab</TooltipContent>
            </Tooltip>

            <Separator orientation="vertical" className="mx-1 h-5" />

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onToggleExplorer}>
                  {explorerCollapsed
                    ? <PanelLeftOpen className="h-4 w-4" />
                    : <PanelLeftClose className="h-4 w-4" />
                  }
                </Button>
              </TooltipTrigger>
              <TooltipContent>{explorerCollapsed ? "Show Explorer" : "Hide Explorer"}</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onToggleTerminal}>
                  {terminalCollapsed
                    ? <PanelBottomOpen className="h-4 w-4" />
                    : <PanelBottomClose className="h-4 w-4" />
                  }
                </Button>
              </TooltipTrigger>
              <TooltipContent>{terminalCollapsed ? "Show Terminal" : "Hide Terminal"}</TooltipContent>
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
              <TooltipContent>{chatCollapsed ? "Show Chat" : "Hide Chat"}</TooltipContent>
            </Tooltip>
          </>
        )}
      </div>
    </header>
  );
}
