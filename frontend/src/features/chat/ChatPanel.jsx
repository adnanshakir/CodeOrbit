import { useCallback, useEffect, useRef, useState } from "react";
import { AlertCircle, MessageSquare } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import { streamAI } from "@/services/aiApi";
import { useSandbox } from "@/hooks/useSandbox";

/**
 * Full chat panel with local message state and SSE streaming.
 * Messages and streaming state are LOCAL — not in global context.
 */
export default function ChatPanel() {
  const { sandboxId } = useSandbox();

  // Local state only
  const [messages, setMessages] = useState([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamError, setStreamError] = useState(null);

  const bottomRef = useRef(null);
  const abortRef = useRef(null);

  // Auto-scroll to bottom on every message change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = useCallback(
    (text) => {
      if (isStreaming) return;

      // 1. Add user message
      const userMessage = { role: "user", content: text, id: Date.now() };

      // 2. Add one assistant message immediately — will be appended to
      const assistantId = Date.now() + 1;
      const assistantMessage = {
        role: "assistant",
        content: "",
        streaming: true,
        id: assistantId,
        error: false,
      };

      setMessages((prev) => [...prev, userMessage, assistantMessage]);
      setIsStreaming(true);
      setStreamError(null);

      // 3. Stream: append each chunk to the single assistant message
      const abort = streamAI(
        { message: text, projectId: sandboxId },
        (chunk) => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, content: m.content + chunk } : m
            )
          );
        },
        () => {
          // onDone — close the streaming bubble
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, streaming: false } : m
            )
          );
          setIsStreaming(false);
        },
        (error) => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? { ...m, streaming: false, error: true, content: m.content || error.message }
                : m
            )
          );
          setStreamError(error.message);
          setIsStreaming(false);
        }
      );

      abortRef.current = abort;
    },
    [isStreaming, sandboxId]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => abortRef.current?.();
  }, []);

  return (
    <div className="flex h-full min-w-0 flex-col bg-background">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-border px-4 py-2.5">
        <MessageSquare className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium text-foreground">Chat</span>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1">
        <div className="flex flex-col py-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
              <MessageSquare className="h-8 w-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground/60">
                Describe what you want to build
              </p>
            </div>
          )}

          {messages.map((message) => (
            <div key={message.id}>
              <ChatMessage
                role={message.role}
                content={message.content || (message.streaming ? "Thinking…" : "")}
                streaming={message.streaming}
              />
              {message.error && (
                <div className="mx-4 mt-1 flex items-center gap-1.5 text-xs text-destructive">
                  <AlertCircle className="h-3.5 w-3.5" />
                  <span>Request failed. Try again.</span>
                </div>
              )}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      {/* Stream error banner */}
      {streamError && !isStreaming && (
        <div className="mx-3 mb-2 flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          <span>AI error: {streamError}</span>
        </div>
      )}

      {/* Input */}
      <ChatInput onSend={handleSend} disabled={isStreaming} />
    </div>
  );
}
