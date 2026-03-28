from services.supabase_client import supabase

def store_message(conversation_id, role, content):
    supabase.table("messages").insert({
        "conversation_id": conversation_id,
        "role": role,
        "content": content
    }).execute()

def get_messages(conversation_id):
    reponse = supabase.table("messages")\
                .select("*")\
                .eq("conversation_id", conversation_id)\
                .order("created_at",desc=True)\
                .execute()
    return reponse.data