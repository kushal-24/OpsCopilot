import { useState } from 'react'
import { TrendingUp, Layers } from 'lucide-react'

/**
 * DashboardCharts — Custom responsive SVG visualizations for process throughput timeline and activity bottleneck ranking.
 */
export default function DashboardCharts({ throughput = [], activityPerformance = [], isLoading }) {
  const [hoveredPoint, setHoveredPoint] = useState(null)

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

  // Calculate scales for Throughput SVG Chart
  const dates = throughput.map((d) => d.date)
  const startedVals = throughput.map((d) => d.startedCases)
  const completedVals = throughput.map((d) => d.completedCases)
  const maxVal = Math.max(...startedVals, ...completedVals, 5)

  const svgWidth = 500
  const svgHeight = 200
  const padding = 30

  const getX = (idx) => {
    if (throughput.length <= 1) return padding
    return padding + (idx / (throughput.length - 1)) * (svgWidth - padding * 2)
  }

  const getY = (val) => {
    return svgHeight - padding - (val / maxVal) * (svgHeight - padding * 2)
  }

  const startedPoints = throughput.map((d, i) => `${getX(i)},${getY(d.startedCases)}`).join(' ')
  const completedPoints = throughput.map((d, i) => `${getX(i)},${getY(d.completedCases)}`).join(' ')

  const maxActivityHours = Math.max(...activityPerformance.map((a) => a.avgDurationHours), 1)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in-up">
      {/* 1. Throughput Timeline Chart */}
      <div className="rounded-card border border-border bg-surface p-3.5 sm:p-6 shadow-card hover:border-border/80 transition-all">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0">
              <TrendingUp size={18} />
            </div>
            <div>
              <h3 className="font-head text-sm sm:text-base font-semibold text-text tracking-tight">
                Case Throughput
              </h3>
              <p className="text-[11px] sm:text-xs text-muted">Daily started vs. completed cases</p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-[11px] sm:text-xs font-medium self-start sm:self-auto">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-primary shrink-0" />
              <span className="text-muted">Started</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-success shrink-0" />
              <span className="text-muted">Completed</span>
            </div>
          </div>
        </div>

        {throughput.length === 0 ? (
          <div className="h-52 flex items-center justify-center text-xs text-muted font-mono">
            No throughput telemetry records found.
          </div>
        ) : (
          <div className="relative">
            <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-52 overflow-visible">
              <defs>
                <linearGradient id="startedGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6D55FA" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#6D55FA" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="completedGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#16A34A" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#16A34A" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              {[0, 0.33, 0.66, 1].map((ratio, i) => {
                const y = padding + ratio * (svgHeight - padding * 2)
                const val = Math.round(maxVal * (1 - ratio))
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

              {/* Area Fills */}
              {throughput.length > 1 && (
                <>
                  <polygon
                    points={`${padding},${svgHeight - padding} ${startedPoints} ${svgWidth - padding},${svgHeight - padding}`}
                    fill="url(#startedGrad)"
                  />
                  <polygon
                    points={`${padding},${svgHeight - padding} ${completedPoints} ${svgWidth - padding},${svgHeight - padding}`}
                    fill="url(#completedGrad)"
                  />
                </>
              )}

              {/* Polylines */}
              <polyline
                fill="none"
                stroke="#6D55FA"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={startedPoints}
              />
              <polyline
                fill="none"
                stroke="#16A34A"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={completedPoints}
              />

              {/* Data points & hover listener */}
              {throughput.map((d, i) => {
                const cx = getX(i)
                const cyStart = getY(d.startedCases)
                const cyComp = getY(d.completedCases)
                const isHovered = hoveredPoint === i

                return (
                  <g key={i} onMouseEnter={() => setHoveredPoint(i)} onMouseLeave={() => setHoveredPoint(null)}>
                    {/* Hover vertical reference line */}
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

                    <circle cx={cx} cy={cyStart} r={isHovered ? '5' : '3'} fill="#6D55FA" className="transition-all" />
                    <circle cx={cx} cy={cyComp} r={isHovered ? '5' : '3'} fill="#16A34A" className="transition-all" />

                    {/* Date label at bottom */}
                    {(i === 0 || i === throughput.length - 1 || i % Math.ceil(throughput.length / 5) === 0) && (
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

            {/* Hover Tooltip display */}
            {hoveredPoint !== null && throughput[hoveredPoint] && (
              <div className="absolute top-2 right-2 p-2 rounded-card bg-surface/95 border border-border shadow-lg text-xs font-mono space-y-1 backdrop-blur-md">
                <div className="font-semibold text-text">{throughput[hoveredPoint].date}</div>
                <div className="text-primary flex justify-between gap-3">
                  <span>Started:</span>
                  <span className="font-bold">{throughput[hoveredPoint].startedCases}</span>
                </div>
                <div className="text-success flex justify-between gap-3">
                  <span>Completed:</span>
                  <span className="font-bold">{throughput[hoveredPoint].completedCases}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 2. Activity Bottleneck Bar Chart */}
      <div className="rounded-card border border-border bg-surface p-3.5 sm:p-6 shadow-card hover:border-border/80 transition-all">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-warning/10 text-warning shrink-0">
              <Layers size={18} />
            </div>
            <div>
              <h3 className="font-head text-sm sm:text-base font-semibold text-text tracking-tight">
                Activity Duration Rankings
              </h3>
              <p className="text-[11px] sm:text-xs text-muted">Average wait time per process phase (hours)</p>
            </div>
          </div>
        </div>

        {activityPerformance.length === 0 ? (
          <div className="h-52 flex items-center justify-center text-xs text-muted font-mono">
            No activity metrics available.
          </div>
        ) : (
          <div className="space-y-3.5 h-52 overflow-y-auto pr-1">
            {activityPerformance.slice(0, 6).map((item, idx) => {
              const pct = Math.min(100, (item.avgDurationHours / maxActivityHours) * 100)
              const isTopBottleneck = idx === 0

              return (
                <div key={item.activity} className="space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-text truncate max-w-[200px]" title={item.activity}>
                      {item.activity}
                    </span>
                    <div className="flex items-center gap-2 font-mono text-muted">
                      <span>{item.occurrences} cases</span>
                      <span className={`font-bold ${isTopBottleneck ? 'text-warning' : 'text-text'}`}>
                        {item.avgDurationHours}h avg
                      </span>
                    </div>
                  </div>

                  <div className="w-full h-2.5 rounded-pill bg-surface-2 border border-border/40 overflow-hidden">
                    <div
                      className={`h-full rounded-pill transition-all duration-500 ${
                        isTopBottleneck
                          ? 'bg-gradient-to-r from-amber-500 to-red-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]'
                          : 'bg-primary/80'
                      }`}
                      style={{ width: `${Math.max(pct, 4)}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
