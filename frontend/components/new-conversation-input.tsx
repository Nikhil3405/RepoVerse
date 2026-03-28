"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

import { Github, Loader2, X, AlertCircle } from "lucide-react";

export default function NewConversationInput({ userId }: { userId: string }) {
  const [showInput, setShowInput] = useState(false);
  const [repoUrl, setRepoUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string>("");

  const router = useRouter();

  const STATUS_MESSAGES: Record<string, string> = {
    cloning: "Cloning repository...",
    mapping: "Analyzing structure...",
    parsing: "Parsing files...",
    embedding: "Generating embeddings...",
    completed: "Finalizing...",
    failed: "Failed",
  };

  const getProgressValue = (s: string) => {
    switch (s) {
      case "cloning":
        return 20;
      case "mapping":
        return 40;
      case "parsing":
        return 60;
      case "embedding":
        return 80;
      case "completed":
        return 100;
      default:
        return 10;
    }
  };

  const startConversation = async () => {
    if (!repoUrl) return;

    try {
      setLoading(true);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/repo/ingest`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ repo_url: repoUrl, user_id: userId }),
        },
      );

      const data = await res.json();
      const repoId = data.repo_id;

      let currentStatus = "processing";

      while (currentStatus !== "completed" && currentStatus !== "failed") {
        await new Promise((r) => setTimeout(r, 1500));

        const statusRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/repo/status/${repoId}`,
        );

        const statusData = await statusRes.json();
        currentStatus = statusData.status;
        setStatus(currentStatus);
      }

      if (currentStatus === "failed") throw new Error();

      const res2 = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/conversations`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: userId,
            repo_id: repoId,
            repo_url: repoUrl,
          }),
        },
      );

      const data2 = await res2.json();
      router.push(`/chat/${data2.id}`);
    } catch {
      setStatus("failed");
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      {!showInput ? (
        <Button onClick={() => setShowInput(true)} className="w-full sm:w-auto">
          New Conversation
        </Button>
      ) : (
        <Card className="animate-in fade-in zoom-in-95">
          <CardContent className="p-4 space-y-4">
            {/* HEADER */}
            <div className="flex justify-between items-center">
              <h2 className="text-sm font-medium">New Repository</h2>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setShowInput(false);
                  setRepoUrl("");
                  setStatus("");
                }}
                disabled={loading}
              >
                <X size={16} />
              </Button>
            </div>

            {/* INPUT */}
            <div className="relative">
              <Github
                size={14}
                className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                placeholder="https://github.com/..."
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                disabled={loading}
                className="pl-7"
              />
            </div>

            {/* PROGRESS */}
            {loading && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 size={14} className="animate-spin" />
                  <span>{STATUS_MESSAGES[status] || "Processing..."}</span>
                </div>

                <Progress value={getProgressValue(status)} />
              </div>
            )}

            {/* ERROR */}
            {status === "failed" && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertCircle size={14} />
                <span>Something went wrong. Try again.</span>
              </div>
            )}

            {/* ACTION */}
            {!loading && (
              <Button
                onClick={startConversation}
                disabled={!repoUrl}
                className="w-full"
              >
                Start Conversation
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
