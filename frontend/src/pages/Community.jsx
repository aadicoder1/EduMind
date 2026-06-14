import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'

function Sep() {
  return <div style={{ height: 1, background: 'var(--border)' }} />
}

function NoteCard({ note, onClick }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      onClick={() => onClick(note)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        border: '1px solid var(--border-strong)',
        borderRadius: 8, overflow: 'hidden',
        background: hovered ? 'var(--bg-elevated)' : 'var(--bg-surface)',
        cursor: 'pointer', transition: 'background 0.15s',
      }}
    >
      <div style={{ padding: '16px 18px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
          <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.08em' }}>
            {note.subjectName || 'SUBJECT'} · {note.chapterName || 'CHAPTER'}
          </span>
          <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>
            {note.fileType || 'PDF'}
          </span>
        </div>
        <h3 style={{ margin: '0 0 6px', fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', fontFamily: 'DM Sans, sans-serif' }}>
          {note.title || 'Untitled Note'}
        </h3>
        <p style={{ margin: 0, fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'DM Sans, sans-serif', fontWeight: 300 }}>
          by {note.userName || 'Anonymous'}
        </p>
      </div>
      <Sep />
      <div style={{ padding: '10px 18px', display: 'flex', gap: 12 }}>
        <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'DM Sans, sans-serif' }}>
          📄 View summary
        </span>
        <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'DM Sans, sans-serif' }}>
          🃏 Flashcards
        </span>
        <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'DM Sans, sans-serif' }}>
          💬 Chat
        </span>
      </div>
    </div>
  )
}

function NoteModal({ note, onClose }) {
  const [activeTab,  setActiveTab]  = useState('summary')
  const [summary,    setSummary]    = useState('')
  const [flashcards, setFlashcards] = useState([])
  const [cardIndex,  setCardIndex]  = useState(0)
  const [flipped,    setFlipped]    = useState(false)
  const [messages,   setMessages]   = useState([])
  const [input,      setInput]      = useState('')
  const [loading,    setLoading]    = useState(false)
  const [chatLoading,setChatLoading]= useState(false)

  useEffect(() => { loadSummary() }, [])

  const loadSummary = async () => {
    if (summary) return
    setLoading(true)
    try {
      const res = await api.get(`/api/community/notes/${note.id}/summary`)
      setSummary(res.data?.summary || res.data || '')
    } catch { setSummary('Failed to load summary.') }
    finally { setLoading(false) }
  }

  const loadFlashcards = async () => {
    if (flashcards.length > 0) return
    setLoading(true)
    try {
      const res = await api.get(`/api/community/notes/${note.id}/flashcards`)
      setFlashcards(res.data?.flashcards || res.data || [])
    } catch { setFlashcards([]) }
    finally { setLoading(false) }
  }

  const handleTab = (tab) => {
    setActiveTab(tab)
    if (tab === 'flashcards') loadFlashcards()
  }

  const sendMessage = async () => {
    const text = input.trim()
    if (!text || chatLoading) return
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: text }])
    setChatLoading(true)
    try {
      const res = await api.post(`/api/community/notes/${note.id}/chat`, { message: text })
      setMessages(prev => [...prev, { role: 'assistant', content: res.data?.reply || res.data?.message || '' }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Failed to get response.' }])
    } finally { setChatLoading(false) }
  }

  const tabs = ['summary', 'flashcards', 'chat']

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 50,
        background: 'rgba(0,0,0,0.6)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 640, maxHeight: '85vh',
          background: 'var(--bg-surface)', border: '1px solid var(--border-strong)',
          borderRadius: 10, overflow: 'hidden', display: 'flex', flexDirection: 'column',
        }}
      >
        {/* Modal header */}
        <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div>
            <p style={{ margin: 0, fontSize: 10, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.08em', marginBottom: 4 }}>
              {note.subjectName} · {note.chapterName}
            </p>
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 500, color: 'var(--text-primary)', fontFamily: 'DM Sans, sans-serif' }}>
              {note.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 22, lineHeight: 1, padding: 4 }}
          >×</button>
        </div>

        <Sep />

        {/* Tabs */}
        <div style={{ display: 'flex', padding: '0 20px', gap: 0, flexShrink: 0 }}>
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => handleTab(tab)}
              style={{
                padding: '10px 16px', border: 'none', background: 'none', cursor: 'pointer',
                fontSize: 11, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.1em',
                color: activeTab === tab ? 'var(--text-primary)' : 'var(--text-muted)',
                borderBottom: activeTab === tab ? '2px solid var(--accent)' : '2px solid transparent',
                marginBottom: -1, textTransform: 'uppercase',
              }}
            >{tab}</button>
          ))}
        </div>

        <Sep />

        {/* Tab content */}
        <div style={{ flex: 1, overflow: 'auto', padding: activeTab === 'chat' ? 0 : 20 }}>

          {/* Summary */}
          {activeTab === 'summary' && (
            loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
                <div style={{ width: 24, height: 24, border: '2px solid var(--border-strong)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
              </div>
            ) : (
              <div>
                {(typeof summary === 'string' ? summary : JSON.stringify(summary))
                  .split('\n').filter(Boolean).map((p, i) => (
                    <p key={i} style={{ margin: '0 0 12px', fontSize: 14, lineHeight: 1.8, color: 'var(--text-primary)', fontFamily: 'DM Sans, sans-serif', fontWeight: 300 }}>{p}</p>
                  ))}
              </div>
            )
          )}

          {/* Flashcards */}
          {activeTab === 'flashcards' && (
            loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
                <div style={{ width: 24, height: 24, border: '2px solid var(--border-strong)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
              </div>
            ) : flashcards.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', textAlign: 'center' }}>
                  {cardIndex + 1} / {flashcards.length}
                </div>
                <div
                  onClick={() => setFlipped(f => !f)}
                  style={{
                    minHeight: 160, cursor: 'pointer',
                    background: flipped ? 'var(--accent)' : 'var(--bg-elevated)',
                    border: '1px solid var(--border-strong)', borderRadius: 8,
                    padding: '28px 24px', display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center', gap: 10,
                    transition: 'background 0.2s', textAlign: 'center',
                  }}
                >
                  <span style={{ fontSize: 10, letterSpacing: '0.12em', fontFamily: 'JetBrains Mono, monospace', color: flipped ? 'var(--accent-text)' : 'var(--text-muted)', opacity: 0.7 }}>
                    {flipped ? 'ANSWER' : 'QUESTION'}
                  </span>
                  <p style={{ margin: 0, fontSize: 14, color: flipped ? 'var(--accent-text)' : 'var(--text-primary)', fontFamily: 'DM Sans, sans-serif', lineHeight: 1.6 }}>
                    {flipped ? flashcards[cardIndex].answer : flashcards[cardIndex].question}
                  </p>
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 10 }}>
                  <button onClick={() => { setCardIndex(i => Math.max(0, i-1)); setFlipped(false) }}
                    disabled={cardIndex === 0}
                    style={{ padding: '8px 16px', border: '1px solid var(--border-strong)', borderRadius: 6, background: 'var(--bg-surface)', color: 'var(--text-primary)', cursor: cardIndex === 0 ? 'not-allowed' : 'pointer', fontSize: 12, fontFamily: 'DM Sans, sans-serif' }}>
                    ← PREV
                  </button>
                  <button onClick={() => { setCardIndex(i => Math.min(flashcards.length-1, i+1)); setFlipped(false) }}
                    disabled={cardIndex === flashcards.length - 1}
                    style={{ padding: '8px 16px', border: '1px solid var(--border-strong)', borderRadius: 6, background: 'var(--bg-surface)', color: 'var(--text-primary)', cursor: cardIndex === flashcards.length-1 ? 'not-allowed' : 'pointer', fontSize: 12, fontFamily: 'DM Sans, sans-serif' }}>
                    NEXT →
                  </button>
                </div>
              </div>
            ) : (
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontFamily: 'DM Sans, sans-serif', padding: 40 }}>No flashcards available.</p>
            )
          )}

          {/* Chat */}
          {activeTab === 'chat' && (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div style={{ flex: 1, overflow: 'auto', padding: 20 }}>
                {messages.length === 0 && (
                  <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontFamily: 'DM Sans, sans-serif', fontSize: 13, paddingTop: 32 }}>
                    Ask anything about this note...
                  </p>
                )}
                {messages.map((msg, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', marginBottom: 10 }}>
                    <div style={{
                      maxWidth: '75%', padding: '9px 13px', borderRadius: 8,
                      background: msg.role === 'user' ? 'var(--accent)' : 'var(--bg-elevated)',
                      border: msg.role === 'user' ? 'none' : '1px solid var(--border)',
                      color: msg.role === 'user' ? 'var(--accent-text)' : 'var(--text-primary)',
                      fontSize: 13, fontFamily: 'DM Sans, sans-serif', lineHeight: 1.6,
                    }}>{msg.content}</div>
                  </div>
                ))}
                {chatLoading && (
                  <div style={{ display: 'flex', gap: 5, padding: '6px 0' }}>
                    {[0,1,2].map(i => (
                      <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--text-muted)', animation: `bounce 1s ease-in-out ${i*0.15}s infinite` }} />
                    ))}
                  </div>
                )}
              </div>
              <Sep />
              <div style={{ padding: '12px 16px', display: 'flex', gap: 8, flexShrink: 0 }}>
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') sendMessage() }}
                  placeholder="Ask about this note..."
                  style={{
                    flex: 1, padding: '9px 12px',
                    background: 'var(--bg-elevated)', border: '1px solid var(--border-strong)',
                    borderRadius: 6, color: 'var(--text-primary)',
                    fontSize: 13, fontFamily: 'DM Sans, sans-serif', outline: 'none',
                  }}
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || chatLoading}
                  style={{
                    padding: '9px 16px', border: 'none', borderRadius: 6, cursor: 'pointer',
                    background: input.trim() ? 'var(--accent)' : 'var(--bg-elevated)',
                    color: input.trim() ? 'var(--accent-text)' : 'var(--text-muted)',
                    fontSize: 12, fontFamily: 'DM Sans, sans-serif', fontWeight: 500,
                  }}
                >SEND</button>
              </div>
            </div>
          )}
        </div>
      </div>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes bounce { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-4px) } }
      `}</style>
    </div>
  )
}

export default function Community() {
  const navigate  = useNavigate()
  const [notes,   setNotes]   = useState([])
  const [loading, setLoading] = useState(true)
  const [search,  setSearch]  = useState('')
  const [selected,setSelected]= useState(null)

  useEffect(() => { fetchNotes() }, [])

  const fetchNotes = async () => {
    try {
      const res = await api.get('/api/community/notes')
      setNotes(res.data || [])
    } catch {}
    finally { setLoading(false) }
  }

  const filtered = notes.filter(n =>
    n.title?.toLowerCase().includes(search.toLowerCase()) ||
    n.subjectName?.toLowerCase().includes(search.toLowerCase()) ||
    n.userName?.toLowerCase().includes(search.toLowerCase())
  )

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
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: 18, lineHeight: 1, padding: '4px 6px', borderRadius: 4, transition: 'color 0.15s' }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
        >←</button>
        <div style={{ width: 1, height: 18, background: 'var(--border)' }} />
        <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.05em' }}>
          COMMUNITY
        </span>
        <div style={{ flex: 1 }} />
        {/* Search */}
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search notes..."
          style={{
            padding: '6px 12px', width: 220,
            background: 'var(--bg-elevated)', border: '1px solid var(--border-strong)',
            borderRadius: 6, color: 'var(--text-primary)',
            fontSize: 13, fontFamily: 'DM Sans, sans-serif', outline: 'none',
          }}
        />
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: '32px 24px', maxWidth: 900, margin: '0 auto', width: '100%' }}>

        <div style={{ marginBottom: 28 }}>
          <p style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', marginBottom: 8 }}>
            COMMUNITY NOTES
          </p>
          <h1 style={{ fontSize: 26, fontWeight: 400, fontFamily: 'Playfair Display, serif', color: 'var(--text-primary)', margin: '0 0 6px' }}>
            Browse public notes
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', fontFamily: 'DM Sans, sans-serif', fontWeight: 300, margin: 0 }}>
            {loading ? 'Loading...' : `${filtered.length} notes available`}
          </p>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
            <div style={{ width: 28, height: 28, border: '2px solid var(--border-strong)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
          </div>
        ) : filtered.length === 0 ? (
          <div style={{
            border: '1px solid var(--border)', borderRadius: 8, padding: '48px 24px',
            textAlign: 'center',
          }}>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', fontFamily: 'DM Sans, sans-serif' }}>
              {search ? 'No notes match your search.' : 'No public notes yet. Be the first to share!'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 1, border: '1px solid var(--border-strong)', borderRadius: 8, overflow: 'hidden' }}>
            {filtered.map(note => (
              <NoteCard key={note.id} note={note} onClick={setSelected} />
            ))}
          </div>
        )}
      </div>

      {selected && <NoteModal note={selected} onClose={() => setSelected(null)} />}
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}