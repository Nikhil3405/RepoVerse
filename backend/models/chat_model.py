from pydantic import BaseModel

class CreateConversationRequest(BaseModel):
    user_id: str
    repo_id: str | None = None
    repo_url: str | None = None

class ChatRequest(BaseModel):
    conversation_id: str
    repo_id: str
    question: str
    file_path: str | None = None

class ExplainFileRequest(BaseModel):
    conversation_id: str
    repo_id: str
    file_path: str