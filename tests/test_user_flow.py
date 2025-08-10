#!/usr/bin/env python3
"""
End-to-end test script for user/device/records flow.

Requirements:
- Backend running locally (default http://localhost:8001). Start with: `python start-backend.py`
- .env.local configured with FIREBASE_* service account vars and NEXT_PUBLIC_FIREBASE_API_KEY

Environment overrides (optional):
- BACKEND_URL: Backend base URL (default: http://localhost:8001)
- TEST_USER_EMAIL: Test user email (default: test.user@example.com)
- TEST_USER_PASSWORD: Test user password (default: TestUser123!)
- TEST_DEVICE_ID: Fixed device id (default: generated TEST_DEVICE_<timestamp>)
- TEST_DEVICE_SECRET: Device secret (default: test_secret_123)

This script will:
1) Ensure test user exists (create or update password)
2) Sign in via Firebase REST to get ID token
3) Create device with secret in RTDB
4) Register device to user via backend (Authorization: Bearer <ID Token>)
5) Post a sample record as the device (using X-Device headers)
6) Fetch records as the user and print a summary
"""

from __future__ import annotations

import os
import sys
import time
import json
import random
from typing import Any, Dict

import requests
from dotenv import load_dotenv
from firebase_admin import credentials, initialize_app, auth, db


def load_env() -> None:
    # Load env from project root `.env.local` if present
    project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    load_dotenv(os.path.join(project_root, ".env.local"))


def init_firebase_admin() -> None:
    db_url = os.environ.get("FIREBASE_DB_URL")
    if not db_url:
        raise RuntimeError("Missing FIREBASE_DB_URL in environment")

    private_key = os.environ.get("FIREBASE_PRIVATE_KEY")
    if private_key:
        private_key = private_key.replace("\\n", "\n")

    service_account_info = {
        "type": os.environ.get("FIREBASE_TYPE"),
        "project_id": os.environ.get("FIREBASE_PROJECT_ID"),
        "private_key_id": os.environ.get("FIREBASE_PRIVATE_KEY_ID"),
        "private_key": private_key,
        "client_email": os.environ.get("FIREBASE_CLIENT_EMAIL"),
        "client_id": os.environ.get("FIREBASE_CLIENT_ID"),
        "auth_uri": os.environ.get("FIREBASE_AUTH_URI"),
        "token_uri": os.environ.get("FIREBASE_TOKEN_URI"),
        "auth_provider_x509_cert_url": os.environ.get("FIREBASE_AUTH_PROVIDER_X509_CERT_URL"),
        "client_x509_cert_url": os.environ.get("FIREBASE_CLIENT_X509_CERT_URL"),
    }

    missing = [k for k, v in service_account_info.items() if not v]
    if missing:
        raise RuntimeError("Missing Firebase service account env vars: " + ", ".join(missing))

    cred = credentials.Certificate(service_account_info)  # type: ignore[arg-type]
    initialize_app(cred, {"databaseURL": db_url})


def ensure_test_user(email: str, password: str) -> str:
    """Return UID of the ensured user; create or update password if exists."""
    try:
        user = auth.get_user_by_email(email)
        uid = user.uid
        # Ensure password matches desired one for the test
        auth.update_user(uid, password=password)
        return uid
    except auth.UserNotFoundError:
        user = auth.create_user(email=email, password=password)
        return user.uid


def firebase_sign_in_email_password(api_key: str, email: str, password: str) -> Dict[str, Any]:
    url = f"https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key={api_key}"
    payload = {"email": email, "password": password, "returnSecureToken": True}
    resp = requests.post(url, json=payload, timeout=20)
    if resp.status_code != 200:
        raise RuntimeError(f"Firebase sign-in failed: {resp.status_code} {resp.text}")
    return resp.json()


def create_device_in_rtdb(device_id: str, device_secret: str) -> None:
    device_ref = db.reference(f"/devices/{device_id}")
    device_ref.set({
        "secret": device_secret,
        # intentionally do not set user_id; it will be bound on registration
        "created_at": int(time.time() * 1000),
    })


def register_device(backend_url: str, id_token: str, device_id: str, device_secret: str) -> None:
    url = f"{backend_url.rstrip('/')}/api/records/device/register"
    headers = {"Authorization": f"Bearer {id_token}"}
    payload = {"device_id": device_id, "device_secret": device_secret}
    resp = requests.post(url, json=payload, headers=headers, timeout=20)
    # Retry once if token is considered "used too early" due to small clock skew
    if resp.status_code == 401 and ("used too early" in (resp.text or "").lower() or "too early" in (resp.text or "").lower()):
        time.sleep(3)
        resp = requests.post(url, json=payload, headers=headers, timeout=20)
    if resp.status_code == 409 and "already registered" in (resp.text or "").lower():
        # Device already bound to this or another user; proceed if same user
        # The API does not expose which user; we continue and let posting data validate
        return
    if resp.status_code != 200:
        raise RuntimeError(f"Device registration failed: {resp.status_code} {resp.text}")


def post_sample_record_as_device(backend_url: str, device_id: str, device_secret: str) -> Dict[str, Any]:
    url = f"{backend_url.rstrip('/')}/api/records/"
    headers = {
        "X-Device-Id": device_id,
        "X-Device-Secret": device_secret,
    }
    # Sample plausible values
    payload = {
        "spo2": random.randint(95, 99),
        "heart_rate": random.randint(65, 90),
    }
    resp = requests.post(url, json=payload, headers=headers, timeout=20)
    if resp.status_code != 200:
        raise RuntimeError(f"Posting record failed: {resp.status_code} {resp.text}")
    return resp.json()


def fetch_user_records(backend_url: str, id_token: str, limit: int = 5) -> Any:
    url = f"{backend_url.rstrip('/')}/api/records/?limit={limit}"
    headers = {"Authorization": f"Bearer {id_token}"}
    resp = requests.get(url, headers=headers, timeout=20)
    if resp.status_code != 200:
        # Retry once if token is considered "used too early" due to small clock skew
        if resp.status_code == 401 and ("used too early" in (resp.text or "").lower() or "too early" in (resp.text or "").lower()):
            time.sleep(3)
            resp = requests.get(url, headers=headers, timeout=20)
            if resp.status_code == 200:
                return resp.json()
        raise RuntimeError(f"Fetching user records failed: {resp.status_code} {resp.text}")
    return resp.json()


def main() -> None:
    load_env()

    backend_url = os.environ.get("BACKEND_URL", "http://localhost:8001")
    api_key = os.environ.get("NEXT_PUBLIC_FIREBASE_API_KEY")
    if not api_key:
        print("❌ Missing NEXT_PUBLIC_FIREBASE_API_KEY in environment/.env.local", file=sys.stderr)
        sys.exit(1)

    test_email = os.environ.get("TEST_USER_EMAIL", "test.user@example.com")
    test_password = os.environ.get("TEST_USER_PASSWORD", "TestUser123!")
    device_id = os.environ.get("TEST_DEVICE_ID", f"TEST_DEVICE_{int(time.time())}")
    device_secret = os.environ.get("TEST_DEVICE_SECRET", "test_secret_123")

    print("🔧 Initializing Firebase Admin SDK...")
    init_firebase_admin()

    print(f"👤 Ensuring test user exists: {test_email}")
    uid = ensure_test_user(test_email, test_password)
    print(f"   → UID: {uid}")

    print("🔐 Signing in via Firebase REST to obtain ID token...")
    signin = firebase_sign_in_email_password(api_key, test_email, test_password)
    id_token = signin.get("idToken")
    if not id_token:
        print("❌ Could not obtain idToken from Firebase sign-in response", file=sys.stderr)
        sys.exit(1)
    print("   → ID token acquired")
    # Mitigate small clock skew causing "Token used too early" on backend verification
    time.sleep(3)

    print(f"🧩 Creating device in RTDB: {device_id}")
    create_device_in_rtdb(device_id, device_secret)

    print("🔗 Registering device to user via backend...")
    try:
        register_device(backend_url, id_token, device_id, device_secret)
        print("   → Device registered (or already registered)")
    except Exception as e:
        print(f"❌ Device registration failed: {e}", file=sys.stderr)
        sys.exit(1)

    print("📤 Posting a sample health record as the device...")
    try:
        post_resp = post_sample_record_as_device(backend_url, device_id, device_secret)
        print(f"   → Post response: {json.dumps(post_resp, ensure_ascii=False)}")
    except Exception as e:
        print(f"❌ Post record failed: {e}", file=sys.stderr)
        sys.exit(1)

    print("📥 Fetching recent user records via backend...")
    try:
        records = fetch_user_records(backend_url, id_token, limit=5)
        print(f"   → Retrieved {len(records) if isinstance(records, list) else 'N/A'} records")
        # Show latest record summary
        if isinstance(records, list) and records:
            latest = records[0]
            print("\nLatest record:")
            print(json.dumps(latest, indent=2, ensure_ascii=False))
        else:
            print("No records returned")
    except Exception as e:
        print(f"❌ Fetch records failed: {e}", file=sys.stderr)
        sys.exit(1)

    print("\n✅ End-to-end user flow test completed successfully")


if __name__ == "__main__":
    main()


