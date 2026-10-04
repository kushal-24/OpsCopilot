import { ClipboardCheck, Calendar, ChevronDown, CheckCircle2 } from 'lucide-react'

/**
 * EvalHeader — Displays evaluation suite header, historic run selector dropdown, and run metadata.
 */
export default function EvalHeader({
  runs = [],
  selectedRunId,
  onSelectRun,
  currentRun,
}) {
  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A'
    const date = new Date(dateStr)
    return date.toLocaleString([], {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-5 animate-fade-in-up">
      <div>
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-primary/10 text-primary">
            <ClipboardCheck size={22} />
          </div>
          <h1 className="font-head text-2xl sm:text-3xl font-bold text-text tracking-tight">
            AI Agent Evaluations
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-muted mt-1">
          25-question grounded process mining accuracy benchmark graded by LLM-as-a-judge
        </p>
      </div>

      {/* Historic Run Selector Dropdown */}
      <div className="flex items-center gap-2 self-start sm:self-auto">
        <div className="relative inline-block text-left">
          <label className="block text-[10px] font-mono text-muted mb-1">Select Benchmark Run</label>
          <div className="relative">
            <select
              value={selectedRunId || currentRun?.id || ''}
              onChange={(e) => onSelectRun(e.target.value)}
              disabled={runs.length === 0}
              className="appearance-none bg-surface border border-border rounded-card px-3.5 py-2 pr-9 text-xs font-semibold text-text focus:outline-none focus:border-primary cursor-pointer shadow-sm min-w-[220px] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {runs.length === 0 ? (
                <option value="">No benchmark runs recorded</option>
              ) : (
                runs.map((r) => (
                  <option key={r.id} value={r.id}>
                    {formatDate(r.createdAt)} ({r.accuracy}% Accuracy)
                  </option>
                ))
              )}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
          </div>
        </div>
      </div>
    </div>
  )
}
