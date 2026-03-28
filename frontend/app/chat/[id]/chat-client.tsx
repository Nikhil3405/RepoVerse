"use client";

import ChatWindow from "@/components/chat/ChatWindow";
import DiagramPanel from "@/components/DiagramPanel";
import { MainPanel } from "@/components/MainPanel";
import { Sidebar } from "@/components/sidebar";
import { useWorkspace } from "@/hooks/useWorkspace";
import { Message } from "@/lib/types";
import { useEffect, useState } from "react";
import { X, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface Props {
  conversationId: string;
  repoId: string;
}

export default function ChatClient({ conversationId, repoId }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const addMessage = (msg: Message) => {
    setMessages((prev) => [...prev, msg]);
  };

  const updateLastMessage = (content: string) => {
    setMessages((prev) => {
      const updated = [...prev];
      updated[updated.length - 1] = {
        role: "assistant",
        content,
      };
      return updated;
    });
  };

  const {
    selectedFile,
    fileContent,
    activePanel,
    setActivePanel,
    loadFile,
    explainFile,
  } = useWorkspace(repoId, conversationId, addMessage, updateLastMessage);

  useEffect(() => {
    document.body.style.overflow = activePanel ? "hidden" : "auto";
  }, [activePanel]);

  return (
    <div className="h-dvh flex bg-background text-foreground overflow-hidden ">
      {/* MOBILE HEADER */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-3 h-12 border-b bg-background/80 backdrop-blur">
        <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu size={18} />
            </Button>
          </SheetTrigger>

          <SheetContent side="left" className="w-64 p-0">
            <SheetHeader className="p-3 border-b">
              <SheetTitle className="text-sm">Navigation</SheetTitle>
            </SheetHeader>

            <Sidebar
              repoId={repoId}
              onSelectFile={(file) => {
                loadFile(file);
                setIsSidebarOpen(false); // ✅ CLOSE
              }}
              onOpenDiagram={() => {
                setActivePanel("diagram");
                setIsSidebarOpen(false); // ✅ CLOSE
              }}
              activePanel={activePanel}
            />
          </SheetContent>
        </Sheet>
        <span className="text-sm font-medium">Chat</span>
        <div className="w-8" /> {/* spacer */}
      </div>

      {/* SIDEBAR DESKTOP */}
      <aside className="hidden lg:flex w-64 border-r">
        <Sidebar
          repoId={repoId}
          onSelectFile={loadFile}
          onOpenDiagram={() => setActivePanel("diagram")}
          activePanel={activePanel}
        />
      </aside>

      {/* MAIN CHAT */}
      <div className="flex-1 flex flex-col md:mt-15 min-h-0 pt-12 lg:pt-0">
        <ChatWindow
          conversationId={conversationId}
          repoId={repoId}
          messages={messages}
          setMessages={setMessages}
          addMessage={addMessage}
          updateLastMessage={updateLastMessage}
        />
      </div>

      {/* RIGHT PANEL */}
      {activePanel && activePanel !== "diagram" && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm">
          <div className="w-full sm:w-[600px] bg-background border-l flex flex-col animate-in slide-in-from-right">
            <div className="flex justify-end p-2 border-b">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setActivePanel(null)}
              >
                <X size={16} />
              </Button>
            </div>

            <div className="flex-1 overflow-auto">
              <MainPanel
                repoId={repoId}
                activePanel={activePanel}
                selectedFile={selectedFile}
                fileContent={fileContent}
                onClose={() => setActivePanel(null)}
                onExplain={explainFile}
              />
            </div>
          </div>
        </div>
      )}

      {/* DIAGRAM PANEL */}
      {activePanel === "diagram" && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm">
          <div className="w-full sm:w-[700px] lg:w-[900px] bg-background border-l flex flex-col animate-in slide-in-from-right">
            <div className="flex justify-between items-center p-3 border-b">
              <span className="text-sm font-medium">Diagram</span>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setActivePanel(null)}
              >
                <X size={16} />
              </Button>
            </div>

            <div className="flex-1 min-h-0 overflow-hidden flex">
              <DiagramPanel repoId={repoId} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
