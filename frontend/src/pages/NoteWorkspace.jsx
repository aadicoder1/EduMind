import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api/axios'

function Sep() {
  return <div style={{ height: 1, background: 'var(--border)' }} />
}

// Parse flashcard string "Q: ...\nA: ..." into array of objects
function parseFlashcards(content) {
  if (!content) return []
  const cards = []
  const lines = content.split('\n').map(l => l.trim()).filter(Boolean)
  let current = {}
  for (const line of lines) {
    if (line.startsWith('Q:')) {
      if (current.question) cards.push(current)
      current = { question: line.replace(/^Q:\s*/, '').replace(/^\[|\]$/g, '') }
    } else if (line.startsWith('A:')) {
      current.answer = line.replace(/^A:\s*/, '').replace(/^\[|\]$/g, '')
      cards.push(current)
      current = {}
    }
  }
  return cards.filter(c => c.question && c.answer)
}

function Flashcard({ card, index, total }) {
  const [flipped, setFlipped] = useState(false)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>
        {index + 1} / {total}
      </div>
      <div
        onClick={() => setFlipped(f => !f)}
        style={{
          width: '100%', minHeight: 200, cursor: 'pointer',
          background: flipped ? 'var(--accent)' : 'var(--bg-elevated)',
          border: '1px solid var(--border-strong)',
          borderRadius: 8, padding: '32px 28px',
          display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
          gap: 12, transition: 'background 0.2s', textAlign: 'center',
        }}
      >
        <span style={{
          fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase',
          fontFamily: 'JetBrains Mono, monospace',
          color: flipped ? 'var(--accent-text)' : 'var(--text-muted)', opacity: 0.7,
        }}>
          {flipped ? 'ANSWER' : 'QUESTION'}
        </span>
        <p style={{
          margin: 0, fontSize: 15, lineHeight: 1.6,
          fontFamily: 'DM Sans, sans-serif',
          color: flipped ? 'var(--accent-text)' : 'var(--text-primary)',
          fontWeight: flipped ? 400 : 500,
        }}>
          {flipped ? card.answer : card.question}
        </p>
        <span style={{
          fontSize: 11, color: flipped ? 'var(--accent-text)' : 'var(--text-muted)',
          fontFamily: 'DM Sans, sans-serif', opacity: 0.6, marginTop: 8,
        }}>
          click to {flipped ? 'see question' : 'reveal answer'}
        </span>
      </div>
    </div>
  )
}

function ChatMessage({ msg }) {
  const isUser = msg.role === 'USER' || msg.role === 'user'
  return (
    <div style={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start', marginBottom: 12 }}>
      <div style={{
        maxWidth: '75%', padding: '10px 14px', borderRadius: 8,
        background: isUser ? 'var(--accent)' : 'var(--bg-elevated)',
        border: isUser ? 'none' : '1px solid var(--border)',
        color: isUser ? 'var(--accent-text)' : 'var(--text-primary)',
        fontSize: 14, fontFamily: 'DM Sans, sans-serif', lineHeight: 1.6,
      }}>
        {msg.content}
      </div>
    </div>
  )
}

function Spinner({ text }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '48px 0' }}>
      <div style={{
        width: 24, height: 24,
        border: '2px solid var(--border-strong)', borderTopColor: 'var(--accent)',
        borderRadius: '50%', animation: 'spin 0.7s linear infinite',
      }} />
      {text && <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)', fontFamily: 'DM Sans, sans-serif' }}>{text}</p>}
    </div>
  )
}

// Modal for naming a new conversation
function NewChatModal({ onConfirm, onCancel }) {
  const [title, setTitle] = useState('')
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999,
    }}>
      <div style={{
        background: 'var(--bg-elevated)', border: '1px solid var(--border-strong)',
        borderRadius: 10, padding: '28px 28px 24px', width: 360,
      }}>
        <p style={{ margin: '0 0 16px', fontSize: 14, color: 'var(--text-primary)', fontFamily: 'DM Sans, sans-serif', fontWeight: 500 }}>
          Name this conversation
        </p>
        <input
          autoFocus
          value={title}
          onChange={e => setTitle(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && title.trim()) onConfirm(title.trim()) }}
          placeholder="e.g. Exam prep, Quick doubts..."
          style={{
            width: '100%', padding: '10px 12px', borderRadius: 6,
            background: 'var(--bg-surface)', border: '1px solid var(--border-strong)',
            color: 'var(--text-primary)', fontSize: 13,
            fontFamily: 'DM Sans, sans-serif', outline: 'none',
            boxSizing: 'border-box',
          }}
        />
        <div style={{ display: 'flex', gap: 8, marginTop: 16, justifyContent: 'flex-end' }}>
          <button
            onClick={onCancel}
            style={{ padding: '8px 16px', border: '1px solid var(--border-strong)', borderRadius: 6, background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 12, fontFamily: 'JetBrains Mono, monospace' }}
          >CANCEL</button>
          <button
            onClick={() => title.trim() && onConfirm(title.trim())}
            disabled={!title.trim()}
            style={{ padding: '8px 16px', border: 'none', borderRadius: 6, background: 'var(--accent)', cursor: 'pointer', color: 'var(--accent-text)', fontSize: 12, fontFamily: 'JetBrains Mono, monospace', fontWeight: 500 }}
          >CREATE</button>
        </div>
      </div>
    </div>
  )
}

export default function NoteWorkspace() {
  const { noteId } = useParams()
  const navigate   = useNavigate()

  const [note,          setNote]          = useState(null)
  const [activeTab,     setActiveTab]     = useState('summary')
  const [summary,       setSummary]       = useState('')
  const [flashcards,    setFlashcards]    = useState([])
  const [cardIndex,     setCardIndex]     = useState(0)
  const [messages,      setMessages]      = useState([])
  const [input,         setInput]         = useState('')
  const [convId,        setConvId]        = useState(null)
  const [showChatModal, setShowChatModal] = useState(false)
  const [loadingSum,    setLoadingSum]    = useState(false)
  const [loadingCards,  setLoadingCards]  = useState(false)
  const [loadingChat,   setLoadingChat]   = useState(false)
  const [loadingNote,   setLoadingNote]   = useState(true)
  const chatEndRef = useRef()

  useEffect(() => { fetchNote() }, [noteId])
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const fetchNote = async () => {
    try {
      // Try to get note details from conversations or community endpoint
      const res = await api.get(`/api/community/notes/${noteId}`)
      setNote(res.data)
    } catch {
      setNote({ id: noteId, title: 'Note' })
    } finally {
      setLoadingNote(false)
    }
  }

  const loadSummary = async (force = false) => {
    if (summary && !force) return
    setLoadingSum(true)
    setSummary('')
    try {
      const endpoint = force
        ? `/api/ai/summarize/${noteId}/regenerate`
        : `/api/ai/summarize/${noteId}`
      const res = await api.post(endpoint)
      // Backend returns AiOutput object — content field has the summary
      setSummary(res.data?.content || '')
    } catch {
      setSummary('Failed to generate summary. Please try again.')
    } finally {
      setLoadingSum(false)
    }
  }

  const loadFlashcards = async (force = false) => {
    if (flashcards.length > 0 && !force) return
    setLoadingCards(true)
    setFlashcards([])
    setCardIndex(0)
    try {
      const endpoint = force
        ? `/api/ai/flashcards/${noteId}/regenerate`
        : `/api/ai/flashcards/${noteId}`
      const res = await api.post(endpoint)
      // Backend returns AiOutput — content is "Q: ...\nA: ..." string
      const parsed = parseFlashcards(res.data?.content || '')
      setFlashcards(parsed)
    } catch {
      setFlashcards([])
    } finally {
      setLoadingCards(false)
    }
  }

  const initChat = async (title) => {
    try {
      // Create new named conversation
      const res = await api.post('/api/conversations', { noteId, title })
      setConvId(res.data.id)
      setMessages([])
      setShowChatModal(false)
    } catch {}
  }

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    if (tab === 'summary')    loadSummary()
    if (tab === 'flashcards') loadFlashcards()
    if (tab === 'chat' && !convId) setShowChatModal(true)
  }

  useEffect(() => { if (!loadingNote) loadSummary() }, [loadingNote])

  const sendMessage = async () => {
    const text = input.trim()
    if (!text || loadingChat || !convId) return
    setInput('')
    setMessages(prev => [...prev, { role: 'USER', content: text }])
    setLoadingChat(true)
    try {
      // Backend expects "question" field, returns ChatMessage object
      const res = await api.post(`/api/conversations/${convId}/message`, { question: text })
      // Response is the AI ChatMessage object with content field
      setMessages(prev => [...prev, { role: 'AI', content: res.data?.content || '' }])
    } catch {
      setMessages(prev => [...prev, { role: 'AI', content: 'Something went wrong. Please try again.' }])
    } finally {
      setLoadingChat(false)
    }
  }

  const tabs = [
    { id: 'summary',    label: 'SUMMARY' },
    { id: 'flashcards', label: 'FLASHCARDS' },
    { id: 'chat',       label: 'CHAT' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', flexDirection: 'column' }}>

      {showChatModal && (
        <NewChatModal
          onConfirm={initChat}
          onCancel={() => { setShowChatModal(false); setActiveTab('summary') }}
        />
      )}

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
        <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.05em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {note?.title || 'NOTE WORKSPACE'}
        </span>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', background: 'var(--bg-surface)', padding: '0 24px', flexShrink: 0 }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            style={{
              padding: '12px 20px', border: 'none', background: 'none', cursor: 'pointer',
              fontSize: 11, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.1em',
              color: activeTab === tab.id ? 'var(--text-primary)' : 'var(--text-muted)',
              borderBottom: activeTab === tab.id ? '2px solid var(--accent)' : '2px solid transparent',
              marginBottom: -1, transition: 'color 0.15s',
            }}
          >
            {tab.label}
          </button>
        ))}
        {/* New chat button when on chat tab */}
        {activeTab === 'chat' && convId && (
          <button
            onClick={() => setShowChatModal(true)}
            style={{
              marginLeft: 'auto', padding: '12px 16px', border: 'none', background: 'none',
              cursor: 'pointer', fontSize: 11, color: 'var(--text-muted)',
              fontFamily: 'JetBrains Mono, monospace',
            }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
          >+ NEW CHAT</button>
        )}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'auto', padding: activeTab === 'chat' ? 0 : '32px 24px', display: 'flex', justifyContent: 'center' }}>

        {/* SUMMARY TAB */}
        {activeTab === 'summary' && (
          <div style={{ width: '100%', maxWidth: 680 }}>
            {loadingSum ? (
              <Spinner text="Generating summary..." />
            ) : summary ? (
              <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-strong)', borderRadius: 8, padding: '28px 32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                  <span style={{ fontSize: 10, letterSpacing: '0.12em', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>AI SUMMARY</span>
                  <button
                    onClick={() => loadSummary(true)}
                    style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 4, padding: '4px 10px', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 11, fontFamily: 'JetBrains Mono, monospace', transition: 'color 0.15s, border-color 0.15s' }}
                    onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.borderColor = 'var(--border-strong)' }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--border)' }}
                  >REGENERATE</button>
                </div>
                <Sep />
                <div style={{ marginTop: 20 }}>
                  {summary.split('\n').filter(Boolean).map((para, i) => (
                    <p key={i} style={{ margin: '0 0 14px', fontSize: 15, lineHeight: 1.8, color: 'var(--text-primary)', fontFamily: 'DM Sans, sans-serif', fontWeight: 300 }}>
                      {para}
                    </p>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '48px 0' }}>
                <p style={{ color: 'var(--text-muted)', fontFamily: 'DM Sans, sans-serif' }}>No summary yet.</p>
                <button onClick={() => loadSummary()} style={{ marginTop: 12, padding: '10px 20px', background: 'var(--accent)', color: 'var(--accent-text)', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontFamily: 'DM Sans, sans-serif' }}>
                  Generate Summary
                </button>
              </div>
            )}
          </div>
        )}

        {/* FLASHCARDS TAB */}
        {activeTab === 'flashcards' && (
          <div style={{ width: '100%', maxWidth: 560 }}>
            {loadingCards ? (
              <Spinner text="Generating flashcards..." />
            ) : flashcards.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <Flashcard card={flashcards[cardIndex]} index={cardIndex} total={flashcards.length} />
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
                  <button
                    onClick={() => setCardIndex(i => Math.max(0, i - 1))}
                    disabled={cardIndex === 0}
                    style={{ padding: '8px 20px', border: '1px solid var(--border-strong)', borderRadius: 6, background: 'var(--bg-surface)', color: cardIndex === 0 ? 'var(--text-muted)' : 'var(--text-primary)', cursor: cardIndex === 0 ? 'not-allowed' : 'pointer', fontSize: 13, fontFamily: 'DM Sans, sans-serif' }}
                  >← PREV</button>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', minWidth: 60, textAlign: 'center' }}>{cardIndex + 1} / {flashcards.length}</span>
                  <button
                    onClick={() => setCardIndex(i => Math.min(flashcards.length - 1, i + 1))}
                    disabled={cardIndex === flashcards.length - 1}
                    style={{ padding: '8px 20px', border: '1px solid var(--border-strong)', borderRadius: 6, background: 'var(--bg-surface)', color: cardIndex === flashcards.length - 1 ? 'var(--text-muted)' : 'var(--text-primary)', cursor: cardIndex === flashcards.length - 1 ? 'not-allowed' : 'pointer', fontSize: 13, fontFamily: 'DM Sans, sans-serif' }}
                  >NEXT →</button>
                </div>
                <button
                  onClick={() => loadFlashcards(true)}
                  style={{ alignSelf: 'center', background: 'none', border: '1px solid var(--border)', borderRadius: 4, padding: '6px 14px', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }}
                >REGENERATE</button>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '48px 0' }}>
                <p style={{ color: 'var(--text-muted)', fontFamily: 'DM Sans, sans-serif' }}>No flashcards yet.</p>
                <button onClick={() => loadFlashcards()} style={{ marginTop: 12, padding: '10px 20px', background: 'var(--accent)', color: 'var(--accent-text)', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontFamily: 'DM Sans, sans-serif' }}>
                  Generate Flashcards
                </button>
              </div>
            )}
          </div>
        )}

        {/* CHAT TAB */}
        {activeTab === 'chat' && (
          <div style={{ width: '100%', maxWidth: 680, display: 'flex', flexDirection: 'column', height: 'calc(100vh - 97px)' }}>
            <div style={{ flex: 1, overflow: 'auto', padding: '24px 24px 0' }}>
              {!convId ? (
                <div style={{ textAlign: 'center', padding: '48px 0' }}>
                  <p style={{ color: 'var(--text-muted)', fontFamily: 'DM Sans, sans-serif' }}>Create a conversation to start chatting.</p>
                  <button onClick={() => setShowChatModal(true)} style={{ marginTop: 12, padding: '10px 20px', background: 'var(--accent)', color: 'var(--accent-text)', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontFamily: 'DM Sans, sans-serif' }}>
                    + New Chat
                  </button>
                </div>
              ) : messages.length === 0 && !loadingChat ? (
                <div style={{ textAlign: 'center', padding: '48px 0' }}>
                  <p style={{ fontSize: 28, marginBottom: 12 }}>💬</p>
                  <p style={{ color: 'var(--text-secondary)', fontFamily: 'DM Sans, sans-serif', fontSize: 15, marginBottom: 6 }}>Ask anything about this note</p>
                  <p style={{ color: 'var(--text-muted)', fontFamily: 'DM Sans, sans-serif', fontSize: 13 }}>Summarise, explain, quiz me, translate...</p>
                </div>
              ) : (
                messages.map((msg, i) => <ChatMessage key={i} msg={msg} />)
              )}
              {loadingChat && (
                <div style={{ display: 'flex', gap: 6, padding: '8px 0', alignItems: 'center' }}>
                  {[0,1,2].map(i => (
                    <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--text-muted)', animation: `bounce 1s ease-in-out ${i * 0.15}s infinite` }} />
                  ))}
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {convId && (
              <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', background: 'var(--bg-surface)', display: 'flex', gap: 10 }}>
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
                  placeholder="Ask about this note..."
                  style={{ flex: 1, padding: '10px 14px', background: 'var(--bg-elevated)', border: '1px solid var(--border-strong)', borderRadius: 6, color: 'var(--text-primary)', fontSize: 14, fontFamily: 'DM Sans, sans-serif', outline: 'none' }}
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || loadingChat}
                  style={{ padding: '10px 18px', border: 'none', borderRadius: 6, cursor: 'pointer', background: input.trim() ? 'var(--accent)' : 'var(--bg-elevated)', color: input.trim() ? 'var(--accent-text)' : 'var(--text-muted)', fontSize: 13, fontFamily: 'DM Sans, sans-serif', fontWeight: 500, transition: 'background 0.15s' }}
                >SEND</button>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin   { to { transform: rotate(360deg) } }
        @keyframes bounce { 0%, 100% { transform: translateY(0) } 50% { transform: translateY(-4px) } }
      `}</style>
    </div>
  )
}