#!/usr/bin/env python3
"""
Script to set admin claims for a user in Firebase Auth.
This is useful for setting up the first admin user.

Usage:
    python scripts/set_admin.py <user_email> [--remove]

Example:
    python scripts/set_admin.py admin@example.com
    python scripts/set_admin.py user@example.com --remove
"""

import os
import sys
import argparse
from firebase_admin import credentials, initialize_app, auth

def main():
    parser = argparse.ArgumentParser(description='Set or remove admin claims for a Firebase user')
    parser.add_argument('email', help='Email address of the user')
    parser.add_argument('--remove', action='store_true', help='Remove admin claim instead of adding it')
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
        print(f"Found user: {user.uid} ({user.email})")

        # Set or remove admin claim
        if args.remove:
            # Remove admin claim
            auth.set_custom_user_claims(user.uid, {'admin': False})
            print(f"Admin claim removed from user {user.email}")
        else:
            # Add admin claim
            auth.set_custom_user_claims(user.uid, {'admin': True})
            print(f"Admin claim added to user {user.email}")

        # Verify the claims were set
        user = auth.get_user(user.uid)
        current_claims = user.custom_claims or {}
        print(f"Current custom claims: {current_claims}")
        
        if current_claims.get('admin'):
            print(f"✓ User {user.email} is now an admin")
        else:
            print(f"✓ User {user.email} is not an admin")

    except auth.UserNotFoundError:
        print(f"Error: User with email '{args.email}' not found")
        sys.exit(1)
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()