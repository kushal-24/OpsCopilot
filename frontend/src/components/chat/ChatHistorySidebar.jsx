import { Plus, MessageSquare, Trash2, Clock, X } from 'lucide-react'

/**
 * ChatHistorySidebar — Renders active chat sessions, new session trigger, and deletion actions.
 */
export default function ChatHistorySidebar({
  sessions = [],
  activeSessionId,
  onSelectSession,
  onCreateSession,
  onDeleteSession,
  isCreating,
  isOpenMobile,
  onCloseMobile,
}) {
  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-30 w-64 bg-surface border-r border-border p-4 flex flex-col justify-between transition-transform duration-300 md:static md:translate-x-0 ${
        isOpenMobile ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
      }`}
    >
      <div className="space-y-4 overflow-hidden flex flex-col h-full">
        {/* Header & New Chat Button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare size={18} className="text-primary" />
            <h2 className="font-head text-sm font-semibold text-text">Chat Sessions</h2>
          </div>
          <button
            onClick={onCloseMobile}
            className="md:hidden p-1 text-muted hover:text-text rounded-lg cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <button
          onClick={onCreateSession}
          disabled={isCreating}
          className="w-full py-2.5 px-3 rounded-card bg-primary text-primary-fg text-xs font-semibold hover:bg-primary-hover flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
        >
          <Plus size={16} />
          <span>{isCreating ? 'Creating...' : 'New Chat Session'}</span>
        </button>

        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
          {sessions.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted font-mono">
              No chat sessions yet.
            </div>
          ) : (
            sessions.map((session) => {
              const isActive = session.id === activeSessionId

              return (
                <div
                  key={session.id}
                  onClick={() => {
                    onSelectSession(session.id)
                    if (onCloseMobile) onCloseMobile()
                  }}
                  className={`group relative flex items-center justify-between p-2.5 rounded-card text-xs transition-all cursor-pointer ${
                    isActive
                      ? 'bg-primary/10 text-primary border border-primary/30 font-medium'
                      : 'text-muted hover:bg-surface-2 hover:text-text border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 pr-6">
                    <MessageSquare size={14} className={isActive ? 'text-primary' : 'text-muted'} />
                    <div className="min-w-0">
                      <p className="truncate font-head font-medium text-xs text-text">
                        {session.title || 'Process Chat'}
                      </p>
                      <span className="text-[10px] font-mono text-muted flex items-center gap-1">
                        <Clock size={10} /> {formatDate(session.createdAt)}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onDeleteSession(session.id)
                    }}
                    title="Delete Chat Session"
                    className="opacity-0 group-hover:opacity-100 p-1 text-muted hover:text-danger rounded transition-opacity cursor-pointer absolute right-2"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              )
            })
          )}
        </div>
      </div>

      <div className="pt-3 border-t border-border/60 text-[11px] text-muted font-mono flex items-center justify-between">
        <span>Session Cap: {sessions.length}/5</span>
        <span className="text-primary font-medium">Grounded Engine</span>
      </div>
    </aside>
  )
}
