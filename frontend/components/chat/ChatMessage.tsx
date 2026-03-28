"use client"

import { Message } from "@/lib/types";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { User, Bot, Copy, Check } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function ChatMessage({ message }: { message: Message }) {
  const isUser = message.role === "user";
  const [copied, setCopied] = useState(false);

  const copyText = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div
      className={cn(
        "flex gap-3 items-start",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      {/* AVATAR (only for assistant for cleaner look) */}
      {!isUser && (
        <div className="w-7 h-7 flex items-center justify-center border rounded-md text-muted-foreground shrink-0">
          <Bot size={14} />
        </div>
      )}

      {/* MESSAGE */}
      <div className="max-w-[85%] sm:max-w-[75%] space-y-1">

        <div
          className={cn(
            "px-3 py-2 text-sm rounded-lg",
            isUser
              ? "bg-primary text-primary-foreground"
              : "bg-muted border"
          )}
        >
          {isUser ? (
            <div className="whitespace-pre-wrap">
              {message.content}
            </div>
          ) : (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                p: ({ children }) => (
                  <p className="mb-2 last:mb-0">{children}</p>
                ),

                ul: ({ children }) => (
                  <ul className="list-disc ml-4 mb-2">{children}</ul>
                ),

                ol: ({ children }) => (
                  <ol className="list-decimal ml-4 mb-2">{children}</ol>
                ),

              }}
            >
              {message.content}
            </ReactMarkdown>
          )}
        </div>

        {/* ACTIONS */}
        {!isUser && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Button
              variant="ghost"
              size="sm"
              onClick={copyText}
              className="h-6 px-2"
            >
              {copied ? (
                <>
                  <Check size={12} className="mr-1" />
                  Copied
                </>
              ) : (
                <>
                  <Copy size={12} className="mr-1" />
                  Copy
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      {/* USER AVATAR (right side) */}
      {isUser && (
        <div className="w-7 h-7 flex items-center justify-center border rounded-md text-muted-foreground shrink-0">
          <User size={14} />
        </div>
      )}
    </div>
  );
}