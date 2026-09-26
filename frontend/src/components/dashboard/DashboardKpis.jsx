import { Briefcase, CheckCircle2, Clock, AlertTriangle } from 'lucide-react'

/**
 * DashboardKpis — Displays key process telemetry metrics in card layout.
 */
export default function DashboardKpis({ kpis, isLoading }) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in-up">
        {[1, 2, 3, 4].map((idx) => (
          <div key={idx} className="rounded-card border border-border bg-surface p-5 shadow-card animate-pulse space-y-3">
            <div className="h-4 bg-surface-2 rounded w-1/2" />
            <div className="h-8 bg-surface-2 rounded w-3/4" />
            <div className="h-3 bg-surface-2 rounded w-2/3" />
          </div>
        ))}
      </div>
    )
  }

  const {
    totalCases = 0,
    completedCases = 0,
    openCases = 0,
    completionRate = 0,
    avgCycleTimeHours = 0,
    medianCycleTimeHours = 0,
    bottleneckActivity = 'None',
    bottleneckAvgDurationHours = null,
    totalEvents = 0,
  } = kpis || {}

  const cards = [
    {
      id: 'cases',
      title: 'Total Case Volume',
      value: totalCases.toLocaleString(),
      subtext: `${completedCases} closed · ${openCases} active`,
      icon: <Briefcase size={20} className="text-primary" />,
      badge: 'Active Log',
      badgeColor: 'bg-primary/10 text-primary border-primary/20',
    },
    {
      id: 'completion',
      title: 'Completion Rate',
      value: `${completionRate}%`,
      subtext: `${totalEvents.toLocaleString()} telemetry events`,
      icon: <CheckCircle2 size={20} className="text-success" />,
      badge: `${completedCases}/${totalCases}`,
      badgeColor: 'bg-success/10 text-success border-success/20',
    },
    {
      id: 'cycletime',
      title: 'Avg Cycle Time',
      value: `${avgCycleTimeHours} hrs`,
      subtext: `Median duration: ${medianCycleTimeHours} hrs`,
      icon: <Clock size={20} className="text-primary" />,
      badge: 'Duration',
      badgeColor: 'bg-primary/10 text-primary border-primary/20',
    },
    {
      id: 'bottleneck',
      title: 'Primary Bottleneck',
      value: bottleneckActivity || 'None',
      subtext: bottleneckAvgDurationHours ? `Avg wait: ${bottleneckAvgDurationHours} hrs` : 'No delays recorded',
      icon: <AlertTriangle size={20} className="text-warning" />,
      badge: bottleneckAvgDurationHours ? `${bottleneckAvgDurationHours}h avg` : 'Optimal',
      badgeColor: 'bg-warning/10 text-warning border-warning/20',
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
