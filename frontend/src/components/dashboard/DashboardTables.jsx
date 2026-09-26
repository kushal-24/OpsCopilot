import { AlertCircle, ArrowUpRight, BarChart2 } from 'lucide-react'

/**
 * DashboardTables — Renders the slowest cases table alongside case status & priority breakdown distributions.
 */
export default function DashboardTables({ slowestCases = [], statusBreakdown = [], priorityBreakdown = [], isLoading }) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in-up">
        <div className="lg:col-span-2 rounded-card border border-border bg-surface p-6 shadow-card animate-pulse space-y-4">
          <div className="h-5 bg-surface-2 rounded w-1/4" />
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-10 bg-surface-2/60 rounded" />
            ))}
          </div>
        </div>
        <div className="rounded-card border border-border bg-surface p-6 shadow-card animate-pulse space-y-4">
          <div className="h-5 bg-surface-2 rounded w-1/3" />
          <div className="h-40 bg-surface-2/60 rounded" />
        </div>
      </div>
    )
  }

  const getPriorityStyle = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'critical':
        return 'bg-danger/10 text-danger border-danger/30'
      case 'high':
        return 'bg-warning/10 text-warning border-warning/30'
      case 'medium':
        return 'bg-primary/10 text-primary border-primary/30'
      default:
        return 'bg-surface-2 text-muted border-border'
    }
  }

  const getStatusStyle = (status) => {
    const s = status?.toLowerCase() || ''
    if (s.includes('resolved') || s.includes('closed') || s.includes('complete')) {
      return 'bg-success/10 text-success border-success/30'
    }
    if (s.includes('pending') || s.includes('waiting')) {
      return 'bg-warning/10 text-warning border-warning/30'
    }
    return 'bg-primary/10 text-primary border-primary/30'
  }

  const totalStatusCount = statusBreakdown.reduce((sum, item) => sum + item.count, 0) || 1
  const totalPriorityCount = priorityBreakdown.reduce((sum, item) => sum + item.count, 0) || 1

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in-up">
      {/* 1. Slowest Cases Table (Spans 2 columns on wide screens) */}
      <div className="lg:col-span-2 rounded-card border border-border bg-surface p-3.5 sm:p-6 shadow-card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-danger/10 text-danger">
              <AlertCircle size={18} />
            </div>
            <div>
              <h3 className="font-head text-base font-semibold text-text tracking-tight">
                Slowest Active Cases
              </h3>
              <p className="text-xs text-muted">Cases experiencing highest total latency</p>
            </div>
          </div>
          <span className="text-xs font-mono px-2.5 py-1 rounded-pill bg-surface-2 border border-border/60 text-muted">
            Top {slowestCases.length} Delayed
          </span>
        </div>

        {slowestCases.length === 0 ? (
          <div className="h-48 flex items-center justify-center text-xs text-muted font-mono">
            No long-running cases detected.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border/60 text-muted font-mono uppercase text-[10px]">
                  <th className="py-2.5 px-3">Case ID</th>
                  <th className="py-2.5 px-3">Priority</th>
                  <th className="py-2.5 px-3">Channel / Tier</th>
                  <th className="py-2.5 px-3">Current Stage</th>
                  <th className="py-2.5 px-3 text-right">Duration</th>
                  <th className="py-2.5 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {slowestCases.map((c) => (
                  <tr key={c.caseId} className="hover:bg-surface-2/50 transition-colors">
                    <td className="py-3 px-3 font-mono font-semibold text-text flex items-center gap-1.5">
                      <span>{c.caseId}</span>
                      <ArrowUpRight size={12} className="text-muted opacity-50" />
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded-pill border text-[10px] font-medium ${getPriorityStyle(c.priority)}`}>
                        {c.priority}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-muted">
                      {c.channel} · <span className="text-text font-medium">{c.customerType}</span>
                    </td>
                    <td className="py-3 px-3 font-medium text-text truncate max-w-[150px]" title={c.currentActivity}>
                      {c.currentActivity || 'Unassigned'}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-warning">
                      {c.durationHours}h
                    </td>
                    <td className="py-3 px-3 text-right">
                      <span className={`px-2 py-0.5 rounded-pill border text-[10px] font-medium ${getStatusStyle(c.status)}`}>
                        {c.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 2. Status & Priority Breakdown Distributions */}
      <div className="space-y-6">
        {/* Status Breakdown Card */}
        <div className="rounded-card border border-border bg-surface p-3.5 sm:p-6 shadow-card">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <BarChart2 size={18} />
            </div>
            <div>
              <h3 className="font-head text-base font-semibold text-text tracking-tight">
                Case Status Distribution
              </h3>
              <p className="text-xs text-muted">Volume breakdown by case status</p>
            </div>
          </div>

          <div className="space-y-3">
            {statusBreakdown.map((item) => {
              const pct = Math.round((item.count / totalStatusCount) * 100)
              return (
                <div key={item.status} className="space-y-1 text-xs">
                  <div className="flex justify-between font-medium">
                    <span className="text-text">{item.status}</span>
                    <span className="font-mono text-muted">{item.count} ({pct}%)</span>
                  </div>
                  <div className="w-full h-2 rounded-pill bg-surface-2 overflow-hidden border border-border/40">
                    <div
                      className={`h-full rounded-pill transition-all duration-500 ${getStatusStyle(item.status).split(' ')[0]} bg-primary`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Priority Breakdown Card */}
        <div className="rounded-card border border-border bg-surface p-3.5 sm:p-6 shadow-card">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 rounded-xl bg-warning/10 text-warning">
              <BarChart2 size={18} />
            </div>
            <div>
              <h3 className="font-head text-base font-semibold text-text tracking-tight">
                Priority Distribution
              </h3>
              <p className="text-xs text-muted">Volume breakdown by urgency tier</p>
            </div>
          </div>

          <div className="space-y-3">
            {priorityBreakdown.map((item) => {
              const pct = Math.round((item.count / totalPriorityCount) * 100)
              return (
                <div key={item.priority} className="space-y-1 text-xs">
                  <div className="flex justify-between font-medium">
                    <span className="text-text">{item.priority}</span>
                    <span className="font-mono text-muted">{item.count} ({pct}%)</span>
                  </div>
                  <div className="w-full h-2 rounded-pill bg-surface-2 overflow-hidden border border-border/40">
                    <div
                      className="h-full rounded-pill bg-warning/80 transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
