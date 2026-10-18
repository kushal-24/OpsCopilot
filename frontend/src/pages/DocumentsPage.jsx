import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query' // TanStack Query: manages SOP document server state and mutation invalidation
import * as datasetApi from '../api/dataset.api'
import * as documentsApi from '../api/documents.api'
import DocumentUploadZone from '../components/documents/DocumentUploadZone'
import DocumentList from '../components/documents/DocumentList'
import { FileText, CheckCircle2, Database } from 'lucide-react'

/**
 * DocumentsPage — SOP document management route (`/document`).
 * Uploads, lists and deletes the SOPs the chat copilot searches (RAG).
 */
export default function DocumentsPage() {
  const queryClient = useQueryClient()
  const [successMessage, setSuccessMessage] = useState(null)

  // TanStack Query: shares the ['currentDataset'] cache with the Data page — SOPs attach to the active dataset, so none means no uploads.
  const { data: datasetInfo, isLoading: isDatasetLoading } = useQuery({
    queryKey: ['currentDataset'],
    queryFn: datasetApi.getCurrentDataset,
    staleTime: 1000 * 60 * 5,
  })

  // TanStack Query: fetches the SOP documents of the active dataset via GET /documents.
  const { data: documents = [], isLoading: isDocumentsLoading } = useQuery({
    queryKey: ['documents'],
    queryFn: documentsApi.listDocuments,
    enabled: Boolean(datasetInfo),
  })

  // TanStack Query: mutation for uploading an SOP via POST /documents, then refreshes the list.
  const uploadMutation = useMutation({
    mutationFn: (formData) => documentsApi.uploadDocument(formData),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['documents'] })
      setSuccessMessage(`"${data.name}" was indexed (${data.chunkCount} chunks) and is ready for the copilot.`)
      setTimeout(() => setSuccessMessage(null), 6000)
    },
    // A failed upload still leaves a "failed" row on the server, so refresh the list too.
    onError: () => queryClient.invalidateQueries({ queryKey: ['documents'] }),
  })

  // TanStack Query: mutation for deleting an SOP via DELETE /documents/:id, then refreshes the list.
  const deleteMutation = useMutation({
    mutationFn: (documentId) => documentsApi.deleteDocument(documentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] })
      setSuccessMessage('SOP document deleted.')
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
              <FileText size={22} />
            </div>
            <h1 className="font-head text-2xl sm:text-3xl font-bold text-text tracking-tight">
              SOP Documents
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-muted mt-1">
            Upload your standard operating procedures so the copilot can answer policy and target questions from them
          </p>
        </div>
      </div>

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

      {!isDatasetLoading && !datasetInfo ? (
        <div className="rounded-card border border-dashed border-border/80 bg-surface/50 p-6 sm:p-8 text-center space-y-3 animate-fade-in-up">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
            <Database size={24} />
          </div>
          <div>
            <h3 className="font-head text-base font-semibold text-text">No Active Dataset</h3>
            <p className="text-xs text-muted max-w-md mx-auto mt-1">
              SOP documents are attached to your active dataset. Upload a dataset or load the demo dataset first.
            </p>
            <Link
              to="/data"
              className="inline-block mt-3 px-3 py-1.5 rounded-pill bg-primary/10 text-primary text-xs font-medium border border-primary/20 hover:bg-primary/15"
            >
              Go to Data Management
            </Link>
          </div>
        </div>
      ) : (
        <>
          <DocumentUploadZone
            onUpload={(formData, callbacks) => uploadMutation.mutate(formData, callbacks)}
            isUploading={uploadMutation.isPending}
            uploadError={uploadMutation.error}
          />
          <DocumentList
            documents={documents}
            isLoading={isDatasetLoading || isDocumentsLoading}
            onDelete={(id, callbacks) => deleteMutation.mutate(id, callbacks)}
            isDeleting={deleteMutation.isPending}
          />
        </>
      )}
    </div>
  )
}
