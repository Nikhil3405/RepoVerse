from services.supabase_client import supabase
from utils.repo_extractor import extract_repo_name

def create_conversation(user_id,repo_id,repo_url):
    title = extract_repo_name(repo_url)
    reponse = supabase.table("conversations").insert({
        "user_id": user_id,
        "repo_id": repo_id,
        "title": title
    }).execute()

    return reponse.data[0]

def get_conversations(user_id):
    reponse = supabase.table("conversations")\
                .select("*")\
                .eq("user_id", user_id)\
                .order("created_at",desc=False)\
                .execute()

    return reponse.data

def delete_conversation(conversation_id):
    supabase.table("conversations")\
            .delete()\
            .eq("id",conversation_id)\
            .execute()

def get_repo_id(converation_id):
    response = supabase.table("conversations")\
        .select("*")\
        .eq("id", converation_id)\
        .execute()
    return response.data[0]["repo_id"]