import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from app.core.config import settings
from app.api.v1.api_router import api_router
from app.services.menu_service import menu_service
from app.db.database import init_db

DIST_DIR = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "dist")
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize SQLite database & pre-warm dynamic menu cache
    print("[FoodieFlow] Initializing SQLite database...")
    try:
        await init_db()
        await menu_service.get_menu()
        print("[FoodieFlow] Database and menu cache initialized successfully.")
    except Exception as e:
        print(f"[FoodieFlow] Warning during startup initialization: {e}")
    yield
    # Shutdown
    print("[FoodieFlow] Shutting down backend.")

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Unified Full-Stack Campus Cafeteria Ordering Platform with SQLite3 & Razorpay",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# Enable CORS for frontend clients
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount REST API routes first
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/api/health", tags=["Health"])
async def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "database": "SQLite (foodieflow.db)",
        "version": "1.0.0"
    }

# Unified Single-Project Serving: Serve React SPA directly from FastAPI
if os.path.exists(DIST_DIR):
    assets_dir = os.path.join(DIST_DIR, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{full_path:path}", include_in_schema=False)
    async def serve_spa(full_path: str):
        if full_path.startswith("api") or full_path.startswith("docs") or full_path.startswith("openapi.json"):
            return None
        file_path = os.path.join(DIST_DIR, full_path)
        if os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(DIST_DIR, "index.html"))
