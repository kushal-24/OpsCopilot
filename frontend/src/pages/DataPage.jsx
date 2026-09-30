import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query' // TanStack Query: manages dataset server state and mutation invalidation
import * as datasetApi from '../api/dataset.api'
import DatasetInfoCard from '../components/data/DatasetInfoCard'
import DatasetUploadZone from '../components/data/DatasetUploadZone'
import DatasetDemoAction from '../components/data/DatasetDemoAction'
import { Database, CheckCircle2 } from 'lucide-react'

/**
 * DataPage — Main Phase 5 Data Management Route (`/data`).
 * Manages active dataset metadata via TanStack Query and handles CSV upload & demo dataset mutations.
 */
export default function DataPage() {
  const queryClient = useQueryClient()
  const [successMessage, setSuccessMessage] = useState(null)

  // TanStack Query: Fetches current active dataset info and telemetry counts for logged in user via GET /datasets/me.
  const {
    data: datasetInfo,
    isLoading: isDatasetLoading,
  } = useQuery({
    queryKey: ['currentDataset'],
    queryFn: datasetApi.getCurrentDataset,
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  })

  // TanStack Query: Mutation hook for uploading custom CSV dataset via POST /datasets/upload.
  const uploadMutation = useMutation({
    mutationFn: (formData) => datasetApi.uploadDataset(formData),
    onSuccess: (data) => {
      // TanStack Query: Invalidate dataset and dashboard queries so all app pages refresh with the new data
      queryClient.invalidateQueries({ queryKey: ['currentDataset'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      queryClient.invalidateQueries({ queryKey: ['dashboardInsight'] })
      setSuccessMessage(`Successfully uploaded and set "${data.name || 'Dataset'}" as your active dataset!`)
      setTimeout(() => setSuccessMessage(null), 6000)
    },
  })

  // TanStack Query: Mutation hook for seeding standard Demo Dataset via POST /datasets/demo.
  const demoMutation = useMutation({
    mutationFn: datasetApi.loadDemoDataset,
    onSuccess: () => {
      // TanStack Query: Invalidate dataset and dashboard queries so all app pages refresh with demo data
      queryClient.invalidateQueries({ queryKey: ['currentDataset'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      queryClient.invalidateQueries({ queryKey: ['dashboardInsight'] })
      setSuccessMessage('Successfully loaded and activated the OpsCopilot Demo Dataset!')
      setTimeout(() => setSuccessMessage(null), 6000)
    },
  })

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Database size={22} />
            </div>
            <h1 className="font-head text-2xl sm:text-3xl font-bold text-text tracking-tight">
              Data Management
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-muted mt-1">
            Manage your active process event logs, inspect dataset metrics, or upload custom process CSVs
          </p>
        </div>
      </div>

      {/* Success Notification Alert */}
      {successMessage && (
        <div className="p-4 rounded-card bg-success/10 border border-success/30 text-xs text-success flex items-center justify-between gap-3 animate-fade-in-up">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={18} className="shrink-0" />
            <span className="font-medium">{successMessage}</span>
          </div>
          <button
            onClick={() => setSuccessMessage(null)}
            className="text-muted hover:text-text font-bold text-sm cursor-pointer px-1"
          >
            ×
          </button>
        </div>
      )}

      {/* 1. Active Dataset Information Card */}
      <DatasetInfoCard datasetInfo={datasetInfo} isLoading={isDatasetLoading} />

      {/* 2. Quick Demo Dataset Action */}
      <DatasetDemoAction
        onLoadDemo={() => demoMutation.mutate()}
        isLoading={demoMutation.isPending}
      />

      {/* 3. CSV Upload Dropzone Section */}
      <DatasetUploadZone
        onUpload={(formData, callbacks) => uploadMutation.mutate(formData, callbacks)}
        isUploading={uploadMutation.isPending}
        uploadError={uploadMutation.error}
      />
    </div>
  )
}
