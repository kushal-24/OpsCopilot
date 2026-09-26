import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query' // TanStack Query: handles cached data fetching & state for dashboard metrics
import { useAuth } from '../auth/auth.context'
import * as analyticsApi from '../api/analytics.api'
import DashboardInsight from '../components/dashboard/DashboardInsight'
import DashboardKpis from '../components/dashboard/DashboardKpis'
import DashboardCharts from '../components/dashboard/DashboardCharts'
import DashboardTables from '../components/dashboard/DashboardTables'
import { RefreshCw, PlayCircle, ShieldCheck, AlertCircle } from 'lucide-react'

/**
 * DashboardPage — Main Phase 4 OpsCopilot Dashboard.
 * Integrates TanStack Query hooks against /analytics/dashboard and /analytics/insight.
 * Supports demo mode flag for unauthenticated/demo visitors.
 */
export default function DashboardPage() {
  const { isAuthenticated } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const isDemo = searchParams.get('demo') === 'true' || !isAuthenticated

  // TanStack Query: Fetches aggregated dashboard metrics (KPIs, throughput, activity performance, slowest cases, breakdowns).
  const {
    data: dashboardData,
    isLoading: isDashboardLoading,
    isError: isDashboardError,
    refetch: refetchDashboard,
    isRefetching: isDashboardRefetching,
  } = useQuery({
    queryKey: ['dashboard', isDemo ? 'demo' : 'live'],
    queryFn: () => analyticsApi.getDashboard(isDemo ? { demo: true } : {}),
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  })

  // TanStack Query: Fetches Gemini plain-English process insight for the current dataset.
  const {
    data: insightData,
    isLoading: isInsightLoading,
    isError: isInsightError,
    refetch: refetchInsight,
  } = useQuery({
    queryKey: ['dashboardInsight', isDemo ? 'demo' : 'live'],
    queryFn: () => analyticsApi.getInsight(isDemo ? { demo: true } : {}),
    staleTime: 1000 * 60 * 10, // 10 minutes cache
  })

  const handleRefreshAll = () => {
    refetchDashboard()
    refetchInsight()
  }

  const toggleDemo = () => {
    if (isDemo) {
      searchParams.delete('demo')
    } else {
      searchParams.set('demo', 'true')
    }
    setSearchParams(searchParams)
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 animate-fade-in-up">
      {/* Demo Mode Banner (if active) */}
      {isDemo && (
        <div className="rounded-card border border-warning/30 bg-warning/10 p-3.5 px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-text transition-all">
          <div className="flex items-center gap-2.5">
            <PlayCircle size={18} className="text-warning animate-pulse" />
            <div>
              <span className="font-semibold text-warning">Demo Mode Active:</span>
              <span className="ml-1 text-muted">
                Rendering simulated operational process dataset. Authenticate to connect your custom data source.
              </span>
            </div>
          </div>
          {isAuthenticated && (
            <button
              onClick={toggleDemo}
              className="self-start sm:self-auto px-3 py-1 rounded-pill bg-surface border border-border text-xs font-medium hover:bg-surface-2 transition-all cursor-pointer"
            >
              Switch to Live Workspace
            </button>
          )}
        </div>
      )}

      {/* Header & Main Page Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-head text-2xl sm:text-3xl font-bold text-text tracking-tight">
              Operations Dashboard
            </h1>
            {isDemo ? (
              <span className="text-xs font-mono px-2.5 py-0.5 rounded-pill bg-warning/20 text-warning border border-warning/30 font-medium">
                Demo Environment
              </span>
            ) : (
              <span className="text-xs font-mono px-2.5 py-0.5 rounded-pill bg-success/15 text-success border border-success/30 font-medium flex items-center gap-1">
                <ShieldCheck size={12} /> Live Telemetry
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-muted mt-1">
            Real-time process mining, cycle-time telemetry, and Gemini AI bottleneck synthesis
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleRefreshAll}
            disabled={isDashboardLoading || isDashboardRefetching}
            className="px-3.5 py-2 rounded-card bg-surface border border-border text-xs font-medium text-text hover:bg-surface-2 flex items-center gap-2 shadow-sm transition-all duration-200 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw size={14} className={isDashboardRefetching ? 'animate-spin text-primary' : ''} />
            <span>{isDashboardRefetching ? 'Refreshing...' : 'Refresh Data'}</span>
          </button>
        </div>
      </div>

      {/* Main Dashboard Error Notice (if query fails) */}
      {isDashboardError && (
        <div className="rounded-card border border-danger/30 bg-danger/10 p-4 text-xs text-danger flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} />
            <span>Failed to connect to analytics telemetry backend. Please ensure the server is running.</span>
          </div>
          <button
            onClick={handleRefreshAll}
            className="px-3 py-1 rounded-pill bg-surface text-danger border border-danger/40 hover:bg-danger/10 font-medium cursor-pointer"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* 1. Gemini AI Insight Synthesis Banner */}
      <DashboardInsight
        insight={insightData}
        isLoading={isInsightLoading}
        isError={isInsightError}
        onRefresh={refetchInsight}
      />

      {/* 2. Telemetry KPI Metric Cards */}
      <DashboardKpis
        kpis={dashboardData?.kpis}
        isLoading={isDashboardLoading}
      />

      {/* 3. Throughput & Bottleneck Charts */}
      <DashboardCharts
        throughput={dashboardData?.throughput}
        activityPerformance={dashboardData?.activityPerformance}
        isLoading={isDashboardLoading}
      />

      {/* 4. Slowest Cases Table & Status/Priority Breakdowns */}
      <DashboardTables
        slowestCases={dashboardData?.slowestCases}
        statusBreakdown={dashboardData?.statusBreakdown}
        priorityBreakdown={dashboardData?.priorityBreakdown}
        isLoading={isDashboardLoading}
      />
    </div>
  )
}
