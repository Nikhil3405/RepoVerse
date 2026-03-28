
import { createHighlighter } from "shiki"

let highlighter: any

export async function highlightCode(code: string, lang: string = "ts", isDark: boolean = false){
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

    return highlighter.codeToHtml(code,{
        lang,
        theme: "github-dark"
    })
}