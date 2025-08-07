#!/usr/bin/env python3
"""
Script to start the FastAPI backend server
"""
import uvicorn
import os
import sys
from dotenv import load_dotenv

# Load environment variables from .env.local file
load_dotenv('.env.local')

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

if __name__ == "__main__":
    # Check if required environment variables are set
    required_env_vars = ["GOOGLE_APPLICATION_CREDENTIALS", "FIREBASE_DB_URL"]
    missing_vars = [var for var in required_env_vars if not os.getenv(var)]
    
    if missing_vars:
        print("❌ Missing required environment variables:")
        for var in missing_vars:
            print(f"   - {var}")
        print("\nPlease check your .env.local file and ensure these variables are set.")
        sys.exit(1)
    
    print("🚀 Starting FastAPI backend server on http://localhost:8001")
    print("📁 API documentation available at http://localhost:8001/docs")
    
    try:
        uvicorn.run(
            "api.main:app",
            host="0.0.0.0",
            port=8001,
            reload=True,
            log_level="info"
        )
    except KeyboardInterrupt:
        print("\n🛑 Server stopped by user")
    except Exception as e:
        print(f"❌ Error starting server: {e}")
        sys.exit(1) 