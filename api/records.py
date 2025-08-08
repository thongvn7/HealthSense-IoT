# api/records.py
from fastapi import APIRouter, Request, Depends, HTTPException, Header
from firebase_admin import db, exceptions as fa_exceptions
import time
from .auth import verify_firebase_token
from typing import Optional

router = APIRouter(prefix="/api/records")

def verify_device(x_device_id: str = Header(...), x_device_secret: str = Header(...)):
    expected = db.reference(f"/devices/{x_device_id}/secret").get()
    if expected != x_device_secret:
        raise HTTPException(401, "Unauthorized")
    return x_device_id

@router.post("/")
async def post_records(req: Request, device_id: str = Depends(verify_device)):
    """Submit sensor data from devices"""
    data = await req.json()
    data["device_id"] = device_id
    
    # Get device owner (user_id) from device registry
    device_info = db.reference(f"/devices/{device_id}").get()
    if device_info and "user_id" in device_info:
        data["userId"] = device_info["user_id"]
    
    key = db.reference("/records").push(data).key
    return {"status":"ok","key":key}

@router.get("/")
async def get_records(
    user = Depends(verify_firebase_token),
    limit: int = 1000
):
    """Get user's health records"""
    user_id = user.get("uid")
    
    # Query records for this user
    records_ref = db.reference("/records")
    try:
        records = (
            records_ref
            .order_by_child("userId")
            .equal_to(user_id)
            .limit_to_last(limit)
            .get()
        )
    except fa_exceptions.InvalidArgumentError:
        # Fallback when RTDB index is not defined in local/test environments
        all_records = records_ref.get() or {}
        filtered = {k: v for k, v in all_records.items() if isinstance(v, dict) and v.get("userId") == user_id}
        records = filtered
    
    if not records:
        return []
    
    # Convert to list format
    records_list = []
    for key, value in records.items():
        record = {"id": key, **value}
        records_list.append(record)
    
    # Sort by timestamp descending
    records_list.sort(key=lambda x: x.get("ts", 0), reverse=True)
    
    # Trim to requested limit after sorting (in case of fallback path)
    return records_list[:limit]

@router.post("/device/register")
async def register_device(req: Request, user = Depends(verify_firebase_token)):
    """Register a device to user account"""
    data = await req.json()
    device_id = data.get("device_id")
    device_secret = data.get("device_secret")
    
    if not device_id or not device_secret:
        raise HTTPException(400, "Missing device_id or device_secret")
    
    user_id = user.get("uid")
    
    # Save device registration
    db.reference(f"/devices/{device_id}").set({
        "secret": device_secret,
        "user_id": user_id,
        "registered_at": int(time.time() * 1000)
    })
    
    return {"status": "ok", "message": "Device registered successfully"}
