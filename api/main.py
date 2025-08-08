"""FastAPI application entrypoint.

Loads environment variables from `.env.local` for local development using python-dotenv
before initializing Firebase Admin SDK.
"""

import os
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from firebase_admin import credentials, initialize_app
from mangum import Mangum

from .records import router as records_router
from .command import router as command_router
from .auth import router as auth_router
from .admin import router as admin_router

# Load env from project root `.env.local` (best-effort) for local dev
PROJECT_ROOT = Path(__file__).resolve().parents[1]
load_dotenv(PROJECT_ROOT / ".env.local")

# Initialize Firebase Admin (once)
try:
    cred_path = os.environ["GOOGLE_APPLICATION_CREDENTIALS"]
    db_url = os.environ["FIREBASE_DB_URL"]
except KeyError as missing:
    raise RuntimeError(
        f"Missing required environment variable: {missing.args[0]}. "
        "Please set it in your .env.local or export it in the environment."
    ) from None

cred = credentials.Certificate(cred_path)
initialize_app(cred, {"databaseURL": db_url})

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount routers
app.include_router(records_router)
app.include_router(command_router)
app.include_router(auth_router)
app.include_router(admin_router)

# Handler for Vercel
handler = Mangum(app)
