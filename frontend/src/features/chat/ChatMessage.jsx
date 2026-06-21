import { cn } from "@/lib/utils";

/**
 * Single chat message bubble.
 *
 * @param {{ role: "user" | "assistant", content: string, streaming?: boolean }} props
 */
export default function ChatMessage({ role, content, streaming = false }) {
  const isUser = role === "user";

  return (
    <div className={cn("flex w-full gap-3 px-4 py-2", isUser ? "justify-end" : "justify-start")}>
      {!isUser && (
        <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-border bg-muted text-[10px] font-semibold text-muted-foreground">
          AI
        </div>
      )}

      <div
        className={cn(
          "max-w-[85%] rounded-lg px-3 py-2 text-sm leading-relaxed",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-foreground"
        )}
      >
        <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed break-words">
          {content}
          {streaming && (
            <span className="ml-0.5 inline-block h-3.5 w-0.5 animate-pulse bg-current align-middle opacity-80" />
          )}
        </pre>
      </div>

      {isUser && (
        <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-border bg-muted text-[10px] font-semibold text-muted-foreground">
          U
        </div>
      )}
    </div>
  );
}
