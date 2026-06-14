import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'

const COURSES = [
  'B.Tech / B.E.', 'M.Tech / M.E.',
  'BCA', 'MCA',
  'B.Sc', 'M.Sc',
  'BBA', 'MBA',
  'B.Com', 'M.Com',
  'MBBS', 'BDS',
  'B.Pharm', 'D.Pharm',
  'B.Arch', 'Other',
]

const SEMESTERS = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th']
const YEARS     = ['1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year']

function Sep() {
  return <div style={{ height: 1, background: 'var(--border)' }} />
}

function Label({ children }) {
  return (
    <p style={{
      fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase',
      color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace',
      marginBottom: 10, marginTop: 0,
    }}>
      {children}
    </p>
  )
}

function OptionGrid({ options, value, onChange, cols = 3 }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${cols}, 1fr)`,
      gap: 1,
      border: '1px solid var(--border-strong)',
      borderRadius: 6,
      overflow: 'hidden',
    }}>
      {options.map((opt, i) => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          style={{
            padding: '10px 8px',
            border: 'none',
            borderRight: (i + 1) % cols !== 0 ? '1px solid var(--border)' : 'none',
            borderBottom: i < options.length - cols ? '1px solid var(--border)' : 'none',
            background: value === opt ? 'var(--accent)' : 'var(--bg-surface)',
            color: value === opt ? 'var(--accent-text)' : 'var(--text-secondary)',
            fontSize: 12, fontFamily: 'DM Sans, sans-serif',
            fontWeight: value === opt ? 500 : 400,
            cursor: 'pointer', transition: 'background 0.12s, color 0.12s',
            textAlign: 'center',
          }}
          onMouseEnter={e => { if (value !== opt) e.currentTarget.style.background = 'var(--bg-hover)' }}
          onMouseLeave={e => { if (value !== opt) e.currentTarget.style.background = 'var(--bg-surface)' }}
        >
          {opt}
        </button>
      ))}
    </div>
  )
}

export default function ProfileSetup() {
  const { user, refreshUser } = useAuth()
  const navigate = useNavigate()

  const [course,   setCourse]   = useState('')
  const [year,     setYear]     = useState('')
  const [semester, setSemester] = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')

  const step = !course ? 1 : !year ? 2 : !semester ? 3 : 4
  const canSubmit = course && year && semester

  const handleSubmit = async () => {
    if (!canSubmit) return
    setLoading(true)
    setError('')
    try {
      await api.put('/api/profile/setup', { course, year, semester })
      await refreshUser()
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg-base)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24,
    }}>
      <div style={{ width: '100%', maxWidth: 480 }}>

        {/* Header */}
        <div style={{ marginBottom: 36 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
            <div style={{
              width: 28, height: 28, background: 'var(--accent)', borderRadius: 6,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ fontSize: 14, color: 'var(--accent-text)', fontWeight: 700, fontFamily: 'DM Sans, sans-serif' }}>E</span>
            </div>
            <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'Playfair Display, serif' }}>EduMind</span>
          </div>

          <p style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', marginBottom: 8 }}>
            ONE TIME SETUP
          </p>
          <h1 style={{ fontSize: 28, fontWeight: 400, fontFamily: 'Playfair Display, serif', color: 'var(--text-primary)', margin: '0 0 8px' }}>
            Tell us about yourself
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', fontFamily: 'DM Sans, sans-serif', fontWeight: 300, margin: 0 }}>
            Hi {user?.name?.split(' ')[0] || 'there'} — this helps us personalise your experience.
          </p>
        </div>

        {/* Progress bar */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            {['Course', 'Year', 'Semester'].map((s, i) => (
              <span key={s} style={{
                fontSize: 10, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.08em',
                color: step > i + 1 ? 'var(--accent)' : step === i + 1 ? 'var(--text-primary)' : 'var(--text-muted)',
              }}>
                0{i + 1} {s.toUpperCase()}
              </span>
            ))}
          </div>
          <div style={{ height: 2, background: 'var(--border)', borderRadius: 1, overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: 1, background: 'var(--accent)',
              width: course && year && semester ? '100%' : course && year ? '66%' : course ? '33%' : '0%',
              transition: 'width 0.3s ease',
            }} />
          </div>
        </div>

        {/* Card */}
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-strong)',
          borderRadius: 8, overflow: 'hidden',
        }}>

          {/* 01 Course */}
          <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>01</span>
              <Label>Select your course</Label>
            </div>
            <OptionGrid options={COURSES} value={course} onChange={setCourse} cols={3} />
          </div>

          <Sep />

          {/* 02 Year */}
          <div style={{
            padding: '20px',
            opacity: !course ? 0.4 : 1, transition: 'opacity 0.2s',
            pointerEvents: !course ? 'none' : 'auto',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>02</span>
              <Label>Current year</Label>
            </div>
            <OptionGrid options={YEARS} value={year} onChange={setYear} cols={3} />
          </div>

          <Sep />

          {/* 03 Semester */}
          <div style={{
            padding: '20px',
            opacity: !year ? 0.4 : 1, transition: 'opacity 0.2s',
            pointerEvents: !year ? 'none' : 'auto',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>03</span>
              <Label>Current semester</Label>
            </div>
            <OptionGrid options={SEMESTERS} value={semester} onChange={setSemester} cols={4} />
          </div>

          <Sep />

          {/* Submit */}
          <div style={{ padding: '16px 20px' }}>
            {error && (
              <p style={{ fontSize: 12, color: '#f87171', fontFamily: 'DM Sans, sans-serif', marginBottom: 10 }}>{error}</p>
            )}
            <button
              onClick={handleSubmit}
              disabled={!canSubmit || loading}
              style={{
                width: '100%', padding: '12px',
                background: canSubmit ? 'var(--accent)' : 'var(--bg-elevated)',
                color: canSubmit ? 'var(--accent-text)' : 'var(--text-muted)',
                border: 'none', borderRadius: 6,
                cursor: canSubmit ? 'pointer' : 'not-allowed',
                fontSize: 13, fontWeight: 500, fontFamily: 'DM Sans, sans-serif',
                letterSpacing: '0.06em', transition: 'opacity 0.15s, background 0.2s',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}
              onMouseEnter={e => { if (canSubmit) e.currentTarget.style.opacity = '0.8' }}
              onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
            >
              {loading ? (
                <>
                  <div style={{
                    width: 14, height: 14,
                    border: '2px solid currentColor',
                    borderTopColor: 'transparent',
                    borderRadius: '50%',
                    animation: 'spin 0.7s linear infinite',
                  }} />
                  SETTING UP...
                </>
              ) : canSubmit ? 'GO TO DASHBOARD →' : 'COMPLETE ALL FIELDS TO CONTINUE'}
            </button>
          </div>
        </div>

        {/* Selection summary */}
        {(course || year || semester) && (
          <div style={{
            marginTop: 12, padding: '10px 16px',
            background: 'var(--bg-surface)', border: '1px solid var(--border)',
            borderRadius: 6, display: 'flex', gap: 16, flexWrap: 'wrap',
          }}>
            {course   && <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'DM Sans, sans-serif' }}>📚 {course}</span>}
            {year     && <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'DM Sans, sans-serif' }}>📅 {year}</span>}
            {semester && <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'DM Sans, sans-serif' }}>📖 {semester} Sem</span>}
          </div>
        )}

        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    </div>
  )
}