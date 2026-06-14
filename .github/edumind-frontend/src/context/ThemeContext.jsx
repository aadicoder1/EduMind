import { createContext, useContext, useState, useEffect } from 'react'

export const THEMES = {
  paper: {
    id: 'paper',
    label: 'Paper',
    description: 'Cream · default',
    '--bg-base':       '#f5f0e8',
    '--bg-surface':    '#ece7de',
    '--bg-elevated':   '#e4dfd6',
    '--bg-hover':      '#ddd8cf',
    '--border':        'rgba(0,0,0,0.10)',
    '--border-strong': 'rgba(0,0,0,0.18)',
    '--text-primary':  '#1a1a1a',
    '--text-secondary':'#5a5550',
    '--text-muted':    '#9e9992',
    '--accent':        '#1a1a1a',
    '--accent-text':   '#f5f0e8',
    '--accent-subtle': 'rgba(0,0,0,0.06)',
    '--separator':     'rgba(0,0,0,0.07)',
  },
  slate: {
    id: 'slate',
    label: 'Slate',
    description: 'Blue-grey · neutral',
    '--bg-base':       '#141b2d',
    '--bg-surface':    '#1c2333',
    '--bg-elevated':   '#232c3d',
    '--bg-hover':      '#2a3347',
    '--border':        'rgba(255,255,255,0.08)',
    '--border-strong': 'rgba(255,255,255,0.15)',
    '--text-primary':  '#e2e8f0',
    '--text-secondary':'#94a3b8',
    '--text-muted':    '#4a5568',
    '--accent':        '#e2e8f0',
    '--accent-text':   '#141b2d',
    '--accent-subtle': 'rgba(255,255,255,0.05)',
    '--separator':     'rgba(255,255,255,0.05)',
  },
  noir: {
    id: 'noir',
    label: 'Noir',
    description: 'True black · focus',
    '--bg-base':       '#0a0a0a',
    '--bg-surface':    '#111111',
    '--bg-elevated':   '#1c1c1c',
    '--bg-hover':      '#222222',
    '--border':        'rgba(255,255,255,0.07)',
    '--border-strong': 'rgba(255,255,255,0.14)',
    '--text-primary':  '#f0f0f0',
    '--text-secondary':'#888888',
    '--text-muted':    '#444444',
    '--accent':        '#f0f0f0',
    '--accent-text':   '#0a0a0a',
    '--accent-subtle': 'rgba(255,255,255,0.04)',
    '--separator':     'rgba(255,255,255,0.04)',
  },
  sage: {
    id: 'sage',
    label: 'Sage',
    description: 'Deep green · long sessions',
    '--bg-base':       '#081510',
    '--bg-surface':    '#0d1f1a',
    '--bg-elevated':   '#132a22',
    '--bg-hover':      '#1a3028',
    '--border':        'rgba(74,222,128,0.09)',
    '--border-strong': 'rgba(74,222,128,0.18)',
    '--text-primary':  '#d4eed8',
    '--text-secondary':'#6b9c78',
    '--text-muted':    '#2d5040',
    '--accent':        '#4ade80',
    '--accent-text':   '#081510',
    '--accent-subtle': 'rgba(74,222,128,0.07)',
    '--separator':     'rgba(74,222,128,0.05)',
  },
}

const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  const [themeId, setThemeId] = useState(() => {
    return localStorage.getItem('edumind-theme') || 'paper'
  })

  const theme = THEMES[themeId] || THEMES.paper

  useEffect(() => {
    const root = document.documentElement
    Object.entries(theme).forEach(([key, val]) => {
      if (key.startsWith('--')) root.style.setProperty(key, val)
    })
    localStorage.setItem('edumind-theme', themeId)
  }, [themeId, theme])

  const setTheme = (id) => {
    if (THEMES[id]) setThemeId(id)
  }

  return (
    <ThemeContext.Provider value={{ themeId, theme, setTheme, themes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
