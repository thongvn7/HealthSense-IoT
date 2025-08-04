# api/command.py
from fastapi import APIRouter, Depends, HTTPException, Header
from firebase_admin import db

router = APIRouter(prefix="/api/command")

def verify_device(x_device_id: str = Header(...), x_device_secret: str = Header(...)):
    expected = db.reference(f"/devices/{x_device_id}/secret").get()
    if expected != x_device_secret:
        raise HTTPException(401, "Unauthorized")
    return x_device_id

@router.get("/{device_id}")
async def get_command(device_id: str, _=Depends(verify_device)):
    cmd = db.reference(f"/commands/{device_id}").get()
    return cmd or {"action":None,"pattern":[]}

@router.post("/")
async def post_command(payload: dict, device_id: str = Depends(verify_device)):
    db.reference(f"/commands/{device_id}").set({
        "action": payload.get("action"),
        "pattern": payload.get("pattern", [])
    })
    return {"status":"ok","device_id":device_id}
