import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'

const COURSES   = ['B.Tech / B.E.','M.Tech / M.E.','BCA','MCA','B.Sc','M.Sc','BBA','MBA','B.Com','M.Com','MBBS','BDS','B.Pharm','D.Pharm','B.Arch','Other']
const SEMESTERS = ['1st','2nd','3rd','4th','5th','6th','7th','8th']
const YEARS     = ['1st Year','2nd Year','3rd Year','4th Year','5th Year']

function Sep() {
  return <div style={{ height: 1, background: 'var(--border)' }} />
}

function OptionGrid({ options, value, onChange, cols = 3, disabled }) {
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`,
      gap: 1, border: '1px solid var(--border-strong)', borderRadius: 6, overflow: 'hidden',
      opacity: disabled ? 0.5 : 1,
      pointerEvents: disabled ? 'none' : 'auto',
    }}>
      {options.map((opt, i) => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          style={{
            padding: '9px 8px', border: 'none',
            borderRight: (i + 1) % cols !== 0 ? '1px solid var(--border)' : 'none',
            borderBottom: i < options.length - cols ? '1px solid var(--border)' : 'none',
            background: value === opt ? 'var(--accent)' : 'var(--bg-surface)',
            color: value === opt ? 'var(--accent-text)' : 'var(--text-secondary)',
            fontSize: 12, fontFamily: 'DM Sans, sans-serif',
            fontWeight: value === opt ? 500 : 400,
            cursor: 'pointer', transition: 'background 0.12s',
          }}
          onMouseEnter={e => { if (value !== opt) e.currentTarget.style.background = 'var(--bg-hover)' }}
          onMouseLeave={e => { if (value !== opt) e.currentTarget.style.background = 'var(--bg-surface)' }}
        >{opt}</button>
      ))}
    </div>
  )
}

export default function Profile() {
  const { user, refreshUser } = useAuth()
  const navigate = useNavigate()

  const [editing,  setEditing]  = useState(false)
  const [course,   setCourse]   = useState(user?.course   || '')
  const [year,     setYear]     = useState(user?.year     || '')
  const [semester, setSemester] = useState(user?.semester || '')
  const [loading,  setLoading]  = useState(false)
  const [saved,    setSaved]    = useState(false)
  const [error,    setError]    = useState('')

  const handleSave = async () => {
    setLoading(true)
    setError('')
    try {
      await api.put('/api/profile/setup', { course, year, semester })
      await refreshUser()
      setEditing(false)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch {
      setError('Failed to save. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setCourse(user?.course || '')
    setYear(user?.year || '')
    setSemester(user?.semester || '')
    setEditing(false)
  }

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : 'ME'

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', flexDirection: 'column' }}>

      {/* Topbar */}
      <div style={{
        height: 48, borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', padding: '0 24px', gap: 12,
        background: 'var(--bg-surface)', flexShrink: 0,
      }}>
        <button
          onClick={() => navigate('/dashboard')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: 18, padding: '4px 6px', borderRadius: 4, transition: 'color 0.15s' }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
        >←</button>
        <div style={{ width: 1, height: 18, background: 'var(--border)' }} />
        <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.05em' }}>
          PROFILE
        </span>
      </div>

      {/* Content */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', padding: '40px 24px' }}>
        <div style={{ width: '100%', maxWidth: 520 }}>

          {/* User card */}
          <div style={{
            background: 'var(--bg-surface)', border: '1px solid var(--border-strong)',
            borderRadius: 8, overflow: 'hidden', marginBottom: 20,
          }}>
            <div style={{ padding: '24px 24px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{
                width: 56, height: 56, borderRadius: '50%', flexShrink: 0,
                background: 'var(--bg-elevated)', border: '2px solid var(--border-strong)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18, fontWeight: 600, color: 'var(--text-secondary)',
                fontFamily: 'DM Sans, sans-serif', overflow: 'hidden',
              }}>
                {user?.picture
                  ? <img src={user.picture} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : initials
                }
              </div>
              <div>
                <h2 style={{ margin: '0 0 4px', fontSize: 18, fontWeight: 500, color: 'var(--text-primary)', fontFamily: 'Playfair Display, serif' }}>
                  {user?.name || 'Student'}
                </h2>
                <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)', fontFamily: 'DM Sans, sans-serif' }}>
                  {user?.email || ''}
                </p>
              </div>
            </div>

            <Sep />

            {/* Stats row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr' }}>
              {[
                { label: 'COURSE',   value: user?.course   || '—' },
                { label: 'YEAR',     value: user?.year     || '—' },
                { label: 'SEMESTER', value: user?.semester ? `${user.semester} Sem` : '—' },
              ].map((item, i) => (
                <div key={item.label} style={{
                  padding: '16px', textAlign: 'center',
                  borderRight: i < 2 ? '1px solid var(--border)' : 'none',
                }}>
                  <p style={{ margin: '0 0 4px', fontSize: 10, letterSpacing: '0.1em', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>
                    {item.label}
                  </p>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', fontFamily: 'DM Sans, sans-serif' }}>
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Edit section */}
          <div style={{
            background: 'var(--bg-surface)', border: '1px solid var(--border-strong)',
            borderRadius: 8, overflow: 'hidden',
          }}>
            <div style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 11, letterSpacing: '0.1em', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>
                ACADEMIC DETAILS
              </span>
              {!editing ? (
                <button
                  onClick={() => setEditing(true)}
                  style={{
                    padding: '5px 14px', border: '1px solid var(--border-strong)', borderRadius: 4,
                    background: 'transparent', cursor: 'pointer', color: 'var(--text-secondary)',
                    fontSize: 11, fontFamily: 'JetBrains Mono, monospace', transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.borderColor = 'var(--accent)' }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'var(--border-strong)' }}
                >EDIT</button>
              ) : (
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={handleCancel}
                    style={{ padding: '5px 12px', border: '1px solid var(--border-strong)', borderRadius: 4, background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }}
                  >CANCEL</button>
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    style={{ padding: '5px 14px', border: 'none', borderRadius: 4, background: 'var(--accent)', cursor: 'pointer', color: 'var(--accent-text)', fontSize: 11, fontFamily: 'JetBrains Mono, monospace', fontWeight: 500 }}
                  >{loading ? 'SAVING...' : 'SAVE'}</button>
                </div>
              )}
            </div>

            <Sep />

            <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 20 }}>
              {saved && (
                <div style={{ padding: '10px 14px', background: 'var(--accent-subtle)', border: '1px solid var(--border)', borderRadius: 6 }}>
                  <p style={{ margin: 0, fontSize: 12, color: 'var(--accent)', fontFamily: 'DM Sans, sans-serif' }}>✓ Profile saved successfully</p>
                </div>
              )}
              {error && (
                <p style={{ margin: 0, fontSize: 12, color: '#f87171', fontFamily: 'DM Sans, sans-serif' }}>{error}</p>
              )}

              <div>
                <p style={{ margin: '0 0 8px', fontSize: 10, letterSpacing: '0.1em', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>COURSE</p>
                <OptionGrid options={COURSES} value={course} onChange={setCourse} cols={3} disabled={!editing} />
              </div>

              <div>
                <p style={{ margin: '0 0 8px', fontSize: 10, letterSpacing: '0.1em', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>YEAR</p>
                <OptionGrid options={YEARS} value={year} onChange={setYear} cols={3} disabled={!editing} />
              </div>

              <div>
                <p style={{ margin: '0 0 8px', fontSize: 10, letterSpacing: '0.1em', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>SEMESTER</p>
                <OptionGrid options={SEMESTERS} value={semester} onChange={setSemester} cols={4} disabled={!editing} />
              </div>
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={() => { localStorage.removeItem('token'); window.location.href = '/login' }}
            style={{
              marginTop: 16, width: '100%', padding: '12px',
              background: 'transparent', border: '1px solid var(--border-strong)',
              borderRadius: 6, cursor: 'pointer', color: 'var(--text-muted)',
              fontSize: 12, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.06em',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#f87171'; e.currentTarget.style.color = '#f87171' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-strong)'; e.currentTarget.style.color = 'var(--text-muted)' }}
          >SIGN OUT</button>

        </div>
      </div>
    </div>
  )
}