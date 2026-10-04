import { useState } from 'react'
import { LogOut, Trash2, AlertTriangle, X } from 'lucide-react'

/**
 * DangerZone — Destructive account actions (Logout & Delete Account confirmation modal).
 */
export default function DangerZone({ onLogout, onDeleteAccount, isDeleting }) {
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [confirmInput, setConfirmInput] = useState('')

  const handleDeleteConfirm = () => {
    if (confirmInput.toLowerCase() !== 'delete account') return
    onDeleteAccount()
  }

  return (
    <div className="rounded-card border border-border bg-surface p-4 sm:p-6 shadow-card space-y-4 animate-fade-in-up">
      <div className="flex items-center gap-2.5 border-b border-border/60 pb-3">
        <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0">
          <AlertTriangle size={18} />
        </div>
        <div>
          <h3 className="font-head text-sm sm:text-base font-semibold text-text tracking-tight">
            Security & Session Actions
          </h3>
          <p className="text-[11px] sm:text-xs text-muted">Manage session state and account deletion</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Log Out Session Card */}
        <div className="p-4 rounded-card bg-surface border border-border flex flex-col justify-between gap-3">
          <div>
            <h4 className="font-head text-sm font-semibold text-text">Sign Out of Session</h4>
            <p className="text-xs text-muted mt-0.5">End your current session on this device</p>
          </div>
          <button
            onClick={onLogout}
            className="px-4 py-2 rounded-card bg-surface border border-border hover:bg-surface-2 text-text text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer self-start"
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Permanent Account Deletion Card */}
        <div className="p-4 rounded-card bg-surface border border-border flex flex-col justify-between gap-3">
          <div>
            <h4 className="font-head text-sm font-semibold text-text">Delete Account</h4>
            <p className="text-xs text-muted mt-0.5">Permanently delete your profile, datasets, and history</p>
          </div>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="px-4 py-2 rounded-card bg-surface border border-danger text-danger hover:bg-danger/10 text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer self-start"
          >
            <Trash2 size={14} />
            <span>Delete Account</span>
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-card p-6 max-w-md w-full shadow-2xl space-y-4 animate-scale-in">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2 text-danger font-head font-bold text-base">
                <AlertTriangle size={20} />
                <span>Delete Account Permanently</span>
              </div>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="text-muted hover:text-text cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-muted leading-relaxed">
              This action cannot be undone. All your custom process datasets, chat sessions, AI request history, and profile records will be permanently deleted.
            </p>

            <div className="space-y-1">
              <label className="block text-xs font-medium text-text">
                Type <code className="font-mono text-danger font-bold">delete account</code> to confirm:
              </label>
              <input
                type="text"
                value={confirmInput}
                onChange={(e) => setConfirmInput(e.target.value)}
                placeholder="delete account"
                className="w-full px-3 py-2 rounded-input bg-surface-2 border border-border text-xs text-text font-mono focus:outline-none focus:border-danger"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 rounded-card bg-surface border border-border text-xs font-semibold text-text hover:bg-surface-2 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={confirmInput.toLowerCase() !== 'delete account' || isDeleting}
                className="px-4 py-2 rounded-card bg-danger text-white text-xs font-semibold hover:bg-danger/90 disabled:opacity-40 cursor-pointer"
              >
                {isDeleting ? 'Deleting...' : 'Confirm Permanent Deletion'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
