import api from './axios'

export const uploadDataset = (formData) =>
  api
    .post('/datasets/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((res) => res.data.data)

export const loadDemoDataset = () =>
  api.post('/datasets/demo').then((res) => res.data.data)

export const getCurrentDataset = () =>
  api.get('/datasets/me').then((res) => res.data.data)
