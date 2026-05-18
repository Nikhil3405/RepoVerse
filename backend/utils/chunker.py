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
    "interface ", "struct ", "enum ",
    # Kotlin
    "fun ", "class ", "object ", "data class ", "interface ",
)


def is_block_start(line: str):
    stripped = line.strip()

    return (
        any(stripped.startswith(k) for k in BLOCK_KEYWORDS)
        or stripped.endswith("{")
        or stripped.endswith(":")   # 🔥 Python blocks
    )

def merge_small_chunks(chunks, min_lines=10):
    merged = []
    buffer = []

    for chunk in chunks:
        lines = chunk.split("\n")

        if len(lines) < min_lines:
            buffer.extend(lines)
        else:
            if buffer:
                merged.append("\n".join(buffer))
                buffer = []
            merged.append(chunk)

    if buffer:
        merged.append("\n".join(buffer))

    return merged

def chunk_code(content: str, max_lines: int = 40, overlap: int = 5):

    lines = content.split("\n")

    chunks = []
    current_chunk = []

    for line in lines:
        stripped = line.strip()

        if not stripped:
            continue

        # 🔥 smarter split
        if is_block_start(stripped) and len(current_chunk) > overlap:
            chunks.append("\n".join(current_chunk))
            current_chunk = current_chunk[-overlap:]

        current_chunk.append(line)

        if len(current_chunk) >= max_lines:
            chunks.append("\n".join(current_chunk))
            current_chunk = current_chunk[-overlap:]

    if current_chunk:
        chunks.append("\n".join(current_chunk))

    # 🔥 merge small chunks
    chunks = merge_small_chunks(chunks)

    return chunks