from services.supabase_client import supabase

def get_project_map(repo_id):
    response = supabase.table("project_maps")\
        .select("project_map")\
        .eq("repo_id",repo_id)\
        .execute()
    return response.data[0]["project_map"]