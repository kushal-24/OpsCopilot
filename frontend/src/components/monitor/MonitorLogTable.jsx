import { useState } from 'react'
import { FileText, CheckCircle2, AlertCircle, ChevronLeft, ChevronRight, Wrench, DollarSign } from 'lucide-react'

/**
 * MonitorLogTable — Paginated and status-filterable raw AI request telemetry table.
 */
export default function MonitorLogTable({
  requestLog,
  page,
  statusFilter,
  onPageChange,
  onStatusFilterChange,
  isLoading,
}) {
  const [expandedRow, setExpandedRow] = useState(null)

  const { rows = [], total = 0, totalPages = 1 } = requestLog || {}

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A'
    const date = new Date(dateStr)
    return date.toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  }

  const formatCost = (cost) => {
    if (!cost || cost === 0) return '$0.0000'
    return `$${cost.toFixed(5)}`
  }

  const parseToolCalls = (toolCalls) => {
    if (!toolCalls) return []
    if (Array.isArray(toolCalls)) return toolCalls
    try {
      return JSON.parse(toolCalls)
    } catch {
      return []
    }
  }

  return (
    <div className="rounded-card border border-border bg-surface p-3.5 sm:p-6 shadow-card space-y-4 animate-fade-in-up">
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0">
            <FileText size={18} />
          </div>
          <div>
            <h3 className="font-head text-sm sm:text-base font-semibold text-text tracking-tight">
              Raw AI Request Logs
            </h3>
            <p className="text-[11px] sm:text-xs text-muted">Detailed prompt executions, token counts, and cost telemetry</p>
          </div>
        </div>

        {/* Status Filter Buttons */}
        <div className="flex items-center gap-1.5 p-1 rounded-pill bg-surface-2 border border-border/60 self-start sm:self-auto text-xs font-medium">
          {[
            { id: 'all', label: 'All Requests' },
            { id: 'success', label: 'Success' },
            { id: 'error', label: 'Errors' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => onStatusFilterChange(tab.id)}
              className={`px-3 py-1 rounded-pill transition-all cursor-pointer ${
                statusFilter === tab.id
                  ? 'bg-primary text-white shadow-sm font-semibold'
                  : 'text-muted hover:text-text'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Log Table */}
      {isLoading ? (
        <div className="space-y-3 py-4 animate-pulse">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 bg-surface-2/60 rounded" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <div className="py-12 text-center text-xs text-muted font-mono">
          No request log entries match the selected filter.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border/60 text-muted font-mono uppercase text-[10px]">
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Prompt / Question</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Latency</th>
                <th className="py-2.5 px-3 text-right">Tokens (In/Out)</th>
                <th className="py-2.5 px-3 text-right">Cost</th>
                <th className="py-2.5 px-3 text-right">Tools Used</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {rows.map((row) => {
                const tools = parseToolCalls(row.toolCalls)
                const isExpanded = expandedRow === row.id

                return (
                  <tr
                    key={row.id}
                    onClick={() => setExpandedRow(isExpanded ? null : row.id)}
                    className="hover:bg-surface-2/50 transition-colors cursor-pointer"
                  >
                    <td className="py-3 px-3 font-mono text-[11px] text-muted whitespace-nowrap">
                      {formatDate(row.createdAt)}
                    </td>
                    <td className="py-3 px-3 font-medium text-text max-w-[220px] sm:max-w-xs truncate" title={row.question}>
                      {row.question}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      {row.success ? (
                        <span className="px-2 py-0.5 rounded-pill bg-success/10 text-success border border-success/30 text-[10px] font-medium inline-flex items-center gap-1">
                          <CheckCircle2 size={11} /> Success
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-pill bg-danger/10 text-danger border border-danger/30 text-[10px] font-medium inline-flex items-center gap-1">
                          <AlertCircle size={11} /> Error
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-semibold text-text whitespace-nowrap">
                      {row.latencyMs ? `${row.latencyMs} ms` : '—'}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-muted whitespace-nowrap">
                      {row.inputTokens ?? 0} / {row.outputTokens ?? 0}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-success font-semibold whitespace-nowrap">
                      <span className="inline-flex items-center gap-0.5">
                        <DollarSign size={11} />
                        {formatCost(row.estimatedCost).slice(1)}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-mono whitespace-nowrap">
                      {tools.length > 0 ? (
                        <span className="px-2 py-0.5 rounded-pill bg-primary/10 text-primary border border-primary/20 text-[10px] font-medium inline-flex items-center gap-1">
                          <Wrench size={10} /> {tools.length} tool
                        </span>
                      ) : (
                        <span className="text-muted text-[10px]">None</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-border/60 text-xs text-muted">
        <span className="font-mono text-[11px]">
          Showing {rows.length} of {total} request logs
        </span>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={page <= 1 || isLoading}
            className="p-1.5 rounded-card bg-surface-2 border border-border text-text hover:bg-surface transition-colors cursor-pointer disabled:opacity-40"
            title="Previous Page"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="font-mono text-[11px]">
            Page {page} of {totalPages || 1}
          </span>
          <button
            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            disabled={page >= totalPages || isLoading}
            className="p-1.5 rounded-card bg-surface-2 border border-border text-text hover:bg-surface transition-colors cursor-pointer disabled:opacity-40"
            title="Next Page"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
