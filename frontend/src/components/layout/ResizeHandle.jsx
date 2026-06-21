import { cn } from "@/lib/utils";

/**
 * Drag handle between panels.
 *
 * @param {{
 *   direction: "horizontal" | "vertical",
 *   onMouseDown: (e: React.MouseEvent) => void,
 *   isResizing?: boolean,
 * }} props
 */
export default function ResizeHandle({ direction, onMouseDown, isResizing = false }) {
  const isH = direction === "horizontal";

  return (
    <div
      role="separator"
      aria-orientation={direction}
      onMouseDown={onMouseDown}
      className={cn(
        "group relative flex shrink-0 items-center justify-center bg-border transition-colors",
        isH ? "w-px cursor-col-resize hover:w-0.5 hover:bg-primary/50" : "h-px cursor-row-resize hover:h-0.5 hover:bg-primary/50",
        isResizing && (isH ? "w-0.5 bg-primary/60" : "h-0.5 bg-primary/60")
      )}
    >
      {/* Invisible wider hit area */}
      <div
        className={cn(
          "absolute z-10",
          isH ? "inset-y-0 -left-1 -right-1" : "inset-x-0 -top-1 -bottom-1"
        )}
      />
    </div>
  );
}
