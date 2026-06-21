import { useRef, useState } from "react";
import { SendHorizonal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

/**
 * @param {{ onSend: (message: string) => void, disabled: boolean }} props
 */
export default function ChatInput({ onSend, disabled }) {
  const [value, setValue] = useState("");
  const textareaRef = useRef(null);

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex items-end gap-2 border-t border-border bg-background p-3">
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Describe what to build…"
        disabled={disabled}
        rows={1}
        className="min-h-[40px] max-h-[160px] flex-1 resize-none bg-muted/40 text-sm placeholder:text-muted-foreground/60 focus-visible:ring-1 focus-visible:ring-ring"
        style={{ fieldSizing: "content" }}
      />
      <Button
        size="icon"
        onClick={handleSubmit}
        disabled={disabled || !value.trim()}
        className="h-9 w-9 shrink-0"
      >
        <SendHorizonal className="h-4 w-4" />
        <span className="sr-only">Send</span>
      </Button>
    </div>
  );
}
