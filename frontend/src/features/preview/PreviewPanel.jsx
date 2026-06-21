import { useRef, useState } from "react";
import { ExternalLink, MonitorSmartphone, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useSandbox } from "@/hooks/useSandbox";

export default function PreviewPanel() {
  const { previewUrl } = useSandbox();
  const iframeRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const handleRefresh = () => {
    setIsLoading(true);
    setLoadError(false);
    if (iframeRef.current) {
      // eslint-disable-next-line no-self-assign
      iframeRef.current.src = iframeRef.current.src;
    }
  };

  const handleLoad = () => {
    setIsLoading(false);
    setLoadError(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setLoadError(true);
  };

  return (
    <div className="flex h-full min-w-0 flex-col bg-background">
      {/* Toolbar */}
      <div className="flex items-center gap-2 border-b border-border px-3 py-2">
        <MonitorSmartphone className="h-4 w-4 shrink-0 text-muted-foreground" />

        {/* URL display */}
        <div className="flex-1 truncate rounded-md border border-border bg-muted/40 px-2.5 py-1 text-xs text-muted-foreground font-mono">
          {previewUrl ?? "No preview available"}
        </div>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 shrink-0"
              onClick={handleRefresh}
              disabled={!previewUrl}
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span className="sr-only">Refresh preview</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Refresh</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 shrink-0"
              disabled={!previewUrl}
              onClick={() => previewUrl && window.open(previewUrl, "_blank")}
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span className="sr-only">Open in new tab</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Open in new tab</TooltipContent>
        </Tooltip>
      </div>

      {/* Preview area */}
      <div className="relative flex-1 overflow-hidden bg-white">
        {/* Loading skeleton overlay */}
        {isLoading && previewUrl && (
          <div className="absolute inset-0 z-10 flex flex-col gap-3 bg-background p-6">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-48 w-full" />
            <div className="flex gap-3">
              <Skeleton className="h-24 flex-1" />
              <Skeleton className="h-24 flex-1" />
              <Skeleton className="h-24 flex-1" />
            </div>
            <Skeleton className="h-32 w-full" />
          </div>
        )}

        {/* Error state */}
        {loadError && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-background">
            <p className="text-sm text-muted-foreground">Preview failed to load</p>
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCw className="mr-2 h-3.5 w-3.5" />
              Reload
            </Button>
          </div>
        )}

        {/* No URL state */}
        {!previewUrl && (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-muted-foreground/50">Preview will appear here</p>
          </div>
        )}

        {/* iframe */}
        {previewUrl && (
          <iframe
            ref={iframeRef}
            src={previewUrl}
            className="h-full w-full border-0"
            onLoad={handleLoad}
            onError={handleError}
            title="Sandbox Preview"
            sandbox="allow-scripts allow-same-origin allow-forms allow-modals allow-popups"
          />
        )}
      </div>
    </div>
  );
}
