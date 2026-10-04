import { useState } from 'react'
import { User, Lock, CheckCircle2, AlertCircle, Save } from 'lucide-react'

/**
 * ProfileSettings — Allows operators to update their full name and change their password.
 */
export default function ProfileSettings({
  user,
  onUpdateProfile,
  onChangePassword,
  isUpdatingProfile,
  isChangingPassword,
}) {
  const [fullName, setFullName] = useState(user?.fullName || '')
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [profileNotice, setProfileNotice] = useState(null)
  const [passwordNotice, setPasswordNotice] = useState(null)

  const handleProfileSubmit = (e) => {
    e.preventDefault()
    setProfileNotice(null)

    if (!fullName.trim()) {
      setProfileNotice({ type: 'error', message: 'Full name cannot be empty.' })
      return
    }

    onUpdateProfile(
      { fullName: fullName.trim() },
      {
        onSuccess: () => {
          setProfileNotice({ type: 'success', message: 'Profile updated successfully!' })
          setTimeout(() => setProfileNotice(null), 5000)
        },
        onError: (err) => {
          setProfileNotice({
            type: 'error',
            message: err?.response?.data?.message || err?.message || 'Failed to update profile.',
          })
        },
      }
    )
  }

  const handlePasswordSubmit = (e) => {
    e.preventDefault()
    setPasswordNotice(null)

    if (!oldPassword || !newPassword) {
      setPasswordNotice({ type: 'error', message: 'Both old and new passwords are required.' })
      return
    }

    if (newPassword.length < 6) {
      setPasswordNotice({ type: 'error', message: 'New password must be at least 6 characters long.' })
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordNotice({ type: 'error', message: 'New passwords do not match.' })
      return
    }

    onChangePassword(
      { oldPassword, newPassword },
      {
        onSuccess: () => {
          setPasswordNotice({ type: 'success', message: 'Password changed successfully!' })
          setOldPassword('')
          setNewPassword('')
          setConfirmPassword('')
          setTimeout(() => setPasswordNotice(null), 5000)
        },
        onError: (err) => {
          setPasswordNotice({
            type: 'error',
            message: err?.response?.data?.message || err?.message || 'Failed to change password.',
          })
        },
      }
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in-up">
      {/* 1. Account Profile Details Form */}
      <div className="rounded-card border border-border bg-surface p-4 sm:p-6 shadow-card space-y-4">
        <div className="flex items-center gap-2.5 border-b border-border/60 pb-3">
          <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0">
            <User size={18} />
          </div>
          <div>
            <h3 className="font-head text-sm sm:text-base font-semibold text-text tracking-tight">
              Profile Information
            </h3>
            <p className="text-[11px] sm:text-xs text-muted">Update your display name and view account details</p>
          </div>
        </div>

        {profileNotice && (
          <div
            className={`p-3 rounded-card text-xs flex items-center gap-2 ${
              profileNotice.type === 'success'
                ? 'bg-success/10 border border-success/30 text-success'
                : 'bg-danger/10 border border-danger/30 text-danger'
            }`}
          >
            {profileNotice.type === 'success' ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
            <span>{profileNotice.message}</span>
          </div>
        )}

        <form onSubmit={handleProfileSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-medium text-text mb-1">Email Address (Read-only)</label>
            <input
              type="email"
              disabled
              value={user?.email || 'operator@opscopilot.com'}
              className="w-full px-3 py-2 rounded-input bg-surface-2/60 border border-border text-xs text-muted font-mono cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text mb-1">Full Display Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Kushal Phadnis"
              className="w-full px-3 py-2 rounded-input bg-surface-2 border border-border text-xs text-text focus:outline-none focus:border-primary transition-colors font-body"
            />
          </div>

          <button
            type="submit"
            disabled={isUpdatingProfile}
            className="px-4 py-2 rounded-card bg-primary text-primary-fg text-xs font-semibold hover:bg-primary-hover flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
          >
            <Save size={14} />
            <span>{isUpdatingProfile ? 'Saving...' : 'Save Profile Changes'}</span>
          </button>
        </form>
      </div>

      {/* 2. Security / Change Password Form */}
      <div className="rounded-card border border-border bg-surface p-4 sm:p-6 shadow-card space-y-4">
        <div className="flex items-center gap-2.5 border-b border-border/60 pb-3">
          <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0">
            <Lock size={18} />
          </div>
          <div>
            <h3 className="font-head text-sm sm:text-base font-semibold text-text tracking-tight">
              Change Password
            </h3>
            <p className="text-[11px] sm:text-xs text-muted">Update your account login password</p>
          </div>
        </div>

        {passwordNotice && (
          <div
            className={`p-3 rounded-card text-xs flex items-center gap-2 ${
              passwordNotice.type === 'success'
                ? 'bg-success/10 border border-success/30 text-success'
                : 'bg-danger/10 border border-danger/30 text-danger'
            }`}
          >
            {passwordNotice.type === 'success' ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
            <span>{passwordNotice.message}</span>
          </div>
        )}

        <form onSubmit={handlePasswordSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-medium text-text mb-1">Current Password</label>
            <input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 rounded-input bg-surface-2 border border-border text-xs text-text focus:outline-none focus:border-primary transition-colors font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text mb-1">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 rounded-input bg-surface-2 border border-border text-xs text-text focus:outline-none focus:border-primary transition-colors font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text mb-1">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 rounded-input bg-surface-2 border border-border text-xs text-text focus:outline-none focus:border-primary transition-colors font-mono"
            />
          </div>

          <button
            type="submit"
            disabled={isChangingPassword}
            className="px-4 py-2 rounded-card bg-surface border border-border text-xs font-semibold text-text hover:bg-surface-2 flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
          >
            <Lock size={14} />
            <span>{isChangingPassword ? 'Updating...' : 'Update Password'}</span>
          </button>
        </form>
      </div>
    </div>
  )
}
