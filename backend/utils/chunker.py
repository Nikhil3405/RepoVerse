BLOCK_KEYWORDS = (
    # Python
    "def ", "class ", "async def ",

    # JavaScript / TypeScript
    "function ", "export ", "const ", "let ", "var ",

    # Java / C / C++ / C#
    "public ", "private ", "protected ",
    "static ", "void ", "int ", "float ", "double ", "String ",

    # Go / Rust
    "func ", "fn ",

    # General structures
    "interface ", "struct ", "enum "
)


def is_block_start(line: str):
    stripped = line.strip()

    return (
        any(stripped.startswith(k) for k in BLOCK_KEYWORDS)
        or stripped.endswith("{")
    )


def chunk_code(content: str, max_lines: int = 40, overlap: int = 5):
    lines = content.split("\n")

    chunks = []
    current_chunk = []

    for line in lines:
        stripped = line.strip()

        # 🔹 Start new chunk at logical boundaries
        if is_block_start(stripped):
            if current_chunk:
                chunks.append("\n".join(current_chunk))
                current_chunk = current_chunk[-overlap:]  # keep overlap

        current_chunk.append(line)

        # 🔹 Prevent overly large chunks
        if len(current_chunk) >= max_lines:
            chunks.append("\n".join(current_chunk))
            current_chunk = current_chunk[-overlap:]

    # 🔹 Add remaining chunk
    if current_chunk:
        chunks.append("\n".join(current_chunk))

    return chunks