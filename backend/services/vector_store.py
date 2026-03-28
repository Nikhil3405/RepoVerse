from services.supabase_client import supabase

def store_embeddings(repo_id:str, embeddings:list):
    data= []
    for item in embeddings:
        data.append({
            "repo_id":repo_id,
            "file_path": item["file_path"],
            "chunk": item["chunk"],
            "embedding": item["embedding"]
        })
    response = supabase.table("code_embeddings").insert(data).execute()