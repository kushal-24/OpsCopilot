import api from './axios'

export const uploadDocument = (formData) =>
  api
    .post('/documents', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((res) => res.data.data)

export const listDocuments = () =>
  api.get('/documents').then((res) => res.data.data)

export const deleteDocument = (documentId) =>
  api.delete(`/documents/${documentId}`).then((res) => res.data)
