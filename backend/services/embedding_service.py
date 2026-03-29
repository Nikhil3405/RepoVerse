from google import genai
import os
from dotenv import load_dotenv
from google.genai import types
load_dotenv()

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

def generate_embedding(text: str):
    response = client.models.embed_content(
        model="gemini-embedding-001", 
        contents=text,
        config=types.EmbedContentConfig(output_dimensionality=768)
    )
    return response.embeddings[0].values