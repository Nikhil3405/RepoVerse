from sentence_transformers import SentenceTransformer

model = None

def get_model():
    global model
    if model is None:
        print("🔄 Loading embedding model...")
        model = SentenceTransformer("BAAI/bge-small-en",device="cpu")
        print("✅ Model loaded")
    return model


def generate_embedding(text: str):
    model = get_model()
    embedding = model.encode(text)
    return embedding.tolist()