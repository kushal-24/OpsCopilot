import { useState } from 'react'
import { Clock, Activity } from 'lucide-react'

/**
 * MonitorCharts — Custom responsive SVG visualizations for latency trends and request volume breakdown.
 */
export default function MonitorCharts({ latencyOverTime = [], requestVolumeOverTime = [], isLoading }) {
  const [hoveredLatency, setHoveredLatency] = useState(null)
  const [hoveredVolume, setHoveredVolume] = useState(null)

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in-up">
        <div className="rounded-card border border-border bg-surface p-6 shadow-card animate-pulse h-80 flex flex-col justify-between">
          <div className="h-5 bg-surface-2 rounded w-1/3" />
          <div className="h-48 bg-surface-2/60 rounded" />
        </div>
        <div className="rounded-card border border-border bg-surface p-6 shadow-card animate-pulse h-80 flex flex-col justify-between">
          <div className="h-5 bg-surface-2 rounded w-1/3" />
          <div className="h-48 bg-surface-2/60 rounded" />
        </div>
      </div>
    )
  }

  // Calculate scales for Latency Line Chart
  const maxLatency = Math.max(...latencyOverTime.map((d) => d.avgLatencyMs), 500)
  const svgWidth = 500
  const svgHeight = 200
  const padding = 35

  const getX = (idx, len) => {
    if (len <= 1) return padding
    return padding + (idx / (len - 1)) * (svgWidth - padding * 2)
  }

  const getY = (val, max) => {
    return svgHeight - padding - (val / max) * (svgHeight - padding * 2)
  }

  const latencyPoints = latencyOverTime.map((d, i) => `${getX(i, latencyOverTime.length)},${getY(d.avgLatencyMs, maxLatency)}`).join(' ')

  // Calculate scales for Request Volume Chart
  const maxVolume = Math.max(...requestVolumeOverTime.map((d) => d.totalRequests), 5)
  const volumeSuccessPoints = requestVolumeOverTime.map((d, i) => `${getX(i, requestVolumeOverTime.length)},${getY(d.successCount, maxVolume)}`).join(' ')
  const volumeErrorPoints = requestVolumeOverTime.map((d, i) => `${getX(i, requestVolumeOverTime.length)},${getY(d.errorCount, maxVolume)}`).join(' ')

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in-up">
      {/* 1. Latency Trend Line Chart */}
      <div className="rounded-card border border-border bg-surface p-3.5 sm:p-6 shadow-card hover:border-border/80 transition-all">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0">
              <Clock size={18} />
            </div>
            <div>
              <h3 className="font-head text-sm sm:text-base font-semibold text-text tracking-tight">
                Response Latency Trend
              </h3>
              <p className="text-[11px] sm:text-xs text-muted">Daily average LLM request latency (ms)</p>
            </div>
          </div>
        </div>

        {latencyOverTime.length === 0 ? (
          <div className="h-52 flex items-center justify-center text-xs text-muted font-mono">
            No latency telemetry logged yet.
          </div>
        ) : (
          <div className="relative">
            <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-52 overflow-visible">
              <defs>
                <linearGradient id="latencyGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6D55FA" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#6D55FA" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              {[0, 0.33, 0.66, 1].map((ratio, i) => {
                const y = padding + ratio * (svgHeight - padding * 2)
                const val = Math.round(maxLatency * (1 - ratio))
                return (
                  <g key={i}>
                    <line
                      x1={padding}
                      y1={y}
                      x2={svgWidth - padding}
                      y2={y}
                      stroke="var(--color-border)"
                      strokeDasharray="4 4"
                      strokeOpacity="0.6"
                    />
                    <text
                      x={padding - 6}
                      y={y + 4}
                      fill="var(--color-muted)"
                      fontSize="9"
                      textAnchor="end"
                      fontFamily="var(--font-mono)"
                    >
                      {val}ms
                    </text>
                  </g>
                )
              })}

              {/* Area Fill */}
              {latencyOverTime.length > 1 && (
                <polygon
                  points={`${padding},${svgHeight - padding} ${latencyPoints} ${svgWidth - padding},${svgHeight - padding}`}
                  fill="url(#latencyGrad)"
                />
              )}

              {/* Polyline */}
              <polyline
                fill="none"
                stroke="#6D55FA"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={latencyPoints}
              />

              {/* Data points */}
              {latencyOverTime.map((d, i) => {
                const cx = getX(i, latencyOverTime.length)
                const cy = getY(d.avgLatencyMs, maxLatency)
                const isHovered = hoveredLatency === i

                return (
                  <g key={i} onMouseEnter={() => setHoveredLatency(i)} onMouseLeave={() => setHoveredLatency(null)}>
                    {isHovered && (
                      <line
                        x1={cx}
                        y1={padding}
                        x2={cx}
                        y2={svgHeight - padding}
                        stroke="#6D55FA"
                        strokeDasharray="2 2"
                        strokeWidth="1"
                      />
                    )}
                    <circle cx={cx} cy={cy} r={isHovered ? '5' : '3'} fill="#6D55FA" className="transition-all cursor-pointer" />
                    {(i === 0 || i === latencyOverTime.length - 1 || i % Math.ceil(latencyOverTime.length / 5) === 0) && (
                      <text
                        x={cx}
                        y={svgHeight - 8}
                        fill="var(--color-muted)"
                        fontSize="9"
                        textAnchor="middle"
                        fontFamily="var(--font-mono)"
                      >
                        {d.date.slice(5)}
                      </text>
                    )}
                  </g>
                )
              })}
            </svg>

            {/* Tooltip */}
            {hoveredLatency !== null && latencyOverTime[hoveredLatency] && (
              <div className="absolute top-2 right-2 p-2 rounded-card bg-surface/95 border border-border shadow-lg text-xs font-mono space-y-1 backdrop-blur-md">
                <div className="font-semibold text-text">{latencyOverTime[hoveredLatency].date}</div>
                <div className="text-primary flex justify-between gap-3">
                  <span>Avg Latency:</span>
                  <span className="font-bold">{latencyOverTime[hoveredLatency].avgLatencyMs} ms</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 2. Request Volume Trend Chart */}
      <div className="rounded-card border border-border bg-surface p-3.5 sm:p-6 shadow-card hover:border-border/80 transition-all">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-success/10 text-success shrink-0">
              <Activity size={18} />
            </div>
            <div>
              <h3 className="font-head text-sm sm:text-base font-semibold text-text tracking-tight">
                Request Volume Trends
              </h3>
              <p className="text-[11px] sm:text-xs text-muted">Daily successful vs. errored request counts</p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-[11px] sm:text-xs font-medium self-start sm:self-auto">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-success shrink-0" />
              <span className="text-muted">Success</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-danger shrink-0" />
              <span className="text-muted">Error</span>
            </div>
          </div>
        </div>

        {requestVolumeOverTime.length === 0 ? (
          <div className="h-52 flex items-center justify-center text-xs text-muted font-mono">
            No request volume logs available.
          </div>
        ) : (
          <div className="relative">
            <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-52 overflow-visible">
              {/* Grid Lines */}
              {[0, 0.33, 0.66, 1].map((ratio, i) => {
                const y = padding + ratio * (svgHeight - padding * 2)
                const val = Math.round(maxVolume * (1 - ratio))
                return (
                  <g key={i}>
                    <line
                      x1={padding}
                      y1={y}
                      x2={svgWidth - padding}
                      y2={y}
                      stroke="var(--color-border)"
                      strokeDasharray="4 4"
                      strokeOpacity="0.6"
                    />
                    <text
                      x={padding - 6}
                      y={y + 4}
                      fill="var(--color-muted)"
                      fontSize="9"
                      textAnchor="end"
                      fontFamily="var(--font-mono)"
                    >
                      {val}
                    </text>
                  </g>
                )
              })}

              <polyline
                fill="none"
                stroke="#16A34A"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={volumeSuccessPoints}
              />
              <polyline
                fill="none"
                stroke="#DC2626"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={volumeErrorPoints}
              />

              {requestVolumeOverTime.map((d, i) => {
                const cx = getX(i, requestVolumeOverTime.length)
                const cySucc = getY(d.successCount, maxVolume)
                const isHovered = hoveredVolume === i

                return (
                  <g key={i} onMouseEnter={() => setHoveredVolume(i)} onMouseLeave={() => setHoveredVolume(null)}>
                    {isHovered && (
                      <line
                        x1={cx}
                        y1={padding}
                        x2={cx}
                        y2={svgHeight - padding}
                        stroke="#16A34A"
                        strokeDasharray="2 2"
                        strokeWidth="1"
                      />
                    )}
                    <circle cx={cx} cy={cySucc} r={isHovered ? '5' : '3'} fill="#16A34A" className="transition-all cursor-pointer" />
                    {(i === 0 || i === requestVolumeOverTime.length - 1 || i % Math.ceil(requestVolumeOverTime.length / 5) === 0) && (
                      <text
                        x={cx}
                        y={svgHeight - 8}
                        fill="var(--color-muted)"
                        fontSize="9"
                        textAnchor="middle"
                        fontFamily="var(--font-mono)"
                      >
                        {d.date.slice(5)}
                      </text>
                    )}
                  </g>
                )
              })}
            </svg>

            {hoveredVolume !== null && requestVolumeOverTime[hoveredVolume] && (
              <div className="absolute top-2 right-2 p-2 rounded-card bg-surface/95 border border-border shadow-lg text-xs font-mono space-y-1 backdrop-blur-md">
                <div className="font-semibold text-text">{requestVolumeOverTime[hoveredVolume].date}</div>
                <div className="text-success flex justify-between gap-3">
                  <span>Success:</span>
                  <span className="font-bold">{requestVolumeOverTime[hoveredVolume].successCount}</span>
                </div>
                <div className="text-danger flex justify-between gap-3">
                  <span>Error:</span>
                  <span className="font-bold">{requestVolumeOverTime[hoveredVolume].errorCount}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
