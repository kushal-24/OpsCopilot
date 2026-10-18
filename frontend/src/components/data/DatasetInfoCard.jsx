import { Database, FileText, CheckCircle2 } from 'lucide-react'

/**
 * DatasetInfoCard — Displays active telemetry dataset metadata and statistics.
 */
export default function DatasetInfoCard({ datasetInfo, isLoading }) {
  if (isLoading) {
    return (
      <div className="rounded-card border border-border bg-surface p-5 sm:p-6 animate-pulse space-y-4">
        <div className="h-6 bg-surface-2 rounded w-1/3" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="h-16 bg-surface-2/60 rounded" />
          <div className="h-16 bg-surface-2/60 rounded" />
          <div className="h-16 bg-surface-2/60 rounded" />
        </div>
      </div>
    )
  }

  if (!datasetInfo) {
    return (
      <div className="rounded-card border border-dashed border-border/80 bg-surface/50 p-6 sm:p-8 text-center space-y-3 animate-fade-in-up">
        <Database size={24} className="text-muted mx-auto" />
        <div>
          <h3 className="font-head text-base font-semibold text-text">No Active Dataset</h3>
          <p className="text-xs text-muted max-w-md mx-auto mt-1">
            You haven&apos;t uploaded a process event log yet. Upload a custom CSV below or load the pre-seeded demo dataset to begin telemetry analysis.
          </p>
        </div>
      </div>
    )
  }

  const {
    name = 'Unnamed Dataset',
    fileName = 'file.csv',
    description,
    createdAt,
    caseCount = 0,
    eventCount = 0,
    dateRange,
  } = datasetInfo

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A'
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  return (
    <div className="rounded-card border border-border bg-surface p-4 sm:p-6 transition-all animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 border-b border-border/60 pb-4">
        <div className="flex items-center gap-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-head text-base sm:text-lg font-semibold text-text tracking-tight">
                {name}
              </h2>
              <span className="text-xs text-success font-medium flex items-center gap-1">
                <CheckCircle2 size={11} /> Active Dataset
              </span>
            </div>
            <p className="text-xs font-mono text-muted flex items-center gap-1.5 mt-0.5">
              <FileText size={12} />
              <span>{fileName}</span>
              {createdAt && <span>· Uploaded {formatDate(createdAt)}</span>}
            </p>
          </div>
        </div>
      </div>

      {description && (
        <p className="text-xs text-text/80 leading-relaxed mb-4 bg-surface-2/50 p-3 rounded-card border border-border/40">
          {description}
        </p>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-border border border-border rounded-card overflow-hidden">
        <div className="p-4 bg-surface">
          <div>
            <span className="text-xs font-medium text-muted block mb-1">Total Process Cases</span>
            <span className="font-head text-2xl font-semibold tabular-nums text-text">{caseCount.toLocaleString()}</span>
          </div>
        </div>

        <div className="p-4 bg-surface">
          <div>
            <span className="text-xs font-medium text-muted block mb-1">Telemetry Events</span>
            <span className="font-head text-2xl font-semibold tabular-nums text-text">{eventCount.toLocaleString()}</span>
          </div>
        </div>

        <div className="p-4 bg-surface">
          <div className="min-w-0">
            <span className="text-xs font-medium text-muted block mb-1">Observed Time Range</span>
            <span className="font-mono text-xs font-semibold text-text block truncate">
              {formatDate(dateRange?.from)} → {formatDate(dateRange?.to)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
