# api/auth.py
from fastapi import APIRouter, HTTPException, Header
from firebase_admin import auth as firebase_auth

router = APIRouter(prefix="/api/auth")

def verify_firebase_token(authorization: str = Header(None)):
    """Verify Firebase ID token from Authorization header"""
    if not authorization or not authorization.startswith('Bearer '):
        raise HTTPException(401, "Missing or invalid authorization header")
    
    token = authorization.split('Bearer ')[1]
    
    try:
        decoded_token = firebase_auth.verify_id_token(token)
        return decoded_token
    except Exception as e:
        raise HTTPException(401, f"Invalid token: {str(e)}")

@router.get("/verify")
async def verify_token(user = verify_firebase_token):
    """Verify user token and return user info"""
    return {
        "uid": user.get("uid"),
        "email": user.get("email"),
        "verified": True
    }
