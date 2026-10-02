import { useState, useRef, useEffect } from 'react'
import { Send, Sparkles } from 'lucide-react'

/**
 * ChatInputBar — Interactive prompt input field for sending queries to OpsCopilot AI agent.
 */
export default function ChatInputBar({ onSendMessage, isSending, disabled }) {
  const [content, setContent] = useState('')
  const textareaRef = useRef(null)

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`
    }
  }, [content])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!content.trim() || isSending || disabled) return
    onSendMessage(content.trim())
    setContent('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-3 sm:p-4 border-t border-border bg-surface/90 backdrop-blur-md">
      <div className="max-w-4xl mx-auto space-y-2">
        <div className="relative flex items-center rounded-2xl bg-surface-2 border border-border/80 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all shadow-sm">
          <textarea
            ref={textareaRef}
            rows={1}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled || isSending}
            placeholder={
              disabled
                ? 'Upload a dataset or load demo data to start chatting...'
                : 'Ask OpsCopilot about your dataset (e.g. "What is our slowest activity?")...'
            }
            className="w-full py-3 pl-4 pr-12 text-xs sm:text-sm bg-transparent text-text placeholder:text-muted focus:outline-none resize-none max-h-32 disabled:opacity-50 font-body"
          />

          <button
            type="submit"
            disabled={!content.trim() || isSending || disabled}
            title="Send Query"
            className="absolute right-2 p-2 rounded-xl bg-primary text-primary-fg hover:bg-primary-hover disabled:opacity-40 disabled:hover:bg-primary transition-all cursor-pointer shadow-sm"
          >
            {isSending ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Send size={15} />
            )}
          </button>
        </div>

        <div className="flex items-center justify-between text-[10px] font-mono text-muted px-1">
          <span className="flex items-center gap-1">
            <Sparkles size={11} className="text-primary" />
            Grounded in active telemetry database
          </span>
          <span className="hidden sm:inline">Press Enter to send · Shift + Enter for newline</span>
        </div>
      </div>
    </form>
  )
}
