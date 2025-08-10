#!/usr/bin/env python3
"""
Fetch and print user data from Firebase (Auth profile, devices, recent records).

Usage:
  python scripts/get_user_data.py --uid <UID> [--limit 20] [--format json|table]
  python scripts/get_user_data.py --email <EMAIL> [--limit 20] [--format json|table]

Notes:
  - Loads env vars from project-root `.env.local` if present
  - Requires FIREBASE_* service account envs; uses FIREBASE_DB_URL for RTDB
"""

import os
import sys
import argparse
import json
from pathlib import Path
from typing import Any, Dict, List, Optional
from datetime import datetime, timezone

from dotenv import load_dotenv
from firebase_admin import credentials, initialize_app, auth, db, exceptions as fa_exceptions
from tabulate import tabulate


def load_env() -> None:
    """Load environment variables from project root .env.local (best-effort)."""
    project_root = Path(__file__).resolve().parents[1]
    load_dotenv(project_root / ".env.local")


def initialize_firebase() -> bool:
    """Initialize Firebase Admin using env-based service account.

    Returns True if RTDB URL is configured (so DB features are available).
    """
    # Prepare service account info from environment variables
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

    cred = credentials.Certificate(service_account_info)  # type: ignore[arg-type]

    db_url = os.environ.get("FIREBASE_DB_URL")
    if db_url:
        db_url = db_url.rstrip("/")
        initialize_app(cred, {"databaseURL": db_url})
        return True
    else:
        initialize_app(cred)
        return False


def to_ms(ts: Optional[int]) -> int:
    if ts is None:
        return 0
    return ts * 1000 if ts < 1_000_000_000_000 else ts


def iso_from_ts(ts: Optional[int]) -> Optional[str]:
    if not ts:
        return None
    ms = to_ms(ts)
    return datetime.fromtimestamp(ms / 1000.0, tz=timezone.utc).isoformat()


def fetch_auth_user(uid: Optional[str], email: Optional[str]):
    if uid:
        return auth.get_user(uid)
    if email:
        return auth.get_user_by_email(email)
    raise ValueError("Either uid or email must be provided")


def fetch_user_devices(user_id: str) -> Dict[str, Dict[str, Any]]:
    """Fetch devices bound to the user. Excludes secrets from output."""
    devices_ref = db.reference("/devices")
    result = devices_ref.order_by_child("user_id").equal_to(user_id).get()
    devices: Dict[str, Dict[str, Any]] = {}
    if result:
        for device_id, device_data in result.items():
            if not isinstance(device_data, dict):
                continue
            sanitized = {k: v for k, v in device_data.items() if k != "secret"}
            devices[device_id] = sanitized
    return devices


def fetch_user_records(user_id: str, limit: int) -> List[Dict[str, Any]]:
    """Fetch recent records for user sorted by timestamp descending."""
    user_records_ref = db.reference(f"/user_records/{user_id}")
    try:
        data = (
            user_records_ref
            .order_by_child("ts")
            .limit_to_last(limit)
            .get()
        )
    except fa_exceptions.InvalidArgumentError:
        # Fallback for environments without appropriate RTDB indexing
        data = user_records_ref.get()

    if not data:
        return []

    records: List[Dict[str, Any]] = []
    for key, value in data.items():
        if not isinstance(value, dict):
            continue
        record = {"id": key, **value}
        records.append(record)

    records.sort(key=lambda r: r.get("ts", 0), reverse=True)
    return records[:limit]


def print_table(user_info: Dict[str, Any], devices: Dict[str, Dict[str, Any]], records: List[Dict[str, Any]], limit: int) -> None:
    # User summary
    print("\nUser")
    print(
        tabulate(
            [[
                user_info.get("uid"),
                user_info.get("email"),
                user_info.get("displayName"),
                user_info.get("emailVerified"),
                user_info.get("disabled"),
                user_info.get("createdAt"),
                user_info.get("lastSignInAt"),
                json.dumps(user_info.get("customClaims") or {}),
            ]],
            headers=["UID", "Email", "Display Name", "Verified", "Disabled", "Created At", "Last Sign-In", "Claims"],
            tablefmt="grid",
        )
    )

    # Devices
    print("\nDevices")
    if devices:
        rows = []
        for device_id, data in devices.items():
            rows.append([
                device_id,
                data.get("user_id"),
                data.get("registered_at"),
                data.get("model") or data.get("type") or "-",
            ])
        print(
            tabulate(
                rows,
                headers=["Device ID", "User ID", "Registered At", "Model/Type"],
                tablefmt="grid",
            )
        )
    else:
        print("(no devices)")

    # Records
    print(f"\nRecent Records (limit {limit})")
    if records:
        rows = []
        for r in records:
            rows.append([
                r.get("id"),
                iso_from_ts(r.get("ts")),
                r.get("heart_rate") if r.get("heart_rate") is not None else r.get("bpm"),
                r.get("spo2"),
                r.get("device_id"),
            ])
        print(
            tabulate(
                rows,
                headers=["Key", "Timestamp", "Heart Rate", "SpO2", "Device"],
                tablefmt="grid",
            )
        )
    else:
        print("(no records)")


def main() -> None:
    parser = argparse.ArgumentParser(description="Get user data from Firebase")
    parser.add_argument("--uid", help="User UID")
    parser.add_argument("--email", help="User email")
    parser.add_argument("--limit", type=int, default=20, help="Max number of recent records to fetch")
    parser.add_argument("--format", choices=["json", "table"], default="json", help="Output format")
    args = parser.parse_args()

    if not args.uid and not args.email:
        print("Error: either --uid or --email is required", file=sys.stderr)
        parser.print_help()
        sys.exit(2)

    load_env()

    try:
        has_db = initialize_firebase()
    except Exception as e:
        print(f"Error initializing Firebase Admin: {e}", file=sys.stderr)
        sys.exit(1)

    try:
        user = fetch_auth_user(args.uid, args.email)
    except Exception as e:
        print(f"Error fetching user: {e}", file=sys.stderr)
        sys.exit(1)

    user_info: Dict[str, Any] = {
        "uid": user.uid,
        "email": user.email,
        "displayName": user.display_name,
        "disabled": user.disabled,
        "emailVerified": user.email_verified,
        "createdAt": user.user_metadata.creation_timestamp if user.user_metadata else None,
        "lastSignInAt": user.user_metadata.last_sign_in_timestamp if user.user_metadata else None,
        "customClaims": user.custom_claims or {},
    }

    devices: Dict[str, Dict[str, Any]] = {}
    records: List[Dict[str, Any]] = []
    if has_db:
        try:
            devices = fetch_user_devices(user.uid)
        except Exception as e:
            print(f"Warning: failed to fetch devices: {e}", file=sys.stderr)
        try:
            if args.limit > 0:
                records = fetch_user_records(user.uid, args.limit)
        except Exception as e:
            print(f"Warning: failed to fetch records: {e}", file=sys.stderr)
    else:
        print("Note: FIREBASE_DB_URL not set, skipping devices/records.", file=sys.stderr)

    if args.format == "json":
        output = {
            "user": user_info,
            "devices": devices,
            "records": records,
        }
        print(json.dumps(output, indent=2, default=str))
    else:
        print_table(user_info, devices, records, args.limit)


if __name__ == "__main__":
    main()


