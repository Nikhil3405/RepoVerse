from huggingface_hub import InferenceClient
import os
from dotenv import load_dotenv

load_dotenv()

client = InferenceClient(token=os.getenv("HF_TOKEN"))

MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"


def generate_embedding(text: str):
    embedding = client.feature_extraction(
        text,
        model=MODEL_NAME
    )

    # 🔹 Handle nested output
    if isinstance(embedding[0], list):
        embedding = embedding[0]

    # 🔥 FIX: convert numpy → list
    return embedding.tolist() if hasattr(embedding, "tolist") else list(embedding)