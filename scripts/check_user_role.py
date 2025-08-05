#!/usr/bin/env python3
"""
Script to check the role of a specific user in Firebase Auth.

Usage:
    python scripts/check_user_role.py <user_email>

Example:
    python scripts/check_user_role.py user@example.com
"""

import os
import sys
import argparse
import json
from firebase_admin import credentials, initialize_app, auth

def main():
    parser = argparse.ArgumentParser(description='Check the role of a specific user in Firebase Auth')
    parser.add_argument('email', help='Email address of the user to check')
    args = parser.parse_args()

    # Initialize Firebase Admin SDK
    try:
        # Get credentials from environment variable
        cred_path = os.environ.get("GOOGLE_APPLICATION_CREDENTIALS")
        if not cred_path:
            print("Error: GOOGLE_APPLICATION_CREDENTIALS environment variable not set")
            print("Please set it to the path of your serviceAccountKey.json file")
            sys.exit(1)
        
        cred = credentials.Certificate(cred_path)
        initialize_app(cred)
    except Exception as e:
        print(f"Error initializing Firebase Admin: {e}")
        sys.exit(1)

    try:
        # Get user by email
        user = auth.get_user_by_email(args.email)
        
        print(f"User Information:")
        print(f"  UID: {user.uid}")
        print(f"  Email: {user.email}")
        print(f"  Display Name: {user.display_name or 'N/A'}")
        print(f"  Disabled: {user.disabled}")
        print(f"  Email Verified: {user.email_verified}")
        
        # Check custom claims
        custom_claims = user.custom_claims or {}
        is_admin = custom_claims.get('admin', False)
        
        print(f"\nRole Information:")
        print(f"  Admin: {'Yes' if is_admin else 'No'}")
        
        if custom_claims:
            print(f"  Custom Claims: {json.dumps(custom_claims, indent=2)}")
        else:
            print(f"  Custom Claims: None")
        
        # User metadata
        if user.user_metadata:
            print(f"\nAccount Information:")
            if user.user_metadata.creation_timestamp:
                from datetime import datetime
                created = datetime.fromtimestamp(user.user_metadata.creation_timestamp / 1000)
                print(f"  Created: {created.strftime('%Y-%m-%d %H:%M:%S')}")
            
            if user.user_metadata.last_sign_in_timestamp:
                from datetime import datetime
                last_signin = datetime.fromtimestamp(user.user_metadata.last_sign_in_timestamp / 1000)
                print(f"  Last Sign In: {last_signin.strftime('%Y-%m-%d %H:%M:%S')}")
        
    except auth.UserNotFoundError:
        print(f"Error: User with email '{args.email}' not found")
        sys.exit(1)
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main() 