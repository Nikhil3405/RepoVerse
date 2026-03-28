"use client";

import { useEffect, useRef } from "react";
import mermaid from "mermaid";

// Initialize ONCE (outside component)
mermaid.initialize({
  startOnLoad: false,
  theme: "default",
});

export default function MermaidPreview({ code }: { code: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const renderDiagram = async () => {
      try {
        // ⚠️ basic guard
        if (!code || !code.trim()) {
          ref.current!.innerHTML = `<pre>No diagram</pre>`;
          return;
        }

        // ⚠️ unique ID (IMPORTANT)
        const id = `diagram-${Date.now()}`;

        const { svg } = await mermaid.render(id, code);

        ref.current!.innerHTML = svg;
      } catch (err) {
        console.error("Mermaid Error:", err);

        if (ref.current) {
          ref.current.innerHTML = `<pre style="color:red">Invalid Diagram</pre>`;
        }
      }
    };

    renderDiagram();
  }, [code]);

  return <div ref={ref} />;
}