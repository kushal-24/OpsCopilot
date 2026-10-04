import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Database, Key, Eye, EyeOff, RotateCcw, ArrowRight } from 'lucide-react'

/**
 * DatasetSettings — Dataset quick actions and workspace Gemini API Key field.
 */
export default function DatasetSettings({ onLoadDemo, isDemoLoading }) {
  const [apiKey, setApiKey] = useState('********************************')
  const [showApiKey, setShowApiKey] = useState(false)
  const [keySaved, setKeySaved] = useState(false)

  const handleSaveApiKey = (e) => {
    e.preventDefault()
    setKeySaved(true)
    setTimeout(() => setKeySaved(false), 3000)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in-up">
      {/* 1. Dataset Quick Controls Card */}
      <div className="rounded-card border border-border bg-surface p-4 sm:p-6 shadow-card space-y-4">
        <div className="flex items-center gap-2.5 border-b border-border/60 pb-3">
          <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0">
            <Database size={18} />
          </div>
          <div>
            <h3 className="font-head text-sm sm:text-base font-semibold text-text tracking-tight">
              Active Dataset Controls
            </h3>
            <p className="text-[11px] sm:text-xs text-muted">Quick management for your workspace event log dataset</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="p-3.5 rounded-card bg-surface-2/60 border border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <span className="font-semibold text-text block font-head">Reset to Demo Dataset</span>
              <span className="text-muted text-[11px]">Re-seeds workspace with standard ~2,940 demo log</span>
            </div>
            <button
              onClick={onLoadDemo}
              disabled={isDemoLoading}
              className="px-3 py-1.5 rounded-card bg-surface border border-border text-text font-semibold hover:bg-surface-2 flex items-center gap-1.5 self-start sm:self-auto shadow-sm cursor-pointer disabled:opacity-50"
            >
              <RotateCcw size={13} className={isDemoLoading ? 'animate-spin text-primary' : ''} />
              <span>{isDemoLoading ? 'Seeding...' : 'Reset Demo'}</span>
            </button>
          </div>

          <div className="p-3.5 rounded-card bg-surface-2/60 border border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <span className="font-semibold text-text block font-head">Full Dataset Management</span>
              <span className="text-muted text-[11px]">Upload custom CSVs and inspect detailed case counts</span>
            </div>
            <Link
              to="/data"
              className="px-3 py-1.5 rounded-card bg-primary text-primary-fg font-semibold hover:bg-primary-hover flex items-center gap-1.5 self-start sm:self-auto shadow-sm"
            >
              <span>Go to Data Hub</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Workspace Gemini API Key Field */}
      <div className="rounded-card border border-border bg-surface p-4 sm:p-6 shadow-card space-y-4">
        <div className="flex items-center gap-2.5 border-b border-border/60 pb-3">
          <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0">
            <Key size={18} />
          </div>
          <div>
            <h3 className="font-head text-sm sm:text-base font-semibold text-text tracking-tight">
              Gemini API Key Configuration
            </h3>
            <p className="text-[11px] sm:text-xs text-muted">Workspace Google Gemini API credentials</p>
          </div>
        </div>

        <form onSubmit={handleSaveApiKey} className="space-y-3.5">
          <div>
            <label className="block text-xs font-medium text-text mb-1">API Key (Environment Default)</label>
            <div className="relative">
              <input
                type={showApiKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full py-2 pl-3 pr-10 rounded-input bg-surface-2 border border-border text-xs text-text font-mono focus:outline-none focus:border-primary"
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-text cursor-pointer"
              >
                {showApiKey ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            <span className="text-[10px] text-muted font-mono mt-1 block">
              Defaulted to server environment <code className="text-primary">GEMINI_API_KEY</code>.
            </span>
          </div>

          <button
            type="submit"
            className="px-4 py-2 rounded-card bg-surface border border-border text-xs font-semibold text-text hover:bg-surface-2 shadow-sm cursor-pointer"
          >
            {keySaved ? 'API Key Saved!' : 'Save Key Override'}
          </button>
        </form>
      </div>
    </div>
  )
}
