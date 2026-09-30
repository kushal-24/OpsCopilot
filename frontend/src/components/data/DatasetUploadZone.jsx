import { useState, useRef } from 'react'
import { UploadCloud, FileSpreadsheet, AlertCircle, CheckCircle2, Info, X } from 'lucide-react'

const REQUIRED_COLUMNS = [
  'event_id',
  'case_id',
  'activity',
  'timestamp',
  'resource',
  'status',
  'priority',
  'channel',
  'customer_type',
  'case_created_at',
]

/**
 * DatasetUploadZone — Drag-and-drop CSV file uploader with column schema checklist and validation.
 */
export default function DatasetUploadZone({ onUpload, isUploading, uploadError }) {
  const [file, setFile] = useState(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [dragActive, setDragActive] = useState(false)
  const [localError, setLocalError] = useState(null)
  const [showSchema, setShowSchema] = useState(false)
  const fileInputRef = useRef(null)

  const validateAndSetFile = (selectedFile) => {
    setLocalError(null)
    if (!selectedFile) return

    if (!selectedFile.name.toLowerCase().endsWith('.csv')) {
      setLocalError('Invalid file type. Please upload a .csv event log file.')
      return
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setLocalError('File size exceeds the 10MB limit. Please upload a smaller CSV.')
      return
    }

    setFile(selectedFile)
    if (!name) {
      setName(selectedFile.name.replace(/\.csv$/i, ''))
    }
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0])
    }
  }

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0])
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!file) {
      setLocalError('Please select a CSV file to upload.')
      return
    }

    const formData = new FormData()
    formData.append('file', file)
    if (name.trim()) formData.append('name', name.trim())
    if (description.trim()) formData.append('description', description.trim())

    onUpload(formData, {
      onSuccess: () => {
        setFile(null)
        setName('')
        setDescription('')
        setLocalError(null)
      },
    })
  }

  const removeFile = () => {
    setFile(null)
    setLocalError(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  }

  return (
    <div className="rounded-card border border-border bg-surface p-4 sm:p-6 shadow-card space-y-4 transition-all animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-3">
        <div>
          <h3 className="font-head text-base font-semibold text-text tracking-tight">
            Upload Process Dataset
          </h3>
          <p className="text-xs text-muted">Upload a flat event log CSV file to replace your active dataset</p>
        </div>
        <button
          type="button"
          onClick={() => setShowSchema(!showSchema)}
          className="text-xs font-medium text-primary hover:text-primary-hover flex items-center gap-1 self-start sm:self-auto cursor-pointer"
        >
          <Info size={14} />
          <span>{showSchema ? 'Hide Required CSV Columns' : 'View Required CSV Schema'}</span>
        </button>
      </div>

      {/* CSV Schema Helper Info */}
      {showSchema && (
        <div className="p-4 rounded-card bg-surface-2/70 border border-border/80 text-xs space-y-2 animate-fade-in-up">
          <span className="font-semibold text-text block">Required CSV Header Columns:</span>
          <div className="flex flex-wrap gap-1.5">
            {REQUIRED_COLUMNS.map((col) => (
              <span key={col} className="font-mono px-2 py-0.5 rounded-md bg-surface border border-border text-[11px] text-muted">
                {col}
              </span>
            ))}
          </div>
          <p className="text-[11px] text-muted mt-1">
            Every CSV row represents a process event tied to a <code className="font-mono text-primary">case_id</code>.
          </p>
        </div>
      )}

      {/* Error Notices */}
      {(localError || uploadError) && (
        <div className="p-3.5 rounded-card bg-danger/10 border border-danger/30 text-xs text-danger flex items-center gap-2.5">
          <AlertCircle size={16} className="shrink-0" />
          <span>{localError || uploadError?.response?.data?.message || uploadError?.message || 'Upload failed. Please check file format.'}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Dropzone */}
        {!file ? (
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-card p-6 sm:p-8 text-center cursor-pointer transition-all duration-200 ${
              dragActive
                ? 'border-primary bg-primary/10 scale-[1.01]'
                : 'border-border/80 hover:border-primary/50 hover:bg-surface-2/40'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3">
              <UploadCloud size={24} />
            </div>
            <h4 className="font-head text-sm font-semibold text-text mb-1">
              Drag & drop your CSV file here
            </h4>
            <p className="text-xs text-muted mb-3">Or click to browse from your device (Max 10MB)</p>
            <span className="inline-block px-3 py-1.5 rounded-pill bg-primary/10 text-primary text-xs font-medium border border-primary/20">
              Select .CSV File
            </span>
          </div>
        ) : (
          <div className="p-4 rounded-card border border-border bg-surface-2/50 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2.5 rounded-xl bg-success/15 text-success shrink-0">
                <FileSpreadsheet size={22} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-text truncate">{file.name}</p>
                <p className="text-[11px] font-mono text-muted">{formatFileSize(file.size)}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={removeFile}
              disabled={isUploading}
              className="p-1.5 rounded-full hover:bg-surface-2 text-muted hover:text-danger transition-colors cursor-pointer"
              title="Remove file"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Inputs */}
        {file && (
          <div className="space-y-3 pt-2">
            <div>
              <label className="block text-xs font-medium text-text mb-1">Dataset Name (Optional)</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Q3 Technical Support Log"
                className="w-full px-3 py-2 rounded-input bg-surface-2 border border-border text-xs text-text focus:outline-none focus:border-primary transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text mb-1">Description (Optional)</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Short summary of this dataset source or domain..."
                rows={2}
                className="w-full px-3 py-2 rounded-input bg-surface-2 border border-border text-xs text-text focus:outline-none focus:border-primary transition-colors resize-none"
              />
            </div>
            <button
              type="submit"
              disabled={isUploading}
              className="w-full py-2.5 px-4 rounded-card bg-primary text-primary-fg text-xs font-semibold hover:bg-primary-hover flex items-center justify-center gap-2 shadow-sm transition-all duration-200 cursor-pointer disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Parsing & Importing Dataset...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={16} />
                  <span>Upload & Set as Active Dataset</span>
                </>
              )}
            </button>
          </div>
        )}
      </form>
    </div>
  )
}
