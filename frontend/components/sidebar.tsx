"use client";

import RepoExplorer from "@/components/repo-explorer";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

import { BarChart3, ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

interface SidebarProps {
  repoId: string;
  onSelectFile: (path: string) => void;
  onOpenDiagram: () => void;
  activePanel: "code" | "diagram" | null;
}

export function Sidebar({
  repoId,
  onSelectFile,
  onOpenDiagram,
  activePanel,
}: SidebarProps) {
  const router = useRouter();

  return (
    <div className="w-64 h-full md:mt-15 bg-background text-foreground flex flex-col">

      {/* TOP */}
      <div className="p-3">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-muted-foreground hover:text-foreground"
          onClick={() => router.push("/dashboard")}
        >
          <ChevronLeft size={14} className="mr-2" />
          Dashboard
        </Button>
      </div>

      <Separator />

      {/* ACTION */}
      <div className="p-3">
        <Button
          onClick={onOpenDiagram}
          variant={activePanel === "diagram" ? "default" : "ghost"}
          className="w-full justify-start"
        >
          <BarChart3 size={14} className="mr-2" />
          Diagram
        </Button>
      </div>

      <Separator />

      {/* FILES */}
      <div className="flex-1 min-h-0 flex flex-col p-3">
        <p className="text-xs text-muted-foreground mb-2 px-1">
          Files
        </p>

        <div className="flex-1 overflow-auto pr-1">
          <RepoExplorer
            repoId={repoId}
            onSelectFile={onSelectFile}
          />
        </div>
      </div>

      <Separator />

    </div>
  );
}