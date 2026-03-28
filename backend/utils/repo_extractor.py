def extract_repo_name(repo_url:str):
    parts = repo_url.rstrip("/").split("/")
    if len(parts) >=2:
        return f"{parts[-2]}/{parts[-1]}"
    
    return repo_url