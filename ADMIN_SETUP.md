# Admin Panel Setup Guide

This guide explains how to set up and use the admin panel for your Physics Final project.

## Features

The admin panel provides:
- **User Management**: View, edit, disable, and delete user accounts
- **Device Management**: View and delete registered devices
- **Role Management**: Grant or revoke admin privileges
- **System Statistics**: Overview of users, devices, and records
- **User-Device Relationships**: View which devices belong to which users

## Initial Setup

### 1. Set Up the First Admin User

After deploying your application, you need to designate at least one admin user:

```bash
# Make sure GOOGLE_APPLICATION_CREDENTIALS is set
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/serviceAccountKey.json"

# Install Python dependencies if not already done
pip install -r requirements.txt

# Set admin claim for a user (replace with actual email)
python scripts/set_admin.py admin@example.com
```

### 2. Access the Admin Panel

1. Log in to your application with the admin account
2. You'll see an "Admin Panel" button in the dashboard header
3. Click it to access the admin interface

## Admin Panel Features

### User Management
- **View All Users**: See all registered users with their email, display name, and device count
- **Edit Users**: Update user email, display name, or disable accounts
- **Admin Privileges**: Grant or revoke admin access to users
- **Delete Users**: Remove users and all their associated data

### Device Management
- **View All Devices**: See all registered devices with owner information
- **Last Activity**: Track when devices were last active
- **Delete Devices**: Remove devices from the system

### User-Device Relationships
- Click "View Devices" on any user to see their registered devices
- See registration dates and last activity for each device

## API Endpoints

The admin panel uses these protected API endpoints:

- `GET /api/admin/users` - List all users
- `PUT /api/admin/users/{user_id}` - Update user information
- `DELETE /api/admin/users/{user_id}` - Delete user and data
- `GET /api/admin/devices` - List all devices
- `DELETE /api/admin/devices/{device_id}` - Delete a device
- `GET /api/admin/users/{user_id}/devices` - Get user's devices
- `GET /api/admin/stats` - Get system statistics
- `POST /api/auth/set-admin-claim` - Set admin privileges

## Security

- All admin endpoints require valid Firebase authentication
- Admin role is verified through Firebase custom claims
- Only admins can access admin endpoints
- Admins cannot delete their own accounts through the UI

## Managing Admin Users

### Add Admin Privileges
```bash
python scripts/set_admin.py user@example.com
```

### Remove Admin Privileges
```bash
python scripts/set_admin.py user@example.com --remove
```

### Via Admin Panel
Admins can grant/revoke admin privileges to other users directly from the admin panel by editing a user and checking/unchecking the "Admin Privileges" checkbox.

## Troubleshooting

### "Access denied. Admin privileges required."
- Ensure the user has admin claims set
- Try logging out and back in to refresh the token

### Admin button not showing
- Verify admin claims are set correctly
- Check browser console for errors
- Ensure AdminContext is properly initialized

### Cannot access admin endpoints
- Verify Firebase Admin SDK is initialized
- Check that GOOGLE_APPLICATION_CREDENTIALS is set correctly
- Ensure the service account has necessary permissions

## Best Practices

1. **Limit Admin Access**: Only grant admin privileges to trusted users
2. **Regular Audits**: Periodically review who has admin access
3. **Backup Data**: Before bulk deletions, ensure you have backups
4. **Monitor Activity**: Keep track of admin actions (consider adding audit logs)

## Future Enhancements

Consider adding:
- Audit logs for admin actions
- Bulk operations (delete multiple users/devices)
- Export functionality for user/device data
- More detailed analytics and reports
- Email notifications for admin actions