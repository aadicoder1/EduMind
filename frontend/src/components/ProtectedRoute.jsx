import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 28, height: 28, border: '2px solid var(--text-muted)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }
  console.log('user:', user)
console.log('profileComplete:', user?.profileComplete)
console.log('pathname:', location.pathname)


  // Only redirect to /setup if profile is incomplete AND we're not already on /setup
  if (!user.profileComplete && location.pathname !== '/setup') {
    return <Navigate to="/setup" replace />
  }

  // If profile is complete and user tries to go to /setup, redirect to dashboard
  if (user.profileComplete && location.pathname === '/setup') {
    return <Navigate to="/dashboard" replace />
  }

  return children
}