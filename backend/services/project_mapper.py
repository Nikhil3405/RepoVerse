import os
from config import IGNORED_DIRECTORIES, ALLOWED_EXTENSIONS

IMPORTANT_FILENAMES = {
    "README.md",
    "package.json",
    "requirements.txt",
    "pyproject.toml",
    "Dockerfile",
    "main.py",
    "app.py",
    "index.js",
    "server.js",
    "index.ts",
    "server.ts",
    "index.py",
    "server.py",
    "index.java",
    "server.java",
    "index.cpp",
    "server.cpp",
    "index.c",
    "server.c",
    "index.go",
    "server.go",
    "index.rs",
    "server.rs",
    "index.json",
    "server.json",
    "index.yml",
    "server.yml",
    "index.yaml",
    "server.yaml",
}

ENTRYPOINT_PATTERNS = [
    "main",
    "app",
    "server",
    "index",
    "run",
    "start"
]


BINARY_EXTENSIONS = {
    ".png", ".jpg", ".jpeg", ".gif", ".ico", ".svg", ".webp",
    ".mp4", ".mp3", ".wav",
    ".zip", ".tar", ".gz", ".rar",
    ".exe", ".dll", ".so", ".dylib",
    ".pdf"
}


def is_valid_file(file_name: str):
    name = file_name.lower()
    _, ext = os.path.splitext(name)

    # ❌ Skip binaries
    if ext in BINARY_EXTENSIONS:
        return False

    # ✅ Allow only supported files
    return ext in ALLOWED_EXTENSIONS or name in IMPORTANT_FILENAMES

def is_important_file(file_name):
    name = file_name.lower()

    if name in IMPORTANT_FILENAMES:
        return True

    base_name = name.split(".")[0]

    if base_name in ENTRYPOINT_PATTERNS:
        return True

    return False


def generate_project_map(repo_path):

    project_map = {
        "directories": [],
        "files": [],
        "important_files": [],
        "tree": {}
    }

    for root, dirs, files in os.walk(repo_path):

        # 🔴 CRITICAL FIX: prevent entering ignored folders
        dirs[:] = [d for d in dirs if d not in IGNORED_DIRECTORIES]

        rel_root = os.path.relpath(root, repo_path)

        if rel_root == ".":
            rel_root = ""

        # normalize path for frontend
        rel_root = rel_root.replace("\\", "/")

        project_map["directories"].append(rel_root)
        project_map["tree"][rel_root] = []

        for file in files:

            # skip hidden files
            if file.startswith("."):
                continue

            if not is_valid_file(file):
                continue

            full_path = os.path.join(root, file)

            rel_path = os.path.relpath(full_path, repo_path)
            rel_path = rel_path.replace("\\", "/")

            project_map["files"].append(rel_path)

            project_map["tree"][rel_root].append(file)

            if is_important_file(file):
                project_map["important_files"].append(rel_path)

    return project_map

    