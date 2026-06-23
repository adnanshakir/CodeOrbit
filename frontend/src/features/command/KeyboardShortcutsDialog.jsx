import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const SHORTCUTS = [
  { keys: "⌘ B", description: "Toggle Explorer" },
  { keys: "⌘ `", description: "Toggle Terminal" },
  { keys: "⌘ + Shift + C", description: "Toggle Chat" },
  { keys: "⌘ K", description: "Command Palette" },
  { keys: "⌘ P", description: "Quick Open" },
  { keys: "⌘ + Shift + F", description: "Search In Files" },
];

export default function KeyboardShortcutsDialog({ isOpen, onClose }) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent
        showCloseButton={false}
        className="top-[20%] w-[min(92vw,520px)] max-w-none translate-y-0 gap-0 overflow-hidden rounded-xl border border-border bg-zinc-950 p-0 text-foreground shadow-2xl data-[state=closed]:slide-out-to-top-2 data-[state=open]:slide-in-from-top-2 [&>button]:hidden"
      >
        <DialogHeader className="border-b border-border px-4 py-3">
          <DialogTitle className="text-xs font-medium uppercase tracking-[0.24em] text-muted-foreground">
            Keyboard Shortcuts
          </DialogTitle>
        </DialogHeader>

        <div className="divide-y divide-border">
          {SHORTCUTS.map(({ keys, description }) => (
            <div key={keys} className="flex items-center justify-between px-4 py-3 text-sm">
              <span className="text-foreground">{description}</span>
              <kbd className="rounded border border-border bg-muted px-2 py-0.5 font-mono text-[11px] text-muted-foreground">
                {keys}
              </kbd>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}