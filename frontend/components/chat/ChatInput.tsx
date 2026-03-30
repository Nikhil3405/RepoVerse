"use client";

import { useState, KeyboardEvent, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Send, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  repoId: string;
  conversationId: string;
  addMessage: (msg: { role: "user" | "assistant"; content: string }) => void;
  updateLastMessage: (content: string) => void;
}

export default function MessageInput({
  conversationId,
  repoId,
  addMessage,
  updateLastMessage,
}: Props) {
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // ✅ auto resize
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        textareaRef.current.scrollHeight + "px";
    }
  }, [message]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const sendMessage = async () => {
    if (!message.trim() || isLoading) return;

    const question = message;
    setIsLoading(true);

    addMessage({ role: "user", content: question });
    addMessage({ role: "assistant", content: "" });
    setMessage("");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversation_id: conversationId,
          repo_id: repoId,
          question,
        }),
      });

      if (!res.body) throw new Error();

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let aiMessage = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        aiMessage += chunk;
        updateLastMessage(aiMessage);
      }
    } catch {
      updateLastMessage("Error generating response.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={cn(
        "flex items-end gap-2 rounded-lg border px-3 py-2 bg-background transition",
        isFocused && "ring-2 ring-ring",
      )}
    >
      {/* TEXTAREA */}
      <textarea
        ref={textareaRef}
        rows={1}
        placeholder="Ask anything about this codebase..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        disabled={isLoading}
        className="flex-1  resize-none bg-transparent text-sm outline-none placeholder:text-muted-foreground"
      />

      {/* SEND BUTTON */}
      <Button
        onClick={sendMessage}
        disabled={!message.trim() || isLoading}
        size="icon"
        className="h-8 w-8 shrink-0"
      >
        {isLoading ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <Send size={16} />
        )}
      </Button>
    </div>
  );
}
