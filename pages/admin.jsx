// pages/admin.jsx
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '../contexts/AuthContext'
import { useAdmin } from '../contexts/AdminContext'

export default function AdminDashboard() {
  const router = useRouter()
  const { user } = useAuth()
  const { 
    isAdmin, 
    loading, 
    users, 
    devices, 
    stats,
    fetchUsers, 
    fetchDevices, 
    fetchStats,
    updateUser,
    deleteUser,
    deleteDevice,
    setAdminClaim,
    getUserDevices
  } = useAdmin()

  const [activeTab, setActiveTab] = useState('users')
  const [selectedUser, setSelectedUser] = useState(null)
  const [userDevices, setUserDevices] = useState([])
  const [editingUser, setEditingUser] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (!loading && !isAdmin) {
      router.push('/dashboard')
    }
  }, [loading, isAdmin, router])

  useEffect(() => {
    if (isAdmin) {
      fetchUsers()
      fetchDevices()
      fetchStats()
    }
  }, [isAdmin])

  // Fetch devices for selected user
  const handleViewUserDevices = async (userId) => {
    try {
      const result = await getUserDevices(userId)
      setUserDevices(result.devices)
      setSelectedUser(users.find(u => u.uid === userId))
    } catch (error) {
      console.error('Error fetching user devices:', error)
    }
  }

  // Handle user edit
  const handleEditUser = (user) => {
    setEditingUser({
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || '',
      disabled: user.disabled,
      admin: user.admin
    })
  }

  // Save user changes
  const handleSaveUser = async () => {
    try {
      const updates = {
        email: editingUser.email,
        displayName: editingUser.displayName,
        disabled: editingUser.disabled
      }
      
      await updateUser(editingUser.uid, updates)
      
      // Update admin claim if changed
      if (editingUser.admin !== users.find(u => u.uid === editingUser.uid).admin) {
        await setAdminClaim(editingUser.uid, editingUser.admin)
      }
      
      setEditingUser(null)
    } catch (error) {
      alert('Error updating user: ' + error.message)
    }
  }

  // Handle user deletion
  const handleDeleteUser = async (userId) => {
    if (confirm('Are you sure you want to delete this user and all their data?')) {
      try {
        await deleteUser(userId)
      } catch (error) {
        alert('Error deleting user: ' + error.message)
      }
    }
  }

  // Handle device deletion
  const handleDeleteDevice = async (deviceId) => {
    if (confirm('Are you sure you want to delete this device?')) {
      try {
        await deleteDevice(deviceId)
      } catch (error) {
        alert('Error deleting device: ' + error.message)
      }
    }
  }

  // Filter users based on search
  const filteredUsers = users.filter(user => 
    user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.uid.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Filter devices based on search
  const filteredDevices = devices.filter(device =>
    device.deviceId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    device.userEmail?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <button
              onClick={() => router.push('/dashboard')}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900">Total Users</h3>
              <p className="mt-2 text-3xl font-bold text-blue-600">{stats.userCount}</p>
            </div>
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900">Total Devices</h3>
              <p className="mt-2 text-3xl font-bold text-green-600">{stats.deviceCount}</p>
            </div>
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900">Total Records</h3>
              <p className="mt-2 text-3xl font-bold text-purple-600">{stats.totalRecords}</p>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('users')}
              className={`${
                activeTab === 'users'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Users ({users.length})
            </button>
            <button
              onClick={() => setActiveTab('devices')}
              className={`${
                activeTab === 'devices'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Devices ({devices.length})
            </button>
          </nav>
        </div>

        {/* Search Bar */}
        <div className="mt-4">
          <input
            type="text"
            placeholder={`Search ${activeTab}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Content */}
        <div className="mt-6">
          {activeTab === 'users' && (
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <li key={user.uid}>
                    {editingUser?.uid === user.uid ? (
                      <div className="px-4 py-4 sm:px-6 bg-gray-50">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Email</label>
                            <input
                              type="email"
                              value={editingUser.email}
                              onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Display Name</label>
                            <input
                              type="text"
                              value={editingUser.displayName}
                              onChange={(e) => setEditingUser({...editingUser, displayName: e.target.value})}
                              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                            />
                          </div>
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              checked={editingUser.disabled}
                              onChange={(e) => setEditingUser({...editingUser, disabled: e.target.checked})}
                              className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                            />
                            <label className="ml-2 block text-sm text-gray-900">Account Disabled</label>
                          </div>
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              checked={editingUser.admin}
                              onChange={(e) => setEditingUser({...editingUser, admin: e.target.checked})}
                              className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                            />
                            <label className="ml-2 block text-sm text-gray-900">Admin Privileges</label>
                          </div>
                        </div>
                        <div className="mt-4 flex space-x-2">
                          <button
                            onClick={handleSaveUser}
                            className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingUser(null)}
                            className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="px-4 py-4 sm:px-6 flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {user.email}
                                {user.admin && (
                                  <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                                    Admin
                                  </span>
                                )}
                                {user.disabled && (
                                  <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                    Disabled
                                  </span>
                                )}
                              </p>
                              <p className="text-sm text-gray-500">
                                {user.displayName || 'No display name'} • {user.deviceCount} devices
                              </p>
                              <p className="text-xs text-gray-400">
                                UID: {user.uid}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="ml-4 flex items-center space-x-2">
                          <button
                            onClick={() => handleViewUserDevices(user.uid)}
                            className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                          >
                            View Devices
                          </button>
                          <button
                            onClick={() => handleEditUser(user)}
                            className="px-3 py-1 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.uid)}
                            className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                            disabled={user.uid === user?.uid} // Prevent self-deletion
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {activeTab === 'devices' && (
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {filteredDevices.map((device) => (
                  <li key={device.deviceId}>
                    <div className="px-4 py-4 sm:px-6 flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              Device ID: {device.deviceId}
                            </p>
                            <p className="text-sm text-gray-500">
                              Owner: {device.userEmail || 'Unknown'} ({device.userDisplayName || 'No name'})
                            </p>
                            <p className="text-xs text-gray-400">
                              Registered: {new Date(device.registeredAt).toLocaleString()}
                              {device.lastActive && (
                                <span> • Last active: {new Date(device.lastActive).toLocaleString()}</span>
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="ml-4">
                        <button
                          onClick={() => handleDeleteDevice(device.deviceId)}
                          className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* User Devices Modal */}
      {selectedUser && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" onClick={() => setSelectedUser(null)}>
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Devices for {selectedUser.email}
                </h3>
                {userDevices.length === 0 ? (
                  <p className="text-gray-500">No devices registered</p>
                ) : (
                  <ul className="divide-y divide-gray-200">
                    {userDevices.map((device) => (
                      <li key={device.deviceId} className="py-3">
                        <p className="text-sm font-medium text-gray-900">
                          Device ID: {device.deviceId}
                        </p>
                        <p className="text-xs text-gray-500">
                          Registered: {new Date(device.registeredAt).toLocaleString()}
                          {device.lastActive && (
                            <span> • Last active: {new Date(device.lastActive).toLocaleString()}</span>
                          )}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  onClick={() => setSelectedUser(null)}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        input[type="text"],
        input[type="email"] {
          padding: 0.5rem;
          border: 1px solid #d1d5db;
          border-radius: 0.375rem;
          font-size: 0.875rem;
          line-height: 1.25rem;
        }
        
        input[type="text"]:focus,
        input[type="email"]:focus {
          outline: 2px solid transparent;
          outline-offset: 2px;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
      `}</style>
    </div>
  )
}