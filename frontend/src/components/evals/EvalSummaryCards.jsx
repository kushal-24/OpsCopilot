/**
 * EvalSummaryCards — Displays summary KPI cards for overall benchmark accuracy, pass/fail counts.
 */
export default function EvalSummaryCards({ runData, isLoading }) {
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
    total = 25,
    passedCount = 0,
    failedCount = 0,
    accuracy = 0,
  } = runData || {}

  const cards = [
    {
      id: 'accuracy',
      title: 'Accuracy score',
      value: `${accuracy}%`,
      subtext: `${passedCount} of ${total} passed`,
      tone: accuracy >= 90 ? 'text-success' : 'text-warning',
    },
    {
      id: 'total',
      title: 'Benchmark suite',
      value: `${total} questions`,
      subtext: 'Data-grounded test set',
      tone: 'text-text',
    },
    {
      id: 'passed',
      title: 'Passed',
      value: `${passedCount}`,
      subtext: 'Verified by LLM judge',
      tone: 'text-text',
    },
    {
      id: 'failed',
      title: 'Failed',
      value: `${failedCount}`,
      subtext: failedCount === 0 ? 'No failures recorded' : 'Needs prompt or tool review',
      tone: failedCount > 0 ? 'text-danger' : 'text-text',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-border border border-border rounded-card overflow-hidden">
      {cards.map((card, idx) => (
        <div key={card.id} className={`bg-surface p-5 sm:p-6 animate-fade-in-up reveal-delay-${idx + 1}`}>
          <span className="text-xs font-medium text-muted block mb-2">{card.title}</span>
          <h3 className={`font-head text-2xl sm:text-3xl font-semibold tracking-tight tabular-nums truncate ${card.tone}`}>
            {card.value}
          </h3>
          <p className="text-xs text-muted mt-1.5 truncate">{card.subtext}</p>
        </div>
      ))}
    </div>
  )
}
