# api/main.py
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from firebase_admin import credentials, initialize_app
from mangum import Mangum
from .records import router as records_router
from .command import router as command_router
from .auth import router as auth_router
from .admin import router as admin_router

# Khởi Firebase Admin (1 lần)
cred = credentials.Certificate(os.environ["GOOGLE_APPLICATION_CREDENTIALS"])
initialize_app(cred, {"databaseURL": os.environ["FIREBASE_DB_URL"]})

app = FastAPI()
app.add_middleware(
  CORSMiddleware,
  allow_origins=["*"], allow_methods=["*"], allow_headers=["*"]
)

# Gắn router
app.include_router(records_router)
app.include_router(command_router)
app.include_router(auth_router)
app.include_router(admin_router)

# Handler cho Vercel
handler = Mangum(app)
