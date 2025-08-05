import React, { useState, useEffect } from 'react'
import { useAdmin } from '../contexts/AdminContext'

const UserRolesList = () => {
  const { fetchUsers, setAdminClaimByEmail, getUserByEmail } = useAdmin()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [adminOnly, setAdminOnly] = useState(false)
  const [searchEmail, setSearchEmail] = useState('')
  const [selectedUser, setSelectedUser] = useState(null)
  const [stats, setStats] = useState(null)

  useEffect(() => {
    loadUsers()
  }, [adminOnly])

  const loadUsers = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await fetchUsers(null, adminOnly)
      setUsers(data.users)
      setStats({
        total: data.totalCount,
        admin: data.adminCount,
        regular: data.totalCount - data.adminCount
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSetAdmin = async (email, isAdmin) => {
    try {
      await setAdminClaimByEmail(email, isAdmin)
      await loadUsers() // Refresh the list
      alert(`Admin status updated for ${email}`)
    } catch (err) {
      alert(`Error updating admin status: ${err.message}`)
    }
  }

  const handleSearchUser = async () => {
    if (!searchEmail.trim()) return
    
    try {
      setLoading(true)
      const user = await getUserByEmail(searchEmail.trim())
      setSelectedUser(user)
    } catch (err) {
      alert(`User not found: ${err.message}`)
      setSelectedUser(null)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A'
    return new Date(timestamp).toLocaleString()
  }

  if (loading && users.length === 0) {
    return <div className="text-center p-4">Loading users...</div>
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">User Roles Management</h2>
      
      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-100 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800">Total Users</h3>
            <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
          </div>
          <div className="bg-green-100 p-4 rounded-lg">
            <h3 className="font-semibold text-green-800">Admin Users</h3>
            <p className="text-2xl font-bold text-green-600">{stats.admin}</p>
          </div>
          <div className="bg-gray-100 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-800">Regular Users</h3>
            <p className="text-2xl font-bold text-gray-600">{stats.regular}</p>
          </div>
        </div>
      )}

      {/* Search User */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-3">Search User by Email</h3>
        <div className="flex gap-2">
          <input
            type="email"
            value={searchEmail}
            onChange={(e) => setSearchEmail(e.target.value)}
            placeholder="Enter email address"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSearchUser}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Search
          </button>
        </div>
        
        {selectedUser && (
          <div className="mt-4 p-4 bg-white rounded-lg border">
            <h4 className="font-semibold mb-2">User Details:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p><strong>Email:</strong> {selectedUser.email}</p>
                <p><strong>Display Name:</strong> {selectedUser.displayName || 'N/A'}</p>
                <p><strong>UID:</strong> {selectedUser.uid}</p>
                <p><strong>Admin:</strong> {selectedUser.admin ? 'Yes' : 'No'}</p>
              </div>
              <div>
                <p><strong>Disabled:</strong> {selectedUser.disabled ? 'Yes' : 'No'}</p>
                <p><strong>Email Verified:</strong> {selectedUser.emailVerified ? 'Yes' : 'No'}</p>
                <p><strong>Created:</strong> {formatDate(selectedUser.createdAt)}</p>
                <p><strong>Last Sign In:</strong> {formatDate(selectedUser.lastSignInAt)}</p>
              </div>
            </div>
            <div className="mt-3">
              <button
                onClick={() => handleSetAdmin(selectedUser.email, !selectedUser.admin)}
                className={`px-3 py-1 rounded text-sm ${
                  selectedUser.admin 
                    ? 'bg-red-500 hover:bg-red-600 text-white' 
                    : 'bg-green-500 hover:bg-green-600 text-white'
                }`}
              >
                {selectedUser.admin ? 'Remove Admin' : 'Make Admin'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="mb-4 flex gap-4 items-center">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={adminOnly}
            onChange={(e) => setAdminOnly(e.target.checked)}
            className="mr-2"
          />
          Show admin users only
        </label>
        <button
          onClick={loadUsers}
          className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Refresh
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Sign In
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.uid} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {user.email}
                    </div>
                    <div className="text-sm text-gray-500">
                      {user.displayName || 'No display name'}
                    </div>
                    <div className="text-xs text-gray-400">
                      {user.uid}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col gap-1">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.admin 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {user.admin ? 'Admin' : 'User'}
                    </span>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.disabled 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {user.disabled ? 'Disabled' : 'Active'}
                    </span>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.emailVerified 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {user.emailVerified ? 'Verified' : 'Unverified'}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(user.createdAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(user.lastSignInAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleSetAdmin(user.email, !user.admin)}
                    className={`px-3 py-1 rounded text-sm ${
                      user.admin 
                        ? 'bg-red-500 hover:bg-red-600 text-white' 
                        : 'bg-green-500 hover:bg-green-600 text-white'
                    }`}
                  >
                    {user.admin ? 'Remove Admin' : 'Make Admin'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {users.length === 0 && !loading && (
          <div className="text-center py-8 text-gray-500">
            No users found{adminOnly ? ' matching admin criteria' : ''}
          </div>
        )}
      </div>
    </div>
  )
}

export default UserRolesList 