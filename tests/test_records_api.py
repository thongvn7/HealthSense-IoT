#!/usr/bin/env python3
"""Integration tests for `api/records.py` endpoints.

This test will:
- Register a temporary device for a fake user
- Post a record using device credentials
- Fetch records for that user and verify the posted record is present
- Cleanup: delete the created record and device from the database
"""

import os
import sys
import time
import uuid
from pathlib import Path

import pytest
from dotenv import load_dotenv
from fastapi.testclient import TestClient


# Ensure project root on sys.path and load environment
PROJECT_ROOT = Path(__file__).resolve().parents[1]
sys.path.append(str(PROJECT_ROOT))
load_dotenv(PROJECT_ROOT / ".env.local")

# Skip gracefully if required env vars are not present
if not os.getenv("GOOGLE_APPLICATION_CREDENTIALS") or not os.getenv("FIREBASE_DB_URL"):
    pytest.skip(
        "Missing GOOGLE_APPLICATION_CREDENTIALS or FIREBASE_DB_URL; cannot run integration tests",
        allow_module_level=True,
    )

print("[tests] Loading FastAPI app and Firebase admin...")
from api.main import app  # noqa: E402
from api.auth import verify_firebase_token  # noqa: E402
from firebase_admin import db  # noqa: E402
print("[tests] App loaded.")


@pytest.fixture()
def client():
    return TestClient(app)


@pytest.fixture()
def override_user():
    """Override Firebase token verification to return a fake user for tests."""
    fake_user = {
        "uid": "test_user_records",
        "email": "test@example.com",
        "admin": False,
    }
    print("[tests] Overriding verify_firebase_token with fake user", fake_user)
    app.dependency_overrides[verify_firebase_token] = lambda: fake_user
    try:
        yield fake_user
    finally:
        app.dependency_overrides.pop(verify_firebase_token, None)
        print("[tests] Restored original dependencies")


def test_records_flow_creates_and_cleans_up(client: TestClient, override_user):
    device_id = f"test-device-{uuid.uuid4().hex[:8]}"
    device_secret = "test-secret-123"

    record_key = None
    try:
        print(f"[tests] Registering device {device_id} ...")
        # 1) Register device to the fake user
        resp = client.post(
            "/api/records/device/register",
            json={"device_id": device_id, "device_secret": device_secret},
        )
        assert resp.status_code == 200, resp.text
        print("[tests] Device registered.")

        # Ensure device was created with expected data
        device = db.reference(f"/devices/{device_id}").get()
        assert device is not None
        assert device.get("user_id") == override_user["uid"]
        assert device.get("secret") == device_secret
        print("[tests] Verified device in DB:", device)

        # 2) Post a record using device credentials
        payload = {"ts": int(time.time() * 1000), "hr": 72, "note": "pytest"}
        headers = {"x-device-id": device_id, "x-device-secret": device_secret}
        resp = client.post("/api/records/", headers=headers, json=payload)
        assert resp.status_code == 200, resp.text
        record_key = resp.json()["key"]
        assert record_key
        print("[tests] Posted record with key:", record_key)

        # Verify the record exists in the database directly
        saved = db.reference(f"/records/{record_key}").get()
        assert saved is not None
        assert saved.get("userId") == override_user["uid"]
        assert saved.get("device_id") == device_id
        assert saved.get("hr") == 72
        print("[tests] Verified record in DB:", saved)

        # 3) Fetch records via API and ensure our record is included
        resp = client.get("/api/records/?limit=50")
        assert resp.status_code == 200, resp.text
        items = resp.json()
        assert isinstance(items, list)
        assert any(item["id"] == record_key for item in items)
        print("[tests] Records endpoint returned", len(items), "items. Contains our record.")

    finally:
        # Cleanup: delete the test record and device from the database
        if record_key:
            db.reference(f"/records/{record_key}").delete()
            print("[tests] Cleaned up record:", record_key)
        db.reference(f"/devices/{device_id}").delete()
        print("[tests] Cleaned up device:", device_id)


