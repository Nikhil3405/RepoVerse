from fastapi import APIRouter
from pydantic import BaseModel
from services.embedding_service import generate_embedding
from services.vector_search import search_similar_chunks, retrieve_top_chunks
from services.llm_service import generate_answer, generate_answer_stream
from services.project_map_service import get_project_map
from services.repo_summary_db import get_repo_summary
from services.message_service import store_message, get_messages
from fastapi.responses import StreamingResponse
from models.chat_model import ExplainFileRequest
from services.supabase_client import supabase

router = APIRouter(prefix="/chat", tags=["Chat"])


class ChatRequest(BaseModel):
    conversation_id: str
    repo_id: str
    question: str


@router.post("/ask")
def ask_question(request: ChatRequest):
    def stream():
        try:
            store_message(request.conversation_id, "user", request.question)
            history = get_messages(request.conversation_id)
            history = history[-6:]
            history_text = "\n".join(
                [f"{m['role']}: {m['content']}" for m in history]
            )
            summary = get_repo_summary(request.repo_id) or "Repository summary not available."
            print("repo_id type:", type(request.repo_id))
            print("repo_id value:", request.repo_id)
            project_map = get_project_map(request.repo_id) or {
                "directories": [],
                "important_files": []
            }
            print("repo_id type:", type(request.repo_id))
            print("repo_id value:", request.repo_id)
            code_context = retrieve_top_chunks(
                request.repo_id,
                request.question
            )
            print("repo_id type:", type(request.repo_id))
            print("repo_id value:", request.repo_id)

            context = f"""
            You are an expert software engineer.

            Answer the user's question using the repository context.

            ### Conversation History
            {history_text}

            ### Repository Summary
            {summary}

            ### Project Structure
            Directories:
            {project_map.get("directories", [])}

            Important Files:
            {project_map.get("important_files", [])}

            ### Code Context
            {code_context}

            ### Instructions:
            - Be precise
            - Refer to actual code structure
            - Explain clearly
            """

            # answer = generate_answer(request.question, context)
            answer = ""
            for token in generate_answer_stream(request.question, context):
                answer += token
                yield token
            store_message(request.conversation_id,"assistant",answer)
        except Exception as e:
            yield f"\nError: {str(e)}"
    return StreamingResponse(stream(),media_type="text/event-stream")

@router.get("/{conversation_id}")
def fetch_messages(conversation_id:str):
    res = get_messages(conversation_id)
    res.reverse()
    return res


@router.post("/explain-file")
def explain_file(request: ExplainFileRequest):

    def stream():
        try:
            # 🔥 Store user message
            user_question = f"Explain this file: {request.file_path}"
            store_message(request.conversation_id, "user", user_question)

            # 🔹 Step 1: File-specific chunks
            file_chunks_res = supabase.table("code_embeddings")\
                .select("chunk")\
                .eq("repo_id", request.repo_id)\
                .eq("file_path", request.file_path)\
                .limit(8)\
                .execute()

            file_chunks = [c["chunk"] for c in (file_chunks_res.data or [])]

            if not file_chunks:
                yield "No content found for this file."
                return

            joined_chunks = "\n\n".join(file_chunks)

            # 🔹 Step 2: Global context
            global_context = retrieve_top_chunks(
                repo_id=request.repo_id,
                query=f"explain file {request.file_path}",
            )

            # 🔹 Step 3: Combine context
            context = f"""
You are an expert software engineer.

Explain the file clearly using the context.

### TARGET FILE: {request.file_path}
{joined_chunks}

### RELATED CONTEXT
{global_context}

### Instructions:
- Explain purpose
- Explain key functions/classes
- Explain how it connects to system
- Keep it clear and structured
"""

            # 🔥 STREAM RESPONSE
            full_answer = ""

            for token in generate_answer_stream(user_question, context):
                full_answer += token
                yield token

            # 🔥 Store assistant message AFTER streaming
            store_message(request.conversation_id, "assistant", full_answer)

        except Exception as e:
            yield f"\nError: {str(e)}"

    return StreamingResponse(stream(), media_type="text/event-stream")
