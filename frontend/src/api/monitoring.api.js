import api from './axios'

export const getMonitoringOverview = (params) =>
  api.get('/monitoring/overview', { params }).then((res) => res.data.data)

export const getMonitoringSummary = (params) =>
  api.get('/monitoring/summary', { params }).then((res) => res.data.data)

export const getLatencyOverTime = (params) =>
  api.get('/monitoring/latency-over-time', { params }).then((res) => res.data.data)

export const getRequestVolumeOverTime = (params) =>
  api.get('/monitoring/request-volume-over-time', { params }).then((res) => res.data.data)

export const getMonitoringRequests = (params) =>
  api.get('/monitoring/requests', { params }).then((res) => res.data.data)
