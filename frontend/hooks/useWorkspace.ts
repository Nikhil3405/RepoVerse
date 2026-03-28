import { useState } from "react";
import { Message } from "../lib/types";

export type PanelType = "code" | "diagram" | null;

export function useWorkspace(
  repoId: string,
  conversationId: string,
  addMessage: (msg: Message) => void,
  updateLastMessage: (content: string) => void
) {
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState("");
  const [activePanel, setActivePanel] = useState<PanelType>(null);


  const loadFile = async (path: string) => {
    setSelectedFile(path);
    setActivePanel("code");
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/explorer/file?repo_id=${repoId}&path=${path}`,
      );
      const data = await res.json();
      setFileContent(data.content);
    } catch (error) {
      console.error("Failed to load file:", error);
      setFileContent("// Error loading file content");
    }
  };

const explainFile = async (path: string) => {
  const question = `Explain this file: ${path}`;

  // 🔥 Add user message
  addMessage({
    role: "user",
    content: question,
  });

  // 🔥 Add empty assistant message (stream target)
  addMessage({
    role: "assistant",
    content: "",
  });

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/chat/explain-file`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          conversation_id: conversationId, // ✅ FIXED
          repo_id: repoId,
          file_path: path,
        }),
      }
    );

    if (!res.body) return;

    const reader = res.body.getReader();
    const decoder = new TextDecoder();

    let result = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      result += chunk;

      updateLastMessage(result); // 🔥 streaming UI
    }

  } catch (err) {
    console.error("Explain error:", err);
  }
};

  return {
    selectedFile,
    fileContent,
    activePanel,
    setActivePanel,
    loadFile,
    explainFile,
  };
}
