from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routes.auth import router as auth_router
from .routes.admin import router as admin_router
from .routes.agenda import router as agenda_router
from .routes.archief import router as archief_router
from .routes.fotos import router as fotos_router
from .routes.courses import router as courses_router
from .routes.rounds import router as rounds_router, leaderboard_router
from .routes.players import router as players_router

app = FastAPI(title="Tigris Silvae API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://ducolam.com", "https://www.ducolam.com", "http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(admin_router)
app.include_router(agenda_router)
app.include_router(archief_router)
app.include_router(fotos_router)
app.include_router(courses_router)
app.include_router(rounds_router)
app.include_router(leaderboard_router)
app.include_router(players_router)


@app.get("/api/health")
def health():
    return {"status": "ok"}
