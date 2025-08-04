from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from mangum import Mangum

app = FastAPI()

# Cho phép Next.js gọi API (chạy trên localhost:3000 hoặc domain production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],        # hoặc ["http://localhost:3000"]
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/records")
async def post_records(req: Request):
    data = await req.json()
    return {"status": "ok", "received": data}

handler = Mangum(app)
