import { useState } from 'react'
import { useQuery } from '@tanstack/react-query' // TanStack Query: manages evaluation benchmark runs and result data fetching
import * as evalApi from '../api/evals.api'
import EvalHeader from '../components/evals/EvalHeader'
import EvalSummaryCards from '../components/evals/EvalSummaryCards'
import EvalResultsTable from '../components/evals/EvalResultsTable'
import { AlertCircle } from 'lucide-react'

/**
 * EvalsPage — Main Phase 8 AI Evaluation Benchmark Route (`/evals`).
 * Connects TanStack Query hooks against /eval/runs and /eval/latest.
 */
export default function EvalsPage() {
  const [selectedRunId, setSelectedRunId] = useState(null)
  const [failuresOnly, setFailuresOnly] = useState(false)

  // TanStack Query: Fetches list of historic evaluation benchmark runs via GET /eval/runs.
  const {
    data: runs = [],
    isLoading: isRunsLoading,
  } = useQuery({
    queryKey: ['evalRuns'],
    queryFn: () => evalApi.listEvalRuns(),
    staleTime: 1000 * 60 * 10, // 10 minutes cache
  })

  // TanStack Query: Fetches evaluation run details (either selected runId or latest run) via GET /eval/runs/:id or /eval/latest.
  const {
    data: currentRun,
    isLoading: isRunLoading,
    isError: isRunError,
  } = useQuery({
    queryKey: ['evalRun', selectedRunId || 'latest'],
    queryFn: () => (selectedRunId ? evalApi.getEvalRun(selectedRunId) : evalApi.getLatestEvalRun()),
    staleTime: 1000 * 60 * 10,
  })

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 animate-fade-in-up">
      {/* Header & Run Picker */}
      <EvalHeader
        runs={runs}
        selectedRunId={selectedRunId}
        onSelectRun={(id) => setSelectedRunId(id)}
        currentRun={currentRun}
      />

      {/* Error Alert */}
      {isRunError && (
        <div className="p-4 rounded-card border border-danger/30 bg-danger/10 text-xs text-danger flex items-center gap-2">
          <AlertCircle size={16} />
          <span>Failed to load evaluation benchmark results. Please check database connection.</span>
        </div>
      )}

      {/* No Eval Runs Empty Notice */}
      {!isRunLoading && !isRunsLoading && !currentRun && (
        <div className="p-4 sm:p-6 rounded-card border border-warning/30 bg-warning/10 text-xs text-text space-y-2 animate-fade-in-up">
          <div className="flex items-center gap-2 font-semibold text-warning text-sm">
            <AlertCircle size={18} />
            <span>No Evaluation Benchmark Runs Found in Database</span>
          </div>
          <p className="text-muted leading-relaxed">
            The database does not contain any saved evaluation benchmark runs yet. The 25-question accuracy benchmark is executed in the backend via <code className="font-mono text-warning bg-warning/20 px-1.5 py-0.5 rounded">npx tsx src/services/eval.service.ts</code> to grade AI responses against ground-truth facts.
          </p>
        </div>
      )}

      {/* 1. Accuracy Summary Metric Cards */}
      <EvalSummaryCards
        runData={currentRun}
        isLoading={isRunLoading || isRunsLoading}
      />

      {/* 2. 25-Question Test Results Table */}
      <EvalResultsTable
        results={currentRun?.results}
        failuresOnly={failuresOnly}
        onToggleFailures={setFailuresOnly}
        isLoading={isRunLoading || isRunsLoading}
      />
    </div>
  )
}
