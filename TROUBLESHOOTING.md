# Troubleshooting Guide

## Fast Refresh Issues

### Problem: "Fast Refresh had to perform full reload"

**Causes:**
- Backend server not running
- Multiple exports in a single file
- Anonymous React components
- Component names in camelCase instead of PascalCase

**Solutions:**

1. **Ensure Backend Server is Running**
   ```bash
   # Start the full development environment
   npm run dev:full
   
   # Or start backend separately
   npm run backend
   ```

2. **Check Component Structure**
   - Use named function components: `export default function MyComponent()`
   - Use PascalCase for component names: `MyComponent` not `myComponent`
   - Avoid multiple exports in component files

3. **Verify File Structure**
   - Components should be in `pages/` or `components/` directories
   - Use `.jsx` extension for React components

## Proxy Connection Errors

### Problem: "Failed to proxy http://localhost:8001/api/auth/verify [Error: socket hang up]"

**Causes:**
- Backend server not running on port 8001
- Missing environment variables
- Python dependencies not installed

**Solutions:**

1. **Start Backend Server**
   ```bash
   # Method 1: Use the development script
   ./dev.sh
   
   # Method 2: Start manually
   python start-backend.py
   ```

2. **Check Environment Variables**
   ```bash
   # Verify these are set
   echo $GOOGLE_APPLICATION_CREDENTIALS
   echo $FIREBASE_DB_URL
   ```

3. **Install Dependencies**
   ```bash
   # Python dependencies
   pip install -r requirements.txt
   
   # Node.js dependencies
   npm install
   ```

4. **Verify Backend is Running**
   ```bash
   # Check if port 8001 is listening
   curl http://localhost:8001/docs
   ```

## Environment Setup

### Required Environment Variables

1. **Copy the template:**
   ```bash
   cp env.template .env
   ```

2. **Set Firebase credentials:**
   - `GOOGLE_APPLICATION_CREDENTIALS`: Path to your Firebase service account key
   - `FIREBASE_DB_URL`: Your Firebase Realtime Database URL

3. **Load environment variables:**
   ```bash
   export $(cat .env | xargs)
   ```

## Common Commands

```bash
# Start full development environment
npm run dev:full

# Start only frontend
npm run dev

# Start only backend
npm run backend

# Build for production
npm run build

# Start production server
npm start
```

## Debugging Tips

1. **Check Server Logs**
   - Backend logs will show in the terminal where you started the backend
   - Frontend logs will show in the browser console

2. **Verify Network Requests**
   - Open browser DevTools → Network tab
   - Check if API requests are being made to the correct endpoints

3. **Test API Endpoints**
   - Visit `http://localhost:8001/docs` for API documentation
   - Test endpoints directly using curl or Postman

4. **Check File Permissions**
   ```bash
   chmod +x dev.sh start-backend.py
   ```

## Still Having Issues?

1. **Restart Everything:**
   ```bash
   # Kill all Node.js and Python processes
   pkill -f "node\|python\|uvicorn"
   
   # Start fresh
   npm run dev:full
   ```

2. **Clear Cache:**
   ```bash
   # Clear Next.js cache
   rm -rf .next
   
   # Clear npm cache
   npm cache clean --force
   ```

3. **Check Port Availability:**
   ```bash
   # Check if ports are in use
   lsof -i :3000
   lsof -i :8001
   ``` 