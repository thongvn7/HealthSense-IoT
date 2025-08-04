// components/Auth/SignupForm.js
import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'

export default function SignupForm({ onClose, switchToLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signup, loginWithGoogle } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (password !== confirmPassword) {
      return setError('Mật khẩu xác nhận không khớp')
    }
    
    if (password.length < 6) {
      return setError('Mật khẩu phải có ít nhất 6 ký tự')
    }

    try {
      setError('')
      setLoading(true)
      await signup(email, password)
      onClose()
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        setError('Email này đã được sử dụng')
      } else if (error.code === 'auth/weak-password') {
        setError('Mật khẩu quá yếu')
      } else {
        setError('Đăng ký thất bại. Vui lòng thử lại.')
      }
    }
    setLoading(false)
  }

  const handleGoogleSignup = async () => {
    try {
      setError('')
      setLoading(true)
      await loginWithGoogle()
      onClose()
    } catch (error) {
      setError('Đăng ký với Google thất bại.')
    }
    setLoading(false)
  }

  return (
    <div className="signup-form">
      <h2>Đăng ký tài khoản</h2>
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="password">Mật khẩu:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="confirmPassword">Xác nhận mật khẩu:</label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? 'Đang đăng ký...' : 'Đăng ký'}
        </button>
      </form>

      <div className="divider">hoặc</div>
      
      <button 
        onClick={handleGoogleSignup} 
        disabled={loading}
        className="btn-google"
      >
        🔍 Đăng ký với Google
      </button>

      <p className="switch-form">
        Đã có tài khoản? 
        <button onClick={switchToLogin} className="link-button">
          Đăng nhập ngay
        </button>
      </p>

      <style jsx>{`
        .signup-form {
          background: white;
          padding: 2rem;
          border-radius: 12px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
          width: 100%;
          max-width: 400px;
        }
        
        .signup-form h2 {
          text-align: center;
          margin-bottom: 1.5rem;
          color: #333;
        }
        
        .error-message {
          background: #fee;
          color: #c33;
          padding: 0.75rem;
          border-radius: 6px;
          margin-bottom: 1rem;
          text-align: center;
        }
        
        .form-group {
          margin-bottom: 1rem;
        }
        
        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
          color: #555;
        }
        
        .form-group input {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 1rem;
          transition: border-color 0.3s;
        }
        
        .form-group input:focus {
          outline: none;
          border-color: #0070f3;
          box-shadow: 0 0 0 3px rgba(0,112,243,0.1);
        }
        
        .btn-primary, .btn-google {
          width: 100%;
          padding: 0.75rem;
          border: none;
          border-radius: 6px;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s;
          margin-bottom: 1rem;
        }
        
        .btn-primary {
          background: #0070f3;
          color: white;
        }
        
        .btn-primary:hover:not(:disabled) {
          background: #0051cc;
        }
        
        .btn-primary:disabled {
          background: #ccc;
          cursor: not-allowed;
        }
        
        .btn-google {
          background: #f5f5f5;
          color: #333;
          border: 1px solid #ddd;
        }
        
        .btn-google:hover:not(:disabled) {
          background: #e5e5e5;
        }
        
        .divider {
          text-align: center;
          margin: 1rem 0;
          color: #666;
          position: relative;
        }
        
        .divider::before,
        .divider::after {
          content: '';
          position: absolute;
          top: 50%;
          width: 45%;
          height: 1px;
          background: #ddd;
        }
        
        .divider::before {
          left: 0;
        }
        
        .divider::after {
          right: 0;
        }
        
        .switch-form {
          text-align: center;
          margin-top: 1rem;
          color: #666;
        }
        
        .link-button {
          background: none;
          border: none;
          color: #0070f3;
          cursor: pointer;
          text-decoration: underline;
          margin-left: 0.5rem;
        }
        
        .link-button:hover {
          color: #0051cc;
        }
      `}</style>
    </div>
  )
}
