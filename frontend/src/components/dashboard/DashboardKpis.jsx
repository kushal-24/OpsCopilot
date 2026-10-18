/**
 * DashboardKpis — Key process metrics as one ruled strip: label, large figure, supporting line.
 */
export default function DashboardKpis({ kpis, isLoading }) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-border border border-border rounded-card overflow-hidden animate-fade-in-up">
        {[1, 2, 3, 4].map((idx) => (
          <div key={idx} className="bg-surface p-5 animate-pulse space-y-3">
            <div className="h-3 bg-surface-2 rounded w-1/2" />
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
      title: 'Total cases',
      value: totalCases.toLocaleString(),
      subtext: `${completedCases.toLocaleString()} closed · ${openCases.toLocaleString()} active`,
    },
    {
      id: 'completion',
      title: 'Completion rate',
      value: `${completionRate}%`,
      subtext: `${completedCases.toLocaleString()} of ${totalCases.toLocaleString()} cases · ${totalEvents.toLocaleString()} events`,
    },
    {
      id: 'cycletime',
      title: 'Average cycle time',
      value: `${avgCycleTimeHours} hrs`,
      subtext: `Median ${medianCycleTimeHours} hrs`,
    },
    {
      id: 'bottleneck',
      title: 'Primary bottleneck',
      value: bottleneckActivity || 'None',
      subtext: bottleneckAvgDurationHours ? `${bottleneckAvgDurationHours} hrs average wait` : 'No delays recorded',
      accent: true,
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-border border border-border rounded-card overflow-hidden">
      {cards.map((card, idx) => (
        <div key={card.id} className={`bg-surface p-5 sm:p-6 animate-fade-in-up reveal-delay-${idx + 1}`}>
          <span className="text-xs font-medium text-muted block mb-2">{card.title}</span>
          <h3
            className={`font-head text-2xl sm:text-3xl font-semibold tracking-tight tabular-nums truncate ${
              card.accent ? 'text-warning' : 'text-text'
            }`}
            title={card.value}
          >
            {card.value}
          </h3>
          <p className="text-xs text-muted mt-1.5 truncate">{card.subtext}</p>
        </div>
      ))}
    </div>
  )
}
