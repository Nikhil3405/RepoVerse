from fastapi import APIRouter
import asyncio

from models.diagram_model import (
    DiagramRequest,
    DiagramSaveRequest,
    DiagramEditRequest
)

from services.diagram_service import (
    build_prompt,
    clean_mermaid,
    ensure_valid_diagram,
    minimal_valid_diagram
)

from services.vector_search import retrieve_top_chunks
from services.llm_service import generate_answer
from services.supabase_client import supabase

router = APIRouter(prefix="/diagram", tags=["Diagram"])


# =====================================
# 🔥 CENTRAL DIAGRAM PROCESSOR
# =====================================
async def process_diagram(prompt: str, fallback_type="flow"):
    try:
        # Step 1: Generate using LLM
        raw_output = await asyncio.to_thread(generate_answer, prompt, "")

        # Step 2: Clean Mermaid
        diagram = clean_mermaid(raw_output)

        # Step 4: Ensure valid diagram
        diagram = ensure_valid_diagram(diagram)

        # Step 5: Strong fallback if invalid
        if len(diagram.split("\n")) < 2:
            fallback_prompt = build_prompt(prompt, fallback_type)
            fallback_output = await asyncio.to_thread(generate_answer, fallback_prompt, "")
            diagram = clean_mermaid(fallback_output)
            diagram = ensure_valid_diagram(diagram)

        return diagram

    except Exception as e:
        print("PROCESS DIAGRAM ERROR:", str(e))
        return minimal_valid_diagram("graph TD")


# =====================================
# 🎯 GENERATE DIAGRAM
# =====================================
@router.post("/generate-diagram")
async def generate_diagram_endpoint(request: DiagramRequest):
    try:
        context = retrieve_top_chunks(
            request.repo_id,
            request.query,
            request.diagram_type
        )

        prompt = build_prompt(context, request.diagram_type)

        diagram = await process_diagram(prompt)

        return {"diagram": diagram}

    except Exception as e:
        return {"error": str(e)}


# =====================================
# 💾 SAVE DIAGRAM
# =====================================
@router.post("/save-diagram")
async def save_diagram(data: DiagramSaveRequest):
    try:
        response = supabase.table("repository_diagrams").insert({
            "user_id": data.user_id,
            "repo_id": data.repo_id,
            "diagram_type": data.diagram_type,
            "mermaid_code": data.mermaid_code,
            "image_url": data.image_url,
        }).execute()

        return {"success": True, "data": response.data}

    except Exception as e:
        return {"error": str(e)}


# =====================================
# 📜 GET HISTORY
# =====================================
@router.get("/history/{repo_id}/{user_id}")
async def get_diagram_history(repo_id: str, user_id: str):
    try:
        response = (
            supabase.table("repository_diagrams")
            .select("*")
            .eq("user_id", user_id)
            .eq("repo_id", repo_id)
            .order("created_at", desc=True)
            .limit(20)
            .execute()
        )

        return response.data

    except Exception as e:
        return {"error": str(e)}


# =====================================
# ❌ DELETE DIAGRAM
# =====================================
@router.delete("/delete-diagram/{diagram_id}/{user_id}")
async def delete_diagram(diagram_id: str, user_id: str):
    try:
        supabase.table("repository_diagrams") \
            .delete() \
            .eq("user_id", user_id) \
            .eq("id", diagram_id) \
            .execute()

        return {"success": True}

    except Exception as e:
        return {"error": str(e)}


# =====================================
# ✏️ EDIT DIAGRAM
# =====================================
@router.post("/edit")
async def edit_diagram(req: DiagramEditRequest):
    try:
        prompt = build_prompt(
            context=f"""
CURRENT DIAGRAM:
{req.current_diagram}

INSTRUCTION:
{req.instruction}
""",
            diagram_type=req.diagram_type
        )

        diagram = await process_diagram(prompt)

        return {"diagram": diagram}

    except Exception as e:
        print("EDIT ERROR:", str(e))
        return {
            "error": str(e),
            "diagram": req.current_diagram
        }


# =====================================
# 📂 GET ALL DIAGRAMS
# =====================================
@router.get("/all-diagram/{user_id}")
async def get_all_diagrams(user_id: str):
    try:
        response = (
            supabase.table("repository_diagrams")
            .select("*")
            .eq("user_id", user_id)
            .order("created_at", desc=True)
            .execute()
        )

        return response.data

    except Exception as e:
        return {"error": str(e)}