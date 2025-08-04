// components/Auth/AuthModal.js
import { useState, useEffect } from 'react'
import LoginForm from './LoginForm'
import SignupForm from './SignupForm'

export default function AuthModal({ isOpen, onClose }) {
  const [isLogin, setIsLogin] = useState(true)

  // Đóng modal khi nhấn Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose()
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      // Ngăn cuộn trang khi modal mở
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>
          ×
        </button>
        
        {isLogin ? (
          <LoginForm 
            onClose={onClose} 
            switchToSignup={() => setIsLogin(false)} 
          />
        ) : (
          <SignupForm 
            onClose={onClose} 
            switchToLogin={() => setIsLogin(true)} 
          />
        )}
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
        }
        
        .modal-content {
          position: relative;
          width: 100%;
          max-width: 450px;
          animation: slideUp 0.3s ease-out;
        }
        
        .close-button {
          position: absolute;
          top: -10px;
          right: -10px;
          width: 32px;
          height: 32px;
          border: none;
          border-radius: 50%;
          background: #fff;
          color: #666;
          font-size: 20px;
          font-weight: bold;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          z-index: 1001;
          transition: all 0.2s;
        }
        
        .close-button:hover {
          background: #f5f5f5;
          color: #333;
          transform: scale(1.1);
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @media (max-width: 480px) {
          .modal-overlay {
            padding: 0.5rem;
          }
          
          .modal-content {
            max-width: 100%;
          }
        }
      `}</style>
    </div>
  )
}
