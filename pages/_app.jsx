// pages/_app.js
import { AuthProvider } from '../contexts/AuthContext'
import { AdminProvider } from '../contexts/AdminContext'
import '../styles/animations.css'

export default function App({ Component, pageProps }) {
  return (
    <AuthProvider>
      <AdminProvider>
        <Component {...pageProps} />
      </AdminProvider>
    </AuthProvider>
  )
}
