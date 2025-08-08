// lib/usePhoneAuth.js
import { useState, useEffect } from 'react'
import { 
  RecaptchaVerifier, 
  signInWithPhoneNumber,
  PhoneAuthProvider,
  signInWithCredential,
  signOut,
  onAuthStateChanged 
} from 'firebase/auth'
import { auth } from './firebase'

export const usePhoneAuth = () => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [verificationId, setVerificationId] = useState('')
  const [recaptchaVerifier, setRecaptchaVerifier] = useState(null)

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      setLoading(false)
    })

    // Initialize reCAPTCHA once
    const verifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
      'size': 'invisible',
      'callback': (response) => {
        console.log('reCAPTCHA solved automatically')
      },
      'expired-callback': () => {
        console.log('reCAPTCHA expired')
      }
    })
    setRecaptchaVerifier(verifier)

    return () => {
      unsubscribe()
      // Clean up reCAPTCHA on unmount
      if (verifier) {
        verifier.clear()
      }
    }
  }, [])

  const sendVerificationCode = async (phoneNumber) => {
    try {
      setLoading(true)
      
      if (!recaptchaVerifier) {
        throw new Error('reCAPTCHA verifier not initialized')
      }
      
      const confirmationResult = await signInWithPhoneNumber(
        auth, 
        phoneNumber,
        recaptchaVerifier
      )
      
      setVerificationId(confirmationResult.verificationId)
      setLoading(false)
      return { success: true, message: 'Verification code sent!' }
      
    } catch (error) {
      setLoading(false)
      console.error('Error sending code:', error)
      
      return { 
        success: false, 
        message: error.message || 'Failed to send verification code' 
      }
    }
  }

  const verifyCode = async (code) => {
    try {
      setLoading(true)
      
      // Create credential
      const credential = PhoneAuthProvider.credential(verificationId, code)
      
      // Sign in with credential
      const result = await signInWithCredential(auth, credential)
      
      setLoading(false)
      return { success: true, user: result.user }
      
    } catch (error) {
      setLoading(false)
      console.error('Error verifying code:', error)
      return { 
        success: false, 
        message: error.message || 'Invalid verification code' 
      }
    }
  }

  const logout = async () => {
    try {
      await signOut(auth)
      setUser(null)
      return { success: true }
    } catch (error) {
      console.error('Error logging out:', error)
      return { success: false, message: error.message }
    }
  }

  return {
    user,
    loading,
    verificationId,
    sendVerificationCode,
    verifyCode,
    logout
  }
}