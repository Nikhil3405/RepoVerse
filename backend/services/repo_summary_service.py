from services.llm_service import generate_answer


def generate_repository_summary(project_map):

    context = f"""
You are analyzing a repository.

Project structure:
Directories: {project_map.get("directories", [])}

Important files:
{project_map.get("important_files", [])}

Describe:
- What this repository appears to do
- Main technologies used
- Overall architecture
"""

    summary = generate_answer(
        "Summarize the purpose and architecture of this repository.",
        context
    )

    return summary