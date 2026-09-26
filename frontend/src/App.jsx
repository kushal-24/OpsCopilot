import { BrowserRouter, Routes, Route } from 'react-router-dom'
import PublicRoute from './routes/PublicRoute'
import PrivateRoute from './routes/PrivateRoute'
import Layout from './components/Layout'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'

// Stub elements — replaced page by page as each Phases.md phase is built.
const Stub = ({ label }) => <div className="p-10 text-text">{label}</div>

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
          <Route path="/dashboard" element={<Stub label="Dashboard — Phase 4" />} />

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
