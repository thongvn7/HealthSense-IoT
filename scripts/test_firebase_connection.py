#!/usr/bin/env python3
"""
Script to test Firebase connection and list basic project info.
"""

import os
import sys
from firebase_admin import credentials, initialize_app, auth

def main():
    print("Testing Firebase connection...")
    
    # Initialize Firebase Admin SDK
    try:
        # Get credentials from environment variable
        cred_path = os.environ.get("GOOGLE_APPLICATION_CREDENTIALS")
        if not cred_path:
            print("Error: GOOGLE_APPLICATION_CREDENTIALS environment variable not set")
            print("Please set it to the path of your serviceAccountKey.json file")
            sys.exit(1)
        
        print(f"Using credentials from: {cred_path}")
        
        cred = credentials.Certificate(cred_path)
        app = initialize_app(cred)
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
        print(f"Error: Credentials file not found at {cred_path}")
        sys.exit(1)
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main() 