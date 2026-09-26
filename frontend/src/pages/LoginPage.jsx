import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/auth.context'
import { useTheme } from '../theme/theme'
import { AlertCircle, Loader2, ArrowRight, Sun, Moon, ShieldCheck, Lock } from 'lucide-react'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const { isDark, toggleTheme } = useTheme()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      await login({ email, password })
      navigate('/dashboard')
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Login failed. Please check your credentials.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg text-text bg-dot-grid flex flex-col justify-between items-center p-4 sm:p-6 font-body transition-colors duration-200">
      
      {/* Top Bar with Theme Toggle */}
      <div className="w-full max-w-5xl flex items-center justify-between pt-2">
        <Link to="/" className="text-xs font-mono text-muted hover:text-text transition-colors flex items-center gap-1.5">
          <span>← Back to Landing</span>
        </Link>

        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-card bg-surface-2 border border-border hover:border-primary/50 text-text transition-all text-xs font-mono cursor-pointer"
        >
          {isDark ? (
            <>
              <Sun className="w-3.5 h-3.5 text-warning" />
              <span>Light</span>
            </>
          ) : (
            <>
              <Moon className="w-3.5 h-3.5 text-primary" />
              <span>Dark</span>
            </>
          )}
        </button>
      </div>

      {/* Main Centered Container */}
      <div className="w-full max-w-md my-auto py-8">
        
        {/* Top Brand Marker */}
        <div className="flex flex-col items-center mb-8">
          <Link to="/" className="flex items-center gap-3 no-underline group mb-2">
            <div className="w-10 h-10 bg-primary text-primary-fg rounded-card flex items-center justify-center font-head font-bold text-xl shadow-sm transition-transform group-hover:scale-105">
              ⚡
            </div>
            <div className="flex flex-col">
              <span className="font-head font-bold text-2xl leading-none text-text tracking-tight">
                OpsCopilot
              </span>
              <span className="text-[11px] font-mono text-muted mt-0.5">
                Process Mining & AI Telemetry
              </span>
            </div>
          </Link>
        </div>

        {/* Centered Login Card */}
        <div className="bg-surface border border-border rounded-card p-6 sm:p-8 shadow-card relative overflow-hidden transition-colors">
          
          {/* Subtle Ambient Accent Glow */}
          <div className="absolute -top-20 -right-20 w-44 h-44 bg-primary/10 rounded-full blur-2xl pointer-events-none" />

          <div className="text-center mb-6">
            <h1 className="font-head text-2xl font-bold text-text">Welcome Back</h1>
            <p className="text-xs sm:text-sm text-muted mt-1.5">
              Sign in to access your operational analytics workspace
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-5 p-3.5 bg-danger/10 border border-danger/30 rounded-input text-danger text-xs font-mono flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-muted mb-1.5 uppercase tracking-wider">
                Email Address
              </label>
              <input
                type="email"
                required
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="operator@company.com"
                className="w-full px-3.5 py-2.5 bg-surface-2 border border-border rounded-input text-sm text-text focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-body"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-mono text-muted uppercase tracking-wider">
                  Password
                </label>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-3.5 py-2.5 bg-surface-2 border border-border rounded-input text-sm text-text focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-body"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-primary text-primary-fg font-semibold rounded-card hover:bg-primary-hover transition-all flex items-center justify-center gap-2 shadow-sm text-sm mt-3 disabled:opacity-60 cursor-pointer group"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Telemetry</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Access Callout */}
          <div className="mt-5 p-3 rounded-card bg-surface-2/60 border border-border/80 flex items-center justify-between text-xs">
            <span className="text-muted">Want to preview first?</span>
            <Link to="/dashboard" className="text-primary font-semibold font-mono hover:underline">
              Try Demo Mode →
            </Link>
          </div>

          <div className="mt-6 pt-5 border-t border-border text-center text-xs text-muted">
            Don't have an account?{' '}
            <Link to="/signup" className="text-primary font-semibold hover:underline">
              Create an Account
            </Link>
          </div>

        </div>

        {/* Security & Grounded Assurance Note */}
        <div className="mt-6 flex items-center justify-center gap-2 text-xs font-mono text-muted">
          <ShieldCheck className="w-3.5 h-3.5 text-success" />
          <span>Encrypted Session • Deterministic SQL Auditing</span>
        </div>

      </div>

      {/* Footer Minimal */}
      <div className="text-[11px] font-mono text-muted pb-4">
        © {new Date().getFullYear()} OpsCopilot Inc. • Grounded Process Mining
      </div>

    </div>
  )
}
