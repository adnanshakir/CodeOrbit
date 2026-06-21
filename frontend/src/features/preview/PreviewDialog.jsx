import { useRef, useState } from "react";
import { ExternalLink, RefreshCw, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Full-screen preview dialog rendering the sandbox iframe.
 * Triggered from Navbar — keeps iframe off the main layout.
 */
export default function PreviewDialog({ previewUrl, isOpen, onClose }) {
  const iframeRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleRefresh = () => {
    setIsLoading(true);
    setHasError(false);
    if (iframeRef.current) {
      // eslint-disable-next-line no-self-assign
      iframeRef.current.src = iframeRef.current.src;
    }
  };

  const handleOpenChange = (open) => {
    if (!open) {
      setIsLoading(true);
      setHasError(false);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        className="flex h-[95vh] max-w-[95vw] flex-col gap-0 p-0 [&>button]:hidden"
      >
        {/* Custom header toolbar */}
        <DialogHeader className="flex-row items-center justify-between border-b border-border px-4 py-2 space-y-0">
          <DialogTitle className="text-sm font-medium">Preview</DialogTitle>
          <div className="flex items-center gap-1">
            {/* URL read-only */}
            <div className="mr-2 max-w-xs truncate rounded border border-border bg-muted/40 px-2.5 py-1 font-mono text-[11px] text-muted-foreground">
              {previewUrl ?? "No preview URL"}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={handleRefresh}
              disabled={!previewUrl}
              title="Refresh"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => previewUrl && window.open(previewUrl, "_blank")}
              disabled={!previewUrl}
              title="Open in new tab"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={onClose}
              title="Close"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        </DialogHeader>

        {/* iframe area */}
        <div className="relative flex-1 overflow-hidden bg-white">
          {isLoading && previewUrl && (
            <div className="absolute inset-0 z-10 flex flex-col gap-3 bg-background p-8">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-64 w-full" />
              <div className="flex gap-4">
                <Skeleton className="h-32 flex-1" />
                <Skeleton className="h-32 flex-1" />
                <Skeleton className="h-32 flex-1" />
              </div>
            </div>
          )}

          {hasError && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-background">
              <p className="text-sm text-muted-foreground">Preview failed to load</p>
              <Button variant="outline" size="sm" onClick={handleRefresh}>
                <RefreshCw className="mr-2 h-3.5 w-3.5" />
                Retry
              </Button>
            </div>
          )}

          {!previewUrl && (
            <div className="flex h-full items-center justify-center bg-background">
              <p className="text-sm text-muted-foreground/50">No preview URL available</p>
            </div>
          )}

          {previewUrl && (
            <iframe
              ref={iframeRef}
              src={previewUrl}
              className="h-full w-full border-0"
              onLoad={() => { setIsLoading(false); setHasError(false); }}
              onError={() => { setIsLoading(false); setHasError(true); }}
              title="Sandbox Preview"
              sandbox="allow-scripts allow-same-origin allow-forms allow-modals allow-popups"
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
