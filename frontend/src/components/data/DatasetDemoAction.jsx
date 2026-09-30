import { PlayCircle, RotateCcw } from 'lucide-react'

/**
 * DatasetDemoAction — 1-click action card to load or replace active dataset with OpsCopilot demo telemetry dataset.
 */
export default function DatasetDemoAction({ onLoadDemo, isLoading }) {
  return (
    <div className="rounded-card border border-warning/30 bg-warning/10 p-4 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all animate-fade-in-up">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-warning/20 text-warning flex items-center justify-center shrink-0">
          <PlayCircle size={22} className="animate-pulse" />
        </div>
        <div>
          <h4 className="font-head text-sm font-semibold text-text">
            Use OpsCopilot Demo Dataset
          </h4>
          <p className="text-xs text-muted mt-0.5 max-w-xl">
            Instantly load or reset your workspace dataset with the standard ~2,940 event telemetry demo dataset (<code className="font-mono text-warning">event_log_flat.csv</code>).
          </p>
        </div>
      </div>

      <button
        onClick={onLoadDemo}
        disabled={isLoading}
        className="px-4 py-2 rounded-card bg-surface border border-warning/40 text-xs font-semibold text-text hover:bg-warning/20 flex items-center justify-center gap-2 shadow-sm transition-all duration-200 shrink-0 cursor-pointer disabled:opacity-50"
      >
        <RotateCcw size={14} className={isLoading ? 'animate-spin text-warning' : ''} />
        <span>{isLoading ? 'Loading Demo Data...' : 'Load Demo Dataset'}</span>
      </button>
    </div>
  )
}
