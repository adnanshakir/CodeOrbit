import { useState } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import Navbar from "@/components/layout/Navbar";
import ResizeHandle from "@/components/layout/ResizeHandle";
import FileExplorer from "@/features/explorer/FileExplorer";
import CodePanel from "@/features/code/CodePanel";
import PreviewTab from "@/features/preview/PreviewTab";
import ChatPanel from "@/features/chat/ChatPanel";
import TerminalPanel from "@/features/terminal/TerminalPanel";
import LandingPage from "@/features/sandbox/LandingPage";
import { useSandbox } from "@/hooks/useSandbox";
import { useResizable, useResizableRight, useResizableTop } from "@/hooks/useResizable";

// ── Layout constants ────────────────────────────────────────────────────────
const EXPLORER = { default: 260, min: 180, max: 500, collapsed: 48 };
const CHAT     = { default: 380, min: 280, max: 700, collapsed: 48 };
const TERMINAL = { default: 250, min: 120, max: Math.round(window.innerHeight * 0.7), collapsed: 40 };

/**
 * VS Code / Cursor inspired IDE layout.
 *
 *  ┌──────────────────────────────────────────────────────────┐
 *  │  Navbar                                                  │
 *  ├──────────┬──────────────────────────┬────────────────────┤
 *  │ Explorer │  Center [Code|Preview]   │  AI Chat           │
 *  │  260px   │     flex: 1              │   380px            │
 *  ├──────────┴──────────────────────────┴────────────────────┤
 *  │  Terminal (250px, collapsible to 40px header)            │
 *  └─────────────────────────────────────────────────────────┘
 *
 * All panels use fixed pixel widths. Center is flex:1.
 * No percentage-based sizing. No react-resizable-panels.
 */
function WorkspacePage() {
  const { agentUrl, previewUrl } = useSandbox();

  // ── Panel collapse state ──────────────────────────────────────────────
  const [explorerCollapsed, setExplorerCollapsed] = useState(false);
  const [chatCollapsed, setChatCollapsed] = useState(false);
  const [terminalCollapsed, setTerminalCollapsed] = useState(false);

  // ── Pixel-based resize hooks ──────────────────────────────────────────
  const explorer = useResizable({
    defaultSize: EXPLORER.default,
    minSize: EXPLORER.min,
    maxSize: EXPLORER.max,
    direction: "horizontal",
  });

  const chat = useResizableRight({
    defaultSize: CHAT.default,
    minSize: CHAT.min,
    maxSize: CHAT.max,
  });

  const terminal = useResizableTop({
    defaultSize: TERMINAL.default,
    minSize: TERMINAL.min,
    maxSize: TERMINAL.max,
  });

  // ── Shared selected file state (Explorer <-> CodePanel) ───────────────
  const [selectedFile, setSelectedFile] = useState(null);

  // ── Center workspace active tab ───────────────────────────────────────
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState("code");

  const toggleExplorer = () => setExplorerCollapsed((c) => !c);
  const toggleChat = () => setChatCollapsed((c) => !c);
  const toggleTerminal = () => setTerminalCollapsed((c) => !c);

  const handleOpenPreview = () => setActiveWorkspaceTab("preview");

  // Computed widths
  const explorerWidth = explorerCollapsed ? EXPLORER.collapsed : explorer.size;
  const chatWidth = chatCollapsed ? CHAT.collapsed : chat.size;
  const terminalHeight = terminalCollapsed ? TERMINAL.collapsed : terminal.size;

  return (
    <div className="flex h-full flex-col bg-background">
      <Navbar
        explorerCollapsed={explorerCollapsed}
        chatCollapsed={chatCollapsed}
        terminalCollapsed={terminalCollapsed}
        onToggleExplorer={toggleExplorer}
        onToggleChat={toggleChat}
        onToggleTerminal={toggleTerminal}
        onOpenPreview={handleOpenPreview}
      />

      {/* ── Main body (workspace + terminal stacked vertically) ─── */}
      <div className="flex min-h-0 flex-1 flex-col">

        {/* ── Top: horizontal panel row ─── */}
        <div className="flex min-h-0 flex-1">

          {/* ── Explorer ─── */}
          <div
            className="shrink-0 overflow-hidden"
            style={{ width: `${explorerWidth}px` }}
          >
            <FileExplorer
              agentUrl={agentUrl}
              isCollapsed={explorerCollapsed}
              selectedFile={selectedFile}
              onFileSelect={(file) => {
                setSelectedFile(file);
                setActiveWorkspaceTab("code");
              }}
              onToggleCollapse={toggleExplorer}
            />
          </div>

          {/* Resize handle: Explorer ↔ Center */}
          {!explorerCollapsed && (
            <ResizeHandle
              direction="horizontal"
              onMouseDown={explorer.startResize}
              isResizing={explorer.isResizing}
            />
          )}

          {/* ── Center workspace (flex: 1) ─── */}
          <div className="flex min-w-0 flex-1 flex-col">
            <Tabs
              value={activeWorkspaceTab}
              onValueChange={setActiveWorkspaceTab}
              className="flex h-full flex-col"
            >
              {/* Tab switcher bar */}
              <TabsList className="h-9 w-full shrink-0 justify-start rounded-none border-b border-border bg-background px-2">
                <TabsTrigger
                  value="code"
                  className="h-7 rounded-sm px-3 text-xs data-[state=active]:bg-muted data-[state=active]:shadow-none"
                >
                  Code
                </TabsTrigger>
                <TabsTrigger
                  value="preview"
                  className="h-7 rounded-sm px-3 text-xs data-[state=active]:bg-muted data-[state=active]:shadow-none"
                >
                  Preview
                </TabsTrigger>
              </TabsList>

              <TabsContent
                value="code"
                forceMount
                className="mt-0 flex-1 data-[state=inactive]:hidden"
              >
                <CodePanel agentUrl={agentUrl} selectedFile={selectedFile} />
              </TabsContent>

              <TabsContent
                value="preview"
                forceMount
                className="mt-0 flex-1 data-[state=inactive]:hidden"
              >
                <PreviewTab previewUrl={previewUrl} />
              </TabsContent>
            </Tabs>
          </div>

          {/* Resize handle: Center ↔ Chat */}
          {!chatCollapsed && (
            <ResizeHandle
              direction="horizontal"
              onMouseDown={chat.startResize}
              isResizing={chat.isResizing}
            />
          )}

          {/* ── Chat panel ─── */}
          <div
            className="shrink-0 overflow-hidden border-l border-border"
            style={{ width: `${chatWidth}px` }}
          >
            {chatCollapsed ? (
              <CollapsedSidePanel
                label="Chat"
                side="right"
                onToggle={toggleChat}
              />
            ) : (
              <ChatPanel />
            )}
          </div>
        </div>

        {/* Resize handle: Workspace ↔ Terminal */}
        {!terminalCollapsed && (
          <ResizeHandle
            direction="vertical"
            onMouseDown={terminal.startResize}
            isResizing={terminal.isResizing}
          />
        )}

        {/* ── Terminal ─── */}
        <div
          className="shrink-0 overflow-hidden"
          style={{ height: `${terminalHeight}px` }}
        >
          <TerminalPanel
            isCollapsed={terminalCollapsed}
            onToggleCollapse={toggleTerminal}
          />
        </div>
      </div>
    </div>
  );
}

/**
 * Collapsed side panel — 48px column with a rotated label.
 */
function CollapsedSidePanel({ label, side, onToggle }) {
  return (
    <div
      className="flex h-full w-full cursor-pointer flex-col items-center pt-3"
      onClick={onToggle}
    >
      <span
        className="text-[11px] font-medium tracking-wide text-muted-foreground"
        style={{
          writingMode: "vertical-rl",
          transform: side === "left" ? "rotate(180deg)" : undefined,
        }}
      >
        {label}
      </span>
    </div>
  );
}

// ── Root App ────────────────────────────────────────────────────────────────
export default function App() {
  const { isSandboxReady } = useSandbox();

  return (
    <TooltipProvider delayDuration={300}>
      <div className="dark h-full bg-background text-foreground">
        {isSandboxReady ? <WorkspacePage /> : <LandingPage />}
      </div>
    </TooltipProvider>
  );
}