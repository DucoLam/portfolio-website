from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routes.auth import router as auth_router
from .routes.admin import router as admin_router
from .routes.agenda import router as agenda_router
from .routes.archief import router as archief_router

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


@app.get("/api/health")
def health():
    return {"status": "ok"}
