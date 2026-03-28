"use client";

import { useEffect, useRef } from "react";
import ChatMessage from "./ChatMessage";
import MessageInput from "./ChatInput";
import { Message } from "@/lib/types";

interface Props {
  conversationId: string;
  repoId: string;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  addMessage: (msg: Message) => void;
  updateLastMessage: (content: string) => void;
}

export default function ChatWindow({
  conversationId,
  repoId,
  messages,
  setMessages,
  addMessage,
  updateLastMessage,
}: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/chat/${conversationId}`
      );
      const data = await res.json();
      setMessages(Array.isArray(data) ? data : data.messages || []);
    } catch {
      setMessages([]);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [conversationId]);

  // ✅ Smooth auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col h-full min-h-0 bg-background">

      {/* MESSAGES */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-6 space-y-6">

        {/* EMPTY STATE */}
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="mb-4 rounded-full border p-3 text-muted-foreground">
              💬
            </div>

            <h2 className="text-lg font-medium">
              Start chatting with your codebase
            </h2>

            <p className="text-sm text-muted-foreground mt-1 max-w-sm">
              Ask anything about this repository — architecture, bugs, or logic.
            </p>
          </div>
        )}

        {/* MESSAGES */}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div className="max-w-[85%] sm:max-w-[75%]">
              <ChatMessage message={msg} />
            </div>
          </div>
        ))}

        {/* SCROLL ANCHOR */}
        <div ref={bottomRef} />
      </div>

      {/* INPUT */}
      <div className="border-t bg-background p-3 sticky bottom-0">
        <MessageInput
          conversationId={conversationId}
          addMessage={addMessage}
          updateLastMessage={updateLastMessage}
          repoId={repoId}
        />
      </div>
    </div>
  );
}