import { useState } from 'react'
import { Sparkles, User, ChevronDown, ChevronUp, Wrench, CheckCircle, AlertTriangle } from 'lucide-react'

/**
 * ChatMessageItem — Renders individual message bubbles with expandable Trust Panel for grounded tool execution details.
 */
export default function ChatMessageItem({ message }) {
  const [showTrustPanel, setShowTrustPanel] = useState(false)
  const isUser = message.role === 'user'

  // Safely parse toolCalls if passed as string or array
  let toolCalls = []
  if (message.toolCalls) {
    toolCalls = Array.isArray(message.toolCalls)
      ? message.toolCalls
      : typeof message.toolCalls === 'string'
      ? JSON.parse(message.toolCalls)
      : []
  }

  const formatTimestamp = (dateStr) => {
    if (!dateStr) return ''
    return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className={`flex gap-3 max-w-4xl mx-auto my-3 animate-fade-in-up ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 shadow-sm ${
          isUser
            ? 'bg-surface-2 border border-border text-text'
            : 'bg-primary text-white shadow-[0_0_12px_rgba(109,85,250,0.4)]'
        }`}
      >
        {isUser ? <User size={16} /> : <Sparkles size={16} />}
      </div>

      {/* Content Container */}
      <div className={`space-y-2 max-w-[85%] sm:max-w-[75%] ${isUser ? 'items-end' : 'items-start'}`}>
        {/* Author Label & Time */}
        <div className={`flex items-center gap-2 text-[11px] font-mono text-muted ${isUser ? 'justify-end' : 'justify-start'}`}>
          <span className="font-semibold text-text">{isUser ? 'Operator' : 'OpsCopilot AI'}</span>
          <span>·</span>
          <span>{formatTimestamp(message.createdAt)}</span>
        </div>

        {/* Message Bubble */}
        <div
          className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed font-body transition-all shadow-sm ${
            isUser
              ? 'bg-primary text-primary-fg rounded-tr-none'
              : 'bg-surface border border-border text-text rounded-tl-none'
          }`}
        >
          <div className="whitespace-pre-wrap break-words">{message.content}</div>
        </div>

        {/* ⚡ Grounded Trust Panel (Visible on AI messages with tool calls) */}
        {!isUser && toolCalls.length > 0 && (
          <div className="rounded-card border border-ai-border bg-ai-bg/60 p-2.5 text-xs space-y-2 mt-2 transition-all">
            <button
              onClick={() => setShowTrustPanel(!showTrustPanel)}
              className="w-full flex items-center justify-between text-[11px] font-mono font-medium text-primary hover:text-primary-hover cursor-pointer"
            >
              <div className="flex items-center gap-1.5">
                <Wrench size={13} className="animate-pulse" />
                <span>⚡ Grounded Tool Reasoning ({toolCalls.length} DB query executed)</span>
              </div>
              {showTrustPanel ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

            {showTrustPanel && (
              <div className="space-y-2 pt-2 border-t border-ai-border/40 font-mono text-[11px]">
                {toolCalls.map((tc, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-surface/80 border border-border/60 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-primary flex items-center gap-1">
                        <CheckCircle size={12} className="text-success" />
                        {tc.tool || tc.name}
                      </span>
                      {tc.error ? (
                        <span className="text-danger flex items-center gap-1 text-[10px]">
                          <AlertTriangle size={11} /> Tool Failed
                        </span>
                      ) : (
                        <span className="text-success text-[10px]">Executed</span>
                      )}
                    </div>

                    {tc.args && Object.keys(tc.args).length > 0 && (
                      <div>
                        <span className="text-muted block text-[10px]">Arguments:</span>
                        <code className="text-text bg-surface-2 p-1 rounded block overflow-x-auto text-[10px]">
                          {JSON.stringify(tc.args)}
                        </code>
                      </div>
                    )}

                    {tc.result && (
                      <div>
                        <span className="text-muted block text-[10px]">Database Output Snippet:</span>
                        <pre className="text-muted bg-surface-2 p-1.5 rounded max-h-24 overflow-y-auto text-[10px] leading-tight">
                          {JSON.stringify(tc.result, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
