import { BrowserRouter, Routes, Route } from 'react-router-dom'
import PublicRoute from './routes/PublicRoute'
import PrivateRoute from './routes/PrivateRoute'

// Stub elements — replaced page by page as each Phases.md phase is built.
const Stub = ({ label }) => <div className="p-10 text-text">{label}</div>

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicRoute />}>
          <Route path="/" element={<Stub label="Landing — Phase 3" />} />
          <Route path="/login" element={<Stub label="Login — Phase 3" />} />
        </Route>

        {/* Public: page itself decides real vs. demo data based on auth state */}
        <Route path="/dashboard" element={<Stub label="Dashboard — Phase 4" />} />

        <Route element={<PrivateRoute />}>
          <Route path="/data" element={<Stub label="Data — Phase 5" />} />
          <Route path="/chat" element={<Stub label="Chat — Phase 6" />} />
          <Route path="/monitor" element={<Stub label="Monitor — Phase 7" />} />
          <Route path="/evals" element={<Stub label="Evaluations — Phase 8" />} />
          <Route path="/settings" element={<Stub label="Settings — Phase 9" />} />
          <Route path="/document" element={<Stub label="SOPs — Phase 10 (stub)" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
