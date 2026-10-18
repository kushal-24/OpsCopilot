import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useTheme } from '../theme/theme'
import { LayoutDashboard, Database, MessageSquare, FileText, ClipboardCheck, Settings, LogOut, Sun, Moon } from 'lucide-react'
import { useAuth } from '../auth/auth.context'

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
  { to: '/data', label: 'Data', icon: <Database size={20} /> },
  { to: '/chat', label: 'Chat', icon: <MessageSquare size={20} /> },
  { to: '/document', label: 'SOPs', icon: <FileText size={20} /> },
  { to: '/evals', label: 'Evaluations', icon: <ClipboardCheck size={20} /> },
]

function Layout() {
  const { user, logout } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div className="flex h-screen bg-bg text-text transition-colors relative overflow-hidden">
      {/* Background ambient lighting subtle glow */}
      <div className="glow-ambient-left opacity-40 pointer-events-none" aria-hidden="true" />
      <div className="glow-ambient-right opacity-30 pointer-events-none" aria-hidden="true" />

      {/* Placeholder keeps the content column at the collapsed rail width; the
          sidebar itself overlays the page when expanded, so nothing reflows. */}
      <div className="relative w-16 shrink-0 z-20">
        <aside className="group absolute inset-y-0 left-0 flex w-16 flex-col gap-2 overflow-hidden border-r border-border bg-surface px-3 py-4 transition-[width] duration-200 md:hover:w-56 md:focus-within:w-56">
          <NavLink
            to="/"
            title="Back to Landing Page"
            className="mb-2 flex h-10 w-10 shrink-0 items-center justify-center transition-transform duration-300 hover:scale-110 cursor-pointer"
          >
            <img src="/logo.png" alt="OpsCopilot Logo" className="w-9 h-9 rounded-xl object-cover" />
          </NavLink>
          {NAV_ITEMS.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              title={label}
              className={({ isActive }) =>
                `flex h-10 w-full shrink-0 items-center gap-3 rounded-card px-2.5 transition-colors duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-primary text-primary-fg'
                    : 'text-muted hover:bg-surface-2 hover:text-text'
                }`
              }
            >
              <span className="shrink-0">{icon}</span>
              <span className="hidden md:block whitespace-nowrap text-sm font-medium opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100">
                {label}
              </span>
            </NavLink>
          ))}
        </aside>
      </div>

      <div className="flex flex-1 flex-col overflow-hidden z-10">
        <header className="flex h-14 items-center justify-between border-b border-border bg-surface/90 backdrop-blur-md px-5 transition-colors">
          <div className="flex items-center gap-2 group cursor-pointer" onClick={() => navigate('/dashboard')}>
            <img src="/logo.png" alt="OpsCopilot Logo" className="w-6 h-6 rounded-lg object-cover transition-transform duration-300 group-hover:scale-110" />
            <span className="font-head text-lg font-semibold tracking-tight">OpsCopilot</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
              className="text-muted hover:text-text p-1.5 rounded-full hover:bg-surface-2 transition-all duration-200 hover:scale-110 cursor-pointer"
            >
              {isDark ? <Sun size={18} className="text-warning transition-transform hover:rotate-45" /> : <Moon size={18} className="text-primary transition-transform hover:-rotate-12" />}
            </button>
            <NavLink 
              to="/settings" 
              title="Settings" 
              className={({ isActive }) => 
                `p-1.5 rounded-full transition-all duration-200 hover:scale-110 ${
                  isActive ? 'text-primary bg-primary/10' : 'text-muted hover:text-text hover:bg-surface-2'
                }`
              }
            >
              <Settings size={18} />
            </NavLink>
            <span className="text-sm font-medium text-text px-2.5 py-1 rounded-full bg-surface-2 border border-border/60">
              {user?.fullName || 'Operator'}
            </span>
            <button 
              onClick={handleLogout} 
              title="Log out" 
              className="text-muted hover:text-danger p-1.5 rounded-full hover:bg-danger/10 transition-all duration-200 hover:scale-110 cursor-pointer"
            >
              <LogOut size={18} />
            </button>
          </div>
        </header>

        <main className="relative isolate flex-1 overflow-auto p-4 sm:p-6 bg-bg/50">
          <div className="page-backdrop pointer-events-none absolute inset-x-0 top-0 -z-10 h-[520px]" aria-hidden="true" />
          <div key={location.pathname} className="animate-fade-in-up h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

export default Layout

