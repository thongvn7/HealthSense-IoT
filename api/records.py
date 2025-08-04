# api/records.py
from fastapi import APIRouter, Request, Depends, HTTPException, Header
from firebase_admin import db

router = APIRouter(prefix="/api/records")

def verify_device(x_device_id: str = Header(...), x_device_secret: str = Header(...)):
    expected = db.reference(f"/devices/{x_device_id}/secret").get()
    if expected != x_device_secret:
        raise HTTPException(401, "Unauthorized")
    return x_device_id

@router.post("/")
async def post_records(req: Request, device_id: str = Depends(verify_device)):
    data = await req.json()
    data["device_id"] = device_id
    key = db.reference("/records").push(data).key
    return {"status":"ok","key":key}
