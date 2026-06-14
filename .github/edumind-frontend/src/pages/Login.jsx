import { useEffect, useRef } from 'react'

const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

// Floating particle for the background
function Particle({ style }) {
  return (
    <div
      className="absolute rounded-full pointer-events-none"
      style={style}
    />
  )
}

// Decorative geometric lines SVG
function GridLines() {
  return (
    <svg
      className="absolute inset-0 w-full h-full opacity-[0.04] pointer-events-none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
          <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#fbbf24" strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)" />
    </svg>
  )
}

// Radial glow orbs
function GlowOrbs() {
  return (
    <>
      {/* Top-left large orb */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: '-20%',
          left: '-15%',
          width: '55vw',
          height: '55vw',
          background: 'radial-gradient(circle, rgba(251,191,36,0.07) 0%, transparent 65%)',
          borderRadius: '50%',
          animation: 'glowPulse 4s ease-in-out infinite',
        }}
      />
      {/* Bottom-right orb */}
      <div
        className="absolute pointer-events-none"
        style={{
          bottom: '-25%',
          right: '-10%',
          width: '45vw',
          height: '45vw',
          background: 'radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 65%)',
          borderRadius: '50%',
          animation: 'glowPulse 6s ease-in-out infinite reverse',
        }}
      />
      {/* Centre subtle glow */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: '30%',
          left: '45%',
          width: '30vw',
          height: '30vw',
          background: 'radial-gradient(circle, rgba(251,191,36,0.04) 0%, transparent 70%)',
          borderRadius: '50%',
        }}
      />
    </>
  )
}

// Feature pill shown on the left panel
function FeaturePill({ icon, text, delay }) {
  return (
    <div
      className="opacity-0-init animate-fade-up flex items-center gap-3 bg-ink-700/60 border border-ink-500/50 rounded-full px-4 py-2 w-fit"
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'forwards' }}
    >
      <span className="text-amber-400 text-base">{icon}</span>
      <span className="text-slate-300 text-sm font-body font-medium">{text}</span>
    </div>
  )
}

export default function Login() {
  const handleGoogleLogin = () => {
    window.location.href = `${BACKEND_URL}/oauth2/authorization/google`
  }

  return (
    <div className="min-h-screen bg-ink-950 flex overflow-hidden relative">
      {/* ── Background layers ── */}
      <GlowOrbs />
      <GridLines />

      {/* Noise texture overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
        }}
      />

      {/* ── Left Panel — Hero / Branding ── */}
      <div className="hidden lg:flex flex-col justify-between w-[52%] p-16 relative z-10">
        {/* Logo */}
        <div
          className="opacity-0-init animate-fade-up flex items-center gap-3"
          style={{ animationDelay: '0ms', animationFillMode: 'forwards' }}
        >
          <div className="relative">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #f59e0b, #fbbf24)' }}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 2L12.5 7H17.5L13.5 10.5L15 15.5L10 12.5L5 15.5L6.5 10.5L2.5 7H7.5L10 2Z" fill="#09090f" />
              </svg>
            </div>
            <div className="absolute -inset-1 rounded-xl opacity-40 blur-md bg-amber-500 -z-10" />
          </div>
          <span className="font-display text-xl font-semibold text-slate-100 tracking-tight">
            EduMind
          </span>
        </div>

        {/* Main headline */}
        <div className="space-y-8">
          <div className="space-y-4">
            <div
              className="opacity-0-init animate-fade-up"
              style={{ animationDelay: '100ms', animationFillMode: 'forwards' }}
            >
              <span className="font-mono text-amber-500 text-sm tracking-widest uppercase">
                AI-Powered Study Assistant
              </span>
            </div>

            <h1
              className="opacity-0-init animate-fade-up font-display text-6xl xl:text-7xl leading-[1.1] text-slate-100"
              style={{ animationDelay: '200ms', animationFillMode: 'forwards' }}
            >
              Study{' '}
              <span
                className="italic"
                style={{
                  background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 60%, #fcd34d 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                smarter.
              </span>
              <br />
              <span className="text-slate-300">Not harder.</span>
            </h1>

            <p
              className="opacity-0-init animate-fade-up text-slate-400 text-lg font-body font-light leading-relaxed max-w-sm"
              style={{ animationDelay: '300ms', animationFillMode: 'forwards' }}
            >
              Upload your notes, get instant summaries, AI-generated flashcards,
              and a study companion that actually understands your syllabus.
            </p>
          </div>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-3">
            <FeaturePill icon="⚡" text="Instant AI summaries" delay={400} />
            <FeaturePill icon="🃏" text="Smart flashcards" delay={500} />
            <FeaturePill icon="💬" text="Chat with your notes" delay={600} />
            <FeaturePill icon="🌐" text="Community notes" delay={700} />
          </div>
        </div>

        {/* Bottom quote */}
        <div
          className="opacity-0-init animate-fade-up"
          style={{ animationDelay: '800ms', animationFillMode: 'forwards' }}
        >
          <p className="font-display text-slate-600 text-sm italic">
            "Education is not the filling of a pail, but the lighting of a fire."
          </p>
          <p className="text-slate-700 text-xs font-body mt-1">— W.B. Yeats</p>
        </div>
      </div>

      {/* ── Divider ── */}
      <div className="hidden lg:block w-px bg-gradient-to-b from-transparent via-ink-500/50 to-transparent self-stretch my-8 relative z-10" />

      {/* ── Right Panel — Login Card ── */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-16 relative z-10">
        <div
          className="opacity-0-init animate-fade-up w-full max-w-sm"
          style={{ animationDelay: '200ms', animationFillMode: 'forwards' }}
        >
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-3 mb-10 justify-center">
            <div className="relative">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #f59e0b, #fbbf24)' }}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M10 2L12.5 7H17.5L13.5 10.5L15 15.5L10 12.5L5 15.5L6.5 10.5L2.5 7H7.5L10 2Z" fill="#09090f" />
                </svg>
              </div>
            </div>
            <span className="font-display text-xl font-semibold text-slate-100">EduMind</span>
          </div>

          {/* Card */}
          <div
            className="relative rounded-2xl p-8"
            style={{
              background: 'linear-gradient(145deg, #16162a, #1e1e35)',
              border: '1px solid rgba(251,191,36,0.12)',
              boxShadow: '0 25px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(251,191,36,0.05) inset',
            }}
          >
            {/* Card top accent line */}
            <div
              className="absolute top-0 left-8 right-8 h-px rounded-full"
              style={{
                background: 'linear-gradient(90deg, transparent, rgba(251,191,36,0.4), transparent)',
              }}
            />

            <div className="space-y-6">
              <div className="space-y-1">
                <h2 className="font-display text-2xl font-semibold text-slate-100">
                  Welcome back
                </h2>
                <p className="text-slate-500 text-sm font-body">
                  Sign in to continue your studies
                </p>
              </div>

              {/* Divider with text */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-ink-500" />
                <span className="text-slate-600 text-xs font-body">continue with</span>
                <div className="flex-1 h-px bg-ink-500" />
              </div>

              {/* Google OAuth Button */}
              <button
                onClick={handleGoogleLogin}
                className="group relative w-full flex items-center justify-center gap-3 rounded-xl px-6 py-4 font-body font-medium text-slate-200 text-sm transition-all duration-300 overflow-hidden"
                style={{
                  background: 'linear-gradient(145deg, #1e1e35, #2a2a4a)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.border = '1px solid rgba(251,191,36,0.35)'
                  e.currentTarget.style.boxShadow = '0 4px 25px rgba(251,191,36,0.12), 0 0 0 1px rgba(251,191,36,0.08) inset'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.border = '1px solid rgba(255,255,255,0.1)'
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.3)'
                }}
              >
                {/* Hover shimmer */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                  style={{
                    background: 'linear-gradient(135deg, rgba(251,191,36,0.05) 0%, transparent 50%)',
                  }}
                />
                {/* Google logo SVG */}
                <svg width="20" height="20" viewBox="0 0 24 24" className="relative z-10 flex-shrink-0">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span className="relative z-10">Sign in with Google</span>
              </button>

              {/* Info text */}
              <p className="text-center text-slate-600 text-xs font-body leading-relaxed">
                For Indian university students. Your academic data stays private.
              </p>
            </div>

            {/* Card bottom accent */}
            <div
              className="absolute bottom-0 left-12 right-12 h-px rounded-full"
              style={{
                background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.2), transparent)',
              }}
            />
          </div>

          {/* Below card */}
          <div className="flex items-center justify-center gap-6 mt-8">
            {[
              { num: '10K+', label: 'Students' },
              { num: '50K+', label: 'Notes processed' },
              { num: '98%', label: 'Accuracy' },
            ].map(({ num, label }) => (
              <div key={label} className="text-center">
                <div className="font-display text-lg font-semibold text-amber-400/80">{num}</div>
                <div className="text-slate-600 text-xs font-body">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
