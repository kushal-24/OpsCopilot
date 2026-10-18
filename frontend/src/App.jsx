import { BrowserRouter, Routes, Route } from 'react-router-dom'
import PublicRoute from './routes/PublicRoute'
import PrivateRoute from './routes/PrivateRoute'
import Layout from './components/Layout'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import DashboardPage from './pages/DashboardPage'
import DataPage from './pages/DataPage'
import ChatPage from './pages/ChatPage'
import EvalsPage from './pages/EvalsPage'
import SettingsPage from './pages/SettingsPage'
import DocumentsPage from './pages/DocumentsPage'

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
            <Route path="/data" element={<DataPage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/evals" element={<EvalsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/document" element={<DocumentsPage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
