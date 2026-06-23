import { useCallback, useEffect, useState } from "react";
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
import CommandPalette from "@/features/command/CommandPalette";
import QuickOpen from "@/features/command/QuickOpen";
import ContentSearch from "@/features/command/ContentSearch";
import KeyboardShortcutsDialog from "@/features/command/KeyboardShortcutsDialog";
import { useSandbox } from "@/hooks/useSandbox";
import { useResizable, useResizableRight, useResizableTop } from "@/hooks/useResizable";
import { useWorkspaceShortcuts } from "@/hooks/useWorkspaceShortcuts";

// ── Layout constants (pixels) ───────────────────────────────────────────────
const EXPLORER = { default: 260, min: 180, max: 500, collapsed: 48 };
const CHAT     = { default: 380, min: 280, max: 700, collapsed: 48 };
const TERMINAL = { default: 250, min: 120, max: Math.round(window.innerHeight * 0.7), collapsed: 40 };

/**
 * IDE-style workspace layout with keyboard shortcuts.
 *
 *  ┌──────────────────────────────────────────────────────────┐
 *  │  Navbar (search bar center)                              │
 *  ├──────────┬───────────────────────────────────────────────┤
 *  │          │  Center [Code|Preview]   │  AI Chat            │
 *  │ Explorer │  flex: 1                 │  380px              │
 *  │  260px   ├──────────────────────────┴────────────────────┤
 *  │          │  Terminal (250px, collapsible via Ctrl+`)      │
 *  ├──────────┴───────────────────────────────────────────────┘
 *
 *  Ctrl+B        Toggle Explorer
 *  Ctrl+`        Toggle Terminal
 *  Ctrl+Shift+C  Toggle Chat
 *  Ctrl+K        Command Palette
 *  Ctrl+P        Quick Open (file search)
 *  Ctrl+Shift+F  Content Search
 */
function WorkspacePage() {
  const { agentUrl } = useSandbox();

  // ── Collapse state ────────────────────────────────────────────────────
  const [explorerCollapsed, setExplorerCollapsed] = useState(false);
  const [chatCollapsed, setChatCollapsed] = useState(false);
  const [terminalCollapsed, setTerminalCollapsed] = useState(false);

  // ── Resize hooks ──────────────────────────────────────────────────────
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

  // ── Shared state ──────────────────────────────────────────────────────
  const [selectedFile, setSelectedFile] = useState(null);
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState("code");
  const [fileList, setFileList] = useState([]);

  // ── Dialog state ──────────────────────────────────────────────────────
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [quickOpenOpen, setQuickOpenOpen] = useState(false);
  const [contentSearchOpen, setContentSearchOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [commandQuery, setCommandQuery] = useState("");

  const toggleExplorer = useCallback(() => setExplorerCollapsed((c) => !c), []);
  const toggleChat = useCallback(() => setChatCollapsed((c) => !c), []);
  const toggleTerminal = useCallback(() => setTerminalCollapsed((c) => !c), []);

  const closeDialogs = useCallback(() => {
    setCommandPaletteOpen(false);
    setQuickOpenOpen(false);
    setContentSearchOpen(false);
    setShortcutsOpen(false);
  }, []);

  const openCommandPalette = useCallback(() => {
    closeDialogs();
    setCommandPaletteOpen(true);
  }, [closeDialogs]);

  const openQuickOpen = useCallback(() => {
    closeDialogs();
    setQuickOpenOpen(true);
  }, [closeDialogs]);

  const openContentSearch = useCallback(() => {
    closeDialogs();
    setContentSearchOpen(true);
  }, [closeDialogs]);

  const openShortcutsDialog = useCallback(() => {
    closeDialogs();
    setShortcutsOpen(true);
  }, [closeDialogs]);

  useWorkspaceShortcuts({
    enabled: true,
    onToggleExplorer: toggleExplorer,
    onToggleTerminal: toggleTerminal,
    onToggleChat: toggleChat,
    onOpenCommandPalette: openCommandPalette,
    onOpenQuickOpen: openQuickOpen,
    onOpenContentSearch: openContentSearch,
  });

  const handleFileSelect = useCallback((file) => {
    setSelectedFile(file);
    setActiveWorkspaceTab("code");
  }, []);

  // ── Keyboard shortcuts ────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      // Ctrl+B — Toggle Explorer
      if (e.ctrlKey && !e.shiftKey && e.key === "b") {
        e.preventDefault();
        toggleExplorer();
        return;
      }

      // Ctrl+` — Toggle Terminal
      if (e.ctrlKey && !e.shiftKey && e.key === "`") {
        e.preventDefault();
        toggleTerminal();
        return;
      }

      // Ctrl+Shift+C — Toggle Chat
      if (e.ctrlKey && e.shiftKey && (e.key === "C" || e.key === "c")) {
        e.preventDefault();
        toggleChat();
        return;
      }

      // Ctrl+K — Command Palette
      if (e.ctrlKey && !e.shiftKey && e.key === "k") {
        e.preventDefault();
        setCommandPaletteOpen((o) => !o);
        return;
      }

      // Ctrl+P — Quick Open
      if (e.ctrlKey && !e.shiftKey && e.key === "p") {
        e.preventDefault();
        setQuickOpenOpen((o) => !o);
        return;
      }

      // Ctrl+Shift+F — Content Search
      if (e.ctrlKey && e.shiftKey && (e.key === "F" || e.key === "f")) {
        e.preventDefault();
        setContentSearchOpen((o) => !o);
        return;
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [toggleExplorer, toggleTerminal, toggleChat]);

  // Computed sizes
  const explorerWidth = explorerCollapsed ? EXPLORER.collapsed : explorer.size;
  const chatWidth = chatCollapsed ? CHAT.collapsed : chat.size;
  const terminalHeight = terminalCollapsed ? TERMINAL.collapsed : terminal.size;

  return (
    <div className="flex h-full flex-col bg-background">
      <Navbar
        commandQuery={commandQuery}
        onClearCommandQuery={() => setCommandQuery("")}
        onOpenCommandPalette={openCommandPalette}
      />

      {/* ── Body: Explorer | Right column ── */}
      <div className="flex min-h-0 flex-1">

        {/* ── Explorer (full height) ── */}
        <div
          className="shrink-0 overflow-hidden"
          style={{ width: `${explorerWidth}px` }}
        >
          <FileExplorer
            agentUrl={agentUrl}
            isCollapsed={explorerCollapsed}
            selectedFile={selectedFile}
            onFileSelect={handleFileSelect}
            onToggleCollapse={toggleExplorer}
            onFilesLoaded={setFileList}
          />
        </div>

        {/* Resize handle: Explorer ↔ right column */}
        {!explorerCollapsed && (
          <ResizeHandle
            direction="horizontal"
            onMouseDown={explorer.startResize}
            isResizing={explorer.isResizing}
          />
        )}

        {/* ── Right column: (Code+Chat row) / Terminal ── */}
        <div className="flex min-w-0 flex-1 flex-col">

          {/* ── Top row: Center workspace + Chat ── */}
          <div className="flex min-h-0 flex-1">

            {/* Center workspace (flex: 1) */}
            <div className="flex min-w-0 flex-1 flex-col">
              <Tabs
                value={activeWorkspaceTab}
                onValueChange={setActiveWorkspaceTab}
                className="flex h-full min-h-0 flex-col"
              >
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
                  className="mt-0 flex min-h-0 flex-1 data-[state=inactive]:hidden"
                >
                  <CodePanel agentUrl={agentUrl} selectedFile={selectedFile} />
                </TabsContent>

                <TabsContent
                  value="preview"
                  forceMount
                  className="mt-0 flex min-h-0 flex-1 data-[state=inactive]:hidden"
                >
                  <PreviewTab />
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

            {/* Chat */}
            <div
              className="shrink-0 overflow-hidden border-l border-border"
              style={{ width: `${chatWidth}px` }}
            >
              {chatCollapsed ? (
                <CollapsedSidePanel label="Chat" side="right" onToggle={toggleChat} />
              ) : (
                <ChatPanel />
              )}
            </div>
          </div>

          {/* Resize handle: top row ↔ Terminal */}
          {!terminalCollapsed && (
            <ResizeHandle
              direction="vertical"
              onMouseDown={terminal.startResize}
              isResizing={terminal.isResizing}
            />
          )}

          {/* ── Terminal ── */}
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

      {/* ── Dialogs ── */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        query={commandQuery}
        onQueryChange={setCommandQuery}
        onClose={() => setCommandPaletteOpen(false)}
        onToggleExplorer={toggleExplorer}
        onToggleTerminal={toggleTerminal}
        onToggleChat={toggleChat}
        onOpenQuickOpen={openQuickOpen}
        onOpenContentSearch={openContentSearch}
        onOpenShortcuts={openShortcutsDialog}
      />
      <QuickOpen
        isOpen={quickOpenOpen}
        onClose={() => setQuickOpenOpen(false)}
        files={fileList}
        onFileSelect={handleFileSelect}
      />
      <ContentSearch
        isOpen={contentSearchOpen}
        onClose={() => setContentSearchOpen(false)}
        files={fileList}
        agentUrl={agentUrl}
        onFileSelect={handleFileSelect}
      />
      <KeyboardShortcutsDialog
        isOpen={shortcutsOpen}
        onClose={() => setShortcutsOpen(false)}
      />
    </div>
  );
}

/**
 * Collapsed side panel — 48px column with rotated label.
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