#!/usr/bin/env python3
"""
CLI tool to register a device in Firebase Realtime Database.

Supports both interactive prompts and CLI flags.

Usage examples:
  - Interactive:
      python scripts/register_device_cli.py

  - Non-interactive (recommended for automation):
      python scripts/register_device_cli.py --id dev123 --secret sss123 --user uid_abc

Environment:
  - Requires .env.local with GOOGLE_APPLICATION_CREDENTIALS and FIREBASE_DB_URL
"""

from __future__ import annotations

import argparse
import os
import sys
import time
from pathlib import Path

from dotenv import load_dotenv
from firebase_admin import credentials, initialize_app, db


def load_environment() -> None:
    project_root = Path(__file__).resolve().parents[1]
    load_dotenv(project_root / ".env.local")

    missing: list[str] = []
    if not os.getenv("FIREBASE_DB_URL"):
        missing.append("FIREBASE_DB_URL")
    required_keys = [
        "FIREBASE_TYPE",
        "FIREBASE_PROJECT_ID",
        "FIREBASE_PRIVATE_KEY_ID",
        "FIREBASE_PRIVATE_KEY",
        "FIREBASE_CLIENT_EMAIL",
        "FIREBASE_CLIENT_ID",
        "FIREBASE_AUTH_URI",
        "FIREBASE_TOKEN_URI",
        "FIREBASE_AUTH_PROVIDER_X509_CERT_URL",
        "FIREBASE_CLIENT_X509_CERT_URL",
    ]
    for key in required_keys:
        if not os.getenv(key):
            missing.append(key)
    if missing:
        print("❌ Missing required environment variables:")
        for var in missing:
            print(f"   - {var}")
        print("Please set them in .env.local")
        sys.exit(1)


def ensure_firebase_initialized() -> None:
    db_url = os.environ["FIREBASE_DB_URL"].rstrip("/")

    service_account_info = {
        "type": os.environ.get("FIREBASE_TYPE"),
        "project_id": os.environ.get("FIREBASE_PROJECT_ID"),
        "private_key_id": os.environ.get("FIREBASE_PRIVATE_KEY_ID"),
        "private_key": (os.environ.get("FIREBASE_PRIVATE_KEY") or "").replace("\\n", "\n"),
        "client_email": os.environ.get("FIREBASE_CLIENT_EMAIL"),
        "client_id": os.environ.get("FIREBASE_CLIENT_ID"),
        "auth_uri": os.environ.get("FIREBASE_AUTH_URI"),
        "token_uri": os.environ.get("FIREBASE_TOKEN_URI"),
        "auth_provider_x509_cert_url": os.environ.get("FIREBASE_AUTH_PROVIDER_X509_CERT_URL"),
        "client_x509_cert_url": os.environ.get("FIREBASE_CLIENT_X509_CERT_URL"),
    }

    # Initialize only once
    try:
        initialize_app(credentials.Certificate(service_account_info), {"databaseURL": db_url})
    except ValueError:
        # App already initialized
        pass


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Register a device in RTDB")
    parser.add_argument("--id", dest="device_id", help="Device ID")
    parser.add_argument("--secret", dest="device_secret", help="Device secret")
    parser.add_argument(
        "--user",
        dest="user_uid",
        help="Optional user UID to associate with the device",
        default=None,
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="Overwrite existing device without prompt",
    )
    return parser.parse_args()


def prompt_if_missing(args: argparse.Namespace) -> argparse.Namespace:
    if not args.device_id:
        args.device_id = input("Enter device id: ").strip()
    if not args.device_secret:
        args.device_secret = input("Enter device secret: ").strip()
    if args.user_uid is None:
        entered = input("Enter user UID (optional, press Enter to skip): ").strip()
        args.user_uid = entered or None
    return args


def main() -> None:
    load_environment()
    ensure_firebase_initialized()

    args = parse_args()
    # Use interactive prompts when flags are missing
    if not args.device_id or not args.device_secret:
        print("ℹ️  Switching to interactive mode for missing inputs...")
        args = prompt_if_missing(args)

    device_id = args.device_id
    device_secret = args.device_secret
    user_uid = args.user_uid

    if not device_id or not device_secret:
        print("❌ device id and secret are required")
        sys.exit(1)

    ref = db.reference(f"/devices/{device_id}")
    existing = ref.get()
    if existing:
        print(f"⚠️  Device '{device_id}' already exists: {existing}")
        if not args.force:
            choice = input("Overwrite? [y/N]: ").strip().lower()
            if choice not in {"y", "yes"}:
                print("Aborted. No changes made.")
                return

    payload = {
        "secret": device_secret,
        "registered_at": int(time.time() * 1000),
    }
    if user_uid:
        payload["user_id"] = user_uid

    ref.set(payload)
    print("✅ Device registered/updated successfully")
    print("Device:", device_id)
    print("Data:", payload)


if __name__ == "__main__":
    main()


