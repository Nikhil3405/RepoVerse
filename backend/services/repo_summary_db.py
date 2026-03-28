from services.supabase_client import supabase

def get_repo_summary(repo_id):
    
    response = supabase.table("repo_summaries")\
        .select("summary")\
        .eq("repo_id",repo_id)\
        .execute()
    return response.data[0]["summary"]