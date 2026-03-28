from pydantic import BaseModel

class DiagramRequest(BaseModel):
    repo_id: str
    query: str
    diagram_type: str

class DiagramSaveRequest(BaseModel):
    user_id: str
    repo_id:str
    diagram_type:str
    mermaid_code:str
    image_url: str | None = None

class DiagramEditRequest(BaseModel):
    instruction: str
    current_diagram: str
    diagram_type: str