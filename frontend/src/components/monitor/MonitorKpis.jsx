import { Activity, Clock, DollarSign, AlertTriangle } from 'lucide-react'

/**
 * MonitorKpis — Displays key AI request telemetry summary metrics.
 */
export default function MonitorKpis({ summary, isLoading }) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in-up">
        {[1, 2, 3, 4].map((idx) => (
          <div key={idx} className="rounded-card border border-border bg-surface p-4 sm:p-5 shadow-card animate-pulse space-y-3">
            <div className="h-4 bg-surface-2 rounded w-1/2" />
            <div className="h-8 bg-surface-2 rounded w-3/4" />
            <div className="h-3 bg-surface-2 rounded w-2/3" />
          </div>
        ))}
      </div>
    )
  }

  const {
    totalRequests = 0,
    avgLatencyMs = 0,
    totalCost = 0,
    errorRate = 0,
  } = summary || {}

  const formatCost = (val) => {
    if (!val || val === 0) return '$0.0000'
    if (val < 0.01) return `$${val.toFixed(5)}`
    return `$${val.toFixed(4)}`
  }

  const cards = [
    {
      id: 'requests',
      title: 'Total AI Requests',
      value: totalRequests.toLocaleString(),
      subtext: 'Cumulative LLM invocations',
      icon: <Activity size={20} className="text-primary" />,
      badge: 'All Logs',
      badgeColor: 'bg-primary/10 text-primary border-primary/20',
    },
    {
      id: 'latency',
      title: 'Average Latency',
      value: `${avgLatencyMs} ms`,
      subtext: avgLatencyMs < 2000 ? 'Optimal response time' : 'Higher latency observed',
      icon: <Clock size={20} className="text-primary" />,
      badge: `${(avgLatencyMs / 1000).toFixed(2)}s avg`,
      badgeColor: 'bg-primary/10 text-primary border-primary/20',
    },
    {
      id: 'cost',
      title: 'Total Estimated Cost',
      value: formatCost(totalCost),
      subtext: 'Gemini 3.6 token usage cost',
      icon: <DollarSign size={20} className="text-success" />,
      badge: 'USD',
      badgeColor: 'bg-success/10 text-success border-success/20',
    },
    {
      id: 'errorRate',
      title: 'Request Error Rate',
      value: `${errorRate}%`,
      subtext: errorRate === 0 ? 'Zero failures recorded' : 'Contains failed requests',
      icon: <AlertTriangle size={20} className={errorRate > 0 ? 'text-danger' : 'text-success'} />,
      badge: errorRate > 0 ? 'Attention' : 'Healthy',
      badgeColor: errorRate > 0 ? 'bg-danger/10 text-danger border-danger/20' : 'bg-success/10 text-success border-success/20',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => (
        <div
          key={card.id}
          className={`rounded-card border border-border bg-surface p-4 sm:p-5 shadow-card hover:border-primary/40 transition-all duration-300 animate-fade-in-up reveal-delay-${idx + 1}`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-muted">{card.title}</span>
            <div className="p-2 rounded-xl bg-surface-2 border border-border/60 shrink-0">
              {card.icon}
            </div>
          </div>

          <div className="flex items-baseline justify-between gap-2 mb-1">
            <h3 className="font-head text-xl sm:text-2xl font-bold text-text tracking-tight truncate">
              {card.value}
            </h3>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-pill border font-medium shrink-0 ${card.badgeColor}`}>
              {card.badge}
            </span>
          </div>

          <p className="text-xs text-muted truncate">{card.subtext}</p>
        </div>
      ))}
    </div>
  )
}
