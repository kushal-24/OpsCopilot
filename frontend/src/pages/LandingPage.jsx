import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTheme } from '../theme/theme'
import { 
  Sparkles, 
  ArrowRight, 
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
  GitBranch
} from 'lucide-react'

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

  const activeDataset = DATASETS.find(d => d.id === selectedDatasetId) || DATASETS[0]
  const currentStep = activeDataset.steps.find(s => s.id === activeStepId) || activeDataset.steps[0]

  const handleCopySql = () => {
    navigator.clipboard.writeText(activeDataset.sql)
    setCopiedSql(true)
    setTimeout(() => setCopiedSql(false), 2000)
  }

  return (
    <div className="min-h-screen bg-bg text-text bg-dot-grid flex flex-col font-body transition-colors duration-200">
      
      {/* ──────────────────────────────────────────────────────────────────────────
          HEADER & BRANDING
          Left: Logo + Title + Subtitle
          Right: Dark Mode Toggle + Telemetry Status Pill
         ────────────────────────────────────────────────────────────────────────── */}
      <header className="border-b border-border bg-surface/85 backdrop-blur-md sticky top-0 z-50 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          
          {/* Logo & Branding */}
          <Link to="/" className="flex items-center gap-3 no-underline group">
            <div className="w-9 h-9 bg-primary text-primary-fg rounded-card flex items-center justify-center font-head font-bold text-lg shadow-sm transition-transform group-hover:scale-105">
              ⚡
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-head font-bold text-xl leading-none text-text tracking-tight">
                  OpsCopilot
                </span>
                <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                  PRO
                </span>
              </div>
              <span className="text-[11px] font-mono text-muted tracking-wide mt-0.5 hidden sm:inline">
                Process Mining & AI Telemetry Engine
              </span>
            </div>
          </Link>

          {/* Right Header Cluster: Dark Mode Toggle & Live Telemetry Status */}
          <div className="flex items-center gap-3">
            
            {/* Live Telemetry Pulse */}
            <div className="hidden md:flex items-center gap-2 text-xs font-mono text-muted bg-surface-2 px-3 py-1.5 rounded-pill border border-border">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
              </span>
              <span>Telemetry Engine Live</span>
            </div>

            {/* Dark/Light Mode Switcher */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-card bg-surface-2 border border-border hover:border-primary/50 text-text transition-all text-xs font-mono cursor-pointer"
            >
              {isDark ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-warning" />
                  <span className="hidden sm:inline">Light</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-primary" />
                  <span className="hidden sm:inline">Dark</span>
                </>
              )}
            </button>
          </div>

        </div>
      </header>

      {/* ──────────────────────────────────────────────────────────────────────────
          MAIN CONTENT CONTAINER
         ────────────────────────────────────────────────────────────────────────── */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 pt-10 sm:pt-14 pb-20 flex flex-col gap-16">
        
        {/* ── SECTION 1: HERO SECTION ── */}
        <section className="text-center max-w-4xl mx-auto flex flex-col items-center">
          
          {/* AI Process Mining Pill */}
          <div className="inline-flex items-center gap-2 bg-ai-bg border border-ai-border text-ai-badge-bg px-4 py-1.5 rounded-pill text-xs font-mono font-medium mb-6 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 shrink-0" />
            <span>Grounded Process Mining & Autonomous Root-Cause Telemetry</span>
          </div>

          {/* Main Headline */}
          <h1 className="font-head text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.12] mb-6 text-text">
            Autonomous Insights for Ops Data & Workflow Event Logs
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg md:text-xl text-muted max-w-2xl leading-relaxed mb-8">
            Transform raw transactional event logs into instant bottleneck identification, throughput telemetry, and grounded AI copilot answers with verifiable SQL trust panels.
          </p>

          {/* Action Cluster — Preserves the Main 3 Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3.5 sm:gap-4 mb-6">
            <Link
              to="/dashboard"
              className="px-6 py-3.5 bg-primary text-primary-fg font-semibold rounded-card hover:bg-primary-hover transition-all flex items-center gap-2 shadow-sm text-sm font-body cursor-pointer group"
            >
              <span>Try Demo Mode</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </Link>

            <Link
              to="/login"
              className="px-6 py-3.5 bg-surface-2 text-text font-semibold rounded-card border border-border hover:bg-border transition-all text-sm font-body cursor-pointer"
            >
              Login
            </Link>

            <Link
              to="/signup"
              className="px-6 py-3.5 bg-transparent text-text font-semibold rounded-card border border-border hover:border-primary hover:text-primary transition-all text-sm font-body cursor-pointer"
            >
              Create Account
            </Link>
          </div>

          {/* Live Ingestion Ticker Bar */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-mono text-muted pt-2 border-t border-border/60">
            <span className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-success" />
              <span>CSV & Event Log Ingestion</span>
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-primary" />
              <span>100% Deterministic SQL Verification</span>
            </span>
            <span className="flex items-center gap-1.5">
              <TrendingDown className="w-3.5 h-3.5 text-warning" />
              <span>Instant Bottleneck Isolation</span>
            </span>
          </div>

        </section>

        {/* ── SECTION 2: INTERACTIVE PROCESS MINING TELEMETRY WORKSPACE ── */}
        <section className="w-full bg-surface border border-border rounded-card p-5 sm:p-7 md:p-8 shadow-card flex flex-col gap-6 relative overflow-hidden transition-colors">
          
          {/* Subtle Ambient Glowing Orbs */}
          <div className="absolute -top-32 -right-32 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-ai-badge-bg/10 rounded-full blur-3xl pointer-events-none" />

          {/* Workspace Top Header: Dataset Switcher + SLA Badge */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-5">
            
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded bg-primary/15 text-primary flex items-center justify-center font-mono text-sm font-bold">
                  ⚡
                </div>
                <div>
                  <h2 className="font-head text-lg sm:text-xl font-bold text-text">
                    Process Mining Telemetry Console
                  </h2>
                  <p className="text-xs font-mono text-muted mt-0.5">
                    Select dataset & inspect workflow transitions
                  </p>
                </div>
              </div>

              {/* Dataset Tabs */}
              <div className="flex items-center gap-1.5 bg-surface-2 p-1 rounded-card border border-border self-start sm:self-auto sm:ml-4">
                {DATASETS.map((ds) => (
                  <button
                    key={ds.id}
                    onClick={() => {
                      setSelectedDatasetId(ds.id)
                      setActiveStepId(2)
                    }}
                    className={`px-3 py-1 rounded text-xs font-mono font-medium transition-all cursor-pointer ${
                      selectedDatasetId === ds.id
                        ? 'bg-surface text-text shadow-sm border border-border font-semibold'
                        : 'text-muted hover:text-text'
                    }`}
                  >
                    {ds.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick SLA & Case Telemetry Pills */}
            <div className="flex items-center gap-2.5 self-start md:self-auto">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-pill bg-success/10 text-success border border-success/30 font-mono text-xs font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{activeDataset.sla} SLA Target</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-pill bg-surface-2 text-muted border border-border font-mono text-xs">
                <span>{activeDataset.cases}</span>
              </span>
            </div>

          </div>

          {/* Process Discovery Graph / Step Pipeline Flow */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs font-mono text-muted uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-primary" />
                <span>Workflow Step Discovery & Bottleneck Heatmap</span>
              </div>
              <span className="text-[11px] font-mono text-muted hidden sm:inline">
                Click any step to inspect duration & SQL
              </span>
            </div>

            {/* Interactive Step Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {activeDataset.steps.map((step, idx) => {
                const isSelected = activeStepId === step.id
                const isBottleneck = step.status === 'bottleneck'

                return (
                  <button
                    key={step.id}
                    onClick={() => setActiveStepId(step.id)}
                    className={`text-left p-3.5 rounded-card border transition-all relative flex flex-col justify-between cursor-pointer group ${
                      isSelected
                        ? 'bg-surface-2 border-primary shadow-ring ring-2 ring-primary/20'
                        : 'bg-surface-2/60 border-border hover:border-muted hover:bg-surface-2'
                    }`}
                  >
                    {/* Bottleneck Badge */}
                    {isBottleneck && (
                      <span className="absolute -top-2.5 right-2 bg-danger text-white text-[10px] font-mono px-2 py-0.5 rounded-pill font-bold uppercase tracking-wider flex items-center gap-1 shadow-sm">
                        <AlertTriangle className="w-2.5 h-2.5" />
                        Bottleneck
                      </span>
                    )}

                    <div>
                      <div className="flex items-center justify-between text-[11px] font-mono text-muted mb-1">
                        <span>Node 0{idx + 1}</span>
                        <span className="text-[10px] text-muted">{step.dropoff} drop</span>
                      </div>
                      <div className="font-head font-bold text-sm text-text mb-2 line-clamp-1 group-hover:text-primary transition-colors">
                        {step.name}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-border/80 flex items-center justify-between text-xs font-mono">
                      <span className="text-muted text-[11px]">Avg Latency</span>
                      <span className={`font-bold ${isBottleneck ? 'text-danger' : 'text-primary'}`}>
                        {step.avgTime}
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Dual Panel: Telemetry Diagnostics (Left) & Grounded AI Copilot (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            
            {/* Left: Cycle Time & Step Metrics (5 Cols) */}
            <div className="lg:col-span-5 bg-surface-2 border border-border rounded-card p-5 flex flex-col justify-between">
              
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono text-muted uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-primary" />
                    <span>Cycle Time Telemetry</span>
                  </span>
                  <span className="text-xs font-mono text-success font-semibold flex items-center gap-1">
                    <TrendingDown className="w-3 h-3" />
                    <span>{activeDataset.cycleDiff}</span>
                  </span>
                </div>

                <div className="flex items-baseline gap-3 mb-4">
                  <span className="font-head text-3xl font-extrabold text-text tracking-tight">
                    {activeDataset.cycleTime}
                  </span>
                  <span className="text-xs text-muted font-mono">End-to-end median</span>
                </div>

                {/* Selected Node Details Table */}
                <div className="space-y-2.5 pt-3 border-t border-border text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted">Selected Workflow Node:</span>
                    <span className="font-semibold text-text">{currentStep.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Node Average Latency:</span>
                    <span className={`font-mono font-bold ${currentStep.status === 'bottleneck' ? 'text-danger' : 'text-primary'}`}>
                      {currentStep.avgTime}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">95th Percentile (P95):</span>
                    <span className="font-mono text-muted">{currentStep.p95}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Cases Processed:</span>
                    <span className="font-mono font-semibold text-text">{currentStep.cases.toLocaleString()} cases</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Primary Bottleneck Flag:</span>
                    <span className="font-mono text-danger font-semibold">
                      {activeDataset.bottleneck}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-border flex items-center justify-between text-xs text-muted font-mono">
                <span className="flex items-center gap-1.5">
                  <Database className="w-3 h-3 text-primary" />
                  <span>PostgreSQL Analytical Store</span>
                </span>
                <span className="text-success font-semibold">100% Grounded</span>
              </div>

            </div>

            {/* Right: AI Copilot Purple Card with Grounded Trust Panel (7 Cols) */}
            <div className="lg:col-span-7 bg-ai-bg border border-ai-border rounded-card p-5 flex flex-col justify-between">
              
              <div>
                {/* Copilot Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="inline-flex items-center gap-1.5 bg-ai-badge-bg text-ai-badge-fg px-2.5 py-1 rounded-pill font-mono text-xs font-bold shadow-sm">
                    <Zap className="w-3 h-3" />
                    <span>AI COPILOT GROUNDED INSIGHT</span>
                  </div>
                  <span className="text-[11px] font-mono text-ai-badge-bg/90">
                    Model: Gemini Flash • Zero-Hallucination
                  </span>
                </div>

                {/* Copilot Diagnostic Insight */}
                <p className="text-sm font-medium text-text leading-relaxed mb-4">
                  "{activeDataset.copilotInsight}"
                </p>

                {/* Collapsible Verified SQL Trust Panel */}
                <div className="bg-surface border border-ai-border rounded-card overflow-hidden">
                  <div className="w-full px-3.5 py-2.5 bg-surface-2/90 flex items-center justify-between text-xs font-mono text-text border-b border-ai-border/60">
                    <span className="flex items-center gap-2 font-semibold text-primary">
                      <Terminal className="w-3.5 h-3.5" />
                      <span>TRUST PANEL — VERIFIED SQL EXECUTED</span>
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleCopySql}
                        className="text-[11px] font-mono text-muted hover:text-text px-2 py-0.5 rounded border border-border bg-surface transition-colors cursor-pointer"
                      >
                        {copiedSql ? 'Copied!' : 'Copy SQL'}
                      </button>
                      <button
                        onClick={() => setShowSqlQuery(!showSqlQuery)}
                        className="text-muted hover:text-text cursor-pointer p-0.5"
                        aria-label="Toggle SQL query"
                      >
                        {showSqlQuery ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {showSqlQuery && (
                    <div className="p-3.5 font-mono text-xs text-text bg-surface overflow-x-auto max-h-40">
                      <pre className="text-primary font-medium whitespace-pre-wrap leading-relaxed">
                        {activeDataset.sql}
                      </pre>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Card Footer */}
              <div className="mt-4 pt-3 border-t border-ai-border/60 flex items-center justify-between text-xs">
                <span className="font-mono text-[11px] text-muted">
                  Audited via PostgreSQL Execution Engine
                </span>
                <Link 
                  to="/chat" 
                  className="text-xs font-semibold text-ai-badge-bg hover:underline flex items-center gap-1 font-mono"
                >
                  <span>Open Copilot Chat</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

            </div>

          </div>

        </section>

        {/* ── SECTION 3: THREE-COLUMN CORE CAPABILITIES GRID ── */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: Process Mining & Discovery */}
          <div className="bg-surface border border-border rounded-card p-6 shadow-card hover:border-primary/50 transition-all flex flex-col justify-between group">
            <div>
              <div className="w-10 h-10 rounded-card bg-primary/10 text-primary flex items-center justify-center mb-4 transition-transform group-hover:scale-105">
                <Activity className="w-5 h-5" />
              </div>
              <h3 className="font-head text-lg font-bold text-text mb-2">
                Event Log Process Diagnostics
              </h3>
              <p className="text-sm text-muted leading-relaxed">
                Ingest CSV dumps and ERP transactional logs to reconstruct end-to-end case journeys. Automatically uncover hidden rework loops, step duration variance, and structural process bottlenecks.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-border font-mono text-xs text-primary font-semibold flex items-center justify-between">
              <span>Automatic KPI Synthesis</span>
              <span>→</span>
            </div>
          </div>

          {/* Card 2: Grounded AI Copilot */}
          <div className="bg-surface border border-border rounded-card p-6 shadow-card hover:border-primary/50 transition-all flex flex-col justify-between group">
            <div>
              <div className="w-10 h-10 rounded-card bg-ai-bg text-ai-badge-bg border border-ai-border flex items-center justify-center mb-4 transition-transform group-hover:scale-105">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="font-head text-lg font-bold text-text mb-2">
                Grounded AI Copilot with Trust Panels
              </h3>
              <p className="text-sm text-muted leading-relaxed">
                Query operational event streams in plain conversational English. The built-in Trust Panel validates every answer with the exact audited SQL query executed on PostgreSQL—zero hallucinations.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-border font-mono text-xs text-ai-badge-bg font-semibold flex items-center justify-between">
              <span>Verifiable Text-to-SQL</span>
              <span>→</span>
            </div>
          </div>

          {/* Card 3: Evaluations & Observability */}
          <div className="bg-surface border border-border rounded-card p-6 shadow-card hover:border-primary/50 transition-all flex flex-col justify-between group">
            <div>
              <div className="w-10 h-10 rounded-card bg-success/10 text-success flex items-center justify-center mb-4 transition-transform group-hover:scale-105">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="font-head text-lg font-bold text-text mb-2">
                Evaluation Runs & System Observability
              </h3>
              <p className="text-sm text-muted leading-relaxed">
                Benchmark LLM reasoning against 25 curated ground-truth operational questions. Track real-time response latency, token consumption, and per-query operational costs in production.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-border font-mono text-xs text-success font-semibold flex items-center justify-between">
              <span>Automated Eval Benchmarks</span>
              <span>→</span>
            </div>
          </div>

        </section>

        {/* ── SECTION 4: DATA MINING ARCHITECTURE PIPELINE ── */}
        <section className="bg-surface-2 border border-border rounded-card p-6 sm:p-8">
          <div className="max-w-3xl mb-6">
            <span className="text-xs font-mono text-primary font-semibold uppercase tracking-wider">
              ENTERPRISE DATA ARCHITECTURE
            </span>
            <h3 className="font-head text-xl font-bold text-text mt-1">
              From Raw Event Traces to Verifiable Operational Intelligence
            </h3>
            <p className="text-sm text-muted mt-1 leading-relaxed">
              OpsCopilot couples analytical database aggregation with generative AI reasoning.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            
            <div className="p-4 rounded-card bg-surface border border-border flex flex-col justify-between">
              <div className="text-xs font-mono text-muted mb-2 flex items-center gap-1.5">
                <FileSpreadsheet className="w-3.5 h-3.5 text-primary" />
                <span>01. Ingestion</span>
              </div>
              <div className="font-head font-bold text-sm text-text mb-1">CSV & Audit Streams</div>
              <div className="text-xs text-muted">Upload raw Case ID, Activity, Timestamp, and Resource logs.</div>
            </div>

            <div className="p-4 rounded-card bg-surface border border-border flex flex-col justify-between">
              <div className="text-xs font-mono text-muted mb-2 flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-primary" />
                <span>02. Analytics DB</span>
              </div>
              <div className="font-head font-bold text-sm text-text mb-1">PostgreSQL + Prisma</div>
              <div className="text-xs text-muted">Normalized schema indexes cases, steps, durations, and transitions.</div>
            </div>

            <div className="p-4 rounded-card bg-surface border border-border flex flex-col justify-between">
              <div className="text-xs font-mono text-muted mb-2 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-ai-badge-bg" />
                <span>03. Copilot Engine</span>
              </div>
              <div className="font-head font-bold text-sm text-text mb-1">Gemini AI Agent</div>
              <div className="text-xs text-muted">Translates questions into precise SQL queries & analytical reasoning.</div>
            </div>

            <div className="p-4 rounded-card bg-surface border border-border flex flex-col justify-between">
              <div className="text-xs font-mono text-muted mb-2 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-success" />
                <span>04. Telemetry UI</span>
              </div>
              <div className="font-head font-bold text-sm text-text mb-1">Interactive Dashboards</div>
              <div className="text-xs text-muted">Grounded trust panels, process graph discovery, and monitoring.</div>
            </div>

          </div>
        </section>

      </main>

      {/* ──────────────────────────────────────────────────────────────────────────
          FOOTER
         ────────────────────────────────────────────────────────────────────────── */}
      <footer className="border-t border-border bg-surface/60 py-8 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-muted">
          
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 bg-primary text-primary-fg rounded flex items-center justify-center font-bold text-xs">
              ⚡
            </div>
            <span className="font-head font-bold text-sm text-text">OpsCopilot</span>
            <span>© {new Date().getFullYear()} OpsCopilot Inc.</span>
          </div>

          <div className="flex flex-wrap items-center gap-5 sm:gap-6">
            <Link to="/dashboard" className="hover:text-text transition-colors">Try Demo</Link>
            <Link to="/login" className="hover:text-text transition-colors">Login</Link>
            <Link to="/signup" className="hover:text-text transition-colors">Signup</Link>
            
            <button
              onClick={toggleTheme}
              className="hover:text-text transition-colors flex items-center gap-1 cursor-pointer"
            >
              {isDark ? <Sun className="w-3 h-3 text-warning" /> : <Moon className="w-3 h-3 text-primary" />}
              <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
            </button>

            <span className="flex items-center gap-1.5 text-success font-semibold">
              <span className="w-2 h-2 rounded-full bg-success" />
              <span>All Systems Operational</span>
            </span>
          </div>

        </div>
      </footer>

    </div>
  )
}
