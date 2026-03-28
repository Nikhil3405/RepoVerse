import { NextRequest } from "next/server"
import { createHighlighter } from "shiki"

let highlighter: any

async function getInstance(){
    if(!highlighter){
        highlighter = await createHighlighter({
            themes: ["github-dark", "github-light"],
            langs:[
                "js",
                "ts",
                "jsx",
                "tsx",
                "html",
                "css",
                "json",
                "python",
                "java",
                "c",
                "cpp",
                "go",
                "rust",
                "php",
                "bash",
                "yaml",
                "dart",
                "kotlin"
            ]
        })
    }
    return highlighter
}

export async function POST(req: NextRequest) {
  const { code, lang } = await req.json();
  const highlighter = await getInstance();

  let html = highlighter.codeToHtml(code, {
    lang,
    theme: "github-dark",
  });

  // ✅ Inject wrapping styles into ANY <pre ...>
  html = html.replace(
    /<pre([^>]*)>/,
    `<pre$1 style="white-space: pre-wrap; word-break: break-word; overflow-wrap: anywhere;">`
  );

  return Response.json({ html });
}