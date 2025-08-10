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

@router.post("")
@router.post("/")
async def post_records(
    req: Request,
    device_id: str = Depends(verify_device),
    x_user_id: Optional[str] = Header(default=None, alias="X-User-Id"),
):
    """Submit sensor data from devices.

    Expected payload from device: {"spo2": number, "heart_rate": number}
    Server will stamp current timestamp (ms) and determine userId from device registry.
    """
    body = await req.json()

    # Validate input fields (accept legacy 'hr' as alias for 'heart_rate')
    spo2 = body.get("spo2")
    heart_rate = body.get("heart_rate", body.get("hr"))
    if spo2 is None or heart_rate is None:
        raise HTTPException(400, "Missing spo2 or heart_rate")

    # Determine/validate user for this device
    # If X-User-Id is provided, validate against multi-user mapping
    if x_user_id:
        allowed = db.reference(f"/device_users/{device_id}/{x_user_id}").get()
        if not allowed:
            # backward-compat: also allow legacy single binding if matches
            legacy_user = db.reference(f"/devices/{device_id}/user_id").get()
            if legacy_user != x_user_id:
                raise HTTPException(401, "User not allowed for this device")
        user_id = x_user_id
    else:
        # Backward-compat: fall back to legacy single user binding
        device_info = db.reference(f"/devices/{device_id}").get()
        user_id = device_info.get("user_id") if device_info else None
        if not user_id:
            raise HTTPException(409, "Device is not yet registered to any user")

    # Compose record and stamp server time
    record = {
        "userId": user_id,
        "device_id": device_id,
        "spo2": spo2,
        "heart_rate": heart_rate,
        "ts": int(time.time() * 1000),
    }

    # Generate key and perform fan-out write to both global and per-user paths
    records_ref = db.reference("/records")
    key = records_ref.push({"_tmp": True}).key  # reserve a key
    root_ref = db.reference("/")
    updates = {
        f"records/{key}": record,
        f"user_records/{user_id}/{key}": record,
    }
    root_ref.update(updates)

    return {"status": "ok", "key": key}

@router.get("")
@router.get("/")
async def get_records(
    user = Depends(verify_firebase_token),
    limit: int = 1000
):
    """Get user's health records"""
    user_id = user.get("uid")
    
    # Query records for this user from per-user folder
    user_records_ref = db.reference(f"/user_records/{user_id}")
    try:
        records = (
            user_records_ref
            .order_by_child("ts")
            .limit_to_last(limit)
            .get()
        )
    except fa_exceptions.InvalidArgumentError:
        # Fallback when RTDB index is not defined in local/test environments
        records = user_records_ref.get() or {}
    
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

@router.get("/check-auth")
async def check_records_auth(user = Depends(verify_firebase_token)):
    """Lightweight endpoint to validate Authorization header on the same router.

    Returns minimal info so frontend can diagnose auth forwarding issues
    specific to the `/api/records` router.
    """
    return {
        "ok": True,
        "uid": user.get("uid"),
        "email": user.get("email"),
    }

@router.post("/device/register")
async def register_device(req: Request, user = Depends(verify_firebase_token)):
    """Register a device to user account"""
    data = await req.json()
    device_id = data.get("device_id")
    device_secret = data.get("device_secret")
    
    if not device_id or not device_secret:
        raise HTTPException(400, "Missing device_id or device_secret")
    
    user_id = user.get("uid")
    device_ref = db.reference(f"/devices/{device_id}")
    existing = device_ref.get()

    # Enforce: device must pre-exist and have a secret provisioned by the system
    if not existing:
        raise HTTPException(404, "Device not found. Please contact support.")

    # Secret must match exactly
    if existing.get("secret") != device_secret:
        raise HTTPException(401, "Invalid device credentials")

    # Do not allow binding to a different user if already registered
    if existing.get("user_id") and existing.get("user_id") != user_id:
        raise HTTPException(409, "Device already registered to another user")

    # Bind to current user; do not overwrite secret
    update_payload = {"user_id": user_id}
    if not existing.get("registered_at"):
        update_payload["registered_at"] = int(time.time() * 1000)
    device_ref.update(update_payload)

    return {"status": "ok", "message": "Device registered successfully"}
