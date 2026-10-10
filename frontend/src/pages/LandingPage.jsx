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

import { useReveal } from '../hooks/useReveal'



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

export default function LandingPage() {
  const { isDark, toggleTheme } = useTheme()
  const [selectedDatasetId, setSelectedDatasetId] = useState('orders')
  const [activeStepId, setActiveStepId] = useState(2) // Default to bottleneck step
  const [showSqlQuery, setShowSqlQuery] = useState(true)
  const [copiedSql, setCopiedSql] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

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
            <div className="w-8 h-8 rounded-lg overflow-hidden shadow-[0_0_20px_rgba(109,85,250,0.5)] transition-transform duration-200 group-hover:scale-105">
              <img src="/logo.png" alt="OpsCopilot" className="w-full h-full object-cover" />
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
        
        {/* Technical Platform Badge */}
        <div className={`inline-flex items-center gap-2 px-3.5 py-1 rounded-md text-xs font-mono mb-8 border ${
          isDark 
            ? 'bg-[#151422] border-[#222033] text-[#94A3B8]' 
            : 'bg-[#F1F3F9] border-[#E2E5EE] text-[#475569]'
        }`}>
          <Activity className="w-3.5 h-3.5 text-[#6D55FA]" />
          <span>PROCESS MINING & EVENT LOG TELEMETRY PLATFORM</span>
        </div>

        {/* Clear Technical Hero Title */}
        <h1 className={`font-head text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.15] mb-6 max-w-4xl ${
          isDark ? 'text-white' : 'text-[#0F0E17]'
        }`}>
          Real-Time Process Mining & <br className="hidden sm:block" />
          Operational Telemetry
        </h1>

        {/* Hero Subtitle */}
        <p className={`text-base sm:text-lg max-w-2xl leading-relaxed mb-10 ${
          isDark ? 'text-[#94A3B8]' : 'text-[#64748B]'
        }`}>
          Ingest transactional event logs, isolate hidden SLA bottlenecks across Order-to-Cash and IT workflows, and query operational state with fully audited Text-to-SQL traces.
        </p>

        {/* ── ACTION BUTTON CLUSTER ── */}
        <div className="flex flex-wrap items-center justify-center gap-3.5 mb-4">
          
          <Link
            to="/dashboard"
            className="px-7 py-3 rounded-xl bg-[#6D55FA] hover:bg-[#5B41E8] active:bg-[#4C34C7] text-white font-semibold text-sm transition-all duration-200 cursor-pointer inline-flex items-center gap-2 group shadow-sm"
          >
            <span>Explore Telemetry Console</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>

          <button
            onClick={() => scrollToSection('telemetry-workspace')}
            className={`px-6 py-3 rounded-xl font-medium text-sm transition-all duration-200 cursor-pointer inline-flex items-center gap-2 group border ${
              isDark 
                ? 'bg-[#151422] hover:bg-[#1E1C30] text-white border-[#2A2742]' 
                : 'bg-white hover:bg-[#F5F3FF] text-[#0F0E17] border-[#E2E5EE] shadow-2xs'
            }`}
          >
            <Play className="w-3.5 h-3.5 text-[#6D55FA] fill-current" />
            <span>Interactive Demo</span>
          </button>

          <Link
            to="/login"
            className={`px-6 py-3 rounded-xl font-medium text-sm transition-all duration-200 cursor-pointer border ${
              isDark 
                ? 'bg-[#0F0E17] hover:bg-[#151422] text-[#E2E8F0] border-[#222033]' 
                : 'bg-[#F1F3F9] hover:bg-white text-[#0F0E17] border-[#E2E5EE] shadow-2xs'
            }`}
          >
            Login
          </Link>

        </div>

        {/* Technical specs tag below buttons */}
        <p className={`text-xs font-mono mt-2 mb-14 ${isDark ? 'text-[#64748B]' : 'text-[#64748B]'}`}>
          IEEE 1849 XES / CSV • PostgreSQL Audited • Deterministic SQL
        </p>

        {/* ──────────────────────────────────────────────────────────────────────────
            HERO APP WINDOW MOCKUP
           ────────────────────────────────────────────────────────────────────────── */}
        <div className="w-full max-w-4xl relative mt-4 group">
          
          {/* Window Container */}
          <div className={`rounded-2xl overflow-hidden text-left border shadow-2xl transition-all duration-300 ${
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
                    <div className="w-7 h-7 rounded-lg overflow-hidden shrink-0 shadow-sm">
                      <img src="/logo.png" alt="OpsCopilot" className="w-full h-full object-cover" />
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
                    <div className="w-7 h-7 rounded-lg overflow-hidden shrink-0 shadow-sm">
                      <img src="/logo.png" alt="OpsCopilot" className="w-full h-full object-cover" />
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
          className={`rounded-3xl p-6 sm:p-8 md:p-10 relative overflow-hidden border shadow-xl transition-all duration-300 reveal-init ${
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
                <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 shadow-xs">
                  <img src="/logo.png" alt="OpsCopilot" className="w-full h-full object-cover" />
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
                      ? 'bg-[#6D55FA] text-white shadow-sm font-semibold'
                      : isDark ? 'text-[#94A3B8]' : 'text-[#64748B]'
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
                    className={`text-left p-4 rounded-xl border transition-all duration-200 relative flex flex-col justify-between cursor-pointer group ${
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
          
          <div className={`rounded-3xl p-7 transition-all duration-300 flex flex-col justify-between group border shadow-sm ${
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

          <div className={`rounded-3xl p-7 transition-all duration-300 flex flex-col justify-between group border shadow-sm ${
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

          <div className={`rounded-3xl p-7 transition-all duration-300 flex flex-col justify-between group border shadow-sm ${
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
            
            <div className={`p-5 rounded-2xl border flex flex-col justify-between ${
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

            <div className={`p-5 rounded-2xl border flex flex-col justify-between ${
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

            <div className={`p-5 rounded-2xl border flex flex-col justify-between ${
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

            <div className={`p-5 rounded-2xl border flex flex-col justify-between ${
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
        <div className={`relative rounded-3xl p-10 sm:p-14 overflow-hidden border shadow-lg transition-all duration-300 ${
          isDark 
            ? 'bg-[#0F0E17] border-[#222033]' 
            : 'bg-white border-[#E2E5EE]'
        }`}>
          
          <h2 className={`font-head text-3xl sm:text-4xl font-bold tracking-tight mb-3 relative z-10 ${
            isDark ? 'text-white' : 'text-[#0F0E17]'
          }`}>
            Inspect Operational Telemetry & Event Logs
          </h2>
          <p className={`text-sm sm:text-base max-w-xl mx-auto mb-8 relative z-10 ${
            isDark ? 'text-[#94A3B8]' : 'text-[#64748B]'
          }`}>
            Explore pre-loaded Order-to-Cash and IT Incident datasets in the interactive console, or create an account to configure your custom database connections.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3.5 relative z-10">
            <Link
              to="/dashboard"
              className="px-7 py-3 rounded-xl bg-[#6D55FA] hover:bg-[#5B41E8] text-white font-semibold text-sm transition-all shadow-sm cursor-pointer"
            >
              Launch Telemetry Console
            </Link>
            
            <Link
              to="/signup"
              className={`px-7 py-3 rounded-xl font-medium text-sm transition-all cursor-pointer border ${
                isDark 
                  ? 'bg-[#151422] hover:bg-[#1E1C30] text-white border-[#2A2742]' 
                  : 'bg-[#F1F3F9] hover:bg-white text-[#0F0E17] border-[#E2E5EE] shadow-2xs'
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-md overflow-hidden shrink-0 shadow-sm">
              <img src="/logo.png" alt="OpsCopilot" className="w-full h-full object-cover" />
            </div>
            <span className={`font-head font-semibold text-[16px] tracking-tight ${isDark ? 'text-white' : 'text-[#0F0E17]'}`}>
              OpsCopilot
            </span>
            <span className="text-[13px] font-normal text-[#64748B]">
              © {new Date().getFullYear()} OpsCopilot Inc.
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-[13px] font-medium">
            <Link to="/dashboard" className={`transition-colors ${isDark ? 'text-[#94A3B8] hover:text-white' : 'text-[#64748B] hover:text-[#0F0E17]'}`}>Try Demo</Link>
            <Link to="/login" className={`transition-colors ${isDark ? 'text-[#94A3B8] hover:text-white' : 'text-[#64748B] hover:text-[#0F0E17]'}`}>Login</Link>
            <Link to="/signup" className={`transition-colors ${isDark ? 'text-[#94A3B8] hover:text-white' : 'text-[#64748B] hover:text-[#0F0E17]'}`}>Signup</Link>
          </div>

        </div>
      </footer>

    </div>
  )
}
