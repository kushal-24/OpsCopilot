import { Award, CheckCircle2, XCircle, HelpCircle } from 'lucide-react'

/**
 * EvalSummaryCards — Displays summary KPI cards for overall benchmark accuracy, pass/fail counts.
 */
export default function EvalSummaryCards({ runData, isLoading }) {
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
    total = 25,
    passedCount = 0,
    failedCount = 0,
    accuracy = 0,
  } = runData || {}

  const cards = [
    {
      id: 'accuracy',
      title: 'Accuracy Score',
      value: `${accuracy}%`,
      subtext: 'Grounded benchmark accuracy',
      icon: <Award size={20} className={accuracy >= 90 ? 'text-success' : 'text-warning'} />,
      badge: `${passedCount}/${total} Passed`,
      badgeColor: accuracy >= 90 ? 'bg-success/10 text-success border-success/20' : 'bg-warning/10 text-warning border-warning/20',
    },
    {
      id: 'total',
      title: 'Benchmark Suite',
      value: `${total} Questions`,
      subtext: 'Data-grounded test suite',
      icon: <HelpCircle size={20} className="text-primary" />,
      badge: 'Golden Set',
      badgeColor: 'bg-primary/10 text-primary border-primary/20',
    },
    {
      id: 'passed',
      title: 'Passed Test Cases',
      value: `${passedCount}`,
      subtext: 'Factually verified by LLM judge',
      icon: <CheckCircle2 size={20} className="text-success" />,
      badge: 'PASS',
      badgeColor: 'bg-success/10 text-success border-success/20',
    },
    {
      id: 'failed',
      title: 'Failed Test Cases',
      value: `${failedCount}`,
      subtext: failedCount === 0 ? 'Zero failures recorded' : 'Requires prompt/tool review',
      icon: <XCircle size={20} className={failedCount > 0 ? 'text-danger' : 'text-success'} />,
      badge: failedCount === 0 ? 'Optimal' : 'FAIL',
      badgeColor: failedCount > 0 ? 'bg-danger/10 text-danger border-danger/20' : 'bg-success/10 text-success border-success/20',
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
