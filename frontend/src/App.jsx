import { BrowserRouter, Routes, Route } from 'react-router-dom'
import PublicRoute from './routes/PublicRoute'
import PrivateRoute from './routes/PrivateRoute'
import Layout from './components/Layout'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import DashboardPage from './pages/DashboardPage'

import { Activity } from 'lucide-react'

// Enhanced Stub component incorporating basic landing page animations & micro-interactions
const Stub = ({ label }) => (
  <div className="max-w-4xl mx-auto py-12 px-4">
    <div className="rounded-3xl p-8 bg-surface border border-border shadow-xl relative overflow-hidden transition-all duration-300">
      <div className="absolute -top-16 -right-16 w-36 h-36 bg-primary/10 rounded-full blur-2xl pointer-events-none animate-pulse-glow" />
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold text-lg animate-scale-in">
          ⚡
        </div>
        <div>
          <h2 className="font-head text-2xl font-bold text-text tracking-tight flex items-center gap-2">
            {label}
          </h2>
          <p className="text-xs font-mono text-muted mt-0.5">Telemetry & Mining Module</p>
        </div>
      </div>
      <div className="p-4 rounded-2xl bg-surface-2/60 border border-border/60 flex items-center gap-3 text-xs font-mono text-muted mt-6">
        <Activity className="w-4 h-4 text-primary animate-pulse" />
        <span>Module interface active. Grounded Process Mining pipeline initialized.</span>
      </div>
    </div>
  </div>
)


function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth-free: landing page is always accessible */}
        <Route path="/" element={<LandingPage />} />

        {/* Public auth routes: redirect to /dashboard if already logged in */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
        </Route>


        <Route element={<Layout />}>
          {/* Public: page itself decides real vs. demo data based on auth state */}
          <Route path="/dashboard" element={<DashboardPage />} />

          <Route element={<PrivateRoute />}>
            <Route path="/data" element={<Stub label="Data — Phase 5" />} />
            <Route path="/chat" element={<Stub label="Chat — Phase 6" />} />
            <Route path="/monitor" element={<Stub label="Monitor — Phase 7" />} />
            <Route path="/evals" element={<Stub label="Evaluations — Phase 8" />} />
            <Route path="/settings" element={<Stub label="Settings — Phase 9" />} />
            <Route path="/document" element={<Stub label="SOPs — Phase 10 (stub)" />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
