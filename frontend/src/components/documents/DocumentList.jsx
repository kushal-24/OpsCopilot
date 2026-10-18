import { useState } from 'react'
import { FileText, Trash2, AlertTriangle, X, CheckCircle2, Loader2, XCircle } from 'lucide-react'

const STATUS_STYLES = {
  ready: { label: 'Ready', className: 'bg-success/15 text-success border-success/30', icon: CheckCircle2 },
  processing: { label: 'Processing', className: 'bg-warning/15 text-warning border-warning/30', icon: Loader2 },
  failed: { label: 'Failed', className: 'bg-danger/15 text-danger border-danger/30', icon: XCircle },
}

const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A'
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

/**
 * DocumentList — Uploaded SOP documents with ingestion status, chunk count and delete confirmation.
 */
export default function DocumentList({ documents = [], isLoading, onDelete, isDeleting }) {
  const [pendingDelete, setPendingDelete] = useState(null)

  if (isLoading) {
    return (
      <div className="rounded-card border border-border bg-surface p-5 sm:p-6 animate-pulse space-y-3">
        <div className="h-6 bg-surface-2 rounded w-1/3" />
        <div className="h-14 bg-surface-2/60 rounded" />
        <div className="h-14 bg-surface-2/60 rounded" />
      </div>
    )
  }

  if (documents.length === 0) {
    return (
      <div className="rounded-card border border-dashed border-border/80 bg-surface/50 p-6 sm:p-8 text-center space-y-3 animate-fade-in-up">
        <FileText size={24} className="text-muted mx-auto" />
        <div>
          <h3 className="font-head text-base font-semibold text-text">No SOPs Yet</h3>
          <p className="text-xs text-muted max-w-md mx-auto mt-1">
            Upload a standard operating procedure above. The copilot will then be able to answer policy and target questions from it.
          </p>
        </div>
      </div>
    )
  }

  const confirmDelete = () => {
    onDelete(pendingDelete.id, { onSettled: () => setPendingDelete(null) })
  }

  return (
    <div className="rounded-card border border-border bg-surface p-4 sm:p-6 space-y-4 animate-fade-in-up">
      <div className="flex items-center justify-between border-b border-border/60 pb-3">
        <div>
          <h3 className="font-head text-base font-semibold text-text tracking-tight">Your SOP Documents</h3>
          <p className="text-xs text-muted">Attached to your active dataset</p>
        </div>
        <span className="text-xs text-muted">
          {documents.length} {documents.length === 1 ? 'document' : 'documents'}
        </span>
      </div>

      <div className="space-y-2.5">
        {documents.map((doc) => {
          const status = STATUS_STYLES[doc.status] || STATUS_STYLES.ready
          const StatusIcon = status.icon

          return (
            <div
              key={doc.id}
              className="p-3.5 rounded-card bg-surface-2/60 border border-border/60 flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-semibold text-text truncate">{doc.name}</span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-pill border font-medium flex items-center gap-1 ${status.className}`}>
                      <StatusIcon size={11} className={doc.status === 'processing' ? 'animate-spin' : ''} />
                      {status.label}
                    </span>
                  </div>
                  <p className="text-[11px] font-mono text-muted truncate">
                    {doc.fileName} · {doc.chunkCount} {doc.chunkCount === 1 ? 'chunk' : 'chunks'} · Uploaded {formatDate(doc.uploadedAt)}
                  </p>
                  {doc.status === 'failed' && doc.error && (
                    <p className="text-[11px] text-danger mt-0.5">{doc.error}</p>
                  )}
                </div>
              </div>
              <button
                onClick={() => setPendingDelete(doc)}
                title="Delete document"
                className="p-1.5 rounded-full text-muted hover:text-danger hover:bg-danger/10 transition-colors cursor-pointer shrink-0"
              >
                <Trash2 size={16} />
              </button>
            </div>
          )
        })}
      </div>

      {pendingDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-card p-6 max-w-md w-full space-y-4 animate-scale-in">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2 text-danger font-head font-bold text-base">
                <AlertTriangle size={20} />
                <span>Delete SOP Document</span>
              </div>
              <button
                onClick={() => setPendingDelete(null)}
                className="text-muted hover:text-text cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-muted leading-relaxed">
              <span className="font-semibold text-text">{pendingDelete.name}</span> will be removed and the copilot will no longer be able to answer from it. This cannot be undone.
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setPendingDelete(null)}
                className="px-4 py-2 rounded-card bg-surface border border-border text-xs font-semibold text-text hover:bg-surface-2 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 rounded-card bg-danger text-white text-xs font-semibold hover:bg-danger/90 disabled:opacity-40 cursor-pointer"
              >
                {isDeleting ? 'Deleting...' : 'Delete Document'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
