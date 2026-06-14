import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'

import Login from './pages/Login'
import AuthCallback from './pages/AuthCallback'
import ProfileSetup from './pages/ProfileSetup'
import Dashboard from './pages/Dashboard'
import Upload from './pages/Upload'
import NoteWorkspace from './pages/NoteWorkspace'
import Community from './pages/Community'
import Profile from './pages/Profile'

export default function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'var(--bg-base)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{
          width: 28, height: 28,
          border: '2px solid var(--text-muted)',
          borderTopColor: 'var(--accent)',
          borderRadius: '50%',
          animation: 'spin 0.7s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    )
  }

  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />

      {/* OAuth callback — always public, never protected */}
      <Route path="/auth/callback" element={<AuthCallback />} />

      {/* Profile setup */}
      <Route path="/setup" element={<ProtectedRoute><ProfileSetup /></ProtectedRoute>} />

      {/* Protected */}
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/upload"    element={<ProtectedRoute><Upload /></ProtectedRoute>} />
      <Route path="/notes/:noteId" element={<ProtectedRoute><NoteWorkspace /></ProtectedRoute>} />
      <Route path="/community" element={<ProtectedRoute><Community /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

      {/* Default */}
      <Route path="/" element={<Navigate to={user ? '/dashboard' : '/login'} replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}