import os

from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import auth, orders, products, site_content

app = FastAPI(
    title="Hémé Kiitchen API",
    description="Backend API for Hémé Kiitchen — Premium Jain-friendly Dips",
    version="2.0.0",
)

# ── CORS ──────────────────────────────────────────────────────────────────────

web_url = os.getenv("WEB_URL", "http://localhost:3000")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[web_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────────────────

app.include_router(auth.router, prefix="/api")
app.include_router(products.router, prefix="/api")
app.include_router(orders.router, prefix="/api")
app.include_router(site_content.router, prefix="/api")


# ── Health ────────────────────────────────────────────────────────────────────

@app.get("/api/health")
def health():
    return {"status": "ok"}
