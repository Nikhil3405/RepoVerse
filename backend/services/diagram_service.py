import re

# -------------------------------
# SUPPORTED TYPES
# -------------------------------
SUPPORTED_TYPES = [
    "graph TD",
    "graph LR",
    "classDiagram",
    "sequenceDiagram",
    "stateDiagram-v2",
    "erDiagram"
]

def extract_mermaid(diagram: str) -> str:
    lines = diagram.split("\n")

    start_idx = None

    for i, line in enumerate(lines):
        if line.strip().startswith((
            "graph", "sequenceDiagram", "classDiagram",
            "stateDiagram", "stateDiagram-v2", "erDiagram"
        )):
            start_idx = i
            break

    if start_idx is None:
        return diagram

    # Take only valid diagram lines
    valid_lines = []
    for line in lines[start_idx:]:
        line = line.strip()

        # STOP when explanation starts
        if line.lower().startswith(("note:", "explanation", "here is")):
            break

        valid_lines.append(line)

    return "\n".join(valid_lines)

# -------------------------------
# CLEAN MERMAID OUTPUT (CORE FIX)
# -------------------------------
def clean_mermaid(output: str) -> str:
    if not output:
        return "graph TD\nA --> B"

    # Remove markdown/code blocks
    cleaned = re.sub(r"```.*?\n", "", output)
    cleaned = cleaned.replace("```", "")
    cleaned = cleaned.replace("diagram:", "")
    cleaned = cleaned.strip()

    # Normalize arrows
    cleaned = cleaned.replace("-->>", "-->")
    cleaned = cleaned.replace("->>", "-->")

    # Fix invalid arrow syntax: |text|>
    cleaned = re.sub(r"\|\s*([^|]+)\s*\|\s*>", r"|\1|", cleaned)

    # Fix duplicated nodes: B[Frontend]B → B[Frontend]
    cleaned = re.sub(r"(\w+\[[^\]]+\])\s*\w+", r"\1", cleaned)

    # Remove quotes inside nodes
    cleaned = re.sub(r'\["([^"]+)"\]', r'[\1]', cleaned)
    cleaned = re.sub(r"\('([^']+)'\)", r'(\1)', cleaned)

    # Ensure diagram starts correctly
    if not any(cleaned.startswith(t) for t in SUPPORTED_TYPES):
        cleaned = "graph TD\n" + cleaned

    # Ensure each statement is on a new line
    cleaned = re.sub(r"(\])(\w)", r"\1\n\2", cleaned)

    # Remove empty lines
    lines = [line.strip() for line in cleaned.split("\n") if line.strip()]

    return "\n".join(lines)


# -------------------------------
# DIAGRAM TYPE FIXERS (MINIMAL)
# -------------------------------
def fix_diagram(diagram: str) -> str:
    if "classDiagram" in diagram:
        return _fix_class(diagram)
    if "sequenceDiagram" in diagram:
        return _fix_sequence(diagram)
    if "stateDiagram" in diagram:
        return _fix_state(diagram)
    if "erDiagram" in diagram:
        return _fix_er(diagram)
    return diagram


def _fix_class(diagram: str) -> str:
    lines = ["classDiagram"]

    for line in diagram.split("\n"):
        line = line.strip()
        if not line or line == "classDiagram":
            continue

        # Remove types
        line = re.sub(r":\s*\w+", "", line)
        line = re.sub(r"\(\s*[\w_,\s]*\)", "()", line)

        lines.append(line)

    if not any("class " in l for l in lines):
        lines.append("class Example { attr method() }")

    return "\n".join(lines)


def _fix_sequence(diagram: str) -> str:
    if "sequenceDiagram" not in diagram:
        return diagram

    # Only fallback if COMPLETELY broken
    if len(diagram.split("\n")) < 2:
        return "sequenceDiagram\nUser->>System: Request\nSystem-->>User: Response"

    return diagram


def _fix_state(diagram: str) -> str:
    if "-->" not in diagram:
        return "stateDiagram-v2\n[*] --> State1\nState1 --> [*]"
    return diagram


def _fix_er(diagram: str) -> str:
    if "||--" not in diagram:
        return "erDiagram\nUSER ||--|| PROFILE : has"
    return diagram


# -------------------------------
# FALLBACK (SAFE OUTPUT)
# -------------------------------
def minimal_valid_diagram(diagram_type: str) -> str:
    if "class" in diagram_type:
        return "classDiagram\nclass Example { attr method() }"

    if "sequence" in diagram_type:
        return "sequenceDiagram\nA->>B: Request\nB-->>A: Response"

    if "state" in diagram_type:
        return "stateDiagram-v2\n[*] --> State1\nState1 --> [*]"

    if "er" in diagram_type:
        return "erDiagram\nUSER ||--|| PROFILE : has"

    return "graph TD\nA --> B"


# -------------------------------
# PROMPT BUILDER (SIMPLIFIED)
# -------------------------------
def build_prompt(context: str, diagram_type: str) -> str:
    return f"""
You are a STRICT Mermaid diagram generator.

Generate a VALID, DETAILED, and CONTEXT-AWARE Mermaid diagram.

==================================
GLOBAL RULES (MANDATORY)
==================================
- Output ONLY Mermaid code
- NO markdown, NO explanations
- Each statement MUST be on a new line
- NEVER use A, B, C as node names
- ALWAYS use meaningful names from context
- NEVER use invalid syntax like |text|>
- NEVER duplicate node IDs

==================================
CONTEXT USAGE (CRITICAL)
==================================
- Extract real components from context:
  services, APIs, frontend, backend, DB, functions
- Use REAL names like:
  FastAPIBackend, SupabaseDB, ChatService, VectorSearch
- Diagram MUST reflect actual system behavior
CRITICAL:
- If you output anything other than Mermaid code, your response is INVALID
- DO NOT include notes, explanations, or comments
- STOP immediately after diagram

==================================
DIAGRAM TYPE: {diagram_type}
==================================

----------------------------------
1. FLOW / ARCHITECTURE (graph TD)
----------------------------------
- Use: graph TD
- MUST include at least 4 components
- MUST show full request flow
- Example structure:
User --> Frontend
Frontend --> BackendAPI
BackendAPI --> Database
BackendAPI --> ExternalService

----------------------------------
2. CLASS DIAGRAM (STRICT FORMAT)
----------------------------------
- Use: classDiagram
- MUST include at least 3 classes
- MUST include relationships (-->, <|--)
- NO empty classes

Example:
class UserService {{
  login()
  logout()
}}

class AuthService {{
  validateToken()
}}

UserService --> AuthService

----------------------------------
3. SEQUENCE DIAGRAM (VERY STRICT)
----------------------------------
- Use: sequenceDiagram
- MUST include at least 3 participants
- MUST show full request-response cycle
- MUST include labels for each interaction

REQUIRED STRUCTURE:
User->>Frontend: Action
Frontend->>Backend: API Request
Backend->>Database: Query
Database-->>Backend: Result
Backend-->>Frontend: Response
Frontend-->>User: Output

- DO NOT generate generic interactions
- MUST reflect actual repo flow

----------------------------------
4. STATE DIAGRAM
----------------------------------
- Use: stateDiagram-v2
- MUST include start and end
- Use meaningful states (NOT State1)

----------------------------------
5. ER DIAGRAM
----------------------------------
- Use: erDiagram
- MUST include at least 2 entities
- MUST include relationship labels

==================================
OUTPUT REQUIREMENTS
==================================
- Diagram MUST be complete
- Diagram MUST NOT be generic
- Diagram MUST use real names
- Diagram MUST follow correct syntax

==================================
CONTEXT
==================================
{context}
"""

# -------------------------------
# FINAL VALIDATION PIPELINE
# -------------------------------
def ensure_valid_diagram(diagram: str, diagram_type: str = "graph TD") -> str:
    if not diagram or len(diagram.strip()) < 5:
        return minimal_valid_diagram(diagram_type)
    diagram = extract_mermaid(diagram)
    diagram = clean_mermaid(diagram)
    diagram = fix_diagram(diagram)

    return diagram