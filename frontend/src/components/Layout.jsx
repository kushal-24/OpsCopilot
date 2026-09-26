import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useTheme } from '../theme/theme'
import { LayoutDashboard, Database, MessageSquare, Activity, ClipboardCheck, Settings, LogOut, Sun, Moon } from 'lucide-react'
import { useAuth } from '../auth/auth.context'

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
  { to: '/data', label: 'Data', icon: <Database size={20} /> },
  { to: '/chat', label: 'Chat', icon: <MessageSquare size={20} /> },
  { to: '/monitor', label: 'Monitoring', icon: <Activity size={20} /> },
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

      <aside className="flex w-16 flex-col items-center gap-2 border-r border-border bg-surface/90 backdrop-blur-md py-4 z-20 shadow-sm">
        <NavLink 
          to="/"
          title="Back to Landing Page"
          className="mb-2 w-10 h-10 bg-[#6D55FA] text-white rounded-xl flex items-center justify-center font-bold text-base shadow-[0_0_16px_rgba(109,85,250,0.5)] transition-transform duration-300 hover:scale-110 hover:rotate-6 cursor-pointer"
        >
          ⚡
        </NavLink>
        {NAV_ITEMS.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            title={label}
            className={({ isActive }) =>
              `flex h-10 w-10 items-center justify-center rounded-card transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer ${
                isActive 
                  ? 'bg-primary text-primary-fg shadow-[0_0_16px_rgba(109,85,250,0.45)]' 
                  : 'text-muted hover:bg-surface-2 hover:text-text'
              }`
            }
          >
            {icon}
          </NavLink>
        ))}
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden z-10">
        <header className="flex h-14 items-center justify-between border-b border-border bg-surface/90 backdrop-blur-md px-5 transition-colors">
          <div className="flex items-center gap-2 group cursor-pointer" onClick={() => navigate('/dashboard')}>
            <span className="text-primary font-bold text-lg transition-transform duration-300 group-hover:scale-125 group-hover:rotate-12">⚡</span>
            <span className="font-head text-lg font-semibold tracking-tight">OpsCopilot</span>
            <span className="ml-2 text-[10px] font-mono px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 animate-pulse-glow">
              Telemetry Studio
            </span>
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

        <main className="flex-1 overflow-auto p-4 sm:p-6 bg-bg/50">
          <div key={location.pathname} className="animate-fade-in-up h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

export default Layout

