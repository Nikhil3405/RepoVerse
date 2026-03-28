"use client";

import { useEffect, useState } from "react";
import { Loader2, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  file: string;
  content: string;
  onExplain: (file: string) => void;
}

const EXTENSION_MAP: Record<string, string> = {
  py: "python",
  ts: "typescript",
  tsx: "tsx",
  js: "javascript",
  jsx: "jsx",
  json: "json",
  java: "java",
  go: "go",
  rs: "rust",
  php: "php",
  bash: "bash",
  sh: "bash",
  yaml: "yaml",
  yml: "yaml",
  dart: "dart",
  kt: "kotlin",
  c: "c",
  cpp: "cpp",
  html: "html",
  css: "css",
};

function getLanguage(filename: string) {
  const ext = filename.split(".").pop()?.toLowerCase() || "";
  return EXTENSION_MAP[ext] || "plaintext";
}

export default function CodeViewer({ file, content }: Props) {
  const [html, setHtml] = useState("");
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const language = getLanguage(file);

  const copyCode = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    const highlight = async () => {
      try {
        const res = await fetch("/api/highlight", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            code: content,
            lang: language,
          }),
        });

        const data = await res.json();
        if (mounted) setHtml(data.html);
      } catch {
        if (mounted) {
          setHtml(`<pre><code>${content}</code></pre>`);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    highlight();
    return () => {
      mounted = false;
    };
  }, [content, file]);

  return (
    <div className="h-full flex flex-col bg-background">

      {/* HEADER */}
      <div className="flex items-center justify-between px-3 py-2 border-b text-xs text-muted-foreground">
        <div className="flex items-center gap-2 truncate">
          <span className="font-medium text-foreground truncate">
            {file}
          </span>
          <span className="px-2 py-0.5 border rounded text-[10px] uppercase">
            {language}
          </span>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={copyCode}
          className="h-7 px-2"
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

      {/* LOADING */}
      {loading && (
        <div className="flex items-center justify-center flex-1 text-sm text-muted-foreground">
          <Loader2 size={16} className="animate-spin mr-2" />
          Highlighting code...
        </div>
      )}

      {/* CODE */}
      {!loading && (
        <div className="flex-1 overflow-auto text-sm font-mono p-4">
          <div
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
      )}

      {/* GLOBAL FIXES */}
      <style jsx global>{`
        pre {
          margin: 0;
          white-space: pre-wrap;
          word-break: break-word;
          overflow-wrap: anywhere;
          padding: 14px
        }

        code {
          font-family: ui-monospace, monospace;
        }
      `}</style>
    </div>
  );
}