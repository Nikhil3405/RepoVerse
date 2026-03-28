from groq import Groq
from config import GROQ_API_KEY
from services.project_map_service import get_project_map

client = Groq(api_key=GROQ_API_KEY)

def build_base_prompt(context: str, question: str):
    return f"""
You are an intelligent AI assistant and senior software engineer and your name is CortexAI.

Your job:
1. FIRST determine if the question is related to the code repository.
2. THEN respond accordingly.

---

DECISION RULE:

If the question is RELATED to the repository:
- Use the provided code context
- Be technical and precise
- Do NOT hallucinate missing details
- If unsure, clearly say what is missing
- Answer should be short and concise

If the question is NOT related to the repository:
- IGNORE the code context completely
- Answer like a normal helpful AI assistant
- You can tell jokes, answer general questions, etc.

---

GUIDELINES:

- Be clear and well-structured
- Avoid unnecessary explanation
- Keep answers useful and concise

---

SPECIAL CASES:

If asked about the full project:
- Summarize purpose
- Identify frameworks/libraries
- Describe architecture (if visible)
- Mention uncertainties

If asked to generate README:
Include:
- Overview
- Features
- Tech Stack
- Structure
- Working
- Improvements (optional)

---

CODE CONTEXT:
{context}

---

QUESTION:
{question}

---

ANSWER:
"""

def generate_answer(question, context):
    prompt = build_base_prompt(context, question)

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "user", "content": prompt}
        ],
        temperature=0.3  # 🔥 more factual
    )

    return response.choices[0].message.content

def generate_answer_stream(question, context):
    prompt = build_base_prompt(context, question)

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "user", "content": prompt}
        ],
        stream=True,
        temperature=0.3
    )

    for chunk in response:
        token = chunk.choices[0].delta.content or ""
        yield token   

def generate_diagram(prompt: str):
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "user", "content": prompt}
        ],
        temperature=0.2  # 🔥 very deterministic
    )

    return response.choices[0].message.content