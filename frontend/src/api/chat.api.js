import api from './axios'

export const createChatSession = (payload) =>
  api.post('/chat/sessions', payload).then((res) => res.data.data)

export const listChatSessions = () =>
  api.get('/chat/sessions').then((res) => res.data.data)

export const getChatMessages = (sessionId) =>
  api.get(`/chat/sessions/${sessionId}/messages`).then((res) => res.data.data)

export const sendChatMessage = (sessionId, payload) =>
  api.post(`/chat/sessions/${sessionId}/messages`, payload).then((res) => res.data.data)

export const deleteChatSession = (sessionId) =>
  api.delete(`/chat/sessions/${sessionId}`).then((res) => res.data.data)
