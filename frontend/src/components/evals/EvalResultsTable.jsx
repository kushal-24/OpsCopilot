import { useState } from 'react'
import { CheckCircle2, XCircle, ChevronDown, ChevronUp, Scale, Filter } from 'lucide-react'

/**
 * EvalResultsTable — Renders the 25-question evaluation benchmark table with pass/fail badges, expected vs actual answers, and LLM judge reasoning.
 */
export default function EvalResultsTable({ results = [], failuresOnly, onToggleFailures, isLoading }) {
  const [expandedId, setExpandedId] = useState(null)

  const filteredResults = failuresOnly ? results.filter((r) => !r.pass) : results

  return (
    <div className="rounded-card border border-border bg-surface p-3.5 sm:p-6 shadow-card space-y-4 animate-fade-in-up">
      {/* Header & Failures-Only Filter Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0">
            <Filter size={18} />
          </div>
          <div>
            <h3 className="font-head text-sm sm:text-base font-semibold text-text tracking-tight">
              Benchmark Test Results
            </h3>
            <p className="text-[11px] sm:text-xs text-muted">Comparison of expected ground-truth answers vs actual AI responses</p>
          </div>
        </div>

        {/* Failures-only filter tab */}
        <div className="flex items-center gap-1.5 p-1 rounded-pill bg-surface-2 border border-border/60 self-start sm:self-auto text-xs font-medium">
          <button
            onClick={() => onToggleFailures(false)}
            className={`px-3 py-1 rounded-pill transition-all cursor-pointer ${
              !failuresOnly
                ? 'bg-primary text-white shadow-sm font-semibold'
                : 'text-muted hover:text-text'
            }`}
          >
            All Questions ({results.length})
          </button>
          <button
            onClick={() => onToggleFailures(true)}
            className={`px-3 py-1 rounded-pill transition-all cursor-pointer ${
              failuresOnly
                ? 'bg-danger text-white shadow-sm font-semibold'
                : 'text-muted hover:text-text'
            }`}
          >
            Failures Only ({results.filter((r) => !r.pass).length})
          </button>
        </div>
      </div>

      {/* Results Table */}
      {isLoading ? (
        <div className="space-y-3 py-4 animate-pulse">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-14 bg-surface-2/60 rounded" />
          ))}
        </div>
      ) : filteredResults.length === 0 ? (
        <div className="py-12 text-center text-xs text-muted font-mono space-y-2">
          <CheckCircle2 size={28} className="text-success mx-auto" />
          <p className="text-text font-semibold text-sm">No Failures Detected!</p>
          <p>All benchmark test cases in this run passed evaluation successfully.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border/60 text-muted font-mono uppercase text-[10px]">
                <th className="py-2.5 px-3">Test ID & Question</th>
                <th className="py-2.5 px-3">Expected Ground-Truth</th>
                <th className="py-2.5 px-3">Actual AI Response</th>
                <th className="py-2.5 px-3 text-right">Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {filteredResults.map((row) => {
                const isExpanded = expandedId === row.id

                return (
                  <tr
                    key={row.id || row.questionId}
                    onClick={() => setExpandedId(isExpanded ? null : row.id)}
                    className="hover:bg-surface-2/50 transition-colors cursor-pointer group"
                  >
                    {/* Question ID & Question */}
                    <td className="py-3 px-3 align-top max-w-xs space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-surface-2 border border-border/60 text-primary font-bold">
                          {row.questionId}
                        </span>
                      </div>
                      <p className="font-semibold text-text text-xs leading-snug">{row.question}</p>
                    </td>

                    {/* Expected Answer */}
                    <td className="py-3 px-3 align-top max-w-xs text-muted leading-relaxed font-body text-[11px]">
                      {row.expectedAnswer}
                    </td>

                    {/* Actual Answer */}
                    <td className="py-3 px-3 align-top max-w-sm leading-relaxed font-body text-[11px] space-y-2">
                      <div className="text-text/90 font-medium">
                        {row.actualAnswer || <span className="italic text-muted font-mono">No answer returned (Error)</span>}
                      </div>

                      {/* Expandable Judge Reasoning Drawer */}
                      {row.judgeReasoning && (
                        <div className="pt-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setExpandedId(isExpanded ? null : row.id)
                            }}
                            className="text-[10px] font-mono text-primary flex items-center gap-1 hover:underline cursor-pointer"
                          >
                            <Scale size={11} />
                            <span>{isExpanded ? 'Hide LLM Judge Reasoning' : 'View LLM Judge Reasoning'}</span>
                            {isExpanded ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                          </button>

                          {isExpanded && (
                            <div className="mt-1.5 p-2 rounded-card bg-surface-2 border border-border/80 text-[11px] font-mono text-text/80 leading-normal animate-fade-in-up">
                              <span className="text-primary font-bold block mb-0.5">Judge Verdict Reasoning:</span>
                              {row.judgeReasoning}
                            </div>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Pass/Fail Status */}
                    <td className="py-3 px-3 align-top text-right whitespace-nowrap">
                      {row.pass ? (
                        <span className="px-2.5 py-1 rounded-pill bg-success/10 text-success border border-success/30 text-[11px] font-bold inline-flex items-center gap-1 shadow-sm">
                          <CheckCircle2 size={12} /> PASS
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-pill bg-danger/10 text-danger border border-danger/30 text-[11px] font-bold inline-flex items-center gap-1 shadow-sm">
                          <XCircle size={12} /> FAIL
                        </span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
