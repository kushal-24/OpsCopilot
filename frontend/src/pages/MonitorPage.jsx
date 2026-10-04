import { useState } from 'react'
import { useQuery } from '@tanstack/react-query' // TanStack Query: handles cached data fetching & state for monitoring metrics and request logs
import * as monitoringApi from '../api/monitoring.api'
import MonitorKpis from '../components/monitor/MonitorKpis'
import MonitorCharts from '../components/monitor/MonitorCharts'
import MonitorLogTable from '../components/monitor/MonitorLogTable'
import { Activity, RefreshCw, AlertCircle } from 'lucide-react'

/**
 * MonitorPage — Main Phase 7 AI Telemetry & Monitoring Route (`/monitor`).
 * Connects TanStack Query hooks against /monitoring/overview and /monitoring/requests.
 */
export default function MonitorPage() {
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('all')

  // TanStack Query: Fetches aggregated monitoring overview (KPIs, latency trend, request volume trend) via GET /monitoring/overview.
  const {
    data: overviewData,
    isLoading: isOverviewLoading,
    isError: isOverviewError,
    refetch: refetchOverview,
    isRefetching: isOverviewRefetching,
  } = useQuery({
    queryKey: ['monitoringOverview'],
    queryFn: () => monitoringApi.getMonitoringOverview(),
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  })

  // TanStack Query: Fetches paginated AI request log entries via GET /monitoring/requests.
  const {
    data: requestLogData,
    isLoading: isRequestsLoading,
    refetch: refetchRequests,
  } = useQuery({
    queryKey: ['monitoringRequests', page, statusFilter],
    queryFn: () =>
      monitoringApi.getMonitoringRequests({
        page,
        pageSize: 10,
        status: statusFilter === 'all' ? undefined : statusFilter,
      }),
    staleTime: 1000 * 30, // 30 seconds cache
  })

  const handleRefreshAll = () => {
    refetchOverview()
    refetchRequests()
  }

  const handleStatusFilterChange = (nextStatus) => {
    setStatusFilter(nextStatus)
    setPage(1)
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 animate-fade-in-up">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Activity size={22} />
            </div>
            <h1 className="font-head text-2xl sm:text-3xl font-bold text-text tracking-tight">
              AI Monitoring & Telemetry
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-muted mt-1">
            Real-time observability into LLM request volume, response latency, token costs, and raw prompt logs
          </p>
        </div>

        <button
          onClick={handleRefreshAll}
          disabled={isOverviewLoading || isOverviewRefetching}
          className="px-3.5 py-2 rounded-card bg-surface border border-border text-xs font-medium text-text hover:bg-surface-2 flex items-center gap-2 shadow-sm transition-all duration-200 self-start sm:self-auto cursor-pointer disabled:opacity-50"
        >
          <RefreshCw size={14} className={isOverviewRefetching ? 'animate-spin text-primary' : ''} />
          <span>{isOverviewRefetching ? 'Refreshing...' : 'Refresh Metrics'}</span>
        </button>
      </div>

      {/* Error Alert Notice */}
      {isOverviewError && (
        <div className="rounded-card border border-danger/30 bg-danger/10 p-4 text-xs text-danger flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} />
            <span>Failed to connect to monitoring telemetry backend. Please ensure the server is running.</span>
          </div>
          <button
            onClick={handleRefreshAll}
            className="px-3 py-1 rounded-pill bg-surface text-danger border border-danger/40 hover:bg-danger/10 font-medium cursor-pointer"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* 1. Summary Observability Metric Cards */}
      <MonitorKpis
        summary={overviewData?.summary}
        isLoading={isOverviewLoading}
      />

      {/* 2. Latency & Volume Trend Charts */}
      <MonitorCharts
        latencyOverTime={overviewData?.latencyOverTime}
        requestVolumeOverTime={overviewData?.requestVolumeOverTime}
        isLoading={isOverviewLoading}
      />

      {/* 3. Paginated Raw Request Logs Table */}
      <MonitorLogTable
        requestLog={requestLogData}
        page={page}
        statusFilter={statusFilter}
        onPageChange={setPage}
        onStatusFilterChange={handleStatusFilterChange}
        isLoading={isRequestsLoading}
      />
    </div>
  )
}
