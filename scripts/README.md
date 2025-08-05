# User Role Management Scripts

Các script này giúp bạn quản lý và xem role của người dùng trong Firebase Auth.

## Cài đặt

1. Đảm bảo bạn đã cài đặt các dependencies:
```bash
pip install -r requirements.txt
```

2. Thiết lập biến môi trường cho Firebase credentials:
```bash
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/serviceAccountKey.json"
```

## Các Script Có Sẵn

### 1. `set_admin.py` - Thiết lập quyền admin
```bash
# Cấp quyền admin cho một user
python scripts/set_admin.py user@example.com

# Thu hồi quyền admin
python scripts/set_admin.py user@example.com --remove
```

### 2. `view_user_roles.py` - Xem role của tất cả người dùng
```bash
# Xem tất cả người dùng
python scripts/view_user_roles.py

# Chỉ xem admin users
python scripts/view_user_roles.py --admin-only

# Xuất ra định dạng JSON
python scripts/view_user_roles.py --format json

# Kết hợp các options
python scripts/view_user_roles.py --admin-only --format json
```

### 3. `check_user_role.py` - Kiểm tra role của một người dùng cụ thể
```bash
python scripts/check_user_role.py user@example.com
```

## Ví dụ Output

### Xem tất cả người dùng:
```
+------------------+---------------+-------+----------+----------+------------+
| Email            | Display Name  | Admin | Disabled | Verified | UID        |
+==================+===============+=======+==========+==========+============+
| admin@test.com   | Admin User    | ✓     | ✗        | ✓        | abc123...  |
+------------------+---------------+-------+----------+----------+------------+
| user@test.com    | Regular User  | ✗     | ✗        | ✓        | def456...  |
+------------------+---------------+-------+----------+----------+------------+

Summary:
Total users: 2
Admin users: 1
Regular users: 1
Showing 2 users
```

### Kiểm tra một người dùng cụ thể:
```
User Information:
  UID: abc123def456
  Email: user@example.com
  Display Name: John Doe
  Disabled: False
  Email Verified: True

Role Information:
  Admin: No
  Custom Claims: {}

Account Information:
  Created: 2024-01-15 10:30:00
  Last Sign In: 2024-01-20 14:45:00
```

## Lưu Ý Quan Trọng

1. **Bảo mật**: Chỉ chạy các script này trên máy tính an toàn và không chia sẻ credentials.

2. **Quyền Admin**: Bạn cần có quyền admin trong Firebase project để sử dụng các script này.

3. **Backup**: Luôn backup dữ liệu trước khi thực hiện các thay đổi quan trọng.

4. **Testing**: Test các script trên môi trường development trước khi sử dụng trên production.

## Troubleshooting

### Lỗi "GOOGLE_APPLICATION_CREDENTIALS not set"
```bash
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/serviceAccountKey.json"
```

### Lỗi "Permission denied"
- Kiểm tra file serviceAccountKey.json có đúng quyền không
- Đảm bảo service account có quyền quản lý users

### Lỗi "User not found"
- Kiểm tra email đúng chính tả
- Đảm bảo user đã tồn tại trong Firebase Auth

## API Endpoints

Ngoài các script, bạn cũng có thể sử dụng các API endpoints:

- `GET /api/admin/users` - Lấy danh sách tất cả users
- `PUT /api/admin/users/{user_id}` - Cập nhật thông tin user
- `DELETE /api/admin/users/{user_id}` - Xóa user

Các endpoints này yêu cầu quyền admin và authentication token hợp lệ. 