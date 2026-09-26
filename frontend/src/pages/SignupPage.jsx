import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/auth.context'
import { useTheme } from '../theme/theme'
import * as authApi from '../api/auth.api'
import { AlertCircle, Loader2, ArrowRight, Sun, Moon, ShieldCheck, Check, Sparkles } from 'lucide-react'

export default function SignupPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const { isDark, toggleTheme } = useTheme()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      await authApi.signup({ fullName, email, password })
      await login({ email, password })
      navigate('/dashboard')
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Signup failed. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className={`min-h-screen flex flex-col justify-between items-center p-4 sm:p-6 font-body relative overflow-hidden selection:bg-[#6D55FA] selection:text-white transition-colors duration-250 ${
      isDark ? 'bg-[#08070C] text-white' : 'bg-[#F8F9FC] text-[#0F0E17]'
    }`}>
      
      {/* Ambient Violet Glow Lighting with Parallax Float */}
      <div className="glow-ambient-left" aria-hidden="true" />
      <div className="glow-ambient-right" aria-hidden="true" />

      {/* Top Header Row */}
      <div className="w-full max-w-5xl flex items-center justify-between pt-2 z-10">
        <Link 
          to="/" 
          className={`text-xs font-mono transition-all duration-200 flex items-center gap-1.5 group ${
            isDark ? 'text-[#94A3B8] hover:text-white' : 'text-[#64748B] hover:text-[#0F0E17]'
          }`}
        >
          <span className="transition-transform group-hover:-translate-x-1">←</span>
          <span>Back to Landing</span>
        </Link>

        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all duration-200 text-xs font-mono cursor-pointer hover:scale-105 ${
            isDark 
              ? 'bg-[#151422] border-[#222033] hover:border-[#6D55FA]/50 text-[#D1D5DB] hover:text-white' 
              : 'bg-white border-[#E2E5EE] hover:border-[#6D55FA] text-[#0F0E17] shadow-2xs'
          }`}
        >
          {isDark ? (
            <>
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              <span>Light</span>
            </>
          ) : (
            <>
              <Moon className="w-3.5 h-3.5 text-[#6D55FA]" />
              <span>Dark</span>
            </>
          )}
        </button>
      </div>

      {/* Main Centered Authentication Container */}
      <div className="w-full max-w-md my-auto py-10 z-10">
        
        {/* Brand Logo & Tagline */}
        <div className="flex flex-col items-center mb-8">
          <Link to="/" className="flex items-center gap-3 no-underline group mb-2">
            <div className="w-10 h-10 bg-[#6D55FA] text-white rounded-xl flex items-center justify-center font-bold text-lg shadow-[0_0_24px_rgba(109,85,250,0.5)] transition-transform duration-300 group-hover:scale-110">
              ⚡
            </div>
            <div className="flex flex-col">
              <span className={`font-head font-bold text-2xl leading-none tracking-tight ${
                isDark ? 'text-white' : 'text-[#0F0E17]'
              }`}>
                OpsCopilot
              </span>
              <span className={`text-[11px] font-mono mt-1 ${isDark ? 'text-[#64748B]' : 'text-[#64748B]'}`}>
                Process Mining & AI Telemetry
              </span>
            </div>
          </Link>
        </div>

        {/* Signup Card with Hover Lift & Smooth Entrance */}
        <div className={`rounded-3xl p-7 sm:p-9 relative overflow-hidden border shadow-xl transition-all duration-300 hover-card-lift ${
          isDark 
            ? 'bg-[#0F0E17] border-[#222033] shadow-[0_20px_50px_rgba(0,0,0,0.8)]' 
            : 'bg-white border-[#E2E5EE] shadow-[0_20px_50px_rgba(27,24,48,0.08)]'
        }`}>
          
          <div className="absolute -top-20 -right-20 w-44 h-44 bg-[#6D55FA]/20 rounded-full blur-2xl pointer-events-none" />

          <div className="text-center mb-7">
            <h1 className={`font-editorial text-3xl font-normal tracking-tight ${
              isDark ? 'text-white' : 'text-[#0F0E17]'
            }`}>
              Create your Account
            </h1>
            <p className={`text-xs sm:text-sm mt-1.5 font-normal ${isDark ? 'text-[#94A3B8]' : 'text-[#64748B]'}`}>
              Start analyzing process event logs with grounded AI intelligence
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3.5 bg-[#EF4444]/10 border border-[#EF4444]/30 rounded-xl text-[#DC2626] dark:text-[#F87171] text-xs font-mono flex items-start gap-2.5 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={`block text-xs font-mono mb-1.5 uppercase tracking-wider ${
                isDark ? 'text-[#94A3B8]' : 'text-[#64748B]'
              }`}>
                Full Name
              </label>
              <input
                type="text"
                required
                autoFocus
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Kushal Phadnis"
                className={`w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-[#6D55FA] focus:ring-2 focus:ring-[#6D55FA]/25 transition-all duration-200 font-body border ${
                  isDark 
                    ? 'bg-[#151422] border-[#222033] text-white placeholder-[#64748B]' 
                    : 'bg-[#F1F3F9] border-[#E2E5EE] text-[#0F0E17] placeholder-[#94A3B8]'
                }`}
              />
            </div>

            <div>
              <label className={`block text-xs font-mono mb-1.5 uppercase tracking-wider ${
                isDark ? 'text-[#94A3B8]' : 'text-[#64748B]'
              }`}>
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="operator@company.com"
                className={`w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-[#6D55FA] focus:ring-2 focus:ring-[#6D55FA]/25 transition-all duration-200 font-body border ${
                  isDark 
                    ? 'bg-[#151422] border-[#222033] text-white placeholder-[#64748B]' 
                    : 'bg-[#F1F3F9] border-[#E2E5EE] text-[#0F0E17] placeholder-[#94A3B8]'
                }`}
              />
            </div>

            <div>
              <label className={`block text-xs font-mono mb-1.5 uppercase tracking-wider ${
                isDark ? 'text-[#94A3B8]' : 'text-[#64748B]'
              }`}>
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className={`w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-[#6D55FA] focus:ring-2 focus:ring-[#6D55FA]/25 transition-all duration-200 font-body border ${
                  isDark 
                    ? 'bg-[#151422] border-[#222033] text-white placeholder-[#64748B]' 
                    : 'bg-[#F1F3F9] border-[#E2E5EE] text-[#0F0E17] placeholder-[#94A3B8]'
                }`}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-[#6D55FA] text-white font-semibold rounded-full hover:bg-[#5B41E8] active:bg-[#4C34C7] transition-all duration-200 flex items-center justify-center gap-2 shadow-[0_0_24px_rgba(109,85,250,0.4)] hover:shadow-[0_0_32px_rgba(109,85,250,0.65)] hover:-translate-y-0.5 text-sm mt-4 disabled:opacity-60 cursor-pointer group"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Create Account & Start</span>
                  <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>

          <div className={`mt-6 p-3.5 rounded-2xl border flex items-center justify-between text-xs ${
            isDark ? 'bg-[#13121F] border-[#222033]' : 'bg-[#F8F9FC] border-[#E2E5EE]'
          }`}>
            <span className={isDark ? 'text-[#94A3B8]' : 'text-[#64748B]'}>Want to test without account?</span>
            <Link to="/dashboard" className="text-[#6D55FA] hover:text-[#5B41E8] font-semibold font-mono flex items-center gap-1 transition-all group">
              <span>Try Demo Mode</span>
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </Link>
          </div>

          <div className={`mt-6 pt-5 border-t text-center text-xs ${
            isDark ? 'border-[#222033] text-[#94A3B8]' : 'border-[#E2E5EE] text-[#64748B]'
          }`}>
            Already have an account?{' '}
            <Link to="/login" className="text-[#6D55FA] hover:text-[#5B41E8] font-semibold transition-colors">
              Sign In
            </Link>
          </div>

        </div>

        <div className={`mt-6 flex items-center justify-center gap-2 text-xs font-mono ${
          isDark ? 'text-[#64748B]' : 'text-[#64748B]'
        }`}>
          <ShieldCheck className="w-3.5 h-3.5 text-[#16A34A] dark:text-[#22C55E]" />
          <span>Encrypted Session • Deterministic SQL Auditing</span>
        </div>

      </div>

      <div className={`text-[11px] font-mono pb-4 z-10 ${isDark ? 'text-[#64748B]' : 'text-[#64748B]'}`}>
        © {new Date().getFullYear()} OpsCopilot Inc. • Grounded Process Mining
      </div>

    </div>
  )
}
