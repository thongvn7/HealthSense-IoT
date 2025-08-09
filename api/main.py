"""FastAPI application entrypoint.

Loads environment variables from `.env.local` for local development using python-dotenv
before initializing Firebase Admin SDK.
"""

import os
import json
import base64
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

# Initialize Firebase Admin (once) using env var (no JSON file on disk)
service_account_env = os.environ.get("FIREBASE_SERVICE_ACCOUNT")
db_url = os.environ.get("FIREBASE_DB_URL")

if not db_url:
    raise RuntimeError(
        "Missing required environment variable: FIREBASE_DB_URL. "
        "Please set it in your .env.local or export it in the environment."
    )

if not service_account_env:
    raise RuntimeError(
        "Missing required environment variable: FIREBASE_SERVICE_ACCOUNT. "
        "Provide the raw JSON or a base64-encoded JSON of the Firebase service account."
    )

try:
    # Accept either raw JSON or base64(JSON)
    if service_account_env.strip().startswith("{"):
        cred_info = json.loads(service_account_env)
    else:
        decoded = base64.b64decode(service_account_env).decode("utf-8")
        cred_info = json.loads(decoded)
except Exception as e:
    raise RuntimeError(
        "Invalid FIREBASE_SERVICE_ACCOUNT: must be JSON or base64 of JSON"
    ) from e

cred = credentials.Certificate(cred_info)
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
