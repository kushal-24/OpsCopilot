import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query' // TanStack Query: manages chat sessions, message thread state, and mutation invalidation
import * as chatApi from '../api/chat.api'
import ChatHistorySidebar from '../components/chat/ChatHistorySidebar'
import ChatMessageList from '../components/chat/ChatMessageList'
import ChatInputBar from '../components/chat/ChatInputBar'
import { Menu, Sparkles, AlertCircle } from 'lucide-react'

/**
 * ChatPage — Main Phase 6 AI Copilot Chat Route (`/chat`).
 * Connects TanStack Query hooks to /chat/sessions and /chat/sessions/:id/messages.
 */
export default function ChatPage() {
  const queryClient = useQueryClient()
  const [activeSessionId, setActiveSessionId] = useState(null)
  const [isOpenMobile, setIsOpenMobile] = useState(false)
  const [chatError, setChatError] = useState(null)

  // TanStack Query: Fetches user's active chat sessions via GET /chat/sessions.
  const {
    data: sessions = [],
    isLoading: isSessionsLoading,
  } = useQuery({
    queryKey: ['chatSessions'],
    queryFn: chatApi.listChatSessions,
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  })

  // Set initial active session when sessions list loads
  useEffect(() => {
    if (sessions.length > 0 && !activeSessionId) {
      setActiveSessionId(sessions[0].id)
    }
  }, [sessions, activeSessionId])

  // TanStack Query: Fetches message thread history for current active session via GET /chat/sessions/:id/messages.
  const {
    data: messages = [],
    isLoading: isMessagesLoading,
  } = useQuery({
    queryKey: ['chatMessages', activeSessionId],
    queryFn: () => chatApi.getChatMessages(activeSessionId),
    enabled: Boolean(activeSessionId),
    staleTime: 1000 * 30, // 30 seconds cache
  })

  // TanStack Query: Mutation hook for instantiating a new chat session via POST /chat/sessions.
  const createSessionMutation = useMutation({
    mutationFn: (title) => chatApi.createChatSession({ title }),
    onSuccess: (newSession) => {
      // TanStack Query: Invalidate sessions list query so sidebar updates instantly
      queryClient.invalidateQueries({ queryKey: ['chatSessions'] })
      setActiveSessionId(newSession.id)
      setChatError(null)
    },
    onError: (err) => {
      setChatError(err?.response?.data?.message || 'Failed to create chat session.')
    },
  })

  // TanStack Query: Mutation hook for sending user prompt to AI agent via POST /chat/sessions/:id/messages.
  const sendMessageMutation = useMutation({
    mutationFn: (content) => chatApi.sendChatMessage(activeSessionId, { content }),
    onSuccess: (data) => {
      setChatError(null)
      // TanStack Query: Manually update messages query cache with returned user & assistant messages
      queryClient.setQueryData(['chatMessages', activeSessionId], (oldMessages = []) => [
        ...oldMessages,
        data.userMessage,
        data.assistantMessage,
      ])
      queryClient.invalidateQueries({ queryKey: ['chatSessions'] })
    },
    onError: (err) => {
      setChatError(err?.response?.data?.message || err?.message || 'Agent request failed. Please retry.')
      // Refetch messages to sync thread state
      queryClient.invalidateQueries({ queryKey: ['chatMessages', activeSessionId] })
    },
  })

  // TanStack Query: Mutation hook for deleting a session via DELETE /chat/sessions/:id.
  const deleteSessionMutation = useMutation({
    mutationFn: (sessionId) => chatApi.deleteChatSession(sessionId),
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: ['chatSessions'] })
      if (activeSessionId === deletedId) {
        const remaining = sessions.filter((s) => s.id !== deletedId)
        setActiveSessionId(remaining[0]?.id || null)
      }
    },
  })

  const handleSendMessage = (content) => {
    if (!activeSessionId) {
      // Auto-create session if sending first message with no active session
      createSessionMutation.mutate('Process Query', {
        onSuccess: (newSession) => {
          chatApi.sendChatMessage(newSession.id, { content }).then((data) => {
            queryClient.setQueryData(['chatMessages', newSession.id], [
              data.userMessage,
              data.assistantMessage,
            ])
          })
        },
      })
      return
    }

    sendMessageMutation.mutate(content)
  }

  const handleCreateNewSession = () => {
    createSessionMutation.mutate('New Chat')
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-bg text-text rounded-card border border-border overflow-hidden shadow-card animate-fade-in-up">
      {/* Sessions Sidebar */}
      <ChatHistorySidebar
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={(id) => {
          setActiveSessionId(id)
          setChatError(null)
        }}
        onCreateSession={handleCreateNewSession}
        onDeleteSession={(id) => deleteSessionMutation.mutate(id)}
        isCreating={createSessionMutation.isPending}
        isOpenMobile={isOpenMobile}
        onCloseMobile={() => setIsOpenMobile(false)}
      />

      {/* Main Chat Thread Section */}
      <div className="flex-1 flex flex-col min-w-0 bg-bg/60 relative">
        {/* Header Bar */}
        <header className="h-12 border-b border-border bg-surface/80 backdrop-blur-md px-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsOpenMobile(true)}
              className="md:hidden p-1.5 text-muted hover:text-text rounded-lg hover:bg-surface-2 cursor-pointer"
            >
              <Menu size={18} />
            </button>
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-primary" />
              <h2 className="font-head text-xs sm:text-sm font-semibold text-text truncate">
                {sessions.find((s) => s.id === activeSessionId)?.title || 'OpsCopilot AI Assistant'}
              </h2>
            </div>
          </div>

          <span className="text-[10px] font-mono px-2 py-0.5 rounded-pill bg-primary/10 text-primary border border-primary/20">
            Gemini 3.6 Tool Engine
          </span>
        </header>

        {/* Error Notice */}
        {chatError && (
          <div className="p-3 bg-danger/10 border-b border-danger/30 text-xs text-danger flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <AlertCircle size={15} />
              <span>{chatError}</span>
            </div>
            <button onClick={() => setChatError(null)} className="font-bold cursor-pointer">
              ×
            </button>
          </div>
        )}

        {/* Message Thread List */}
        <ChatMessageList
          messages={messages}
          isSending={sendMessageMutation.isPending}
          isLoading={isMessagesLoading || isSessionsLoading}
          onSelectPrompt={handleSendMessage}
        />

        {/* Prompt Input Bar */}
        <ChatInputBar
          onSendMessage={handleSendMessage}
          isSending={sendMessageMutation.isPending}
        />
      </div>
    </div>
  )
}
