import os 
from git import Repo
from config import REPO_STORAGE_PATH
from utils.file_parser import parse_repository
from utils.chunker import chunk_code
from services.embedding_service import generate_embedding
from services.vector_store import store_embeddings
from services.project_mapper import generate_project_map
from services.project_map_store import store_project_map
from services.repo_summary_service import generate_repository_summary
from services.repo_summary_store import store_repo_summary
from services.repo_service import update_repo_status


def process_repository(repo_url: str, repo_id: str):
    print(f"Processing repository: {repo_url}")
    repo_path = os.path.join(REPO_STORAGE_PATH, repo_id)

    try:
        os.makedirs(REPO_STORAGE_PATH, exist_ok=True)

        # 🔹 STEP 1: CLONING
        update_repo_status(repo_id, "cloning")
        print("Cloning repository...")
        Repo.clone_from(repo_url, repo_path, depth=1)

        # 🔹 STEP 2: PROJECT MAP
        update_repo_status(repo_id, "mapping")
        project_map = generate_project_map(repo_path)
        store_project_map(repo_id, project_map)

        # 🔹 STEP 3: SUMMARY
        summary = generate_repository_summary(project_map)
        store_repo_summary(repo_id, summary)

        # 🔹 STEP 4: PARSING
        update_repo_status(repo_id, "parsing")
        files = parse_repository(repo_path)
        print(f"Parsed {len(files)} files")

        # 🔹 STEP 5: CHUNKING
        all_chunks = []
        for file in files:
            chunks = chunk_code(file["content"])
            for chunk in chunks:
                all_chunks.append({
                    "file_path": file["file_path"],
                    "chunk": chunk
                })

        # 🔹 STEP 6: EMBEDDING
        update_repo_status(repo_id, "embedding")
        embeddings = []
        for chunk_data in all_chunks:
            vector = generate_embedding(chunk_data["chunk"])
            embeddings.append({
                "file_path": chunk_data["file_path"],
                "chunk": chunk_data["chunk"],
                "embedding": vector
            })

        store_embeddings(repo_id, embeddings)

        # ✅ FINAL STEP
        update_repo_status(repo_id, "completed")
        print("Repository processing completed")

    except Exception as e:
        print(f"Error processing repository: {str(e)}")

        # ❌ FAILED STATE
        update_repo_status(repo_id, "failed")