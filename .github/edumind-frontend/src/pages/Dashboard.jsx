import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme, THEMES } from '../context/ThemeContext'
import api from '../api/axios'

/* ─── Theme Switcher ─────────────────────────────────────── */
function ThemeSwitcher() {
  const { themeId, setTheme } = useTheme()
  const [open, setOpen] = useState(false)
  const btnRef = useRef(null)
  const [coords, setCoords] = useState({ top: 0, left: 0 })

  useEffect(() => {
    const handler = (e) => {
      if (!e.target.closest('[data-theme-switcher]')) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleOpen = () => {
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect()
      setCoords({ top: rect.bottom + 6, left: rect.left - 100 })
    }
    setOpen(o => !o)
  }

  const dots = { paper: '#1a1a1a', slate: '#e2e8f0', noir: '#f0f0f0', sage: '#4ade80' }
  const bgs  = { paper: '#f5f0e8', slate: '#141b2d', noir: '#0a0a0a', sage: '#081510' }

  return (
    <div data-theme-switcher="true" style={{ position: 'relative' }}>
      <button
        ref={btnRef}
        onClick={handleOpen}
        title="Switch theme"
        style={{
          width: 28, height: 28, borderRadius: 6,
          border: '1px solid var(--border-strong)',
          background: bgs[themeId],
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', transition: 'opacity 0.15s',
        }}
        onMouseEnter={e => e.currentTarget.style.opacity = '0.75'}
        onMouseLeave={e => e.currentTarget.style.opacity = '1'}
      >
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: dots[themeId] }} />
      </button>

      {open && (
        <div
          data-theme-switcher="true"
          style={{
            position: 'fixed',
            top: coords.top,
            left: coords.left,
            zIndex: 9999,
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-strong)',
            borderRadius: 8, overflow: 'hidden', minWidth: 170,
            boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
          }}
        >
          {Object.values(THEMES).map(t => (
            <button
              key={t.id}
              onClick={() => { setTheme(t.id); setOpen(false) }}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 12px', cursor: 'pointer', border: 'none',
                background: themeId === t.id ? 'var(--accent-subtle)' : 'transparent',
                transition: 'background 0.1s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
              onMouseLeave={e => e.currentTarget.style.background = themeId === t.id ? 'var(--accent-subtle)' : 'transparent'}
            >
              <div style={{
                width: 14, height: 14, borderRadius: '50%', flexShrink: 0,
                background: bgs[t.id], border: `2px solid ${dots[t.id]}`,
              }} />
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', fontFamily: 'DM Sans, sans-serif' }}>{t.label}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'DM Sans, sans-serif' }}>{t.description}</div>
              </div>
              {themeId === t.id && (
                <div style={{ marginLeft: 'auto', width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', flexShrink: 0 }} />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/* ─── Sidebar Nav Item ───────────────────────────────────── */
function NavItem({ icon, label, onClick, active }) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: 10,
        padding: '8px 12px', border: 'none', borderRadius: 6, cursor: 'pointer',
        background: active ? 'var(--accent-subtle)' : hovered ? 'var(--bg-hover)' : 'transparent',
        transition: 'background 0.15s',
        borderLeft: active ? '2px solid var(--accent)' : '2px solid transparent',
      }}
    >
      <span style={{ fontSize: 16, color: active ? 'var(--accent)' : 'var(--text-secondary)', lineHeight: 1 }}>{icon}</span>
      <span style={{ fontSize: 13, color: active ? 'var(--text-primary)' : 'var(--text-secondary)', fontFamily: 'DM Sans, sans-serif', fontWeight: active ? 500 : 400 }}>
        {label}
      </span>
    </button>
  )
}

/* ─── Conversation Item ──────────────────────────────────── */
function ConversationItem({ conv, active, onClick, onDelete }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '7px 12px', borderRadius: 6, cursor: 'pointer',
        background: active ? 'var(--accent-subtle)' : hovered ? 'var(--bg-hover)' : 'transparent',
        borderLeft: active ? '2px solid var(--accent)' : '2px solid transparent',
        transition: 'background 0.15s',
      }}
      onClick={onClick}
    >
      <span style={{ fontSize: 11, flexShrink: 0, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>—</span>
      <span style={{
        fontSize: 12, color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
        fontFamily: 'DM Sans, sans-serif', overflow: 'hidden', whiteSpace: 'nowrap',
        textOverflow: 'ellipsis', flex: 1, fontWeight: active ? 500 : 400,
      }}>
        {conv.title || 'Untitled chat'}
      </span>
      {hovered && (
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(conv.id) }}
          style={{
            flexShrink: 0, background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-muted)', fontSize: 14, lineHeight: 1, padding: 2, borderRadius: 3,
          }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
        >×</button>
      )}
    </div>
  )
}

function Sep() {
  return <div style={{ height: 1, background: 'var(--separator)', margin: '6px 0' }} />
}

function WelcomeScreen({ user, onNewChat, onUpload }) {
  const cards = [
    { num: '01', title: 'UPLOAD NOTES',   sub: 'PDF or image, any subject',    action: onUpload,  icon: '↑' },
    { num: '02', title: 'AI SUMMARY',     sub: 'Instant condensed notes',      action: onNewChat, icon: '≡' },
    { num: '03', title: 'FLASHCARDS',     sub: 'Auto-generated study cards',   action: onNewChat, icon: '⊞' },
    { num: '04', title: 'CHAT WITH NOTES',sub: 'Ask questions, get answers',   action: onNewChat, icon: '◎' },
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
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
  const [activePage] = useState('home')
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

  const handleUpload    = () => navigate('/upload')
  const handleCommunity = () => navigate('/community')

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
        transition: 'width 0.2s ease, min-width 0.2s ease',
        flexShrink: 0,
      }}>
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', minWidth: 240 }}>

          {/* Logo row */}
          <div style={{ padding: '16px 14px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 24, height: 24, background: 'var(--accent)', borderRadius: 5,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <span style={{ fontSize: 12, color: 'var(--accent-text)', fontWeight: 700, fontFamily: 'DM Sans, sans-serif' }}>E</span>
            </div>
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'Playfair Display, serif' }}>
              EduMind
            </span>
          </div>

          <Sep />

          <div style={{ padding: '4px 8px' }}>
            <NavItem icon="+" label="New chat"      onClick={handleUpload}    active={activePage === 'newchat'} />
            <NavItem icon="↑" label="Upload notes"  onClick={handleUpload}    active={activePage === 'upload'} />
          </div>

          <Sep />

          <div style={{ padding: '4px 8px' }}>
            <NavItem icon="◎" label="Community" onClick={handleCommunity} active={activePage === 'community'} />
          </div>

          <Sep />

          <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '8px 14px 4px' }}>
              <span style={{ fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>
                Recent
              </span>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '0 8px' }}>
              {conversations.length === 0 ? (
                <p style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'DM Sans, sans-serif', padding: '8px 12px', fontStyle: 'italic' }}>
                  No chats yet
                </p>
              ) : (
                conversations.slice(0, 20).map(conv => (
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
          </div>

          <Sep />

          {/* User row */}
          <div style={{ padding: '8px 12px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
              background: 'var(--bg-elevated)', border: '1px solid var(--border-strong)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', fontFamily: 'DM Sans, sans-serif',
              overflow: 'hidden',
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
            <button
              onClick={logout}
              title="Logout"
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--text-muted)', fontSize: 16, lineHeight: 1,
                padding: 4, borderRadius: 4, flexShrink: 0, transition: 'color 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
            >⎋</button>
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <main style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>

        {/* Topbar — ThemeSwitcher lives here now */}
        <div style={{
          height: 48, borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', padding: '0 20px', gap: 12, flexShrink: 0,
          background: 'var(--bg-surface)',
        }}>
          <button
            onClick={() => setSidebarOpen(o => !o)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text-secondary)', fontSize: 16, lineHeight: 1,
              padding: '4px 6px', borderRadius: 4, transition: 'color 0.15s, background 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.background = 'var(--bg-hover)' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.background = 'transparent' }}
          >☰</button>

          <div style={{ width: 1, height: 18, background: 'var(--border)' }} />

          <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.05em' }}>
            DASHBOARD
          </span>

          <div style={{ flex: 1 }} />

          {/* Theme switcher in topbar — no overflow issues here */}
          <ThemeSwitcher />

          <div style={{ width: 1, height: 18, background: 'var(--border)' }} />

          <button
            onClick={handleUpload}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '6px 14px', borderRadius: 6, cursor: 'pointer',
              background: 'var(--accent)', border: 'none',
              fontSize: 12, fontWeight: 500, fontFamily: 'DM Sans, sans-serif',
              color: 'var(--accent-text)', letterSpacing: '0.04em', transition: 'opacity 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >+ UPLOAD</button>
        </div>

        <div style={{ flex: 1 }}>
          <WelcomeScreen user={user} onNewChat={handleUpload} onUpload={handleUpload} />
        </div>
      </main>
    </div>
  )
}