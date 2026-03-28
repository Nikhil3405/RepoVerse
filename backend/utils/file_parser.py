import os
from config import (
    IGNORED_DIRECTORIES,
    MAX_FILE_SIZE_KB,
    MAX_REPO_SIZE_MB
)
from services.project_mapper import is_valid_file

MAX_FILES = 500  # safety limit


def parse_repository(repo_path: str):

    parsed_files = []
    total_size_kb = 0
    file_count = 0

    for root, dirs, files in os.walk(repo_path):

        # 🔹 Skip ignored directories
        dirs[:] = [d for d in dirs if d not in IGNORED_DIRECTORIES]

        for file in files:

            # 🔹 Skip invalid files (🔥 includes binary filter)
            if not is_valid_file(file):
                continue

            file_path = os.path.join(root, file)

            # 🔹 File size check
            size_kb = os.path.getsize(file_path) / 1024

            if size_kb > MAX_FILE_SIZE_KB:
                continue

            # 🔹 Repo size limit
            total_size_kb += size_kb
            if total_size_kb > MAX_REPO_SIZE_MB * 1024:
                print("⚠️ Repo too large, stopping parsing")
                return parsed_files

            # 🔹 File count limit
            file_count += 1
            if file_count > MAX_FILES:
                print("⚠️ Too many files, stopping parsing")
                return parsed_files

            try:
                with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                    content = f.read()

                rel_path = os.path.relpath(file_path, repo_path)
                rel_path = rel_path.replace("\\", "/")  # 🔥 normalize

                parsed_files.append({
                    "file_path": rel_path,
                    "content": content
                })

            except Exception as e:
                print(f"Error reading {file_path}: {e}")

    return parsed_files