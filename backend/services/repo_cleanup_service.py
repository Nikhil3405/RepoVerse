from services.supabase_client import supabase
import os
import shutil
from config import REPO_STORAGE_PATH


def cleanup_repository(repo_id: str):

    print(f"Cleaning up repository: {repo_id}")

    # 🔹 Delete embeddings
    supabase.table("code_embeddings") \
        .delete() \
        .eq("repo_id", repo_id) \
        .execute()

    # 🔹 Delete project map
    supabase.table("project_maps") \
        .delete() \
        .eq("repo_id", repo_id) \
        .execute()

    # 🔹 Delete summary
    supabase.table("repo_summaries") \
        .delete() \
        .eq("repo_id", repo_id) \
        .execute()

    # 🔹 Delete repo row
    supabase.table("repositories") \
        .delete() \
        .eq("id", repo_id) \
        .execute()

    # 🔹 Delete storage (zip)
    try:
        supabase.storage.from_("repos").remove([f"{repo_id}.zip"])
    except Exception as e:
        print(f"Storage cleanup failed: {e}")

    # 🔹 Delete local files
    repo_path = os.path.join(REPO_STORAGE_PATH, repo_id)
    shutil.rmtree(repo_path, ignore_errors=True)

    print("Cleanup completed ✅")