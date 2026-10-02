import { useEffect, useRef } from 'react'
import ChatMessageItem from './ChatMessageItem'
import { Sparkles, MessageSquare, ArrowRight } from 'lucide-react'

const SUGGESTED_PROMPTS = [
  {
    title: 'Identify Primary Bottleneck',
    prompt: 'What is our primary operational bottleneck in this dataset?',
  },
  {
    title: 'Top Delayed Cases',
    prompt: 'List the top 5 slowest cases along with their current activity stage.',
  },
  {
    title: 'Process Completion Rates',
    prompt: 'What is our overall case completion rate and average cycle time in hours?',
  },
  {
    title: 'Priority Distribution',
    prompt: 'Show case volume breakdown by priority level.',
  },
]

/**
 * ChatMessageList — Displays conversation thread, empty state prompt suggestions, and typing indicators.
 */
export default function ChatMessageList({ messages = [], isSending, onSelectPrompt, isLoading }) {
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isSending])

  if (isLoading) {
    return (
      <div className="flex-1 p-4 space-y-4 overflow-y-auto animate-pulse max-w-4xl mx-auto w-full">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-3 items-start">
            <div className="w-8 h-8 rounded-xl bg-surface-2 shrink-0" />
            <div className="space-y-2 flex-1">
              <div className="h-4 bg-surface-2 rounded w-1/4" />
              <div className="h-16 bg-surface-2/60 rounded w-3/4" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 p-4 sm:p-8 overflow-y-auto flex flex-col items-center justify-center text-center max-w-3xl mx-auto w-full animate-fade-in-up">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(109,85,250,0.3)]">
          <Sparkles size={28} />
        </div>

        <h3 className="font-head text-lg sm:text-xl font-bold text-text tracking-tight mb-2">
          OpsCopilot Telemetry Assistant
        </h3>
        <p className="text-xs sm:text-sm text-muted max-w-md mb-6 leading-relaxed">
          Ask questions in plain English about your active process dataset. OpsCopilot queries PostgreSQL in real-time to return grounded, tool-backed answers.
        </p>

        {/* Suggested Prompts Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full text-left">
          {SUGGESTED_PROMPTS.map((item, idx) => (
            <button
              key={idx}
              onClick={() => onSelectPrompt(item.prompt)}
              className="p-3.5 rounded-card bg-surface border border-border hover:border-primary/50 hover:bg-surface-2/60 transition-all text-xs group cursor-pointer flex flex-col justify-between gap-2 shadow-card"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-text font-head">{item.title}</span>
                <ArrowRight size={14} className="text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-muted text-[11px] font-body">{item.prompt}</p>
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 p-4 overflow-y-auto space-y-4">
      {messages.map((msg) => (
        <ChatMessageItem key={msg.id} message={msg} />
      ))}

      {/* Thinking / Tool Calling Indicator */}
      {isSending && (
        <div className="flex gap-3 max-w-4xl mx-auto my-3 animate-fade-in-up">
          <div className="w-8 h-8 rounded-xl bg-primary text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-[0_0_12px_rgba(109,85,250,0.4)]">
            <Sparkles size={16} className="animate-pulse" />
          </div>
          <div className="p-3.5 rounded-2xl rounded-tl-none bg-surface border border-border text-xs text-muted flex items-center gap-2">
            <div className="flex gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" />
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:0.2s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:0.4s]" />
            </div>
            <span className="font-mono text-[11px]">OpsCopilot is querying process telemetry database...</span>
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  )
}
