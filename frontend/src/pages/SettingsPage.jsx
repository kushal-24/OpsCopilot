import { useMutation, useQueryClient } from '@tanstack/react-query' // TanStack Query: handles settings mutation actions and query cache updates
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/auth.context'
import * as settingsApi from '../api/settings.api'
import * as datasetApi from '../api/dataset.api'
import ProfileSettings from '../components/settings/ProfileSettings'
import AppearanceSettings from '../components/settings/AppearanceSettings'
import DatasetSettings from '../components/settings/DatasetSettings'
import DangerZone from '../components/settings/DangerZone'
import { Settings } from 'lucide-react'

/**
 * SettingsPage — Main Phase 9 Application Settings Route (`/settings`).
 * Integrates auth state, profile updating, theme controls, dataset resets, and account deletion.
 */
export default function SettingsPage() {
  const { user, logout } = useAuth()
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  // TanStack Query: Mutation hook for updating user full name via PATCH /users/update-profile.
  const updateProfileMutation = useMutation({
    mutationFn: (payload) => settingsApi.updateProfile(payload),
    onSuccess: (updatedUser) => {
      // TanStack Query: Update current user cache so top bar avatar name reflects immediately
      queryClient.setQueryData(['currentUser'], updatedUser)
    },
  })

  // TanStack Query: Mutation hook for changing password via PATCH /users/change-password.
  const changePasswordMutation = useMutation({
    mutationFn: (payload) => settingsApi.changePassword(payload),
  })

  // TanStack Query: Mutation hook for deleting account via DELETE /users/delete-account.
  const deleteAccountMutation = useMutation({
    mutationFn: settingsApi.deleteAccount,
    onSuccess: async () => {
      await logout()
      navigate('/signup')
    },
  })

  // TanStack Query: Mutation hook for resetting dataset to demo log via POST /datasets/demo.
  const demoDatasetMutation = useMutation({
    mutationFn: datasetApi.loadDemoDataset,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentDataset'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      queryClient.invalidateQueries({ queryKey: ['dashboardInsight'] })
    },
  })

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Settings size={22} />
            </div>
            <h1 className="font-head text-2xl sm:text-3xl font-bold text-text tracking-tight">
              Settings & Preferences
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-muted mt-1">
            Manage your profile details, security credentials, visual theme, and workspace datasets
          </p>
        </div>
      </div>

      {/* 1. Account Profile & Password Security */}
      <ProfileSettings
        user={user}
        onUpdateProfile={(payload, callbacks) => updateProfileMutation.mutate(payload, callbacks)}
        onChangePassword={(payload, callbacks) => changePasswordMutation.mutate(payload, callbacks)}
        isUpdatingProfile={updateProfileMutation.isPending}
        isChangingPassword={changePasswordMutation.isPending}
      />

      {/* 2. Appearance & Theme Controls */}
      <AppearanceSettings />

      {/* 3. Dataset Controls & API Key Field */}
      <DatasetSettings
        onLoadDemo={() => demoDatasetMutation.mutate()}
        isDemoLoading={demoDatasetMutation.isPending}
      />

      {/* 4. Danger Zone (Logout & Delete Account) */}
      <DangerZone
        onLogout={handleLogout}
        onDeleteAccount={() => deleteAccountMutation.mutate()}
        isDeleting={deleteAccountMutation.isPending}
      />
    </div>
  )
}
