from services.supabase_client import supabase


def store_repo_summary(repo_id, summary):

    supabase.table("repo_summaries").insert({
        "repo_id": repo_id,
        "summary": summary
    }).execute()