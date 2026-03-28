from services.supabase_client import supabase

def store_project_map(repo_id,project_map):
    supabase.table("project_maps").insert({
        "repo_id": repo_id,
        "project_map": project_map
    }).execute()