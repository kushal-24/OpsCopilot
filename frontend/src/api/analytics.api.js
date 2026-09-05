import api from './axios'

// Dashboard domain — backend groups this under /analytics, not /dashboard.
export const getDashboard = (params) =>
  api.get('/analytics/dashboard', { params }).then((res) => res.data.data)

export const getSummary = (params) =>
  api.get('/analytics/summary', { params }).then((res) => res.data.data)

export const getActivityPerformance = (params) =>
  api.get('/analytics/activity-performance', { params }).then((res) => res.data.data)

export const getThroughput = (params) =>
  api.get('/analytics/throughput', { params }).then((res) => res.data.data)

export const getSlowestCases = (params) =>
  api.get('/analytics/slowest-cases', { params }).then((res) => res.data.data)

export const getStatusBreakdown = (params) =>
  api.get('/analytics/status', { params }).then((res) => res.data.data)

export const getPriorityBreakdown = (params) =>
  api.get('/analytics/priority', { params }).then((res) => res.data.data)

export const getInsight = (params) =>
  api.get('/analytics/insight', { params }).then((res) => res.data.data)
