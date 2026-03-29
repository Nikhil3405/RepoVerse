from fastapi import FastAPI
from routes import repo,chat, conversations, diagram
from routes.repo_explorer import router as explorer_router
from fastapi.middleware.cors import CORSMiddleware

app =FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://repo-verse-lyart.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(repo.router)
app.include_router(diagram.router)
app.include_router(chat.router)
app.include_router(conversations.router)
app.include_router(explorer_router)
@app.get("/")
def root():
    return {"message":"Hello World"}
