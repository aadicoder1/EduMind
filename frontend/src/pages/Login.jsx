import { useEffect, useState, useRef } from 'react'
import { useTheme, THEMES } from '../context/ThemeContext'

const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

/* ─── Reuse exact same BulbIcon + ThemeCircle + ThemeSwitcher from Dashboard ── */
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
      <path d={`M${r},0 A${r},${r} 0 0,0 ${r},${size} Z`} fill={c.bg} />
      <path d={`M${r},0 A${r},${r} 0 0,1 ${r},${size} Z`} fill={c.accent} />
      <circle cx={r} cy={r} r={r-1} fill="none" stroke={active ? c.accent : 'rgba(128,128,128,0.3)'} strokeWidth={active ? 2 : 1}/>
    </svg>
  )
}

function ThemeSwitcher() {
  const { themeId, setTheme } = useTheme()
  const [open, setOpen] = useState(false)
  const [hovered, setHovered] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
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
          background: hovered ? 'var(--bg-hover)' : 'transparent',
          border: 'none', cursor: 'pointer', padding: '4px 8px',
          borderRadius: 8, display: 'flex', alignItems: 'flex-end',
          transition: 'background 0.15s',
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
        }}>
          <div style={{
            position: 'absolute', top: -6, right: 14, width: 12, height: 12,
            background: 'var(--bg-elevated)', border: '1px solid var(--border-strong)',
            borderBottom: 'none', borderRight: 'none', transform: 'rotate(45deg)',
          }} />
          {Object.values(THEMES).map(t => (
            <button
              key={t.id}
              onClick={() => { setTheme(t.id); setOpen(false) }}
              title={t.label}
              style={{
                background: 'none', border: 'none', cursor: 'pointer', padding: 4,
                borderRadius: '50%', display: 'flex',
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
    </div>
  )
}

/* ─── Animated counter ───────────────────────────────────── */
function Counter({ target, suffix = '' }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        let start = 0
        const duration = 1500
        const step = target / (duration / 16)
        const timer = setInterval(() => {
          start += step
          if (start >= target) { setCount(target); clearInterval(timer) }
          else setCount(Math.floor(start))
        }, 16)
      }
    }, { threshold: 0.5 })
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [target])

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>
}

/* ─── Feature card ───────────────────────────────────────── */
function FeatureCard({ num, title, desc, icon, delay }) {
  const [hovered, setHovered] = useState(false)
  const [visible, setVisible] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true) }, { threshold: 0.2 })
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        border: '1px solid var(--border-strong)', borderRadius: 0,
        padding: '28px 24px', background: hovered ? 'var(--bg-elevated)' : 'var(--bg-surface)',
        transition: 'background 0.2s, opacity 0.6s, transform 0.6s',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(24px)',
        transitionDelay: `${delay}ms`,
        cursor: 'default',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.08em' }}>{num}</span>
        <span style={{ fontSize: 22, opacity: 0.6 }}>{icon}</span>
      </div>
      <h3 style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 500, letterSpacing: '0.08em', color: 'var(--text-primary)', fontFamily: 'DM Sans, sans-serif', textTransform: 'uppercase' }}>
        {title}
      </h3>
      <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)', fontFamily: 'DM Sans, sans-serif', fontWeight: 300, lineHeight: 1.7 }}>
        {desc}
      </p>
    </div>
  )
}

/* ─── Step item ──────────────────────────────────────────── */
function Step({ num, title, desc }) {
  const [visible, setVisible] = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    const observer = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true) }, { threshold: 0.3 })
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      style={{
        display: 'flex', gap: 20, alignItems: 'flex-start',
        opacity: visible ? 1 : 0, transform: visible ? 'translateX(0)' : 'translateX(-20px)',
        transition: `opacity 0.5s ease ${num * 0.15}s, transform 0.5s ease ${num * 0.15}s`,
      }}
    >
      <div style={{
        width: 32, height: 32, borderRadius: 6, flexShrink: 0,
        background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent-text)', fontFamily: 'JetBrains Mono, monospace' }}>
          0{num}
        </span>
      </div>
      <div>
        <h4 style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', fontFamily: 'DM Sans, sans-serif' }}>
          {title}
        </h4>
        <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)', fontFamily: 'DM Sans, sans-serif', fontWeight: 300, lineHeight: 1.6 }}>
          {desc}
        </p>
      </div>
    </div>
  )
}

/* ─── Login page ─────────────────────────────────────────── */
export default function Login() {
  const [heroVisible, setHeroVisible] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setHeroVisible(true), 100)
    return () => clearTimeout(t)
  }, [])

  const handleGoogleLogin = () => {
    window.location.href = `${BACKEND_URL}/oauth2/authorization/google`
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', flexDirection: 'column' }}>

      {/* ── Topbar ── */}
      <nav style={{
        height: 52, borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 32px', background: 'var(--bg-surface)',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 26, height: 26, background: 'var(--accent)', borderRadius: 6,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ fontSize: 13, color: 'var(--accent-text)', fontWeight: 700, fontFamily: 'DM Sans, sans-serif' }}>E</span>
          </div>
          <span style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'Playfair Display, serif', letterSpacing: '-0.01em' }}>
            EduMind
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.05em' }}>
            AI STUDY ASSISTANT
          </span>
          <ThemeSwitcher />
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{
        borderBottom: '1px solid var(--border)',
        padding: '80px 32px 72px',
        display: 'flex', gap: 48, alignItems: 'center', justifyContent: 'center',
        maxWidth: 1100, margin: '0 auto', width: '100%',
      }}>
        {/* Left */}
        <div style={{ flex: 1, maxWidth: 520 }}>
          <div style={{
            opacity: heroVisible ? 1 : 0, transform: heroVisible ? 'translateY(0)' : 'translateY(20px)',
            transition: 'opacity 0.6s ease, transform 0.6s ease',
          }}>
            <p style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', marginBottom: 16 }}>
              FOR INDIAN UNIVERSITY STUDENTS
            </p>
            <h1 style={{ fontSize: 52, fontWeight: 400, fontFamily: 'Playfair Display, serif', color: 'var(--text-primary)', lineHeight: 1.15, margin: '0 0 20px' }}>
              Study <span style={{ fontStyle: 'italic' }}>smarter.</span>
              <br />Not harder.
            </h1>
            <p style={{ fontSize: 16, color: 'var(--text-secondary)', fontFamily: 'DM Sans, sans-serif', fontWeight: 300, lineHeight: 1.7, marginBottom: 36, maxWidth: 440 }}>
              Upload your notes, get instant AI summaries, generate flashcards automatically, and chat with your study material — all in one place.
            </p>

            {/* Google button */}
            <button
              onClick={handleGoogleLogin}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '14px 24px', borderRadius: 8, cursor: 'pointer',
                background: 'var(--bg-elevated)', border: '1px solid var(--border-strong)',
                transition: 'border-color 0.2s, box-shadow 0.2s',
                marginBottom: 16,
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--accent)'
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.15)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--border-strong)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', fontFamily: 'DM Sans, sans-serif' }}>
                Continue with Google
              </span>
              <span style={{ marginLeft: 'auto', fontSize: 16, color: 'var(--text-muted)' }}>→</span>
            </button>

            <p style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'DM Sans, sans-serif' }}>
              Free to use · No credit card · Your data stays private
            </p>
          </div>
        </div>

        {/* Right — preview card */}
        <div style={{
          flex: 1, maxWidth: 420,
          opacity: heroVisible ? 1 : 0, transform: heroVisible ? 'translateY(0)' : 'translateY(30px)',
          transition: 'opacity 0.6s ease 0.2s, transform 0.6s ease 0.2s',
        }}>
          <div style={{
            background: 'var(--bg-surface)', border: '1px solid var(--border-strong)',
            borderRadius: 10, overflow: 'hidden',
          }}>
            {/* Mock topbar */}
            <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--border-strong)' }} />
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--border-strong)' }} />
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--border-strong)' }} />
              <div style={{ flex: 1, height: 6, background: 'var(--bg-elevated)', borderRadius: 3, marginLeft: 8 }} />
            </div>
            {/* Mock tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', padding: '0 16px' }}>
              {['SUMMARY', 'FLASHCARDS', 'CHAT'].map((t, i) => (
                <div key={t} style={{
                  padding: '10px 14px', fontSize: 10, fontFamily: 'JetBrains Mono, monospace',
                  color: i === 0 ? 'var(--text-primary)' : 'var(--text-muted)',
                  borderBottom: i === 0 ? '2px solid var(--accent)' : '2px solid transparent',
                  letterSpacing: '0.08em',
                }}>{t}</div>
              ))}
            </div>
            {/* Mock summary content */}
            <div style={{ padding: '20px 20px' }}>
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.1em', marginBottom: 12 }}>AI SUMMARY</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {[90, 75, 85, 60, 80].map((w, i) => (
                    <div key={i} style={{ height: 8, background: 'var(--bg-elevated)', borderRadius: 4, width: `${w}%` }} />
                  ))}
                </div>
              </div>
              <div style={{ height: 1, background: 'var(--border)', margin: '16px 0' }} />
              {/* Mock flashcard */}
              <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-strong)', borderRadius: 6, padding: '14px 16px', textAlign: 'center' }}>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', marginBottom: 8 }}>QUESTION</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center' }}>
                  <div style={{ height: 8, background: 'var(--border-strong)', borderRadius: 4, width: '70%' }} />
                  <div style={{ height: 8, background: 'var(--border-strong)', borderRadius: 4, width: '50%' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats bar ── */}
      <section style={{
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg-surface)',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)' }}>
          {[
            { label: 'STUDENTS', value: 10000, suffix: '+' },
            { label: 'NOTES PROCESSED', value: 50000, suffix: '+' },
            { label: 'UNIVERSITIES', value: 200, suffix: '+' },
            { label: 'AI ACCURACY', value: 98, suffix: '%' },
          ].map((s, i) => (
            <div key={s.label} style={{
              padding: '24px 32px', textAlign: 'center',
              borderRight: i < 3 ? '1px solid var(--border)' : 'none',
            }}>
              <div style={{ fontSize: 28, fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'Playfair Display, serif', marginBottom: 4 }}>
                <Counter target={s.value} suffix={s.suffix} />
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.1em' }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features grid ── */}
      <section style={{ borderBottom: '1px solid var(--border)', padding: '64px 32px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ marginBottom: 48, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', marginBottom: 10 }}>
                WHAT YOU CAN DO
              </p>
              <h2 style={{ fontSize: 32, fontWeight: 400, fontFamily: 'Playfair Display, serif', color: 'var(--text-primary)', margin: 0 }}>
                Everything you need to study better
              </h2>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0, border: '1px solid var(--border-strong)', borderRadius: 8, overflow: 'hidden' }}>
            {[
              { num: '01', title: 'Upload Notes',    icon: '↑', desc: 'Upload any PDF or image of your handwritten or printed notes. We extract the text automatically using OCR.' },
              { num: '02', title: 'AI Summary',      icon: '≡', desc: 'Get a concise, well-structured summary of your notes instantly. Powered by Groq\'s LLaMA 70B model.' },
              { num: '03', title: 'Smart Flashcards',icon: '⊞', desc: 'Auto-generated question and answer pairs from your notes. Click to flip, navigate through the deck.' },
              { num: '04', title: 'Chat with Notes', icon: '◎', desc: 'Ask questions about your notes in natural language. Get instant answers, explanations, and examples.' },
            ].map((f, i) => (
              <div key={f.num} style={{ borderRight: i < 3 ? '1px solid var(--border)' : 'none' }}>
                <FeatureCard {...f} delay={i * 100} />
              </div>
            ))}
          </div>

          {/* Second row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0, border: '1px solid var(--border-strong)', borderTop: 'none', borderRadius: '0 0 8px 8px', overflow: 'hidden' }}>
            {[
              { num: '05', title: 'Community Notes', icon: '🌐', desc: 'Browse public notes from other students at your university. Find notes for any subject or chapter.' },
              { num: '06', title: 'Multi-Theme UI',  icon: '◑', desc: 'Four carefully designed themes — Paper, Slate, Noir, Sage — each optimised for different lighting and sessions.' },
              { num: '07', title: 'Persistent Chats',icon: '💬', desc: 'Your conversations are saved and tied to each note. Pick up right where you left off, every time.' },
              { num: '08', title: 'Subject Manager', icon: '📚', desc: 'Organise notes by subject and chapter. Your entire semester structured and searchable in one place.' },
            ].map((f, i) => (
              <div key={f.num} style={{ borderRight: i < 3 ? '1px solid var(--border)' : 'none' }}>
                <FeatureCard {...f} delay={i * 100} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section style={{ borderBottom: '1px solid var(--border)', padding: '64px 32px', background: 'var(--bg-surface)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>
          <div>
            <p style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', marginBottom: 10 }}>
              HOW IT WORKS
            </p>
            <h2 style={{ fontSize: 32, fontWeight: 400, fontFamily: 'Playfair Display, serif', color: 'var(--text-primary)', margin: '0 0 40px' }}>
              From notes to mastery in four steps
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
              <Step num={1} title="Sign in with Google" desc="One click, no forms, no passwords. We use Google OAuth so you're up in seconds." />
              <Step num={2} title="Upload your notes" desc="PDF or photo — we handle both. Our OCR engine extracts text from any quality scan." />
              <Step num={3} title="Let AI do the work" desc="Summaries and flashcards are generated automatically the moment your note is processed." />
              <Step num={4} title="Chat, revise, repeat" desc="Ask questions, test yourself with flashcards, share notes with classmates." />
            </div>
          </div>

          {/* Right — CTA card */}
          <div>
            <div style={{
              border: '1px solid var(--border-strong)', borderRadius: 10,
              overflow: 'hidden', background: 'var(--bg-base)',
            }}>
              <div style={{ padding: '32px 32px 28px', borderBottom: '1px solid var(--border)' }}>
                <p style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', marginBottom: 12 }}>
                  GET STARTED
                </p>
                <h3 style={{ fontSize: 26, fontWeight: 400, fontFamily: 'Playfair Display, serif', color: 'var(--text-primary)', margin: '0 0 12px' }}>
                  Ready to study smarter?
                </h3>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', fontFamily: 'DM Sans, sans-serif', fontWeight: 300, margin: 0, lineHeight: 1.7 }}>
                  Join thousands of Indian university students who use EduMind to save study time and score better.
                </p>
              </div>

              <div style={{ padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                <button
                  onClick={handleGoogleLogin}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                    padding: '13px 20px', borderRadius: 7, cursor: 'pointer',
                    background: 'var(--accent)', border: 'none',
                    transition: 'opacity 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                  onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <path fill={`var(--accent-text)`} d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill={`var(--accent-text)`} d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill={`var(--accent-text)`} d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill={`var(--accent-text)`} d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--accent-text)', fontFamily: 'DM Sans, sans-serif' }}>
                    Sign in with Google — it's free
                  </span>
                </button>

                {[
                  '✓ No credit card required',
                  '✓ Works with any Indian university syllabus',
                  '✓ Your notes are private by default',
                ].map(item => (
                  <p key={item} style={{ margin: 0, fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'DM Sans, sans-serif' }}>
                    {item}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ padding: '24px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 20, height: 20, background: 'var(--accent)', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 10, color: 'var(--accent-text)', fontWeight: 700 }}>E</span>
          </div>
          <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontFamily: 'DM Sans, sans-serif' }}>EduMind</span>
        </div>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'DM Sans, sans-serif', margin: 0 }}>
          Built for Indian university students
        </p>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', margin: 0 }}>
          2026
        </p>
      </footer>

      <style>{`
        @keyframes swing {
          0%   { transform: rotate(-8deg); }
          100% { transform: rotate(8deg); }
        }
      `}</style>
    </div>
  )
}