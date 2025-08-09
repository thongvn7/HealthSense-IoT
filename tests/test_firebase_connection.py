#!/usr/bin/env python3
"""
Script to test Firebase connection and list basic project info.

Loads environment variables from `.env.local` for local development.
"""

import os
import sys
from pathlib import Path

from dotenv import load_dotenv
from firebase_admin import credentials, initialize_app, auth

def main():
    # Load env from project root `.env.local` (best-effort)
    project_root = Path(__file__).resolve().parents[1]
    load_dotenv(project_root / ".env.local")

    print("Testing Firebase connection...")
    
    # Initialize Firebase Admin SDK using env-based service account
    try:
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
        app = initialize_app(credentials.Certificate(service_account_info))  # type: ignore[arg-type]
        print("✓ Firebase Admin SDK initialized successfully")
        
        # Test listing users (just get the first few)
        print("\nTesting user listing...")
        users_result = auth.list_users(max_results=5)
        print(f"✓ Successfully connected to Firebase Auth")
        print(f"  Found {len(users_result.users)} users (showing first 5)")
        
        if users_result.users:
            print("\nSample users:")
            for i, user in enumerate(users_result.users, 1):
                custom_claims = user.custom_claims or {}
                is_admin = custom_claims.get('admin', False)
                print(f"  {i}. {user.email} (Admin: {'Yes' if is_admin else 'No'})")
        else:
            print("  No users found in the project")
        
        print("\n✓ Firebase connection test completed successfully!")
        
    except FileNotFoundError:
        print("Error: Credentials file not found")
        sys.exit(1)
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main() 