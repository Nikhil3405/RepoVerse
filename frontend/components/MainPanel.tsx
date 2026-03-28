"use client";

import CodeViewer from "@/components/code-viewer";
import DiagramPanel from "@/components/DiagramPanel";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

import { PanelType } from "@/hooks/useWorkspace";
import { X, FileCode2, Layers } from "lucide-react";
import { cn } from "@/lib/utils";

interface MainPanelProps {
  repoId: string;
  activePanel: PanelType;
  selectedFile: string | null;
  fileContent: string;
  onClose: () => void;
  onExplain: (path: string) => void;
}

export function MainPanel({
  repoId,
  activePanel,
  selectedFile,
  fileContent,
  onClose,
  onExplain,
}: MainPanelProps) {
  const isCode = activePanel === "code";

  return (
    <div className="flex flex-col h-full bg-background text-foreground">

      {/* HEADER */}
      <div className="flex items-center justify-between px-4 py-2">

        {/* LEFT */}
        <div className="flex items-center gap-2 text-sm">

          <div className="text-muted-foreground">
            {isCode ? <FileCode2 size={14} /> : <Layers size={14} />}
          </div>

          <span className="truncate font-medium">
            {isCode
              ? selectedFile || "No file selected"
              : "System Diagram"}
          </span>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-2">

          {isCode && selectedFile && (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => onExplain(selectedFile)}
            >
              Explain File
            </Button>
          )}

        </div>
      </div>

      <Separator />

      {/* CONTENT */}
      <div className="flex-1 min-h-0 overflow-hidden flex">

        {isCode && selectedFile ? (
          <CodeViewer
            file={selectedFile}
            content={fileContent}
            onExplain={onExplain}
          />
        ) : activePanel === "diagram" ? (
          <DiagramPanel repoId={repoId} />
        ) : (
          <div className="flex flex-col items-center justify-center w-full text-center">
            <div className="mb-3 rounded-full border p-3 text-muted-foreground">
              <FileCode2 size={18} />
            </div>

            <p className="text-sm font-medium">
              No file selected
            </p>

            <p className="text-xs text-muted-foreground mt-1">
              Choose a file from the sidebar to view its contents
            </p>
          </div>
        )}

      </div>
    </div>
  );
}