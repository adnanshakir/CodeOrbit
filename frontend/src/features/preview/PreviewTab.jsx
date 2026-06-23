import { useRef, useState } from "react";
import { ExternalLink, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useSandbox } from "@/hooks/useSandbox";

/**
 * Preview tab content.
 * Does NOT mount the iframe until `isPreviewReady` is true (polled in context).
 * This prevents the 504 Gateway Timeout on first load.
 */
export default function PreviewTab() {
  const { previewUrl, isPreviewReady } = useSandbox();
  const iframeRef = useRef(null);
  const [iframeLoading, setIframeLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleRefresh = () => {
    setIframeLoading(true);
    setHasError(false);
    if (iframeRef.current) {
      // eslint-disable-next-line no-self-assign
      iframeRef.current.src = iframeRef.current.src;
    }
  };

  return (
    <div className="flex h-full min-w-0 flex-col">
      {/* Toolbar */}
      <div className="flex h-9 shrink-0 items-center gap-2 border-b border-border px-3">
        <div className="flex-1 truncate rounded border border-border bg-muted/40 px-2.5 py-0.5 font-mono text-[11px] text-muted-foreground">
          {previewUrl ?? "No preview URL"}
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 shrink-0"
              onClick={handleRefresh}
              disabled={!isPreviewReady}
            >
              <RefreshCw className="h-3 w-3" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Refresh</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 shrink-0"
              onClick={() => previewUrl && window.open(previewUrl, "_blank")}
              disabled={!isPreviewReady}
            >
              <ExternalLink className="h-3 w-3" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Open in new tab</TooltipContent>
        </Tooltip>
      </div>

      {/* Content area */}
      <div className="relative flex-1 overflow-hidden">
        {/* Not ready: waiting for Vite server */}
        {!isPreviewReady && previewUrl && (
          <div className="flex h-full flex-col items-center justify-center gap-3 bg-background">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <div className="space-y-1 text-center">
              <p className="text-sm font-medium text-foreground">Starting Preview…</p>
              <p className="text-xs text-muted-foreground">
                Waiting for Vite dev server…
              </p>
            </div>
          </div>
        )}

        {/* No URL at all */}
        {!previewUrl && (
          <div className="flex h-full items-center justify-center bg-background">
            <p className="text-sm text-muted-foreground/50">No preview URL available</p>
          </div>
        )}

        {/* Ready: mount iframe */}
        {isPreviewReady && previewUrl && (
          <>
            {/* iframe loading skeleton overlay */}
            {iframeLoading && (
              <div className="absolute inset-0 z-10 flex flex-col gap-3 bg-background p-6">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-48 w-full" />
                <div className="flex gap-3">
                  <Skeleton className="h-24 flex-1" />
                  <Skeleton className="h-24 flex-1" />
                  <Skeleton className="h-24 flex-1" />
                </div>
              </div>
            )}

            {hasError && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-background">
                <p className="text-sm text-muted-foreground">Preview failed to load</p>
                <Button variant="outline" size="sm" onClick={handleRefresh}>
                  <RefreshCw className="mr-2 h-3.5 w-3.5" />
                  Reload
                </Button>
              </div>
            )}

            <iframe
              ref={iframeRef}
              src={previewUrl}
              className="h-full w-full border-0 bg-white"
              onLoad={() => { setIframeLoading(false); setHasError(false); }}
              onError={() => { setIframeLoading(false); setHasError(true); }}
              title="Sandbox Preview"
              sandbox="allow-scripts allow-same-origin allow-forms allow-modals allow-popups"
            />
          </>
        )}
      </div>
    </div>
  );
}
