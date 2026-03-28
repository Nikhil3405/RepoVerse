import os
import zipfile
from services.supabase_client import supabase

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")


# 🔹 Zip repo folder
def zip_repo(folder_path, zip_path):
    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, _, files in os.walk(folder_path):
            for file in files:
                full_path = os.path.join(root, file)
                arcname = os.path.relpath(full_path, folder_path)
                zipf.write(full_path, arcname)


# 🔹 Unzip repo
def unzip_repo(zip_path, extract_path):
    with zipfile.ZipFile(zip_path, 'r') as zipf:
        zipf.extractall(extract_path)


# 🔹 Upload to Supabase
def upload_repo(repo_id, folder_path):
    zip_path = f"/tmp/{repo_id}.zip"
    zip_repo(folder_path, zip_path)

    with open(zip_path, "rb") as f:
        supabase.storage.from_("repos").upload(
            f"{repo_id}.zip",
            f,
            {"upsert": True}
        )

    os.remove(zip_path)


# 🔹 Download from Supabase
def download_repo(repo_id, target_path):
    zip_path = f"/tmp/{repo_id}.zip"

    res = supabase.storage.from_("repos").download(f"{repo_id}.zip")

    with open(zip_path, "wb") as f:
        f.write(res)

    unzip_repo(zip_path, target_path)
    os.remove(zip_path)