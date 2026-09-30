import { Database, Calendar, FileText, Activity, CheckCircle2, Layers } from 'lucide-react'

/**
 * DatasetInfoCard — Displays active telemetry dataset metadata and statistics.
 */
export default function DatasetInfoCard({ datasetInfo, isLoading }) {
  if (isLoading) {
    return (
      <div className="rounded-card border border-border bg-surface p-5 sm:p-6 shadow-card animate-pulse space-y-4">
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
        <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
          <Database size={24} />
        </div>
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
    <div className="rounded-card border border-border bg-surface p-4 sm:p-6 shadow-card transition-all animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 border-b border-border/60 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Database size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-head text-base sm:text-lg font-bold text-text tracking-tight">
                {name}
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-pill bg-success/15 text-success border border-success/30 font-medium flex items-center gap-1">
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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="p-3.5 rounded-card bg-surface-2/60 border border-border/60 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
            <Layers size={18} />
          </div>
          <div>
            <span className="text-[11px] font-medium text-muted block">Total Process Cases</span>
            <span className="font-head text-lg font-bold text-text">{caseCount.toLocaleString()}</span>
          </div>
        </div>

        <div className="p-3.5 rounded-card bg-surface-2/60 border border-border/60 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-success/10 text-success shrink-0">
            <Activity size={18} />
          </div>
          <div>
            <span className="text-[11px] font-medium text-muted block">Telemetry Events</span>
            <span className="font-head text-lg font-bold text-text">{eventCount.toLocaleString()}</span>
          </div>
        </div>

        <div className="p-3.5 rounded-card bg-surface-2/60 border border-border/60 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-warning/10 text-warning shrink-0">
            <Calendar size={18} />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-medium text-muted block">Observed Time Range</span>
            <span className="font-mono text-xs font-semibold text-text block truncate">
              {formatDate(dateRange?.from)} → {formatDate(dateRange?.to)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
