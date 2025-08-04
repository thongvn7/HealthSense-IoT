// contexts/AuthContext.js
import { createContext, useContext, useEffect, useState } from 'react'
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth'
import { auth } from '../lib/firebase'

const AuthContext = createContext({})

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      setLoading(false)
    })

    return unsubscribe
  }, [])

  // Đăng nhập bằng email/password
  const login = async (email, password) => {
    return signInWithEmailAndPassword(auth, email, password)
  }

  // Đăng ký tài khoản mới
  const signup = async (email, password) => {
    return createUserWithEmailAndPassword(auth, email, password)
  }

  // Đăng nhập bằng Google
  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider()
    return signInWithPopup(auth, provider)
  }

  // Đăng xuất
  const logout = async () => {
    return signOut(auth)
  }

  const value = {
    user,
    login,
    signup,
    loginWithGoogle,
    logout,
    loading
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}
