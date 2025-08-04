// pages/device-setup.jsx
import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useRouter } from 'next/router'
import axios from 'axios'

export default function DeviceSetup() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [deviceId, setDeviceId] = useState('')
  const [deviceSecret, setDeviceSecret] = useState('')
  const [isRegistering, setIsRegistering] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  // Redirect if not authenticated
  if (!loading && !user) {
    router.push('/landing')
    return null
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div>Đang tải...</div>
      </div>
    )
  }

  const handleRegisterDevice = async (e) => {
    e.preventDefault()
    
    if (!deviceId.trim() || !deviceSecret.trim()) {
      setError('Vui lòng nhập đầy đủ thông tin thiết bị')
      return
    }

    setIsRegistering(true)
    setError('')
    setMessage('')

    try {
      // Get user's Firebase ID token
      const token = await user.getIdToken()
      
      await axios.post('/api/records/device/register', {
        device_id: deviceId.trim(),
        device_secret: deviceSecret.trim()
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      setMessage('Đăng ký thiết bị thành công! Bây giờ bạn có thể xem dữ liệu từ thiết bị này.')
      setDeviceId('')
      setDeviceSecret('')
      
      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)
      
    } catch (error) {
      console.error('Device registration error:', error)
      setError(error.response?.data?.detail || 'Đăng ký thiết bị thất bại')
    }
    
    setIsRegistering(false)
  }

  return (
    <div className="device-setup">
      <div className="container">
        <div className="setup-card">
          <div className="header">
            <h1>🔧 Đăng ký thiết bị ESP32</h1>
            <p>Kết nối thiết bị ESP32 của bạn để bắt đầu theo dõi sức khỏe</p>
          </div>

          <form onSubmit={handleRegisterDevice} className="setup-form">
            <div className="form-group">
              <label htmlFor="deviceId">Device ID:</label>
              <input
                type="text"
                id="deviceId"
                value={deviceId}
                onChange={(e) => setDeviceId(e.target.value)}
                placeholder="Nhập ID thiết bị ESP32"
                required
              />
              <small>ID duy nhất của thiết bị ESP32 (ví dụ: ESP32_001)</small>
            </div>

            <div className="form-group">
              <label htmlFor="deviceSecret">Device Secret:</label>
              <input
                type="password"
                id="deviceSecret"
                value={deviceSecret}
                onChange={(e) => setDeviceSecret(e.target.value)}
                placeholder="Nhập mật khẩu thiết bị"
                required
              />
              <small>Mật khẩu bảo mật của thiết bị (được cấu hình trong code ESP32)</small>
            </div>

            {error && (
              <div className="alert alert-error">
                {error}
              </div>
            )}

            {message && (
              <div className="alert alert-success">
                {message}
              </div>
            )}

            <button 
              type="submit" 
              disabled={isRegistering}
              className="btn-primary"
            >
              {isRegistering ? 'Đang đăng ký...' : 'Đăng ký thiết bị'}
            </button>
          </form>

          <div className="instructions">
            <h3>📖 Hướng dẫn:</h3>
            <ol>
              <li>Đảm bảo thiết bị ESP32 đã được cấu hình với WiFi</li>
              <li>Kiểm tra Device ID và Secret trong code ESP32</li>
              <li>Đăng ký thiết bị bằng form trên</li>
              <li>Sau khi đăng ký thành công, thiết bị có thể gửi dữ liệu</li>
              <li>Xem dữ liệu trực tiếp trên Dashboard</li>
            </ol>
          </div>

          <div className="actions">
            <button 
              onClick={() => router.push('/dashboard')}
              className="btn-secondary"
            >
              ← Quay lại Dashboard
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .device-setup {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .container {
          width: 100%;
          max-width: 600px;
        }

        .setup-card {
          background: white;
          border-radius: 16px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
          overflow: hidden;
        }

        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 2rem;
          text-align: center;
        }

        .header h1 {
          margin: 0 0 0.5rem 0;
          font-size: 2rem;
        }

        .header p {
          margin: 0;
          opacity: 0.9;
        }

        .setup-form {
          padding: 2rem;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 600;
          color: #333;
        }

        .form-group input {
          width: 100%;
          padding: 0.75rem;
          border: 2px solid #e1e5e9;
          border-radius: 8px;
          font-size: 1rem;
          transition: border-color 0.3s;
        }

        .form-group input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .form-group small {
          display: block;
          margin-top: 0.25rem;
          color: #666;
          font-size: 0.875rem;
        }

        .alert {
          padding: 1rem;
          border-radius: 8px;
          margin-bottom: 1rem;
          text-align: center;
        }

        .alert-error {
          background: #fee;
          color: #c33;
          border: 1px solid #fcc;
        }

        .alert-success {
          background: #efe;
          color: #060;
          border: 1px solid #cfc;
        }

        .btn-primary {
          width: 100%;
          background: #667eea;
          color: white;
          border: none;
          padding: 1rem;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
        }

        .btn-primary:hover:not(:disabled) {
          background: #5a67d8;
          transform: translateY(-1px);
        }

        .btn-primary:disabled {
          background: #ccc;
          cursor: not-allowed;
          transform: none;
        }

        .instructions {
          padding: 0 2rem;
          border-top: 1px solid #e1e5e9;
          background: #f8f9fa;
        }

        .instructions h3 {
          color: #333;
          margin-bottom: 1rem;
          padding-top: 1.5rem;
        }

        .instructions ol {
          color: #666;
          line-height: 1.6;
          padding-left: 1.5rem;
          margin-bottom: 1.5rem;
        }

        .instructions li {
          margin-bottom: 0.5rem;
        }

        .actions {
          padding: 1.5rem 2rem;
          text-align: center;
        }

        .btn-secondary {
          background: #f8f9fa;
          color: #495057;
          border: 1px solid #dee2e6;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.3s;
        }

        .btn-secondary:hover {
          background: #e9ecef;
          transform: translateY(-1px);
        }

        .loading-container {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          font-size: 1.2rem;
          color: #666;
        }

        @media (max-width: 768px) {
          .device-setup {
            padding: 1rem;
          }

          .header h1 {
            font-size: 1.5rem;
          }

          .setup-form {
            padding: 1.5rem;
          }

          .instructions {
            padding: 0 1.5rem;
          }

          .actions {
            padding: 1.5rem;
          }
        }
      `}</style>
    </div>
  )
}
