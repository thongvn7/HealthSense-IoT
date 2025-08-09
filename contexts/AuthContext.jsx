// contexts/AuthContext.js
import { createContext, useContext, useEffect, useState } from 'react'
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult
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

  // Handle redirect result (fallback path for environments where popup is blocked)
  useEffect(() => {
    getRedirectResult(auth).catch((err) => {
      // Useful diagnostics on production when Google popup closes immediately
      // Common codes: auth/unauthorized-domain, auth/popup-blocked, auth/popup-closed-by-user
      if (process.env.NODE_ENV !== 'production') {
        // eslint-disable-next-line no-console
        console.warn('getRedirectResult error:', err?.code, err?.message)
      }
    })
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
    provider.setCustomParameters({ prompt: 'select_account' })
    try {
      return await signInWithPopup(auth, provider)
    } catch (err) {
      const code = err?.code || ''
      // Fallback to redirect for environments where popup is blocked/unsupported
      if (
        code === 'auth/popup-blocked' ||
        code === 'auth/popup-closed-by-user' ||
        code === 'auth/operation-not-supported-in-this-environment' ||
        code === 'auth/unauthorized-domain'
      ) {
        await signInWithRedirect(auth, provider)
        return
      }
      throw err
    }
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
