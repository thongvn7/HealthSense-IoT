# API Endpoints for User Role Management

Các API endpoints mới được tạo để frontend có thể gọi về và quản lý role của người dùng.

## Authentication Endpoints

### 1. GET `/api/auth/verify`
**Mô tả**: Xác thực token và trả về thông tin user hiện tại

**Headers**:
```
Authorization: Bearer <firebase_id_token>
```

**Response**:
```json
{
  "uid": "user_uid",
  "email": "user@example.com",
  "verified": true,
  "admin": false
}
```

### 2. GET `/api/auth/user-roles`
**Mô tả**: Lấy danh sách tất cả người dùng với role (chỉ admin)

**Headers**:
```
Authorization: Bearer <firebase_id_token>
```

**Query Parameters**:
- `admin_only` (boolean): Chỉ lấy admin users
- `limit` (number): Số lượng users tối đa (mặc định: 100)
- `page_token` (string): Token cho pagination

**Response**:
```json
{
  "users": [
    {
      "uid": "user_uid",
      "email": "user@example.com",
      "displayName": "User Name",
      "disabled": false,
      "emailVerified": true,
      "createdAt": 1640995200000,
      "lastSignInAt": 1640995200000,
      "customClaims": {
        "admin": true
      },
      "admin": true
    }
  ],
  "nextPageToken": "next_page_token",
  "total": 10,
  "adminCount": 2,
  "totalCount": 10
}
```

### 3. GET `/api/auth/user/{user_email}`
**Mô tả**: Lấy thông tin chi tiết của một user theo email (chỉ admin)

**Headers**:
```
Authorization: Bearer <firebase_id_token>
```

**Response**:
```json
{
  "uid": "user_uid",
  "email": "user@example.com",
  "displayName": "User Name",
  "disabled": false,
  "emailVerified": true,
  "createdAt": 1640995200000,
  "lastSignInAt": 1640995200000,
  "customClaims": {
    "admin": true
  },
  "admin": true
}
```

### 4. GET `/api/auth/user-stats`
**Mô tả**: Lấy thống kê về users (chỉ admin)

**Headers**:
```
Authorization: Bearer <firebase_id_token>
```

**Response**:
```json
{
  "totalUsers": 100,
  "adminUsers": 5,
  "regularUsers": 95,
  "disabledUsers": 2,
  "verifiedUsers": 98,
  "unverifiedUsers": 2
}
```

### 5. POST `/api/auth/set-admin-claim`
**Mô tả**: Thiết lập quyền admin cho user theo UID (chỉ admin)

**Headers**:
```
Authorization: Bearer <firebase_id_token>
Content-Type: application/json
```

**Body**:
```json
{
  "uid": "user_uid",
  "admin": true
}
```

**Response**:
```json
{
  "status": "ok",
  "message": "Admin claim set to true for user user_uid"
}
```

### 6. POST `/api/auth/set-admin-claim-by-email`
**Mô tả**: Thiết lập quyền admin cho user theo email (chỉ admin)

**Headers**:
```
Authorization: Bearer <firebase_id_token>
Content-Type: application/json
```

**Body**:
```json
{
  "email": "user@example.com",
  "admin": true
}
```

**Response**:
```json
{
  "status": "ok",
  "message": "Admin claim set to true for user user@example.com",
  "uid": "user_uid"
}
```

## Error Responses

Tất cả endpoints có thể trả về các lỗi sau:

### 401 Unauthorized
```json
{
  "detail": "Missing or invalid authorization header"
}
```

### 403 Forbidden
```json
{
  "detail": "Access denied. Admin privileges required."
}
```

### 404 Not Found
```json
{
  "detail": "User with email 'user@example.com' not found"
}
```

### 500 Internal Server Error
```json
{
  "detail": "Failed to fetch users: error_message"
}
```

## Frontend Usage Examples

### React Hook Example
```javascript
import { useAdmin } from '../contexts/AdminContext'

const MyComponent = () => {
  const { fetchUsers, setAdminClaimByEmail, getUserByEmail } = useAdmin()

  // Lấy tất cả users
  const loadUsers = async () => {
    try {
      const data = await fetchUsers()
      console.log('Users:', data.users)
    } catch (error) {
      console.error('Error:', error)
    }
  }

  // Lấy chỉ admin users
  const loadAdminUsers = async () => {
    try {
      const data = await fetchUsers(null, true)
      console.log('Admin users:', data.users)
    } catch (error) {
      console.error('Error:', error)
    }
  }

  // Tìm user theo email
  const findUser = async (email) => {
    try {
      const user = await getUserByEmail(email)
      console.log('User:', user)
    } catch (error) {
      console.error('Error:', error)
    }
  }

  // Thiết lập admin cho user
  const makeAdmin = async (email) => {
    try {
      await setAdminClaimByEmail(email, true)
      console.log('User is now admin')
    } catch (error) {
      console.error('Error:', error)
    }
  }
}
```

### Axios Direct Call Example
```javascript
import axios from 'axios'

const getAuthHeaders = async (user) => {
  const token = await user.getIdToken()
  return { Authorization: `Bearer ${token}` }
}

// Lấy user roles
const getUserRoles = async (user) => {
  const headers = await getAuthHeaders(user)
  const response = await axios.get('/api/auth/user-roles', { headers })
  return response.data
}

// Thiết lập admin claim
const setAdminClaim = async (user, email, isAdmin) => {
  const headers = await getAuthHeaders(user)
  const response = await axios.post('/api/auth/set-admin-claim-by-email', {
    email,
    admin: isAdmin
  }, { headers })
  return response.data
}
```

## Security Notes

1. **Authentication Required**: Tất cả endpoints yêu cầu Firebase ID token hợp lệ
2. **Admin Only**: Hầu hết endpoints chỉ dành cho admin users
3. **Token Verification**: Token được verify bởi Firebase Admin SDK
4. **Custom Claims**: Admin role được lưu trong Firebase custom claims

## Testing

Bạn có thể test các endpoints bằng cách:

1. **Sử dụng script Python**:
```bash
python scripts/view_user_roles.py
python scripts/check_user_role.py user@example.com
```

2. **Sử dụng frontend component**:
- Truy cập `/user-roles` page
- Sử dụng UserRolesList component

3. **Sử dụng curl**:
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:3000/api/auth/user-roles
``` 