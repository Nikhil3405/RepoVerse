"use client";

import { useEffect, useRef, useState } from "react";
import MermaidPreview from "./MermaidPreview";
import { Button } from "@/components/ui/button";
import { Loader2, Download, Save, X, Maximize2, Trash2 } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { Input } from "@/components/ui/input";

export default function DiagramPanel({ repoId }: { repoId: string }) {
  const { userId } = useAuth();

  const [diagram, setDiagram] = useState("");
  const [type, setType] = useState("architecture");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [editPrompt, setEditPrompt] = useState("");
  const [editing, setEditing] = useState(false);

  const [isFullScreen, setIsFullScreen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [start, setStart] = useState({ x: 0, y: 0 });

  const containerRef = useRef<HTMLDivElement>(null);

  // ---------------- FETCH HISTORY ----------------
  const fetchHistory = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/diagram/history/${repoId}/${userId}`,
      );
      const data = await res.json();
      setHistory(data);
    } catch {}
  };

  useEffect(() => {
    if (userId) fetchHistory();
  }, [repoId, userId]);

  // ---------------- GENERATE ----------------
  const generateDiagram = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/diagram/generate-diagram`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: userId,
            repo_id: repoId,
            diagram_type: type,
            query: "Explain system design",
          }),
        },
      );
      const data = await res.json();
      setDiagram(data.diagram || "");
    } catch {}
    setLoading(false);
    fetchHistory();
  };

  // ---------------- AI EDIT ----------------
  const handleAIEdit = async () => {
    if (!editPrompt.trim()) return;
    setEditing(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/diagram/edit`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            instruction: editPrompt,
            current_diagram: diagram,
            diagram_type: type,
          }),
        },
      );

      const data = await res.json();
      if (data.diagram) {
        setDiagram(data.diagram);
        setEditPrompt("");
      }
    } catch {}

    setEditing(false);
  };

  // ---------------- DELETE ----------------
  const deleteDiagram = async (id: string) => {
    await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/diagram/delete-diagram/${id}/${userId}`,
      { method: "DELETE" },
    );
    setHistory((prev) => prev.filter((d) => d.id !== id));
  };

  // ---------------- SVG DOWNLOAD ----------------
  const handleDownload = () => {
    const svg = containerRef.current?.querySelector("svg");
    if (!svg) return;

    const data = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([data], { type: "image/svg+xml" });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "diagram.svg";
    a.click();
    URL.revokeObjectURL(url);
  };

  // ---------------- SAVE ----------------
  const handleSave = async () => {
    const svg = containerRef.current?.querySelector("svg");
    if (!svg) return;

    const data = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([data], { type: "image/svg+xml" });

    const reader = new FileReader();
    reader.onloadend = async () => {
      const upload = await fetch("/api/upload", {
        method: "POST",
        body: JSON.stringify({
          file: reader.result,
          fileName: `diagram-${Date.now()}.svg`,
        }),
        headers: { "Content-Type": "application/json" },
      });

      const { url } = await upload.json();

      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/diagram/save-diagram`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          repo_id: repoId,
          diagram_type: type,
          mermaid_code: diagram,
          image_url: url,
        }),
      });

      fetchHistory();
    };

    reader.readAsDataURL(blob);
  };

  // ---------------- ZOOM ----------------
  const handleWheel = (e: React.WheelEvent) => {
    const delta = -e.deltaY * 0.001;
    setZoom((z) => Math.min(Math.max(z + delta, 0.5), 3));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({ x: e.clientX - start.x, y: e.clientY - start.y });
  };

  const handleMouseUp = () => setIsDragging(false);

  // ---------------- UI ----------------
  return (
    <div className="flex w-full h-full min-h-0 min-w-0 bg-background text-foreground">
      {/* HISTORY (hidden on mobile, collapses nicely) */}
      <div className="hidden md:flex w-56 border-r flex-col">
        <div className="p-3 text-xs font-medium text-muted-foreground">
          History
        </div>

        <div className="flex-1 overflow-auto px-2 space-y-2">
          {history.map((d) => (
            <div
              key={d.id}
              onClick={() => {
                setDiagram(d.mermaid_code);
                setType(d.diagram_type);
              }}
              className="border rounded-md p-2 cursor-pointer hover:bg-muted transition bg-white"
            >
              <img
                src={d.image_url}
                className="h-20 w-full object-contain rounded"
              />

              <div className="flex justify-between items-center mt-2 text-xs text-muted-foreground">
                <span className="truncate">{d.diagram_type}</span>

                <Trash2
                  size={14}
                  className="hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteDiagram(d.id);
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MAIN */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0">
        {/* HEADER */}
        <div className="flex flex-wrap items-center gap-2 p-3 border-b">
          {/* TYPE */}
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="border rounded-md px-2 py-1 text-sm bg-background"
          >
            {["architecture", "flow", "class", "sequence"].map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>

          {/* GENERATE */}
          <Button onClick={generateDiagram} size="sm">
            {loading ? <Loader2 className="animate-spin" /> : "Generate"}
          </Button>

          {/* INPUT */}
          <Input
            value={editPrompt}
            onChange={(e) => setEditPrompt(e.target.value)}
            placeholder="Refine diagram..."
            className="flex-1 min-w-[150px] sm:max-w-xs"
          />

          {/* EDIT */}
          <Button onClick={handleAIEdit} size="sm">
            {editing ? <Loader2 className="animate-spin" /> : "Edit"}
          </Button>

          {/* ACTIONS */}
          <div className="flex gap-1 ml-auto">
            <Button size="icon" variant="ghost" onClick={handleSave}>
              <Save size={16} />
            </Button>

            <Button size="icon" variant="ghost" onClick={handleDownload}>
              <Download size={16} />
            </Button>

          </div>
        </div>

        {/* CANVAS */}
        <div
          className="flex-1 min-h-0 overflow-auto flex flex-col items-center justify-center p-4 sm:p-6 relative bg-white text-gray-500"
          onWheel={handleWheel}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        >
          {diagram ? (
            <>
              <div
                ref={containerRef}
                onMouseDown={handleMouseDown}
                style={{
                  transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
                }}
                className="cursor-grab active:cursor-grabbing max-w-full"
              >
                <MermaidPreview code={diagram} />
              </div>

              {/* ZOOM HINT */}
              <div className="fixed bottom-5 mt-4 text-xs text-muted-foreground">
                Scroll to zoom • Drag to move
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center text-center">
              <div className="mb-3 rounded-full border p-3 text-muted-foreground bg-gray-200">
                🧠
              </div>

              <p className="text-sm font-medium">No diagram yet</p>

              <p className="text-xs text-muted-foreground mt-1">
                Generate a diagram to visualize your system
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
