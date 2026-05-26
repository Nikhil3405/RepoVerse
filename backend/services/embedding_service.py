from sentence_transformers import SentenceTransformer
import numpy as np

# 🔹 Load model once (important for performance)
model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")


def generate_embedding(text: str):
    embedding = model.encode(
        text,
        normalize_embeddings=True  # 🔥 improves similarity search
    )

    return embedding.tolist()

