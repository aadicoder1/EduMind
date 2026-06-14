import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'

function Sep() {
  return <div style={{ height: 1, background: 'var(--border)' }} />
}

function Label({ num, children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
      <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>{num}</span>
      <p style={{
        fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase',
        color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', margin: 0,
      }}>{children}</p>
    </div>
  )
}

export default function Upload() {
  const navigate = useNavigate()

  const [subjects,    setSubjects]    = useState([])
  const [chapters,    setChapters]    = useState([])
  const [subjectId,   setSubjectId]   = useState('')
  const [chapterId,   setChapterId]   = useState('')
  const [newSubject,  setNewSubject]  = useState('')
  const [newChapter,  setNewChapter]  = useState('')
  const [file,        setFile]        = useState(null)
  const [dragging,    setDragging]    = useState(false)
  const [loading,     setLoading]     = useState(false)
  const [error,       setError]       = useState('')
  const [addingSub,   setAddingSub]   = useState(false)
  const [addingChap,  setAddingChap]  = useState(false)
  const fileRef = useRef()

  useEffect(() => { fetchSubjects() }, [])
useEffect(() => {
  if (subjectId) fetchChapters(subjectId)
  else setChapters([])
}, [subjectId])
  const fetchSubjects = async () => {
    try {
      const res = await api.get('/api/subjects')
      setSubjects(res.data || [])
    } catch {}
  }

  const fetchChapters = async (sid) => {
    try {
      const res = await api.get(`/api/chapters/${sid}`)
      setChapters(res.data || [])
    } catch {}
  }

  const addSubject = async () => {
    if (!newSubject.trim()) return
    try {
      const res = await api.post('/api/subjects', { name: newSubject.trim() })
      setSubjects(prev => [...prev, res.data])
      setSubjectId(res.data.id)
      setNewSubject('')
      setAddingSub(false)
    } catch { setError('Failed to add subject') }
  }

  const addChapter = async () => {
    if (!newChapter.trim() || !subjectId) return
    try {
      const res = await api.post('/api/chapters', { name: newChapter.trim(), subjectId })
      setChapters(prev => [...prev, res.data])
      setChapterId(res.data.id)
      setNewChapter('')
      setAddingChap(false)
    } catch { setError('Failed to add chapter') }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) validateAndSetFile(f)
  }

  const validateAndSetFile = (f) => {
    const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg', 'image/webp']
    if (!allowed.includes(f.type)) {
      setError('Only PDF or image files are allowed.')
      return
    }
    if (f.size > 20 * 1024 * 1024) {
      setError('File must be under 20MB.')
      return
    }
    setError('')
    setFile(f)
  }

  const handleUpload = async () => {
    if (!file || !chapterId) return
    setLoading(true)
    setError('')
    try {
      const formData = new FormData()
formData.append('file', file)
formData.append('chapterId', chapterId)
formData.append('title', file.name.replace(/\.[^/.]+$/, ''))
      const res = await api.post('/api/notes/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      navigate(`/notes/${res.data.id}`)
    } catch {
      setError('Upload failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const canUpload = file && chapterId && !loading

  const inputStyle = {
    width: '100%', padding: '10px 12px',
    background: 'var(--bg-elevated)', border: '1px solid var(--border-strong)',
    borderRadius: 6, color: 'var(--text-primary)',
    fontSize: 13, fontFamily: 'DM Sans, sans-serif',
    outline: 'none', transition: 'border-color 0.15s',
  }

  const selectStyle = {
    ...inputStyle,
    cursor: 'pointer',
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23888' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 12px center',
    paddingRight: 32,
  }

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg-base)',
      display: 'flex', flexDirection: 'column',
    }}>

      {/* Topbar */}
      <div style={{
        height: 48, borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', padding: '0 24px', gap: 12,
        background: 'var(--bg-surface)', flexShrink: 0,
      }}>
        <button
          onClick={() => navigate('/dashboard')}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-secondary)', fontSize: 18, lineHeight: 1,
            padding: '4px 6px', borderRadius: 4, transition: 'color 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
        >←</button>
        <div style={{ width: 1, height: 18, background: 'var(--border)' }} />
        <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.05em' }}>
          UPLOAD NOTES
        </span>
      </div>

      {/* Content */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '40px 24px' }}>
        <div style={{ width: '100%', maxWidth: 520 }}>

          <div style={{ marginBottom: 32 }}>
            <p style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', marginBottom: 8 }}>
              NEW NOTE
            </p>
            <h1 style={{ fontSize: 28, fontWeight: 400, fontFamily: 'Playfair Display, serif', color: 'var(--text-primary)', margin: '0 0 6px' }}>
              Upload your notes
            </h1>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', fontFamily: 'DM Sans, sans-serif', fontWeight: 300, margin: 0 }}>
              PDF or image — we'll extract text and generate summaries.
            </p>
          </div>

          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-strong)', borderRadius: 8, overflow: 'hidden' }}>

            {/* 01 Subject */}
            <div style={{ padding: 20 }}>
              <Label num="01">Subject</Label>
              {!addingSub ? (
                <div style={{ display: 'flex', gap: 8 }}>
                  <select
  value={subjectId}
  onChange={e => { setSubjectId(e.target.value); setChapterId('') }}
  style={{ ...selectStyle, colorScheme: 'dark' }}
>
  <option value="">Select subject...</option>
  {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
</select>
                  <button
                    onClick={() => setAddingSub(true)}
                    style={{
                      flexShrink: 0, padding: '10px 14px', borderRadius: 6, cursor: 'pointer',
                      background: 'var(--bg-elevated)', border: '1px solid var(--border-strong)',
                      color: 'var(--text-secondary)', fontSize: 16, lineHeight: 1,
                      transition: 'color 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
                    title="Add new subject"
                  >+</button>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    autoFocus
                    value={newSubject}
                    onChange={e => setNewSubject(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') addSubject(); if (e.key === 'Escape') setAddingSub(false) }}
                    placeholder="Subject name..."
                    style={inputStyle}
                  />
                  <button onClick={addSubject} style={{ flexShrink: 0, padding: '10px 14px', borderRadius: 6, cursor: 'pointer', background: 'var(--accent)', border: 'none', color: 'var(--accent-text)', fontSize: 13, fontWeight: 500 }}>Add</button>
                  <button onClick={() => setAddingSub(false)} style={{ flexShrink: 0, padding: '10px 12px', borderRadius: 6, cursor: 'pointer', background: 'var(--bg-elevated)', border: '1px solid var(--border-strong)', color: 'var(--text-muted)', fontSize: 16 }}>×</button>
                </div>
              )}
            </div>

            <Sep />

            {/* 02 Chapter */}
            <div style={{ padding: 20, opacity: !subjectId ? 0.4 : 1, transition: 'opacity 0.2s', pointerEvents: !subjectId ? 'none' : 'auto' }}>
              <Label num="02">Chapter</Label>
              {!addingChap ? (
                <div style={{ display: 'flex', gap: 8 }}>
                  <select
  value={chapterId}
  onChange={e => setChapterId(e.target.value)}
  style={{ ...selectStyle, colorScheme: 'dark' }}
>
  <option value="">Select chapter...</option>
  {chapters.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
</select>
                  <button
                    onClick={() => setAddingChap(true)}
                    style={{
                      flexShrink: 0, padding: '10px 14px', borderRadius: 6, cursor: 'pointer',
                      background: 'var(--bg-elevated)', border: '1px solid var(--border-strong)',
                      color: 'var(--text-secondary)', fontSize: 16, lineHeight: 1,
                    }}
                    title="Add new chapter"
                  >+</button>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    autoFocus
                    value={newChapter}
                    onChange={e => setNewChapter(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') addChapter(); if (e.key === 'Escape') setAddingChap(false) }}
                    placeholder="Chapter name..."
                    style={inputStyle}
                  />
                  <button onClick={addChapter} style={{ flexShrink: 0, padding: '10px 14px', borderRadius: 6, cursor: 'pointer', background: 'var(--accent)', border: 'none', color: 'var(--accent-text)', fontSize: 13, fontWeight: 500 }}>Add</button>
                  <button onClick={() => setAddingChap(false)} style={{ flexShrink: 0, padding: '10px 12px', borderRadius: 6, cursor: 'pointer', background: 'var(--bg-elevated)', border: '1px solid var(--border-strong)', color: 'var(--text-muted)', fontSize: 16 }}>×</button>
                </div>
              )}
            </div>

            <Sep />

            {/* 03 File */}
            <div style={{ padding: 20, opacity: !chapterId ? 0.4 : 1, transition: 'opacity 0.2s', pointerEvents: !chapterId ? 'none' : 'auto' }}>
              <Label num="03">File</Label>

              {!file ? (
                <div
                  onDragOver={e => { e.preventDefault(); setDragging(true) }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileRef.current?.click()}
                  style={{
                    border: `1px dashed ${dragging ? 'var(--accent)' : 'var(--border-strong)'}`,
                    borderRadius: 6, padding: '32px 20px',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                    cursor: 'pointer', transition: 'border-color 0.15s, background 0.15s',
                    background: dragging ? 'var(--accent-subtle)' : 'transparent',
                  }}
                >
                  <span style={{ fontSize: 28, opacity: 0.4 }}>↑</span>
                  <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)', fontFamily: 'DM Sans, sans-serif', textAlign: 'center' }}>
                    Drop file here or <span style={{ color: 'var(--accent)', textDecoration: 'underline' }}>browse</span>
                  </p>
                  <p style={{ margin: 0, fontSize: 11, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>
                    PDF · JPG · PNG · WEBP — max 20MB
                  </p>
                  <input
                    ref={fileRef}
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.webp"
                    style={{ display: 'none' }}
                    onChange={e => { if (e.target.files[0]) validateAndSetFile(e.target.files[0]) }}
                  />
                </div>
              ) : (
                <div style={{
                  border: '1px solid var(--border-strong)', borderRadius: 6,
                  padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12,
                  background: 'var(--bg-elevated)',
                }}>
                  <span style={{ fontSize: 20 }}>{file.type === 'application/pdf' ? '📄' : '🖼️'}</span>
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <p style={{ margin: 0, fontSize: 13, color: 'var(--text-primary)', fontFamily: 'DM Sans, sans-serif', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</p>
                    <p style={{ margin: 0, fontSize: 11, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  <button
                    onClick={() => setFile(null)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 18, lineHeight: 1, padding: 4 }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                  >×</button>
                </div>
              )}
            </div>

            <Sep />

            {/* Submit */}
            <div style={{ padding: '16px 20px' }}>
              {error && <p style={{ fontSize: 12, color: '#f87171', fontFamily: 'DM Sans, sans-serif', marginBottom: 10 }}>{error}</p>}
              <button
                onClick={handleUpload}
                disabled={!canUpload}
                style={{
                  width: '100%', padding: '12px',
                  background: canUpload ? 'var(--accent)' : 'var(--bg-elevated)',
                  color: canUpload ? 'var(--accent-text)' : 'var(--text-muted)',
                  border: 'none', borderRadius: 6,
                  cursor: canUpload ? 'pointer' : 'not-allowed',
                  fontSize: 13, fontWeight: 500, fontFamily: 'DM Sans, sans-serif',
                  letterSpacing: '0.06em', transition: 'opacity 0.15s, background 0.2s',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}
                onMouseEnter={e => { if (canUpload) e.currentTarget.style.opacity = '0.8' }}
                onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
              >
                {loading ? (
                  <>
                    <div style={{ width: 14, height: 14, border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                    UPLOADING...
                  </>
                ) : canUpload ? 'UPLOAD & PROCESS →' : 'COMPLETE ALL FIELDS TO UPLOAD'}
              </button>
            </div>

          </div>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}