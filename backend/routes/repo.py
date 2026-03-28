from fastapi import APIRouter, BackgroundTasks
from pydantic import BaseModel
from services.repo_processor import process_repository
from services.repo_service import get_repo_by_url,create_repo,get_repo_by_id,delete_repo
import os
import shutil
from config import REPO_STORAGE_PATH
from services.supabase_client import supabase

router = APIRouter(prefix="/repo",tags=['Repository'])

class RepoRequest(BaseModel):
    repo_url: str
    user_id: str | None=None
    

@router.post("/ingest")
def ingest_repository(request: RepoRequest, background_tasks: BackgroundTasks):
    
    repo = get_repo_by_url(request.repo_url)

    if repo:
        # ✅ If already completed → reuse
        if repo["status"] == "completed":
            return {
                "repo_id": repo["id"],
                "message": "Repository already processed",
                "repo_url": request.repo_url
            }

        # 🔁 If failed → retry
        if repo["status"] == "failed":
            background_tasks.add_task(process_repository, request.repo_url, repo["id"])
            return {
                "repo_id": repo["id"],
                "message": "Retrying repository processing",
                "repo_url": request.repo_url
            }

        # ⏳ Still processing
        return {
            "repo_id": repo["id"],
            "message": f"Repository is {repo['status']}",
            "repo_url": request.repo_url
        }

    # 🆕 New repo
    repo = create_repo(request.repo_url, request.user_id)
    repo_id = repo["id"]

    background_tasks.add_task(process_repository, request.repo_url, repo_id)

    return {
        "repo_id": repo_id,
        "message": "Repository processing started",
        "repo_url": request.repo_url
    }


@router.get("/status/{repo_id}")
def get_repo_status(repo_id: str):
    repo = get_repo_by_id(repo_id)
    return {"status": repo["status"]}

@router.delete("/delete/{repo_id}")
def delete_repository(repo_id: str):

    # 🔹 Delete from Supabase Storage
    try:
        supabase.storage.from_("repos").remove([f"{repo_id}.zip"])
        print("Deleted from Supabase ✅")
    except Exception as e:
        print(f"Supabase delete failed: {e}")

    # 🔹 Delete local /tmp repo
    repo_path = os.path.join(REPO_STORAGE_PATH, repo_id)
    shutil.rmtree(repo_path, ignore_errors=True)

    # 🔹 Delete from DB
    delete_repo(repo_id)

    return {"message": "Repository deleted completely"}

