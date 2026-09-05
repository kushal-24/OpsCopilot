import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Database, MessageSquare, Activity, ClipboardCheck, Settings, LogOut } from 'lucide-react'
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
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div className="flex h-screen bg-bg text-text">
      <aside className="flex w-16 flex-col items-center gap-1 border-r border-border bg-surface py-4">
        {NAV_ITEMS.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            title={label}
            className={({ isActive }) =>
              `flex h-10 w-10 items-center justify-center rounded-card ${
                isActive ? 'bg-primary text-primary-fg' : 'text-muted hover:bg-surface-2'
              }`
            }
          >
            {icon}
          </NavLink>
        ))}
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-14 items-center justify-between border-b border-border bg-surface px-5">
          <span className="font-head text-lg font-semibold">OpsCopilot</span>

          <div className="flex items-center gap-3">
            <NavLink to="/settings" title="Settings" className="text-muted hover:text-text">
              <Settings size={18} />
            </NavLink>
            <span className="text-sm text-muted">{user?.fullName}</span>
            <button onClick={handleLogout} title="Log out" className="text-muted hover:text-text">
              <LogOut size={18} />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default Layout
