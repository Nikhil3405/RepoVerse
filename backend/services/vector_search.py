from services.supabase_client import supabase
from services.embedding_service import generate_embedding

def search_similar_chunks(query_embedding, repo_id, limit =5):
    response = supabase.rpc(
        "match_code_chunks",
        {
            "query_embedding": query_embedding,
            "repo_filter": repo_id,
            "match_count": limit
        }
    ).execute()
    return response.data

def hybrid_search_chunks(query, query_embedding, repo_id):

    semantic_results = search_similar_chunks(query_embedding, repo_id)

    keyword_results = supabase.table("code_embeddings")\
        .select("*")\
        .or_(f"chunk.ilike.%{query}%,file_path.ilike.%{query}%")\
        .limit(5)\
        .execute()

    combined = (semantic_results or []) + (keyword_results.data or [])

    # remove duplicates
    seen = set()
    unique_chunks = []

    for item in combined:
        key = f"{item.get('file_path','')}::{item['chunk'][:100]}"

        if key not in seen:
            unique_chunks.append(item)
            seen.add(key)

    return unique_chunks[:8]

MAX_CONTEXT_LENGTH = 7000

IMPORTANT_KEYWORDS = [
    # 🔥 Entry points
    "main", "app", "index", "server", "run",

    # 🔥 Backend core
    "route", "routes", "controller", "controllers",
    "service", "services", "api", "handler",

    # 🔥 Architecture / logic
    "core", "module", "manager", "engine", "logic",

    # 🔥 Frontend (React / Next / etc.)
    "page", "pages", "component", "components",
    "layout", "view", "screen",

    # 🔥 Config / setup
    "config", "settings", "env",

    # 🔥 ML / AI projects
    "model", "train", "inference", "pipeline",

    # 🔥 Database / schema
    "db", "database", "schema", "repository",

    # 🔥 Auth / important features
    "auth", "middleware",

    # 🔥 CLI / scripts
    "cli", "script"
]

def is_important_file(file_path: str):
    return any(k in file_path.lower() for k in IMPORTANT_KEYWORDS)

def get_file_priority(file_path: str):
    path = file_path.lower()

    if any(k in path for k in ["main", "app", "server", "index"]):
        return 3  # highest priority

    if any(k in path for k in ["route", "controller", "service", "api"]):
        return 2

    if any(k in path for k in IMPORTANT_KEYWORDS):
        return 1

    return 0

def retrieve_top_chunks(repo_id: str, query: str, diagram_type: str = None):
    # 🔹 Step 1: Improve query based on diagram type
    query_map = {
        "architecture": "system architecture components services modules api database flow",
        "flow": "execution flow function calls control flow request response",
        "high-level": "high level overview main modules system design",
        "class": "classes objects relationships inheritance structure"
    }

    enhanced_query = query_map.get(diagram_type, query)

    # 🔹 Step 2: Generate embedding
    query_embedding = generate_embedding(enhanced_query)

    # 🔹 Step 3: Hybrid search
    results = hybrid_search_chunks(enhanced_query, query_embedding, repo_id)

    # 🔹 Step 4: Sort important files first
    results.sort(
        key=lambda x: get_file_priority(x.get("file_path", "")),
        reverse=True
    )

    important = []
    others = []

    for r in results:
        if get_file_priority(r.get("file_path", "")) > 0:
            important.append(r)
        else:
            others.append(r)

    results = important + others
    # 🔹 Step 5: Build structured context
    context = ""
    for item in results:
        chunk = item["chunk"]
        file_path = item.get("file_path", "unknown")

        formatted_chunk = f"\n# File: {file_path}\n{chunk}\n"

        if len(context) + len(formatted_chunk) > MAX_CONTEXT_LENGTH:
            break

        context += formatted_chunk

    return context