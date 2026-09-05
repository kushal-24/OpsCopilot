import api from './axios'

export const signup = (payload) =>
  api.post('/users/signup', payload).then((res) => res.data.data)

export const login = (payload) =>
  api.post('/users/login', payload).then((res) => res.data.data)

export const logout = () => api.post('/users/logout').then((res) => res.data.data)

export const getMe = () => api.get('/users/me').then((res) => res.data.data)
