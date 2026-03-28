import os 
from dotenv import load_dotenv

load_dotenv()

REPO_STORAGE_PATH = os.getenv("REPO_STORAGE_PATH","/tmp/repos")
MAX_REPO_SIZE_MB = 50
MAX_FILE_SIZE_KB = 200

ALLOWED_EXTENSIONS = {
    # 🔹 Programming languages
    ".py", ".js", ".jsx", ".ts", ".tsx",
    ".java", ".cpp", ".c", ".go", ".rs", ".rb", ".php",

    # 🔹 Web / frontend
    ".html", ".css", ".scss", ".sass",

    # 🔹 Config / data
    ".json", ".yml", ".yaml", ".toml", ".ini", ".xml",
    ".env", ".properties",

    # 🔹 Docs / text
    ".md", ".txt",

    # 🔹 Shell / scripts
    ".sh", ".bat", ".ps1",

    # 🔹 Database
    ".sql",

    # 🔹 DevOps / infra
    ".dockerignore", ".gitignore"
}

IGNORED_DIRECTORIES = {
    # 🔹 Version control
    ".git",

    # 🔹 Node / frontend
    "node_modules",
    ".next",
    ".nuxt",

    # 🔹 Python
    "__pycache__",
    "venv",
    "env",
    ".venv",

    # 🔹 Build outputs
    "dist",
    "build",
    "out",
    "coverage",
    "target",   # Java / Rust
    "bin",
    "obj",

    # 🔹 IDEs
    ".idea",
    ".vscode",

    # 🔹 Misc caches
    ".cache",
    ".parcel-cache",
    ".turbo",
    ".pytest_cache",
}


IMPORTANT_FILENAMES = {
    # 🔹 Root / docs
    "readme.md", "readme",
    "license",
    "contributing.md",

    # 🔹 Package managers / dependencies
    "package.json",
    "package-lock.json",
    "yarn.lock",
    "pnpm-lock.yaml",
    "requirements.txt",
    "pipfile",
    "pipfile.lock",
    "pyproject.toml",
    "poetry.lock",
    "pom.xml",
    "build.gradle",
    "gradle.properties",
    "go.mod",
    "go.sum",
    "cargo.toml",
    "cargo.lock",

    # 🔹 Entry points (very important 🔥)
    "main.py", "app.py", "run.py",
    "server.py",
    "index.js", "server.js", "app.js",
    "index.ts", "server.ts", "app.ts",
    "main.ts", "main.js",
    "index.jsx", "index.tsx",
    "main.go",
    "main.rs",
    "main.java",

    # 🔹 Framework configs
    "next.config.js",
    "next.config.ts",
    "vite.config.js",
    "vite.config.ts",
    "webpack.config.js",
    "nuxt.config.js",
    "angular.json",
    "tsconfig.json",
    "jsconfig.json",

    # 🔹 Environment / config
    ".env",
    ".env.local",
    ".env.development",
    ".env.production",
    "config.py",
    "settings.py",

    # 🔹 Docker / DevOps
    "dockerfile",
    "docker-compose.yml",
    "docker-compose.yaml",
    ".dockerignore",

    # 🔹 CI/CD
    ".github/workflows",
    ".gitlab-ci.yml",

    # 🔹 Database / schema
    "schema.sql",
    "db.sql",
    "database.sql",

    # 🔹 API / routes
    "routes.py",
    "routes.js",
    "api.py",
    "api.js",

    # 🔹 ML / AI
    "train.py",
    "inference.py",
    "model.py",
    "pipeline.py",

    # 🔹 Monorepo / workspace
    "turbo.json",
    "nx.json",
    "workspace.json",

    # 🔹 Misc
    "makefile",
}

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")