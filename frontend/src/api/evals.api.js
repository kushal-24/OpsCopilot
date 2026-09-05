import api from './axios'

export const getLatestEvalRun = (params) =>
  api.get('/eval/latest', { params }).then((res) => res.data.data)

export const listEvalRuns = (params) =>
  api.get('/eval/runs', { params }).then((res) => res.data.data)

export const getEvalRun = (runId) =>
  api.get(`/eval/runs/${runId}`).then((res) => res.data.data)
