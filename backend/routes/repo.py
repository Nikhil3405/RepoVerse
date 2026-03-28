from fastapi import APIRouter, BackgroundTasks
from pydantic import BaseModel
from services.repo_processor import process_repository
from services.repo_service import get_repo_by_url,create_repo,get_repo_by_id,delete_repo

router = APIRouter(prefix="/repo",tags=['Repository'])

class RepoRequest(BaseModel):
    repo_url: str
    user_id: str | None=None
    


@router.post("/ingest")
def ingest_repository(request: RepoRequest,background_tasks: BackgroundTasks):
    repo = get_repo_by_url(request.repo_url)
    print("repo:",repo)
    if repo:
        return{
            "repo_id": repo["id"],
            "message": "Repository already exists",
            "repo_url": request.repo_url
        }
    repo = create_repo(request.repo_url,request.user_id)
    repo_id = repo["id"]
    background_tasks.add_task(process_repository,request.repo_url,repo_id)
    return {
        "repo_id": repo_id,
        "message":"Repository processed started",
        "repo_url":request.repo_url
    }

@router.get("/status/{repo_id}")
def get_repo_status(repo_id: str):
    repo = get_repo_by_id(repo_id)
    return {"status": repo["status"]}

@router.delete("/delete/{repo_id}")
def delete_repository(repo_id: str):
    delete_repo(repo_id)
    return {"message": "Repository deleted"}

