from fastapi import APIRouter
from services.project_map_service import get_project_map
import os 
from config import REPO_STORAGE_PATH
from pydantic import BaseModel
from services.llm_service import generate_answer

class FileExplainRequest(BaseModel):
    repo_id: str
    file_path:str

router = APIRouter(prefix="/explorer", tags=["Repository Explorer"])

@router.get("/tree/{repo_id}")
def get_repo_tree(repo_id:str):
    project_map = get_project_map(repo_id)
    if not project_map:
        return {"error": "Repository not found."}
    return {
        "directories": project_map.get("directories",[]),
        "files": project_map.get("files",[])
    }

@router.get("/file")
def get_file(repo_id:str,path:str):
    file_path = os.path.join(REPO_STORAGE_PATH,repo_id,path)
    if not os.path.exists(file_path):
        return {"error": "File not found."}
    try:
        with open(file_path,"r",encoding="utf-8",errors="ignore") as f:
            content = f.read()
        return {
            "file_path": path,
            "content": content
        }
    except Exception as e:
        return {"error": str(e)}


def split_code_blocks(code):
    blocks = code.split("\n\n")
    chunks = []
    current = ""
    for block in blocks:
        if len(current) + len(block) < 4000:
            current += "\n\n" + block
        else:
            chunks.append(current)
            current = block
    if current:
        chunks.append(current)
    return chunks

# @router.post("/explain-file")
# def explain_file(request:FileExplainRequest):
#     file_path = os.path.join(
#         REPO_STORAGE_PATH,
#         request.repo_id,
#         request.file_path
#     )
#     if not os.path.exists(file_path):
#         return {"error": "File not found."}
#     with open(file_path,"r",encoding="utf-8",errors="ignore") as f:
#         code = f.read()
#     chunks = split_code_blocks(code)
#     joined_chunks = "\n\n".join(chunks[:10])
#     context = f"""
#     File: {request.file_path}

#     Code:
#     {joined_chunks}
#     """
#     answer = generate_answer(
#         f"Explain the purpose of the file {request.file_path}",
#         context
#     )
#     return {"explanation": answer}

