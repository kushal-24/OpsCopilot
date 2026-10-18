import { useState, useRef } from 'react'
import { UploadCloud, AlertCircle, CheckCircle2, X } from 'lucide-react'

const MAX_SIZE = 2 * 1024 * 1024

/**
 * DocumentUploadZone — Drag-and-drop uploader for .md / .txt SOP files.
 */
export default function DocumentUploadZone({ onUpload, isUploading, uploadError }) {
  const [file, setFile] = useState(null)
  const [name, setName] = useState('')
  const [dragActive, setDragActive] = useState(false)
  const [localError, setLocalError] = useState(null)
  const fileInputRef = useRef(null)

  const validateAndSetFile = (selectedFile) => {
    setLocalError(null)
    if (!selectedFile) return

    const lower = selectedFile.name.toLowerCase()
    if (!lower.endsWith('.md') && !lower.endsWith('.txt')) {
      setLocalError('Invalid file type. Please upload a .md or .txt SOP file.')
      return
    }

    if (selectedFile.size > MAX_SIZE) {
      setLocalError('File size exceeds the 2MB limit. Please upload a smaller SOP.')
      return
    }

    setFile(selectedFile)
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
      setLocalError('Please select an SOP file to upload.')
      return
    }

    const formData = new FormData()
    formData.append('file', file)
    if (name.trim()) formData.append('name', name.trim())

    onUpload(formData, {
      onSuccess: () => {
        setFile(null)
        setName('')
        setLocalError(null)
        if (fileInputRef.current) fileInputRef.current.value = ''
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
    <div className="rounded-card border border-border bg-surface p-4 sm:p-6 space-y-4 transition-all animate-fade-in-up">
      <div className="border-b border-border/60 pb-3">
        <h3 className="font-head text-base font-semibold text-text tracking-tight">
          Upload SOP Document
        </h3>
        <p className="text-xs text-muted">
          Upload a .md or .txt procedure file so the copilot can answer policy questions from it
        </p>
      </div>

      {(localError || uploadError) && (
        <div className="p-3.5 rounded-card bg-danger/10 border border-danger/30 text-xs text-danger flex items-center gap-2.5">
          <AlertCircle size={16} className="shrink-0" />
          <span>{localError || uploadError?.response?.data?.message || uploadError?.message || 'Upload failed. Please check the file and try again.'}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
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
              accept=".md,.txt"
              onChange={handleFileChange}
              className="hidden"
            />
            <UploadCloud size={24} className="text-muted mx-auto mb-3" />
            <h4 className="font-head text-sm font-semibold text-text mb-1">
              Drag & drop your SOP file here
            </h4>
            <p className="text-xs text-muted mb-3">Or click to browse from your device (Max 2MB)</p>
            <span className="inline-block px-3 py-1.5 rounded-card bg-surface text-primary text-xs font-medium border border-border">
              Select .MD / .TXT File
            </span>
          </div>
        ) : (
          <div className="p-4 rounded-card border border-border bg-surface-2/50 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
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

        {file && (
          <div className="space-y-3 pt-2">
            <div>
              <label className="block text-xs font-medium text-text mb-1">Document Name (Optional)</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Defaults to the title inside the file"
                className="w-full px-3 py-2 rounded-input bg-surface-2 border border-border text-xs text-text focus:outline-none focus:border-primary transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={isUploading}
              className="w-full py-2.5 px-4 rounded-card bg-primary text-primary-fg text-xs font-semibold hover:bg-primary-hover flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Reading & Indexing SOP...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={16} />
                  <span>Upload & Index SOP</span>
                </>
              )}
            </button>
          </div>
        )}
      </form>
    </div>
  )
}
