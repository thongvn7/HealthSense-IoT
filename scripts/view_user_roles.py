#!/usr/bin/env python3
"""
Script to view user roles and claims from Firebase Auth.
This script lists all users with their roles and custom claims.

Usage:
    python scripts/view_user_roles.py [--admin-only] [--format json|table]

Example:
    python scripts/view_user_roles.py
    python scripts/view_user_roles.py --admin-only
    python scripts/view_user_roles.py --format json
"""

import os
import sys
import argparse
import json
from tabulate import tabulate
from firebase_admin import credentials, initialize_app, auth

def main():
    parser = argparse.ArgumentParser(description='View user roles and claims from Firebase Auth')
    parser.add_argument('--admin-only', action='store_true', help='Show only admin users')
    parser.add_argument('--format', choices=['table', 'json'], default='table', help='Output format')
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
        # List all users
        print("Fetching users from Firebase Auth...")
        users_result = auth.list_users()
        
        users_data = []
        admin_count = 0
        total_count = 0
        
        for user in users_result.users:
            total_count += 1
            
            # Get custom claims
            custom_claims = user.custom_claims or {}
            is_admin = custom_claims.get('admin', False)
            
            if args.admin_only and not is_admin:
                continue
                
            if is_admin:
                admin_count += 1
            
            user_data = {
                "uid": user.uid,
                "email": user.email,
                "display_name": user.display_name or "N/A",
                "admin": is_admin,
                "disabled": user.disabled,
                "email_verified": user.email_verified,
                "created_at": user.user_metadata.creation_timestamp if user.user_metadata else None,
                "last_sign_in": user.user_metadata.last_sign_in_timestamp if user.user_metadata else None,
                "custom_claims": custom_claims
            }
            
            users_data.append(user_data)
        
        # Display results
        if args.format == 'json':
            print(json.dumps(users_data, indent=2, default=str))
        else:
            # Table format
            if not users_data:
                print("No users found" + (" matching admin criteria" if args.admin_only else ""))
                return
            
            # Prepare table data
            table_data = []
            for user in users_data:
                table_data.append([
                    user["email"],
                    user["display_name"],
                    "✓" if user["admin"] else "✗",
                    "✓" if user["disabled"] else "✗",
                    "✓" if user["email_verified"] else "✗",
                    user["uid"][:8] + "..." if len(user["uid"]) > 8 else user["uid"]
                ])
            
            headers = ["Email", "Display Name", "Admin", "Disabled", "Verified", "UID"]
            print(tabulate(table_data, headers=headers, tablefmt="grid"))
            
            # Summary
            print(f"\nSummary:")
            print(f"Total users: {total_count}")
            print(f"Admin users: {admin_count}")
            print(f"Regular users: {total_count - admin_count}")
            
            if args.admin_only:
                print(f"Showing {len(users_data)} admin users")
            else:
                print(f"Showing {len(users_data)} users")
        
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main() 