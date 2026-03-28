from services.supabase_client import supabase

def normalize_repo_url(repo_url:str):
    repo_url = repo_url.rstrip("/")
    repo_url = repo_url.replace(".git","")
    return repo_url

def get_repo_by_url(repo_url:str):
    response = supabase.table("repositories")\
        .select("*")\
        .eq("repo_url", repo_url)\
        .execute()
    if response.data:
        return response.data[0]
    return None

def get_repo_by_id(repo_id:str):
    response = supabase.table("repositories")\
        .select("*")\
        .eq("id", repo_id)\
        .execute()
    if response.data:
        return response.data[0]
    return None

def create_repo(repo_url: str, owner_id:str|None=None):
    response = supabase.table("repositories").insert({
        "repo_url": repo_url,
        "owner_id": owner_id
    }).execute()
    return response.data[0]


def update_repo_status(repo_id: str, status: str):
    supabase.table("repositories").update({
        "status": status
    }).eq("id", repo_id).execute()

def delete_repo(repo_id: str):
    supabase.table("repositories").delete().eq("id", repo_id).execute()
