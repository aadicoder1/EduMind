import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme, THEMES } from '../context/ThemeContext'
import api from '../api/axios'

/* ─── Bulb SVG with swing animation ─────────────────────── */
function BulbIcon({ isOn, hovered }) {
  return (
    <svg
      width="22" height="32" viewBox="0 0 22 32" fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        transformOrigin: 'top center',
        animation: hovered ? 'swing 0.5s ease-in-out infinite alternate' : 'none',
        transition: 'filter 0.3s',
        filter: isOn ? 'drop-shadow(0 0 6px rgba(255,220,80,0.8))' : 'none',
      }}
    >
      {/* Bulb glass — now at top */}
      <path
        d="M4 9C4 5.134 7.134 2 11 2C14.866 2 18 5.134 18 9C18 12 16 14 14.5 15.5V17H7.5V15.5C6 14 4 12 4 9Z"
        fill={isOn ? '#FFD84D' : 'var(--bg-elevated)'}
        stroke="var(--border-strong)"
        strokeWidth="1.2"
        style={{ transition: 'fill 0.3s' }}
      />
      {/* Glow */}
      {isOn && (
        <path
          d="M4 9C4 5.134 7.134 2 11 2C14.866 2 18 5.134 18 9C18 12 16 14 14.5 15.5V17H7.5V15.5C6 14 4 12 4 9Z"
          fill="rgba(255,220,80,0.3)"
          style={{ filter: 'blur(4px)' }}
        />
      )}
      {/* Filament */}
      {isOn && (
        <path
          d="M9 11 Q11 9.5 13 11"
          stroke="#FF9500"
          strokeWidth="1"
          fill="none"
          strokeLinecap="round"
        />
      )}
      {/* Base ridges */}
      <rect x="7.5" y="17" width="7" height="1.5" rx="0.5" fill="var(--text-muted)" opacity="0.6"/>
      <rect x="7.5" y="19" width="7" height="1.5" rx="0.5" fill="var(--text-muted)" opacity="0.4"/>
      {/* Tip / pull cord attachment */}
      <rect x="9" y="20.5" width="4" height="1.5" rx="0.75" fill="var(--text-muted)" opacity="0.3"/>
      {/* Pull cord — hangs from bottom */}
      <line x1="11" y1="22" x2="11" y2="31" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round"
        strokeDasharray={hovered ? "2 2" : "none"}
      />
      {/* Cord knot */}
      <circle cx="11" cy="31" r="1" fill="var(--text-muted)" opacity="0.5"/>
    </svg>
  )
}
 

/* ─── Theme circle — two halves ──────────────────────────── */
function ThemeCircle({ theme, size = 28, active }) {
  const configs = {
    paper: { bg: '#f5f0e8', accent: '#1a1a1a' },
    slate: { bg: '#141b2d', accent: '#e2e8f0' },
    noir:  { bg: '#0a0a0a', accent: '#f0f0f0' },
    sage:  { bg: '#081510', accent: '#4ade80' },
  }
  const c = configs[theme.id]
  const r = size / 2

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Left half — bg */}
      <path d={`M${r},0 A${r},${r} 0 0,0 ${r},${size} Z`} fill={c.bg} />
      {/* Right half — accent */}
      <path d={`M${r},0 A${r},${r} 0 0,1 ${r},${size} Z`} fill={c.accent} />
      {/* Border */}
      <circle cx={r} cy={r} r={r - 1} fill="none" stroke={active ? c.accent : 'rgba(128,128,128,0.3)'} strokeWidth={active ? 2 : 1} />
    </svg>
  )
}

/* ─── Theme Switcher ─────────────────────────────────────── */
function ThemeSwitcher() {
  const { themeId, setTheme } = useTheme()
  const [open, setOpen] = useState(false)
  const [hovered, setHovered] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
      <button
        onClick={() => setOpen(o => !o)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          padding: '4px 8px', borderRadius: 8,
          display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
          transition: 'background 0.15s',
          background: hovered ? 'var(--bg-hover)' : 'transparent',
        }}
        title="Switch theme"
      >
        <BulbIcon isOn={open} hovered={hovered} />
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: '110%', right: 0, zIndex: 9999,
          background: 'var(--bg-elevated)', border: '1px solid var(--border-strong)',
          borderRadius: 10, padding: '12px 14px',
          display: 'flex', gap: 12, alignItems: 'center',
          boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
          minWidth: 160,
        }}>
          {/* Small arrow */}
          <div style={{
            position: 'absolute', top: -6, right: 14,
            width: 12, height: 12, background: 'var(--bg-elevated)',
            border: '1px solid var(--border-strong)', borderBottom: 'none', borderRight: 'none',
            transform: 'rotate(45deg)',
          }} />
          {Object.values(THEMES).map(t => (
            <button
              key={t.id}
              onClick={() => { setTheme(t.id); setOpen(false) }}
              title={t.label}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                padding: 4, borderRadius: '50%', display: 'flex',
                transform: themeId === t.id ? 'scale(1.15)' : 'scale(1)',
                transition: 'transform 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.2)'}
              onMouseLeave={e => e.currentTarget.style.transform = themeId === t.id ? 'scale(1.15)' : 'scale(1)'}
            >
              <ThemeCircle theme={t} size={30} active={themeId === t.id} />
            </button>
          ))}
        </div>
      )}

      <style>{`
        @keyframes swing {
          0%   { transform: rotate(-8deg); }
          100% { transform: rotate(8deg); }
        }
      `}</style>
    </div>
  )
}

/* ─── Conversation Item ──────────────────────────────────── */
function ConversationItem({ conv, active, onClick, onDelete }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '7px 12px', borderRadius: 6, cursor: 'pointer',
        background: active ? 'var(--accent-subtle)' : hovered ? 'var(--bg-hover)' : 'transparent',
        borderLeft: active ? '2px solid var(--accent)' : '2px solid transparent',
        transition: 'background 0.15s',
      }}
    >
      <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', flexShrink: 0 }}>—</span>
      <span style={{
        fontSize: 12, color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
        fontFamily: 'DM Sans, sans-serif', overflow: 'hidden',
        whiteSpace: 'nowrap', textOverflow: 'ellipsis', flex: 1,
        fontWeight: active ? 500 : 400,
      }}>
        {conv.title || 'Untitled chat'}
      </span>
      {hovered && (
        <button
          onClick={e => { e.stopPropagation(); onDelete(conv.id) }}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-muted)', fontSize: 14, lineHeight: 1,
            padding: 2, borderRadius: 3, flexShrink: 0,
          }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
        >×</button>
      )}
    </div>
  )
}

function Sep() {
  return <div style={{ height: 1, background: 'var(--separator)', margin: '4px 0' }} />
}

/* ─── Welcome Screen ─────────────────────────────────────── */
function WelcomeScreen({ user, onUpload }) {
  const navigate = useNavigate()
  const cards = [
    { num: '01', title: 'UPLOAD NOTES',    sub: 'PDF or image, any subject',   action: onUpload,                          icon: '↑' },
    { num: '02', title: 'AI SUMMARY',      sub: 'Instant condensed notes',     action: onUpload,                          icon: '≡' },
    { num: '03', title: 'FLASHCARDS',      sub: 'Auto-generated study cards',  action: onUpload,                          icon: '⊞' },
    { num: '04', title: 'COMMUNITY NOTES', sub: 'Browse notes from students',  action: () => navigate('/community'),      icon: '◎' },
  ]

  return (
    <div style={{ padding: '48px 40px', maxWidth: 760, margin: '0 auto' }}>
      <div style={{ marginBottom: 48 }}>
        <p style={{ fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', marginBottom: 12 }}>
          WELCOME BACK
        </p>
        <h1 style={{ fontSize: 36, fontWeight: 400, color: 'var(--text-primary)', fontFamily: 'Playfair Display, serif', lineHeight: 1.2, margin: 0 }}>
          {user?.name?.split(' ')[0] || 'Student'}.
        </h1>
        <p style={{ fontSize: 15, color: 'var(--text-secondary)', fontFamily: 'DM Sans, sans-serif', marginTop: 10, fontWeight: 300 }}>
          What are we studying today?
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, border: '1px solid var(--border-strong)', borderRadius: 8, overflow: 'hidden', marginBottom: 32 }}>
        {cards.map((card, i) => (
          <button
            key={card.num}
            onClick={card.action}
            style={{
              display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
              padding: '24px 28px', cursor: 'pointer', border: 'none',
              borderRight: i % 2 === 0 ? '1px solid var(--border)' : 'none',
              borderBottom: i < 2 ? '1px solid var(--border)' : 'none',
              background: 'var(--bg-surface)', minHeight: 140,
              transition: 'background 0.15s', textAlign: 'left',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-surface)'}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.08em' }}>{card.num}</span>
              <span style={{ fontSize: 18, color: 'var(--text-muted)' }}>{card.icon}</span>
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500, letterSpacing: '0.08em', color: 'var(--text-primary)', fontFamily: 'DM Sans, sans-serif', marginBottom: 4 }}>
                {card.title}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'DM Sans, sans-serif', fontWeight: 300 }}>
                {card.sub}
              </div>
            </div>
          </button>
        ))}
      </div>

      <div
        onClick={onUpload}
        style={{
          background: 'var(--accent)', borderRadius: 8, padding: '18px 28px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer',
        }}
      >
        <span style={{ fontSize: 15, fontFamily: 'DM Sans, sans-serif', color: 'var(--accent-text)', fontWeight: 500 }}>
          Start by uploading your first note
        </span>
        <span style={{ fontSize: 20, color: 'var(--accent-text)', opacity: 0.7 }}>→</span>
      </div>
    </div>
  )
}

/* ─── Dashboard ─────────────────────────────────────────── */
export default function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [conversations, setConversations] = useState([])
  const [activeConvId, setActiveConvId] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  useEffect(() => { fetchConversations() }, [])

  const fetchConversations = async () => {
    try {
      const res = await api.get('/api/conversations')
      setConversations(res.data || [])
    } catch {}
  }

  const deleteConversation = async (id) => {
    try {
      await api.delete(`/api/conversations/${id}`)
      setConversations(prev => prev.filter(c => c.id !== id))
      if (activeConvId === id) setActiveConvId(null)
    } catch {}
  }

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : 'ME'

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--bg-base)', overflow: 'hidden' }}>

      {/* ── Sidebar ── */}
      <aside style={{
        width: sidebarOpen ? 240 : 0,
        minWidth: sidebarOpen ? 240 : 0,
        overflow: 'hidden',
        background: 'var(--bg-surface)',
        borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column',
        transition: 'width 0.25s ease, min-width 0.25s ease',
        flexShrink: 0,
      }}>
        <div style={{ width: 240, flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

          {/* Sidebar top — hamburger + label */}
          <div style={{ padding: '12px 10px 8px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={() => setSidebarOpen(false)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--text-muted)', fontSize: 16, padding: '4px 6px',
                borderRadius: 4, lineHeight: 1, transition: 'color 0.15s, background 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.background = 'var(--bg-hover)' }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent' }}
            >☰</button>
            <span style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>
              Recent chats
            </span>
          </div>

          <Sep />

          {/* New chat button */}
          <div style={{ padding: '6px 10px' }}>
            <button
              onClick={() => navigate('/upload')}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 8,
                padding: '8px 12px', border: '1px dashed var(--border-strong)',
                borderRadius: 6, cursor: 'pointer', background: 'transparent',
                transition: 'background 0.15s, border-color 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.borderColor = 'var(--accent)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'var(--border-strong)' }}
            >
              <span style={{ fontSize: 16, color: 'var(--text-muted)', lineHeight: 1 }}>+</span>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontFamily: 'DM Sans, sans-serif' }}>New chat</span>
            </button>
          </div>

          {/* Conversations list */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '4px 8px' }}>
            {conversations.length === 0 ? (
              <p style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'DM Sans, sans-serif', padding: '8px 12px', fontStyle: 'italic' }}>
                No chats yet
              </p>
            ) : (
              conversations.slice(0, 30).map(conv => (
                <ConversationItem
                  key={conv.id}
                  conv={conv}
                  active={activeConvId === conv.id}
                  onClick={() => { setActiveConvId(conv.id); navigate(`/notes/${conv.noteId || conv.id}`) }}
                  onDelete={deleteConversation}
                />
              ))
            )}
          </div>

          <Sep />

          {/* User row — click to profile */}
          <div
            onClick={() => navigate('/profile')}
            style={{
              padding: '10px 12px 14px', display: 'flex', alignItems: 'center', gap: 10,
              cursor: 'pointer', transition: 'background 0.15s', borderRadius: 6, margin: '0 4px 4px',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <div style={{
              width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
              background: 'var(--bg-elevated)', border: '1px solid var(--border-strong)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)',
              fontFamily: 'DM Sans, sans-serif', overflow: 'hidden',
            }}>
              {user?.picture
                ? <img src={user.picture} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : initials
              }
            </div>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-primary)', fontFamily: 'DM Sans, sans-serif', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                {user?.name || 'Student'}
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'DM Sans, sans-serif', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                {user?.email || ''}
              </div>
            </div>
            <span style={{ fontSize: 12, color: 'var(--text-muted)', flexShrink: 0 }}>›</span>
          </div>

        </div>
      </aside>

      {/* ── Main ── */}
      <main style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>

        {/* Topbar */}
        <div style={{
          height: 52, borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', padding: '0 20px',
          background: 'var(--bg-surface)', flexShrink: 0,
          justifyContent: 'space-between',
        }}>
          {/* Left — hamburger (when collapsed) + Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {!sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--text-secondary)', fontSize: 16, padding: '4px 6px',
                  borderRadius: 4, lineHeight: 1, transition: 'color 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
              >☰</button>
            )}
            {/* Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 26, height: 26, background: 'var(--accent)', borderRadius: 6,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ fontSize: 13, color: 'var(--accent-text)', fontWeight: 700, fontFamily: 'DM Sans, sans-serif' }}>E</span>
              </div>
              <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'Playfair Display, serif', letterSpacing: '-0.01em' }}>
                EduMind
              </span>
            </div>
          </div>

          {/* Right — bulb theme switcher */}
          <ThemeSwitcher />
        </div>

        <div style={{ flex: 1 }}>
          <WelcomeScreen user={user} onUpload={() => navigate('/upload')} />
        </div>
      </main>
    </div>
  )
}