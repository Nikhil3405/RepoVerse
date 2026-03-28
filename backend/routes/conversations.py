from fastapi import APIRouter
from models.chat_model import CreateConversationRequest
from services.conversation_service import (
    create_conversation,
    get_conversations,
    delete_conversation,
    get_repo_id
)

router = APIRouter(prefix="/conversations",tags=["Conversations"])

@router.post("/")
def new_conversation(request: CreateConversationRequest):
    conversation = create_conversation(
        request.user_id,
        request.repo_id,
        request.repo_url
    )
    return conversation

@router.get("/{user_id}")
async def list_conversations(user_id:str):
    conversations = get_conversations(user_id)
    return conversations

@router.delete("/{conversation_id}")
def remove_conversation(conversation_id:str):
    delete_conversation(conversation_id)
    return {"message": "Conversation deleted successfully."}

@router.get("/repo/{conversation_id}")
def get_repository(conversation_id:str):
    repo_id = get_repo_id(conversation_id)
    print("repo_id:",repo_id)
    return repo_id