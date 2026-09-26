import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useTheme } from '../theme/theme'
import { 
  Sparkles, 
  ArrowRight, 
  Play, 
  Activity, 
  Database, 
  Cpu, 
  ChevronDown, 
  ChevronUp, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  Zap,
  Sun,
  Moon,
  TrendingDown,
  Layers,
  FileSpreadsheet,
  Check,
  Terminal,
  ShieldCheck,
  BarChart3,
  Copy,
  ExternalLink,
  Menu,
  X,
  Server,
  Code2
} from 'lucide-react'

// Custom hook for scroll-triggered reveals
function useReveal(threshold = 0.15) {
  const ref = useRef(null)
  const [isRevealed, setIsRevealed] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsRevealed(true)
          observer.unobserve(el)
        }
      },
      { threshold }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold])

  return [ref, isRevealed]
}



// Curated process mining demo datasets
const DATASETS = [
  {
    id: 'orders',
    label: 'Order-to-Cash',
    cases: '14,280 cases',
    events: '71,400 events',
    sla: '98.4%',
    cycleTime: '1.4 Days',
    cycleDiff: '18.2% faster',
    bottleneck: 'Manager Approval',
    steps: [
      { id: 0, name: 'Order Placed', avgTime: '0.2 hrs', durationHours: 0.2, status: 'normal', cases: 14280, p95: '0.5 hrs', dropoff: '0%' },
      { id: 1, name: 'Inventory Reserved', avgTime: '1.1 hrs', durationHours: 1.1, status: 'normal', cases: 14210, p95: '2.4 hrs', dropoff: '0.5%' },
      { id: 2, name: 'Manager Approval', avgTime: '3.8 days', durationHours: 91.2, status: 'bottleneck', cases: 13950, p95: '5.2 days', dropoff: '1.8%' },
      { id: 3, name: 'Dispatch & Shipping', avgTime: '4.5 hrs', durationHours: 4.5, status: 'normal', cases: 13800, p95: '8.0 hrs', dropoff: '1.1%' },
      { id: 4, name: 'Delivered & Settled', avgTime: '1.2 days', durationHours: 28.8, status: 'normal', cases: 13750, p95: '2.1 days', dropoff: '0.4%' }
    ],
    sql: `SELECT step_name, COUNT(case_id) AS total_cases, 
       ROUND(AVG(duration_seconds) / 86400.0, 2) AS avg_days_spent,
       ROUND(PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY duration_seconds) / 86400.0, 2) AS p95_days
FROM events 
WHERE dataset_id = 'order-to-cash'
GROUP BY step_name 
ORDER BY avg_days_spent DESC;`,
    copilotInsight: 'Manager Approval is your critical operational bottleneck. 13,950 cases spent an average of 3.8 days in this step (3.2x target SLA threshold). 41% of approvals idle on weekends without automatic routing. Introducing automated threshold approval for orders under $2,500 would reduce median cycle time by 64%.'
  },
  {
    id: 'incidents',
    label: 'IT Incident Triage',
    cases: '8,410 cases',
    events: '42,050 events',
    sla: '94.1%',
    cycleTime: '4.6 Hours',
    cycleDiff: '12.5% faster',
    bottleneck: 'Tier-2 Diagnostic',
    steps: [
      { id: 0, name: 'Incident Logged', avgTime: '0.1 hrs', durationHours: 0.1, status: 'normal', cases: 8410, p95: '0.3 hrs', dropoff: '0%' },
      { id: 1, name: 'Automated Triage', avgTime: '0.3 hrs', durationHours: 0.3, status: 'normal', cases: 8390, p95: '0.8 hrs', dropoff: '0.2%' },
      { id: 2, name: 'Tier-2 Diagnostic', avgTime: '3.1 hrs', durationHours: 3.1, status: 'bottleneck', cases: 7920, p95: '6.4 hrs', dropoff: '5.6%' },
      { id: 3, name: 'Patch Deployed', avgTime: '0.9 hrs', durationHours: 0.9, status: 'normal', cases: 7850, p95: '1.8 hrs', dropoff: '0.8%' },
      { id: 4, name: 'Incident Closed', avgTime: '0.2 hrs', durationHours: 0.2, status: 'normal', cases: 7840, p95: '0.5 hrs', dropoff: '0.1%' }
    ],
    sql: `SELECT step_name, 
       ROUND(AVG(duration_seconds) / 3600.0, 2) AS avg_hours,
       COUNT(*) FILTER (WHERE duration_seconds > 14400) AS breach_count
FROM events 
WHERE dataset_id = 'it-incident'
GROUP BY step_name
ORDER BY avg_hours DESC;`,
    copilotInsight: 'Tier-2 Diagnostic exhibits high latency variance. While median resolution is 3.1 hours, 95th percentile reaches 6.4 hours on database-related incidents due to missing runbook telemetry. Re-routing DB incidents directly to Database Ops prevents 180 annual SLA breaches.'
  }
]

// The Complete Electric Violet & Obsidian Color Palette System
const PALETTE_SHADES = [
  { step: '50', hex: '#F5F3FF', label: 'Violet Tint', use: 'Highlight overlays, subtle glows' },
  { step: '100', hex: '#EDE9FE', label: 'Violet Soft', use: 'Active badge backgrounds' },
  { step: '200', hex: '#DDD6FE', label: 'Violet Muted', use: 'Subtle interactive borders' },
  { step: '300', hex: '#C4B5FD', label: 'Violet Light', use: 'Secondary text accents' },
  { step: '400', hex: '#A78BFA', label: 'Violet Bright', use: 'Icon badges, active pill text' },
  { step: '500', hex: '#8B5CF6', label: 'Violet Vibrant', use: 'Glowing halos, hover accents' },
  { step: '600', hex: '#6D55FA', label: 'Primary Brand CTA', use: 'Hero button, main interactive trigger' },
  { step: '700', hex: '#5B41E8', label: 'Primary Hover', use: 'CTA hover and focus state' },
  { step: '800', hex: '#4C34C7', label: 'Primary Active', use: 'Pressed / active state' },
  { step: '900', hex: '#312082', label: 'Deep Violet', use: 'Tinted dark panel surfaces' },
  { step: '950', hex: '#1E134D', label: 'Void Violet', use: 'Ambient background glow base' },
]

const OBSIDIAN_SHADES = [
  { name: 'Canvas Void', hex: '#08070C', role: 'Dark mode main background depth' },
  { name: 'Obsidian Card', hex: '#0F0E17', role: 'Dark mode primary card & hero window' },
  { name: 'Elevated Panel', hex: '#151422', role: 'Dark mode sub-containers & inputs' },
  { name: 'Border Subtle', hex: '#222033', role: 'Dark mode dividers & borders' },
]

const LIGHT_SURFACE_SHADES = [
  { name: 'Canvas Modern Off-White', hex: '#F8F9FC', role: 'Light mode clean background depth' },
  { name: 'Surface Pure White', hex: '#FFFFFF', role: 'Light mode elevated card & window' },
  { name: 'Panel Sub-Container', hex: '#F1F3F9', role: 'Light mode sub-containers & metrics' },
  { name: 'Border Slate-Subtle', hex: '#E2E5EE', role: 'Light mode clean dividers & borders' },
]

export default function LandingPage() {
  const { isDark, toggleTheme } = useTheme()
  const [selectedDatasetId, setSelectedDatasetId] = useState('orders')
  const [activeStepId, setActiveStepId] = useState(2) // Default to bottleneck step
  const [showSqlQuery, setShowSqlQuery] = useState(true)
  const [copiedSql, setCopiedSql] = useState(false)
  const [copiedHex, setCopiedHex] = useState(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeSurfaceTab, setActiveSurfaceTab] = useState(isDark ? 'dark' : 'light')

  // Reveal hooks for sections
  const [heroRef, heroRevealed] = useReveal(0.05)
  const [workspaceRef, workspaceRevealed] = useReveal(0.1)
  const [paletteRef, paletteRevealed] = useReveal(0.1)
  const [capabilitiesRef, capabilitiesRevealed] = useReveal(0.1)
  const [architectureRef, architectureRevealed] = useReveal(0.1)
  const [ctaRef, ctaRevealed] = useReveal(0.1)

  const activeDataset = DATASETS.find(d => d.id === selectedDatasetId) || DATASETS[0]
  const currentStep = activeDataset.steps.find(s => s.id === activeStepId) || activeDataset.steps[0]

  const handleCopySql = () => {
    navigator.clipboard.writeText(activeDataset.sql)
    setCopiedSql(true)
    setTimeout(() => setCopiedSql(false), 2000)
  }

  const handleCopyHex = (hex) => {
    navigator.clipboard.writeText(hex)
    setCopiedHex(hex)
    setTimeout(() => setCopiedHex(null), 2000)
  }

  const scrollToSection = (id) => {
    setMobileMenuOpen(false)
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div className={`min-h-screen font-body relative overflow-x-hidden selection:bg-[#6D55FA] selection:text-white transition-colors duration-250 ${
      isDark ? 'bg-[#08070C] text-white' : 'bg-[#F8F9FC] text-[#0F0E17]'
    }`}>
      
      {/* ──────────────────────────────────────────────────────────────────────────
          ATMOSPHERIC AMBIENT PURPLE GLOWS WITH PARALLAX FLOAT
         ────────────────────────────────────────────────────────────────────────── */}
      <div className="glow-ambient-left" aria-hidden="true" />
      <div className="glow-ambient-right" aria-hidden="true" />
      <div className="glow-ambient-center" aria-hidden="true" />

      {/* ──────────────────────────────────────────────────────────────────────────
          STICKY MINIMAL NAVIGATION BAR
         ────────────────────────────────────────────────────────────────────────── */}
      <header className={`sticky top-0 z-50 backdrop-blur-xl border-b transition-all duration-200 ${
        isDark 
          ? 'bg-[#08070C]/80 border-[#222033]/80' 
          : 'bg-[#F8F9FC]/85 border-[#E2E5EE]/80'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 no-underline group">
            <div className="w-8 h-8 rounded-lg bg-[#6D55FA] flex items-center justify-center text-white font-bold text-sm shadow-[0_0_20px_rgba(109,85,250,0.5)] transition-transform duration-200 group-hover:scale-105">
              ⚡
            </div>
            <span className={`font-head font-bold text-xl tracking-tight transition-colors ${
              isDark ? 'text-white group-hover:text-white/90' : 'text-[#0F0E17] group-hover:text-[#6D55FA]'
            }`}>
              OpsCopilot
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className={`hidden md:flex items-center gap-8 text-sm font-medium ${
            isDark ? 'text-[#94A3B8]' : 'text-[#64748B]'
          }`}>
            <button 
              onClick={() => scrollToSection('telemetry-workspace')} 
              className={`transition-colors cursor-pointer ${isDark ? 'hover:text-white' : 'hover:text-[#0F0E17]'}`}
            >
              Interactive Console
            </button>
            <button 
              onClick={() => scrollToSection('palette-showcase')} 
              className={`transition-colors cursor-pointer ${isDark ? 'hover:text-white' : 'hover:text-[#0F0E17]'}`}
            >
              Color Palette
            </button>
            <button 
              onClick={() => scrollToSection('capabilities')} 
              className={`transition-colors cursor-pointer ${isDark ? 'hover:text-white' : 'hover:text-[#0F0E17]'}`}
            >
              Capabilities
            </button>
            <button 
              onClick={() => scrollToSection('architecture')} 
              className={`transition-colors cursor-pointer ${isDark ? 'hover:text-white' : 'hover:text-[#0F0E17]'}`}
            >
              Architecture
            </button>
          </nav>

          {/* Right Header Actions (Desktop: sm and above) */}
          <div className="hidden sm:flex items-center gap-3">
            
            <Link 
              to="/login" 
              className={`text-sm font-medium transition-colors px-3 py-1.5 rounded-full ${
                isDark 
                  ? 'text-[#94A3B8] hover:text-white' 
                  : 'text-[#64748B] hover:text-[#0F0E17]'
              }`}
            >
              Login
            </Link>

            <Link
              to="/dashboard"
              className="px-5 py-2.5 rounded-full bg-[#6D55FA] hover:bg-[#5B41E8] active:bg-[#4C34C7] text-white font-semibold text-sm transition-all duration-200 shadow-[0_0_24px_rgba(109,85,250,0.45)] hover:shadow-[0_0_32px_rgba(109,85,250,0.65)] hover:-translate-y-0.5 cursor-pointer inline-flex items-center gap-2"
            >
              <span>Try Demo</span>
            </Link>

            <button
              onClick={toggleTheme}
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
              aria-label="Toggle Theme"
              className={`p-2.5 rounded-full transition-colors cursor-pointer flex items-center justify-center border ${
                isDark 
                  ? 'bg-[#151422] border-[#222033] text-[#94A3B8] hover:text-white hover:border-[#6D55FA]/50' 
                  : 'bg-white border-[#E2E5EE] text-[#64748B] hover:text-[#0F0E17] hover:border-[#6D55FA] shadow-xs'
              }`}
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-[#6D55FA]" />}
            </button>
          </div>

          {/* Mobile Right Controls: Uncrowded Theme Switcher + Hamburger */}
          <div className="flex sm:hidden items-center gap-2">
            <button
              onClick={toggleTheme}
              aria-label="Toggle Theme"
              className={`p-2 rounded-full border transition-colors cursor-pointer flex items-center justify-center ${
                isDark 
                  ? 'bg-[#151422] border-[#222033] text-[#94A3B8]' 
                  : 'bg-white border-[#E2E5EE] text-[#64748B] shadow-2xs'
              }`}
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-[#6D55FA]" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`p-2 rounded-lg border transition-colors cursor-pointer flex items-center justify-center ${
                isDark 
                  ? 'border-[#222033] bg-[#151422] text-[#D1D5DB]' 
                  : 'border-[#E2E5EE] bg-white text-[#0F0E17] shadow-2xs'
              }`}
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className={`sm:hidden border-b px-5 py-5 space-y-4 shadow-xl ${
            isDark ? 'bg-[#0F0E17] border-[#222033]' : 'bg-white border-[#E2E5EE]'
          }`}>
            <Link
              to="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-3 px-4 rounded-full bg-[#6D55FA] hover:bg-[#5B41E8] text-white font-semibold text-sm text-center shadow-[0_0_20px_rgba(109,85,250,0.4)] flex items-center justify-center gap-2"
            >
              <span>Try Demo Mode</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <div className="space-y-1 pt-2">
              <button 
                onClick={() => scrollToSection('telemetry-workspace')} 
                className={`block w-full text-left py-2 px-1 text-sm font-medium rounded-lg ${isDark ? 'text-[#94A3B8] hover:text-white' : 'text-[#64748B] hover:text-[#0F0E17]'}`}
              >
                Interactive Console
              </button>
              <button 
                onClick={() => scrollToSection('palette-showcase')} 
                className={`block w-full text-left py-2 px-1 text-sm font-medium rounded-lg ${isDark ? 'text-[#94A3B8] hover:text-white' : 'text-[#64748B] hover:text-[#0F0E17]'}`}
              >
                Color Palette
              </button>
              <button 
                onClick={() => scrollToSection('capabilities')} 
                className={`block w-full text-left py-2 px-1 text-sm font-medium rounded-lg ${isDark ? 'text-[#94A3B8] hover:text-white' : 'text-[#64748B] hover:text-[#0F0E17]'}`}
              >
                Capabilities
              </button>
              <button 
                onClick={() => scrollToSection('architecture')} 
                className={`block w-full text-left py-2 px-1 text-sm font-medium rounded-lg ${isDark ? 'text-[#94A3B8] hover:text-white' : 'text-[#64748B] hover:text-[#0F0E17]'}`}
              >
                Architecture
              </button>
            </div>

            <div className={`pt-4 border-t flex items-center justify-between ${isDark ? 'border-[#222033]' : 'border-[#E2E5EE]'}`}>
              <Link 
                to="/login" 
                onClick={() => setMobileMenuOpen(false)}
                className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-[#0F0E17]'}`}
              >
                Login
              </Link>
              <Link 
                to="/signup" 
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-semibold text-[#6D55FA]"
              >
                Create Account
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* ──────────────────────────────────────────────────────────────────────────
          HERO SECTION (With subtle scroll-triggered reveal & animated entrance)
         ────────────────────────────────────────────────────────────────────────── */}
      <section 
        ref={heroRef}
        className={`relative z-10 pt-16 sm:pt-24 pb-16 sm:pb-24 px-4 sm:px-6 lg:px-8 text-center max-w-5xl mx-auto flex flex-col items-center reveal-init ${
          heroRevealed ? 'reveal-active' : ''
        }`}
      >
        
        {/* Live Feature Announcement Pill */}
        <div className={`inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full text-xs font-mono mb-8 shadow-sm backdrop-blur-md border transition-transform hover:scale-105 ${
          isDark 
            ? 'bg-[#151422]/90 border-[#2A2742] text-[#D1D5DB]' 
            : 'bg-white/90 border-[#E2E5EE] text-[#4A455A]'
        }`}>
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22C55E] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#22C55E]"></span>
          </span>
          <span className="text-[#16A34A] dark:text-[#22C55E] font-semibold">New:</span>
          <span>Grounded Process Mining 2.0 is live</span>
        </div>

        {/* Editorial Serif Hero Title */}
        <h1 className={`font-editorial text-5xl sm:text-6xl md:text-7xl font-normal tracking-tight leading-[1.12] mb-6 max-w-4xl ${
          isDark ? 'text-white' : 'text-[#0F0E17]'
        }`}>
          Your AI Process Copilot <br />
          <span className={`italic font-light ${isDark ? 'text-white/95' : 'text-[#2B273A]'}`}>
            That Never Sleeps
          </span>
        </h1>

        {/* Hero Subtitle */}
        <p className={`text-base sm:text-lg md:text-xl max-w-2xl leading-relaxed mb-10 font-normal ${
          isDark ? 'text-[#94A3B8]' : 'text-[#64748B]'
        }`}>
          OpsCopilot discovers bottlenecks, computes throughput telemetry, and answers operational questions with verifiable PostgreSQL trust panels.
        </p>

        {/* ── ACTION BUTTON CLUSTER (3 Decided Button Variants with smooth hover lift) ── */}
        <div className="flex flex-wrap items-center justify-center gap-3.5 mb-4">
          
          <Link
            to="/dashboard"
            className="px-7 py-3.5 rounded-full bg-[#6D55FA] hover:bg-[#5B41E8] active:bg-[#4C34C7] text-white font-semibold text-sm transition-all duration-200 shadow-[0_0_30px_rgba(109,85,250,0.5)] hover:shadow-[0_0_40px_rgba(109,85,250,0.75)] hover:-translate-y-0.5 cursor-pointer inline-flex items-center gap-2 group"
          >
            <span>Try Demo Mode</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>

          <button
            onClick={() => scrollToSection('telemetry-workspace')}
            className={`px-6 py-3.5 rounded-full font-medium text-sm transition-all duration-200 backdrop-blur-md cursor-pointer inline-flex items-center gap-2.5 group border hover:-translate-y-0.5 ${
              isDark 
                ? 'bg-[#151422]/90 hover:bg-[#1E1C30] text-white border-[#2A2742] hover:border-[#6D55FA]/50' 
                : 'bg-white hover:bg-[#F5F3FF] text-[#0F0E17] border-[#E2E5EE] hover:border-[#6D55FA] hover:text-[#6D55FA] shadow-xs'
            }`}
          >
            <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors ${
              isDark ? 'bg-white/10 text-white group-hover:bg-[#6D55FA]' : 'bg-[#6D55FA]/10 text-[#6D55FA] group-hover:bg-[#6D55FA] group-hover:text-white'
            }`}>
              <Play className="w-2.5 h-2.5 fill-current ml-0.5" />
            </div>
            <span>Watch Product Tour</span>
          </button>

          <Link
            to="/login"
            className={`px-6 py-3.5 rounded-full font-medium text-sm transition-all duration-200 cursor-pointer border hover:-translate-y-0.5 ${
              isDark 
                ? 'bg-[#0F0E17] hover:bg-[#151422] text-[#E2E8F0] border-[#222033] hover:border-[#94A3B8]/40' 
                : 'bg-[#F1F3F9] hover:bg-white text-[#0F0E17] border-[#E2E5EE] hover:border-[#6D55FA] shadow-2xs'
            }`}
          >
            Login
          </Link>

        </div>

        {/* Small reassurance tag below buttons */}
        <p className={`text-xs font-mono mt-2 mb-14 ${isDark ? 'text-[#64748B]' : 'text-[#64748B]'}`}>
          No credit card required • Instant interactive sandbox • Deterministic SQL
        </p>

        {/* ──────────────────────────────────────────────────────────────────────────
            HERO APP WINDOW MOCKUP (Hover Lift Micro-interaction)
           ────────────────────────────────────────────────────────────────────────── */}
        <div className="w-full max-w-4xl relative mt-4 group">
          
          {/* Behind-window ambient radial luminescence */}
          <div className="absolute -inset-4 bg-gradient-to-r from-[#6D55FA]/30 via-[#8B5CF6]/20 to-[#6D55FA]/30 rounded-3xl blur-3xl -z-10 opacity-70 transition-opacity duration-300 group-hover:opacity-90" />

          {/* Window Container */}
          <div className={`rounded-2xl overflow-hidden text-left border shadow-2xl transition-all duration-300 hover-card-lift ${
            isDark 
              ? 'bg-[#0F0E17] border-[#222033] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)]' 
              : 'bg-white border-[#E2E5EE] shadow-[0_25px_60px_-15px_rgba(27,24,48,0.1)]'
          }`}>
            
            {/* MacOS Window Top Header */}
            <div className={`px-5 py-3.5 border-b flex items-center justify-between ${
              isDark ? 'bg-[#0A0912] border-[#222033]' : 'bg-[#F1F3F9] border-[#E2E5EE]'
            }`}>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#FF5F56] border border-[#E0443E]" />
                <div className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123]" />
                <div className="w-3 h-3 rounded-full bg-[#27C93F] border border-[#1AAB29]" />
                <span className={`ml-3 text-xs font-mono ${isDark ? 'text-[#64748B]' : 'text-[#64748B]'}`}>
                  opscopilot-runtime / order-to-cash.stream
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-mono text-[11px] font-medium border ${
                  isDark 
                    ? 'bg-[#22C55E]/10 border-[#22C55E]/30 text-[#4ADE80]' 
                    : 'bg-[#16A34A]/10 border-[#16A34A]/30 text-[#16A34A]'
                }`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" />
                  Active Call
                </span>
              </div>
            </div>

            {/* Split Window Content: Left Chat stream vs Right Process Health panel */}
            <div className={`grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x ${
              isDark ? 'divide-[#222033]' : 'divide-[#E2E5EE]'
            }`}>
              
              {/* Left Column (8 cols): Conversational Copilot Stream */}
              <div className={`md:col-span-8 p-6 flex flex-col justify-between space-y-5 ${
                isDark ? 'bg-[#0F0E17]' : 'bg-white'
              }`}>
                
                {/* Channel Header */}
                <div className={`flex items-center justify-between pb-3 border-b ${
                  isDark ? 'border-[#222033]/60' : 'border-[#E2E5EE]'
                }`}>
                  <div>
                    <h3 className={`font-head font-bold text-sm ${isDark ? 'text-white' : 'text-[#0F0E17]'}`}>
                      Live Conversation
                    </h3>
                    <p className={`text-xs font-mono mt-0.5 ${isDark ? 'text-[#64748B]' : 'text-[#64748B]'}`}>
                      Dataset: Order-to-Cash • 14,280 events
                    </p>
                  </div>
                  <span className="text-xs font-mono text-[#6D55FA] bg-[#6D55FA]/10 px-2 py-0.5 rounded border border-[#6D55FA]/20">
                    Gemini 2.5 Flash
                  </span>
                </div>

                {/* Chat Bubbles */}
                <div className="space-y-4 text-xs leading-relaxed">
                  
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg bg-[#6D55FA] text-white flex items-center justify-center text-xs shrink-0 font-bold shadow-sm">
                      ⚡
                    </div>
                    <div className={`p-3.5 rounded-2xl rounded-tl-sm border max-w-lg shadow-xs ${
                      isDark 
                        ? 'bg-[#181628] border-[#2A2742] text-[#D1D5DB]' 
                        : 'bg-[#F8F9FC] border-[#E2E5EE] text-[#0F0E17]'
                    }`}>
                      Hello! This is OpsCopilot. I noticed you are analyzing the Order-to-Cash event pipeline. Would you like a cycle time breakdown across all 5 workflow steps?
                    </div>
                  </div>

                  <div className="flex items-start justify-end gap-3">
                    <div className={`p-3.5 rounded-2xl rounded-tr-sm border max-w-md shadow-xs ${
                      isDark 
                        ? 'bg-[#222038] border-[#332F52] text-white' 
                        : 'bg-[#EDE8FE] border-[#DDD6FE] text-[#0F0E17]'
                    }`}>
                      Yes, exactly. Which step is causing the biggest bottleneck and SLA breach right now?
                    </div>
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs shrink-0 font-bold ${
                      isDark ? 'bg-[#332F52] text-[#A78BFA]' : 'bg-[#DDD6FE] text-[#6D55FA]'
                    }`}>
                      OP
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg bg-[#6D55FA] text-white flex items-center justify-center text-xs shrink-0 font-bold shadow-sm">
                      ⚡
                    </div>
                    <div className={`p-3.5 rounded-2xl rounded-tl-sm border max-w-lg shadow-xs space-y-2 ${
                      isDark 
                        ? 'bg-[#181628] border-[#2A2742] text-[#D1D5DB]' 
                        : 'bg-[#F8F9FC] border-[#E2E5EE] text-[#0F0E17]'
                    }`}>
                      <p>
                        That's clear! <strong className={isDark ? 'text-white' : 'text-[#0F0E17]'}>Manager Approval</strong> is your primary bottleneck, averaging <span className="text-[#DC2626] dark:text-[#F87171] font-mono font-semibold">3.8 days</span> (3.2x above target SLA).
                      </p>
                      <div className={`p-2 rounded font-mono text-[11px] border ${
                        isDark 
                          ? 'bg-[#0A0912] border-[#222033] text-[#A78BFA]' 
                          : 'bg-white border-[#E2E5EE] text-[#6D55FA]'
                      }`}>
                        <code>SELECT step_name, AVG(duration_seconds)/86400 FROM events...</code>
                      </div>
                    </div>
                  </div>

                </div>

                <div className="pt-2">
                  <div className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl border text-xs ${
                    isDark 
                      ? 'bg-[#151422] border-[#222033] text-[#64748B]' 
                      : 'bg-[#F1F3F9] border-[#E2E5EE] text-[#64748B]'
                  }`}>
                    <span>Ask copilot anything about cycle time, dropoffs, or SQL...</span>
                    <span className={`font-mono text-[10px] px-1.5 py-0.5 rounded ${
                      isDark ? 'bg-[#222033] text-[#94A3B8]' : 'bg-white text-[#64748B] border border-[#E2E5EE]'
                    }`}>
                      ⏎ Enter
                    </span>
                  </div>
                </div>

              </div>

              {/* Right Column: Health Score & Telemetry Checklist with Animated Number Counter */}
              <div className={`md:col-span-4 p-6 flex flex-col justify-between space-y-6 ${
                isDark ? 'bg-[#13121F]' : 'bg-[#FAFAFD]'
              }`}>
                <div>
                  <span className={`text-xs font-mono uppercase tracking-wider block mb-1 ${
                    isDark ? 'text-[#64748B]' : 'text-[#64748B]'
                  }`}>
                    Process Health
                  </span>
                  
                  {/* Big Score */}
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className={`text-4xl font-extrabold font-head tracking-tight ${
                      isDark ? 'text-white' : 'text-[#0F0E17]'
                    }`}>
                      92
                    </span>
                    <span className="text-xs font-mono text-[#16A34A] dark:text-[#4ADE80] font-semibold flex items-center gap-1">
                      ↑ High Efficiency
                    </span>
                  </div>

                  <p className={`text-xs leading-relaxed ${isDark ? 'text-[#94A3B8]' : 'text-[#64748B]'}`}>
                    14,280 cases processed with 98.4% end-to-end SLA compliance.
                  </p>
                </div>

                {/* Qualification Checklist */}
                <div className={`space-y-3 pt-4 border-t ${isDark ? 'border-[#222033]' : 'border-[#E2E5EE]'}`}>
                  <span className={`text-xs font-mono uppercase tracking-wider block mb-2 ${
                    isDark ? 'text-[#64748B]' : 'text-[#64748B]'
                  }`}>
                    Verification
                  </span>

                  <div className={`flex items-center gap-2.5 text-xs ${isDark ? 'text-[#D1D5DB]' : 'text-[#0F0E17]'}`}>
                    <div className="w-4 h-4 rounded-full bg-[#6D55FA] text-white flex items-center justify-center text-[10px] shrink-0 font-bold shadow-sm">
                      ✓
                    </div>
                    <span>PostgreSQL DB Audited</span>
                  </div>

                  <div className={`flex items-center gap-2.5 text-xs ${isDark ? 'text-[#D1D5DB]' : 'text-[#0F0E17]'}`}>
                    <div className="w-4 h-4 rounded-full bg-[#6D55FA] text-white flex items-center justify-center text-[10px] shrink-0 font-bold shadow-sm">
                      ✓
                    </div>
                    <span>Bottleneck Isolated</span>
                  </div>

                  <div className={`flex items-center gap-2.5 text-xs ${isDark ? 'text-[#D1D5DB]' : 'text-[#0F0E17]'}`}>
                    <div className="w-4 h-4 rounded-full bg-[#6D55FA] text-white flex items-center justify-center text-[10px] shrink-0 font-bold shadow-sm">
                      ✓
                    </div>
                    <span>Deterministic SQL Trace</span>
                  </div>
                </div>

                <Link
                  to="/chat"
                  className={`w-full py-2.5 px-4 rounded-xl font-semibold text-xs text-center transition-all duration-200 shadow-sm block font-body cursor-pointer hover:-translate-y-0.5 ${
                    isDark 
                      ? 'bg-white hover:bg-white/90 text-[#08070C]' 
                      : 'bg-[#6D55FA] hover:bg-[#5B41E8] text-white'
                  }`}
                >
                  Open Copilot Chat
                </Link>

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* ──────────────────────────────────────────────────────────────────────────
          TRUSTED BY LOGO CLOUD
         ────────────────────────────────────────────────────────────────────────── */}
      <section className={`relative z-10 py-10 border-y text-center transition-colors ${
        isDark 
          ? 'border-[#222033]/60 bg-[#08070C]/60' 
          : 'border-[#E2E5EE] bg-[#F1F3F9]/60'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <p className={`text-xs font-mono uppercase tracking-widest mb-8 font-medium ${
            isDark ? 'text-[#64748B]' : 'text-[#64748B]'
          }`}>
            TRUSTED BY FAST-GROWING SAAS TEAMS & OPERATIONS LEADERS
          </p>

          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-14 md:gap-18 opacity-50 grayscale hover:grayscale-0 hover:opacity-90 transition-all duration-300">
            <div className={`flex items-center gap-2 text-xl font-bold font-head tracking-tight ${isDark ? 'text-white' : 'text-[#0F0E17]'}`}>
              <span className="font-extrabold text-2xl">stripe</span>
            </div>
            <div className={`flex items-center gap-1.5 text-xl font-bold font-head tracking-tight ${isDark ? 'text-white' : 'text-[#0F0E17]'}`}>
              <span>aws</span>
            </div>
            <div className={`flex items-center gap-2 text-lg font-bold font-head tracking-tight ${isDark ? 'text-white' : 'text-[#0F0E17]'}`}>
              <span>Intercom</span>
            </div>
            <div className={`flex items-center gap-2 text-lg font-bold font-head tracking-tight ${isDark ? 'text-white' : 'text-[#0F0E17]'}`}>
              <span>Figma</span>
            </div>
            <div className={`flex items-center gap-2 text-lg font-bold font-head tracking-tight ${isDark ? 'text-white' : 'text-[#0F0E17]'}`}>
              <span>HubSpot</span>
            </div>
            <div className={`flex items-center gap-2 text-lg font-bold font-head tracking-tight ${isDark ? 'text-white' : 'text-[#0F0E17]'}`}>
              <span>PostgreSQL</span>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────────────
          PROBLEM STATEMENT SECTION
         ────────────────────────────────────────────────────────────────────────── */}
      <section className="relative z-10 py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center">
        <h2 className={`font-editorial text-4xl sm:text-5xl md:text-6xl font-normal tracking-tight leading-[1.15] mb-6 ${
          isDark ? 'text-white' : 'text-[#0F0E17]'
        }`}>
          Scaling operations manually <br />
          <span className={`italic font-light ${isDark ? 'text-white/90' : 'text-[#3B354D]'}`}>
            is broken
          </span>
        </h2>
        <p className={`text-base sm:text-lg leading-relaxed max-w-2xl mx-auto ${
          isDark ? 'text-[#94A3B8]' : 'text-[#64748B]'
        }`}>
          Your analysts are overwhelmed, process bottlenecks slip through the cracks, and manual SQL queries take hours while operational cycle times degrade.
        </p>
      </section>

      {/* ──────────────────────────────────────────────────────────────────────────
          INTERACTIVE PROCESS MINING TELEMETRY WORKSPACE (Scroll Reveal)
         ────────────────────────────────────────────────────────────────────────── */}
      <section id="telemetry-workspace" className="relative z-10 py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        
        {/* Workspace Card */}
        <div 
          ref={workspaceRef}
          className={`rounded-3xl p-6 sm:p-8 md:p-10 relative overflow-hidden border shadow-xl transition-all duration-300 reveal-init hover-card-lift ${
            workspaceRevealed ? 'reveal-active' : ''
          } ${
            isDark 
              ? 'bg-[#0F0E17] border-[#222033] shadow-[0_20px_50px_rgba(0,0,0,0.8)]' 
              : 'bg-white border-[#E2E5EE] shadow-[0_20px_50px_rgba(27,24,48,0.08)]'
          }`}
        >
          
          <div className="absolute top-0 right-0 w-72 h-72 bg-[#6D55FA]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#8B5CF6]/10 rounded-full blur-3xl pointer-events-none" />

          {/* Console Header */}
          <div className={`flex flex-col md:flex-row md:items-center justify-between gap-5 border-b pb-6 mb-8 ${
            isDark ? 'border-[#222033]' : 'border-[#E2E5EE]'
          }`}>
            <div>
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                  isDark ? 'bg-[#6D55FA]/20 text-[#A78BFA]' : 'bg-[#6D55FA]/10 text-[#6D55FA]'
                }`}>
                  ⚡
                </div>
                <h2 className={`font-head text-xl sm:text-2xl font-bold tracking-tight ${
                  isDark ? 'text-white' : 'text-[#0F0E17]'
                }`}>
                  Process Mining Telemetry Console
                </h2>
              </div>
              <p className={`text-xs font-mono mt-1 ml-11 ${isDark ? 'text-[#64748B]' : 'text-[#64748B]'}`}>
                Select dataset & inspect workflow transitions with audited SQL
              </p>
            </div>

            {/* Dataset Picker Buttons */}
            <div className={`flex items-center gap-2 p-1.5 rounded-xl border self-start md:self-auto ${
              isDark ? 'bg-[#151422] border-[#222033]' : 'bg-[#F1F3F9] border-[#E2E5EE]'
            }`}>
              {DATASETS.map((ds) => (
                <button
                  key={ds.id}
                  onClick={() => {
                    setSelectedDatasetId(ds.id)
                    setActiveStepId(2)
                  }}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-medium transition-all duration-200 cursor-pointer ${
                    selectedDatasetId === ds.id
                      ? 'bg-[#6D55FA] text-white shadow-sm font-semibold scale-102'
                      : isDark ? 'text-[#94A3B8] hover:text-white' : 'text-[#64748B] hover:text-[#0F0E17]'
                  }`}
                >
                  {ds.label}
                </button>
              ))}
            </div>
          </div>

          {/* Step Pipeline Flow */}
          <div className="mb-8">
            <div className={`flex items-center justify-between mb-3 text-xs font-mono ${
              isDark ? 'text-[#64748B]' : 'text-[#64748B]'
            }`}>
              <span className="uppercase tracking-wider flex items-center gap-1.5 text-[#6D55FA] font-semibold">
                <Activity className="w-3.5 h-3.5" />
                <span>Workflow Step Discovery & Bottleneck Heatmap</span>
              </span>
              <span className="hidden sm:inline">Click any node to inspect SQL & duration</span>
            </div>

            {/* 5 Step Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
              {activeDataset.steps.map((step) => {
                const isSelected = activeStepId === step.id
                const isBottleneck = step.status === 'bottleneck'

                return (
                  <button
                    key={step.id}
                    onClick={() => setActiveStepId(step.id)}
                    className={`text-left p-4 rounded-xl border transition-all duration-200 relative flex flex-col justify-between cursor-pointer group hover:-translate-y-1 ${
                      isSelected
                        ? isDark 
                          ? 'bg-[#181628] border-[#6D55FA] shadow-[0_0_20px_rgba(109,85,250,0.3)] ring-1 ring-[#6D55FA]' 
                          : 'bg-[#F5F3FF] border-[#6D55FA] shadow-[0_4px_16px_rgba(109,85,250,0.15)] ring-1 ring-[#6D55FA]'
                        : isDark
                          ? 'bg-[#13121F] border-[#222033] hover:border-[#6D55FA]/40 hover:bg-[#151422]'
                          : 'bg-[#F8F9FC] border-[#E2E5EE] hover:border-[#6D55FA]/40 hover:bg-white'
                    }`}
                  >
                    {isBottleneck && (
                      <span className="absolute -top-2.5 right-2 bg-[#DC2626] text-white text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-1 shadow-sm animate-pulse">
                        <AlertTriangle className="w-2.5 h-2.5" />
                        Bottleneck
                      </span>
                    )}

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-[11px] font-mono ${isDark ? 'text-[#64748B]' : 'text-[#64748B]'}`}>
                          Step 0{step.id + 1}
                        </span>
                        <span className={`text-[10px] font-mono ${isDark ? 'text-[#94A3B8]' : 'text-[#64748B]'}`}>
                          {step.dropoff} drop
                        </span>
                      </div>
                      <div className={`font-head font-bold text-sm line-clamp-1 mb-2 ${
                        isDark ? 'text-white' : 'text-[#0F0E17]'
                      }`}>
                        {step.name}
                      </div>
                    </div>

                    <div className={`pt-2 border-t flex items-baseline justify-between ${
                      isDark ? 'border-[#222033]' : 'border-[#E2E5EE]'
                    }`}>
                      <span className={`text-[11px] font-mono ${isDark ? 'text-[#94A3B8]' : 'text-[#64748B]'}`}>Avg Time:</span>
                      <span className={`font-mono text-xs font-bold ${
                        isBottleneck ? 'text-[#DC2626] dark:text-[#F87171]' : isDark ? 'text-white' : 'text-[#0F0E17]'
                      }`}>
                        {step.avgTime}
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Selected Step Telemetry Inspection Panel */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            <div className={`lg:col-span-4 p-5 rounded-2xl border space-y-4 ${
              isDark ? 'bg-[#13121F] border-[#222033]' : 'bg-[#F8F9FC] border-[#E2E5EE]'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <span className={`text-[11px] font-mono uppercase ${isDark ? 'text-[#64748B]' : 'text-[#64748B]'}`}>
                    Selected Step Telemetry
                  </span>
                  <h4 className={`font-head font-bold text-base ${isDark ? 'text-white' : 'text-[#0F0E17]'}`}>
                    {currentStep.name}
                  </h4>
                </div>
                {currentStep.status === 'bottleneck' ? (
                  <span className="px-2.5 py-1 rounded-full bg-[#DC2626]/10 border border-[#DC2626]/30 text-[#DC2626] dark:text-[#F87171] text-xs font-mono font-semibold">
                    Critical SLA Risk
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-full bg-[#16A34A]/10 border border-[#16A34A]/30 text-[#16A34A] dark:text-[#4ADE80] text-xs font-mono font-semibold">
                    Normal Flow
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className={`p-3 rounded-xl border ${isDark ? 'bg-[#181628] border-[#2A2742]' : 'bg-white border-[#E2E5EE]'}`}>
                  <span className={`text-[10px] font-mono block ${isDark ? 'text-[#64748B]' : 'text-[#64748B]'}`}>SAMPLE VOLUME</span>
                  <span className={`font-head font-bold text-lg ${isDark ? 'text-white' : 'text-[#0F0E17]'}`}>
                    {currentStep.cases.toLocaleString()}
                  </span>
                </div>
                <div className={`p-3 rounded-xl border ${isDark ? 'bg-[#181628] border-[#2A2742]' : 'bg-white border-[#E2E5EE]'}`}>
                  <span className={`text-[10px] font-mono block ${isDark ? 'text-[#64748B]' : 'text-[#64748B]'}`}>95TH PERCENTILE</span>
                  <span className={`font-head font-bold text-lg ${
                    currentStep.status === 'bottleneck' ? 'text-[#DC2626] dark:text-[#F87171]' : isDark ? 'text-white' : 'text-[#0F0E17]'
                  }`}>
                    {currentStep.p95}
                  </span>
                </div>
              </div>

              <div className={`pt-3 border-t text-xs flex justify-between ${
                isDark ? 'border-[#222033] text-[#94A3B8]' : 'border-[#E2E5EE] text-[#64748B]'
              }`}>
                <span>Total Workflow Cases:</span>
                <strong className={isDark ? 'text-white' : 'text-[#0F0E17]'}>{activeDataset.cases}</strong>
              </div>
            </div>

            <div className={`lg:col-span-8 p-6 rounded-2xl border flex flex-col justify-between ${
              isDark ? 'bg-[#151422] border-[#2A2742]' : 'bg-white border-[#E2E5EE]'
            }`}>
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-2.5 py-1 rounded-full bg-[#6D55FA] text-white text-xs font-mono font-bold flex items-center gap-1.5 shadow-sm">
                    <Sparkles className="w-3 h-3" />
                    <span>AI COPILOT INSIGHT</span>
                  </span>
                  <span className={`text-xs font-mono ${isDark ? 'text-[#94A3B8]' : 'text-[#64748B]'}`}>
                    • Grounded on active transactional event log
                  </span>
                </div>

                <p className={`text-sm font-medium leading-relaxed mb-5 ${
                  isDark ? 'text-[#E2E8F0]' : 'text-[#0F0E17]'
                }`}>
                  "{activeDataset.copilotInsight}"
                </p>

                <div className={`rounded-xl overflow-hidden border ${
                  isDark ? 'bg-[#0A0912] border-[#2A2742]' : 'bg-[#F8F9FC] border-[#E2E5EE]'
                }`}>
                  <div className={`px-4 py-3 flex items-center justify-between text-xs font-mono border-b ${
                    isDark ? 'bg-[#13121F] border-[#222033] text-white' : 'bg-[#F1F3F9] border-[#E2E5EE] text-[#0F0E17]'
                  }`}>
                    <span className="flex items-center gap-2 font-semibold text-[#6D55FA]">
                      <Terminal className="w-3.5 h-3.5" />
                      <span>TRUST PANEL — VERIFIED SQL EXECUTED</span>
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleCopySql}
                        className={`text-[11px] font-mono px-2 py-0.5 rounded border transition-colors cursor-pointer flex items-center gap-1 ${
                          isDark 
                            ? 'text-[#94A3B8] hover:text-white border-[#222033] bg-[#0A0912]' 
                            : 'text-[#64748B] hover:text-[#0F0E17] border-[#E2E5EE] bg-white'
                        }`}
                      >
                        <Copy className="w-3 h-3" />
                        <span>{copiedSql ? 'Copied!' : 'Copy SQL'}</span>
                      </button>
                      <button
                        onClick={() => setShowSqlQuery(!showSqlQuery)}
                        className={`cursor-pointer p-0.5 ${isDark ? 'text-[#94A3B8] hover:text-white' : 'text-[#64748B] hover:text-[#0F0E17]'}`}
                        aria-label="Toggle SQL query"
                      >
                        {showSqlQuery ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {showSqlQuery && (
                    <div className={`p-4 font-mono text-xs overflow-x-auto max-h-40 ${
                      isDark ? 'text-[#E2E8F0] bg-[#0A0912]' : 'text-[#0F0E17] bg-[#F8F9FC]'
                    }`}>
                      <pre className="text-[#6D55FA] font-medium whitespace-pre-wrap leading-relaxed">
                        {activeDataset.sql}
                      </pre>
                    </div>
                  )}
                </div>
              </div>

              <div className={`mt-5 pt-4 border-t flex items-center justify-between text-xs ${
                isDark ? 'border-[#222033]' : 'border-[#E2E5EE]'
              }`}>
                <span className={`font-mono text-[11px] ${isDark ? 'text-[#64748B]' : 'text-[#64748B]'}`}>
                  Audited via PostgreSQL Execution Engine
                </span>
                <Link 
                  to="/chat" 
                  className="text-xs font-semibold text-[#6D55FA] hover:text-[#5B41E8] flex items-center gap-1 font-mono transition-colors"
                >
                  <span>Open Copilot Chat</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

          </div>

        </div>

      </section>

      {/* ──────────────────────────────────────────────────────────────────────────
          DEDICATED COLOR PALETTE & 3 BUTTON VARIANTS LABORATORY
         ────────────────────────────────────────────────────────────────────────── */}
      <section 
        id="palette-showcase" 
        ref={paletteRef}
        className={`relative z-10 py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto border-t reveal-init ${
          paletteRevealed ? 'reveal-active' : ''
        } ${isDark ? 'border-[#222033]/80' : 'border-[#E2E5EE]'}`}
      >
        
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#6D55FA]/10 border border-[#6D55FA]/30 text-xs font-mono text-[#6D55FA] mb-4">
            🎨 Design Template 2 Architecture
          </div>
          <h2 className={`font-editorial text-4xl sm:text-5xl font-normal tracking-tight mb-4 ${
            isDark ? 'text-white' : 'text-[#0F0E17]'
          }`}>
            Full Theme Palette & The 3 Standard Button Variants
          </h2>
          <p className={`text-sm sm:text-base leading-relaxed ${isDark ? 'text-[#94A3B8]' : 'text-[#64748B]'}`}>
            Click any swatch to copy its exact hex code. Below you can preview the 3 standardized button variants and the surface layer tokens for both Dark Obsidian and Crisp Light Mode.
          </p>
        </div>

        {/* 11-Step Electric Violet Shade Scale */}
        <div className={`rounded-3xl p-6 sm:p-8 mb-10 border shadow-lg transition-colors ${
          isDark ? 'bg-[#0F0E17] border-[#222033]' : 'bg-white border-[#E2E5EE]'
        }`}>
          <div className={`flex items-center justify-between mb-6 pb-4 border-b ${
            isDark ? 'border-[#222033]' : 'border-[#E2E5EE]'
          }`}>
            <div>
              <h3 className={`font-head font-bold text-lg ${isDark ? 'text-white' : 'text-[#0F0E17]'}`}>
                Electric Violet Scale (50 – 950)
              </h3>
              <p className={`text-xs font-mono ${isDark ? 'text-[#64748B]' : 'text-[#64748B]'}`}>
                Primary brand accent, interactive triggers, glowing halos, and Trust panel badges
              </p>
            </div>
            <span className="text-xs font-mono text-[#6D55FA] bg-[#6D55FA]/10 px-3 py-1 rounded-full border border-[#6D55FA]/20 font-bold">
              Primary: #6D55FA
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-11 gap-3">
            {PALETTE_SHADES.map((s) => {
              const isCopied = copiedHex === s.hex
              const isHeroCTA = s.step === '600'

              return (
                <button
                  key={s.step}
                  onClick={() => handleCopyHex(s.hex)}
                  className={`p-3 rounded-xl border text-left transition-all duration-200 cursor-pointer group flex flex-col justify-between relative hover:-translate-y-1 ${
                    isHeroCTA 
                      ? 'border-[#6D55FA] bg-[#6D55FA]/10 shadow-[0_0_15px_rgba(109,85,250,0.3)] ring-1 ring-[#6D55FA]' 
                      : isDark
                        ? 'border-[#222033] bg-[#13121F] hover:border-[#6D55FA]/50 hover:bg-[#151422]'
                        : 'border-[#E2E5EE] bg-[#F8F9FC] hover:border-[#6D55FA]/50 hover:bg-white'
                  }`}
                  title={`Click to copy ${s.hex}`}
                >
                  {isHeroCTA && (
                    <span className="absolute -top-2 left-2 bg-[#6D55FA] text-white text-[9px] font-mono px-1.5 py-0.2 rounded font-bold uppercase tracking-wider">
                      CTA
                    </span>
                  )}

                  <div 
                    className="w-full h-10 rounded-lg mb-2.5 shadow-inner transition-transform group-hover:scale-105"
                    style={{ backgroundColor: s.hex }}
                  />

                  <div>
                    <div className={`flex items-center justify-between text-[11px] font-mono font-bold ${
                      isDark ? 'text-white' : 'text-[#0F0E17]'
                    }`}>
                      <span>{s.step}</span>
                      <span className="text-[10px] text-[#6D55FA]">{isCopied ? 'Copied!' : s.hex}</span>
                    </div>
                    <div className={`text-[10px] mt-0.5 line-clamp-1 ${isDark ? 'text-[#64748B]' : 'text-[#64748B]'}`}>
                      {s.label}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* CTA Button Style Laboratory (3 Standard Variants + Surfaces) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-10">
          
          <div className={`lg:col-span-7 rounded-3xl p-6 sm:p-8 border ${
            isDark ? 'bg-[#0F0E17] border-[#222033]' : 'bg-white border-[#E2E5EE]'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <h3 className={`font-head font-bold text-lg ${isDark ? 'text-white' : 'text-[#0F0E17]'}`}>
                The 3 Standard Button Variants
              </h3>
              <span className="text-xs font-mono text-[#6D55FA] bg-[#6D55FA]/10 px-2.5 py-0.5 rounded-full border border-[#6D55FA]/20">
                Standardized
              </span>
            </div>
            <p className={`text-xs mb-6 ${isDark ? 'text-[#94A3B8]' : 'text-[#64748B]'}`}>
              Consistent interactive hierarchy across the application for high clarity and uniformity:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              <div className={`p-4 rounded-2xl border flex flex-col justify-between space-y-4 hover-card-lift ${
                isDark ? 'bg-[#13121F] border-[#222033]' : 'bg-[#F8F9FC] border-[#E2E5EE]'
              }`}>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`font-bold text-xs ${isDark ? 'text-white' : 'text-[#0F0E17]'}`}>01. Solid Violet</span>
                    <span className="text-[9px] font-mono text-[#16A34A] dark:text-[#4ADE80] font-bold">Primary</span>
                  </div>
                  <p className={`text-[11px] ${isDark ? 'text-[#64748B]' : 'text-[#64748B]'}`}>
                    Hero triggers, key form actions, and direct conversion.
                  </p>
                </div>
                <button className="w-full py-3 px-4 rounded-full bg-[#6D55FA] hover:bg-[#5B41E8] active:bg-[#4C34C7] text-white font-semibold text-xs transition-all shadow-[0_0_20px_rgba(109,85,250,0.4)] hover:shadow-[0_0_28px_rgba(109,85,250,0.65)] hover:-translate-y-0.5 cursor-pointer">
                  Request a Demo
                </button>
              </div>

              <div className={`p-4 rounded-2xl border flex flex-col justify-between space-y-4 hover-card-lift ${
                isDark ? 'bg-[#13121F] border-[#222033]' : 'bg-[#F8F9FC] border-[#E2E5EE]'
              }`}>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`font-bold text-xs ${isDark ? 'text-white' : 'text-[#0F0E17]'}`}>02. Luminescent Aura</span>
                    <span className="text-[9px] font-mono text-[#6D55FA] font-bold">Highlight</span>
                  </div>
                  <p className={`text-[11px] ${isDark ? 'text-[#64748B]' : 'text-[#64748B]'}`}>
                    Vibrant halo glow for key highlighted CTA sections.
                  </p>
                </div>
                <button className="w-full py-3 px-4 rounded-full bg-[#6D55FA] hover:bg-[#5B41E8] text-white font-semibold text-xs transition-all shadow-[0_0_30px_rgba(109,85,250,0.65)] hover:shadow-[0_0_40px_rgba(109,85,250,0.85)] hover:-translate-y-0.5 cursor-pointer">
                  Try Demo Mode →
                </button>
              </div>

              <div className={`p-4 rounded-2xl border flex flex-col justify-between space-y-4 hover-card-lift ${
                isDark ? 'bg-[#13121F] border-[#222033]' : 'bg-[#F8F9FC] border-[#E2E5EE]'
              }`}>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`font-bold text-xs ${isDark ? 'text-white' : 'text-[#0F0E17]'}`}>03. Outline Pill</span>
                    <span className="text-[9px] font-mono text-[#64748B] dark:text-[#94A3B8] font-bold">Secondary</span>
                  </div>
                  <p className={`text-[11px] ${isDark ? 'text-[#64748B]' : 'text-[#64748B]'}`}>
                    Dark glass fill in dark mode; crisp translucent pill in light mode.
                  </p>
                </div>
                <button className={`w-full py-3 px-4 rounded-full font-medium text-xs border transition-all cursor-pointer flex items-center justify-center gap-1.5 hover:-translate-y-0.5 ${
                  isDark 
                    ? 'bg-[#181628] hover:bg-[#201D36] text-white border-[#2A2742] hover:border-[#6D55FA]/60' 
                    : 'bg-white hover:bg-[#F5F3FF] text-[#0F0E17] border-[#E2E5EE] hover:border-[#6D55FA] hover:text-[#6D55FA]'
                }`}>
                  <Play className="w-3 h-3 fill-current text-[#6D55FA]" />
                  <span>Watch Tour</span>
                </button>
              </div>

            </div>
          </div>

          <div className={`lg:col-span-5 rounded-3xl p-6 sm:p-8 border flex flex-col justify-between ${
            isDark ? 'bg-[#0F0E17] border-[#222033]' : 'bg-white border-[#E2E5EE]'
          }`}>
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className={`font-head font-bold text-lg ${isDark ? 'text-white' : 'text-[#0F0E17]'}`}>
                  Surface Architecture
                </h3>
                
                <div className={`flex items-center p-1 rounded-lg border text-xs font-mono ${
                  isDark ? 'bg-[#151422] border-[#222033]' : 'bg-[#F1F3F9] border-[#E2E5EE]'
                }`}>
                  <button
                    onClick={() => setActiveSurfaceTab('dark')}
                    className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${
                      activeSurfaceTab === 'dark' ? 'bg-[#6D55FA] text-white font-bold' : isDark ? 'text-[#94A3B8]' : 'text-[#64748B]'
                    }`}
                  >
                    Dark Obsidian
                  </button>
                  <button
                    onClick={() => setActiveSurfaceTab('light')}
                    className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${
                      activeSurfaceTab === 'light' ? 'bg-[#6D55FA] text-white font-bold' : isDark ? 'text-[#94A3B8]' : 'text-[#64748B]'
                    }`}
                  >
                    Light Mode
                  </button>
                </div>
              </div>

              <p className={`text-xs mb-4 ${isDark ? 'text-[#94A3B8]' : 'text-[#64748B]'}`}>
                {activeSurfaceTab === 'dark' 
                  ? 'Engineered obsidian black layers for high-depth optical isolation:'
                  : 'Crisp modern off-white layers with purple atmospheric gradients:'}
              </p>

              <div className="space-y-2.5">
                {(activeSurfaceTab === 'dark' ? OBSIDIAN_SHADES : LIGHT_SURFACE_SHADES).map((surface) => (
                  <div 
                    key={surface.hex}
                    onClick={() => handleCopyHex(surface.hex)}
                    className={`p-2.5 rounded-xl border transition-all duration-200 flex items-center justify-between cursor-pointer group hover:-translate-y-0.5 ${
                      isDark 
                        ? 'border-[#222033] bg-[#13121F] hover:border-[#6D55FA]/50' 
                        : 'border-[#E2E5EE] bg-[#F8F9FC] hover:border-[#6D55FA]/50 hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className={`w-7 h-7 rounded-lg border shrink-0 shadow-sm ${
                          isDark ? 'border-[#222033]' : 'border-[#E2E5EE]'
                        }`}
                        style={{ backgroundColor: surface.hex }}
                      />
                      <div>
                        <div className={`text-xs font-bold transition-colors ${
                          isDark ? 'text-white group-hover:text-[#A78BFA]' : 'text-[#0F0E17] group-hover:text-[#6D55FA]'
                        }`}>
                          {surface.name}
                        </div>
                        <div className={`text-[10px] font-mono ${isDark ? 'text-[#64748B]' : 'text-[#64748B]'}`}>
                          {surface.role}
                        </div>
                      </div>
                    </div>
                    <span className={`text-xs font-mono ${
                      isDark ? 'text-[#94A3B8] group-hover:text-white' : 'text-[#64748B] group-hover:text-[#0F0E17]'
                    }`}>
                      {copiedHex === surface.hex ? 'Copied!' : surface.hex}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className={`pt-4 mt-4 border-t text-xs font-mono flex items-center justify-between ${
              isDark ? 'border-[#222033] text-[#64748B]' : 'border-[#E2E5EE] text-[#64748B]'
            }`}>
              <span>WCAG Contrast: {activeSurfaceTab === 'dark' ? '14.8:1 (AAA)' : '15.6:1 (AAA)'}</span>
              <span className="text-[#16A34A] dark:text-[#4ADE80]">✔ Verified</span>
            </div>
          </div>

        </div>

      </section>

      {/* ──────────────────────────────────────────────────────────────────────────
          CORE CAPABILITIES GRID (Staggered Reveal)
         ────────────────────────────────────────────────────────────────────────── */}
      <section 
        id="capabilities" 
        ref={capabilitiesRef}
        className={`relative z-10 py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto reveal-init ${
          capabilitiesRevealed ? 'reveal-active' : ''
        }`}
      >
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-mono text-[#6D55FA] uppercase tracking-wider font-semibold">
            ENGINEERED FOR PRODUCTION OPERATIONS
          </span>
          <h2 className={`font-editorial text-4xl sm:text-5xl font-normal tracking-tight mt-2 ${
            isDark ? 'text-white' : 'text-[#0F0E17]'
          }`}>
            Deterministic Process Intelligence
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className={`rounded-3xl p-7 transition-all duration-300 flex flex-col justify-between group border shadow-sm hover-card-lift ${
            isDark 
              ? 'bg-[#0F0E17] border-[#222033] hover:border-[#6D55FA]/50' 
              : 'bg-white border-[#E2E5EE] hover:border-[#6D55FA]/50'
          }`}>
            <div>
              <div className="w-11 h-11 rounded-2xl bg-[#6D55FA]/15 text-[#6D55FA] flex items-center justify-center mb-5 transition-transform duration-200 group-hover:scale-110">
                <Activity className="w-5 h-5" />
              </div>
              <h3 className={`font-head text-lg font-bold mb-2.5 ${isDark ? 'text-white' : 'text-[#0F0E17]'}`}>
                Event Log Process Diagnostics
              </h3>
              <p className={`text-sm leading-relaxed ${isDark ? 'text-[#94A3B8]' : 'text-[#64748B]'}`}>
                Ingest CSV dumps and ERP transactional logs to reconstruct end-to-end case journeys. Automatically uncover hidden rework loops, step duration variance, and structural process bottlenecks.
              </p>
            </div>
            <div className={`mt-8 pt-4 border-t font-mono text-xs text-[#6D55FA] font-semibold flex items-center justify-between ${
              isDark ? 'border-[#222033]' : 'border-[#E2E5EE]'
            }`}>
              <span>Automatic KPI Synthesis</span>
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </div>
          </div>

          <div className={`rounded-3xl p-7 transition-all duration-300 flex flex-col justify-between group border shadow-sm hover-card-lift ${
            isDark 
              ? 'bg-[#0F0E17] border-[#222033] hover:border-[#6D55FA]/50' 
              : 'bg-white border-[#E2E5EE] hover:border-[#6D55FA]/50'
          }`}>
            <div>
              <div className="w-11 h-11 rounded-2xl bg-[#6D55FA]/15 text-[#6D55FA] flex items-center justify-center mb-5 transition-transform duration-200 group-hover:scale-110">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className={`font-head text-lg font-bold mb-2.5 ${isDark ? 'text-white' : 'text-[#0F0E17]'}`}>
                Grounded AI Copilot with Trust Panels
              </h3>
              <p className={`text-sm leading-relaxed ${isDark ? 'text-[#94A3B8]' : 'text-[#64748B]'}`}>
                Query operational event streams in plain conversational English. The built-in Trust Panel validates every answer with the exact audited SQL query executed on PostgreSQL—zero hallucinations.
              </p>
            </div>
            <div className={`mt-8 pt-4 border-t font-mono text-xs text-[#6D55FA] font-semibold flex items-center justify-between ${
              isDark ? 'border-[#222033]' : 'border-[#E2E5EE]'
            }`}>
              <span>Verifiable Text-to-SQL</span>
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </div>
          </div>

          <div className={`rounded-3xl p-7 transition-all duration-300 flex flex-col justify-between group border shadow-sm hover-card-lift ${
            isDark 
              ? 'bg-[#0F0E17] border-[#222033] hover:border-[#6D55FA]/50' 
              : 'bg-white border-[#E2E5EE] hover:border-[#6D55FA]/50'
          }`}>
            <div>
              <div className="w-11 h-11 rounded-2xl bg-[#16A34A]/15 text-[#16A34A] flex items-center justify-center mb-5 transition-transform duration-200 group-hover:scale-110">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className={`font-head text-lg font-bold mb-2.5 ${isDark ? 'text-white' : 'text-[#0F0E17]'}`}>
                Evaluation Runs & System Observability
              </h3>
              <p className={`text-sm leading-relaxed ${isDark ? 'text-[#94A3B8]' : 'text-[#64748B]'}`}>
                Benchmark LLM reasoning against 25 curated ground-truth operational questions. Track real-time response latency, token consumption, and per-query operational costs in production.
              </p>
            </div>
            <div className={`mt-8 pt-4 border-t font-mono text-xs text-[#16A34A] dark:text-[#4ADE80] font-semibold flex items-center justify-between ${
              isDark ? 'border-[#222033]' : 'border-[#E2E5EE]'
            }`}>
              <span>Automated Eval Benchmarks</span>
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </div>
          </div>

        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────────────
          ENTERPRISE ARCHITECTURE PIPELINE (Staggered Reveal)
         ────────────────────────────────────────────────────────────────────────── */}
      <section 
        id="architecture" 
        ref={architectureRef}
        className={`relative z-10 py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto reveal-init ${
          architectureRevealed ? 'reveal-active' : ''
        }`}
      >
        <div className={`rounded-3xl p-8 sm:p-10 border transition-colors ${
          isDark ? 'bg-[#0F0E17] border-[#222033]' : 'bg-white border-[#E2E5EE]'
        }`}>
          
          <div className="max-w-3xl mb-8">
            <span className="text-xs font-mono text-[#6D55FA] font-semibold uppercase tracking-wider">
              ENTERPRISE DATA ARCHITECTURE
            </span>
            <h3 className={`font-editorial text-3xl sm:text-4xl font-normal mt-1 ${
              isDark ? 'text-white' : 'text-[#0F0E17]'
            }`}>
              From Raw Event Traces to Verifiable Intelligence
            </h3>
            <p className={`text-sm mt-2 leading-relaxed ${isDark ? 'text-[#94A3B8]' : 'text-[#64748B]'}`}>
              OpsCopilot couples high-throughput analytical database aggregation with zero-hallucination generative AI reasoning.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            
            <div className={`p-5 rounded-2xl border flex flex-col justify-between hover-card-lift ${
              isDark ? 'bg-[#13121F] border-[#222033]' : 'bg-[#F8F9FC] border-[#E2E5EE]'
            }`}>
              <div>
                <div className={`text-xs font-mono mb-2 flex items-center gap-1.5 ${isDark ? 'text-[#64748B]' : 'text-[#64748B]'}`}>
                  <FileSpreadsheet className="w-3.5 h-3.5 text-[#6D55FA]" />
                  <span>01. Ingestion</span>
                </div>
                <div className={`font-head font-bold text-sm mb-1 ${isDark ? 'text-white' : 'text-[#0F0E17]'}`}>
                  CSV & Audit Streams
                </div>
                <div className={`text-xs ${isDark ? 'text-[#94A3B8]' : 'text-[#64748B]'}`}>
                  Upload raw Case ID, Activity, Timestamp, and Resource logs.
                </div>
              </div>
            </div>

            <div className={`p-5 rounded-2xl border flex flex-col justify-between hover-card-lift ${
              isDark ? 'bg-[#13121F] border-[#222033]' : 'bg-[#F8F9FC] border-[#E2E5EE]'
            }`}>
              <div>
                <div className={`text-xs font-mono mb-2 flex items-center gap-1.5 ${isDark ? 'text-[#64748B]' : 'text-[#64748B]'}`}>
                  <Database className="w-3.5 h-3.5 text-[#6D55FA]" />
                  <span>02. Analytics DB</span>
                </div>
                <div className={`font-head font-bold text-sm mb-1 ${isDark ? 'text-white' : 'text-[#0F0E17]'}`}>
                  PostgreSQL + Prisma
                </div>
                <div className={`text-xs ${isDark ? 'text-[#94A3B8]' : 'text-[#64748B]'}`}>
                  Normalized schema indexes cases, steps, durations, and transitions.
                </div>
              </div>
            </div>

            <div className={`p-5 rounded-2xl border flex flex-col justify-between hover-card-lift ${
              isDark ? 'bg-[#13121F] border-[#222033]' : 'bg-[#F8F9FC] border-[#E2E5EE]'
            }`}>
              <div>
                <div className={`text-xs font-mono mb-2 flex items-center gap-1.5 ${isDark ? 'text-[#64748B]' : 'text-[#64748B]'}`}>
                  <Cpu className="w-3.5 h-3.5 text-[#6D55FA]" />
                  <span>03. Copilot Engine</span>
                </div>
                <div className={`font-head font-bold text-sm mb-1 ${isDark ? 'text-white' : 'text-[#0F0E17]'}`}>
                  Gemini AI Agent
                </div>
                <div className={`text-xs ${isDark ? 'text-[#94A3B8]' : 'text-[#64748B]'}`}>
                  Translates questions into precise SQL queries & analytical reasoning.
                </div>
              </div>
            </div>

            <div className={`p-5 rounded-2xl border flex flex-col justify-between hover-card-lift ${
              isDark ? 'bg-[#13121F] border-[#222033]' : 'bg-[#F8F9FC] border-[#E2E5EE]'
            }`}>
              <div>
                <div className={`text-xs font-mono mb-2 flex items-center gap-1.5 ${isDark ? 'text-[#64748B]' : 'text-[#64748B]'}`}>
                  <Layers className="w-3.5 h-3.5 text-[#16A34A] dark:text-[#4ADE80]" />
                  <span>04. Telemetry UI</span>
                </div>
                <div className={`font-head font-bold text-sm mb-1 ${isDark ? 'text-white' : 'text-[#0F0E17]'}`}>
                  Interactive Dashboards
                </div>
                <div className={`text-xs ${isDark ? 'text-[#94A3B8]' : 'text-[#64748B]'}`}>
                  Grounded trust panels, process graph discovery, and monitoring.
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────────────
          BOTTOM CONVERSION BANNER (Scroll Reveal & Scale Lift)
         ────────────────────────────────────────────────────────────────────────── */}
      <section 
        ref={ctaRef}
        className={`relative z-10 py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center reveal-init ${
          ctaRevealed ? 'reveal-active' : ''
        }`}
      >
        <div className={`relative rounded-3xl p-10 sm:p-14 overflow-hidden shadow-2xl border transition-all duration-300 hover-card-lift ${
          isDark 
            ? 'bg-gradient-to-b from-[#151422] to-[#0A0912] border-[#2A2742]' 
            : 'bg-gradient-to-b from-white to-[#F1F3F9] border-[#E2E5EE]'
        }`}>
          
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#6D55FA]/30 rounded-full blur-3xl pointer-events-none" />

          <h2 className={`font-editorial text-4xl sm:text-5xl font-normal tracking-tight mb-4 relative z-10 ${
            isDark ? 'text-white' : 'text-[#0F0E17]'
          }`}>
            Ready to explore your operational telemetry?
          </h2>
          <p className={`text-sm sm:text-base max-w-xl mx-auto mb-8 relative z-10 ${
            isDark ? 'text-[#94A3B8]' : 'text-[#64748B]'
          }`}>
            Try demo mode immediately with pre-loaded transactional data, or create a free account to ingest your own event logs.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 relative z-10">
            <Link
              to="/dashboard"
              className="px-8 py-3.5 rounded-full bg-[#6D55FA] hover:bg-[#5B41E8] text-white font-semibold text-sm transition-all shadow-[0_0_35px_rgba(109,85,250,0.65)] hover:shadow-[0_0_45px_rgba(109,85,250,0.85)] hover:-translate-y-0.5 cursor-pointer"
            >
              Try Demo Mode Now
            </Link>
            
            <Link
              to="/signup"
              className={`px-8 py-3.5 rounded-full font-medium text-sm transition-all cursor-pointer border hover:-translate-y-0.5 ${
                isDark 
                  ? 'bg-[#181628] hover:bg-[#201D36] text-white border-[#2A2742]' 
                  : 'bg-white hover:bg-[#F5F3FF] text-[#0F0E17] border-[#E2E5EE] hover:border-[#6D55FA]'
              }`}
            >
              Create Account
            </Link>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────────────
          MINIMAL FOOTER
         ────────────────────────────────────────────────────────────────────────── */}
      <footer className={`relative z-10 border-t py-10 transition-colors ${
        isDark ? 'border-[#222033] bg-[#0A0912]' : 'border-[#E2E5EE] bg-[#F1F3F9]'
      }`}>
        <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs font-mono ${
          isDark ? 'text-[#64748B]' : 'text-[#64748B]'
        }`}>
          
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-md bg-[#6D55FA] text-white flex items-center justify-center font-bold text-xs shadow-sm">
              ⚡
            </div>
            <span className={`font-head font-bold text-sm ${isDark ? 'text-white' : 'text-[#0F0E17]'}`}>
              OpsCopilot
            </span>
            <span>© {new Date().getFullYear()} OpsCopilot Inc.</span>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <Link to="/dashboard" className={`transition-colors ${isDark ? 'hover:text-white' : 'hover:text-[#0F0E17]'}`}>Try Demo</Link>
            <Link to="/login" className={`transition-colors ${isDark ? 'hover:text-white' : 'hover:text-[#0F0E17]'}`}>Login</Link>
            <Link to="/signup" className={`transition-colors ${isDark ? 'hover:text-white' : 'hover:text-[#0F0E17]'}`}>Signup</Link>

            <span className="flex items-center gap-1.5 text-[#16A34A] dark:text-[#4ADE80]">
              <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
              <span>All Systems Operational</span>
            </span>
          </div>

        </div>
      </footer>

    </div>
  )
}
