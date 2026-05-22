import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, LogOut, HardHat } from 'lucide-react'

export default function Sidebar() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('erp_user') || '{}')

  const handleLogout = () => {
    localStorage.removeItem('erp_token')
    localStorage.removeItem('erp_user')
    navigate('/login')
  }

  return (
    <aside className="fixed left-0 top-0 h-screen w-60 bg-white border-r border-border flex flex-col z-40">
      {/* Brand */}
      <div className="px-5 py-5 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center flex-shrink-0">
            <HardHat size={16} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-accent leading-none">Build ERP</p>
            <p className="text-xs text-muted mt-0.5">Construction Manager</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              isActive
                ? 'bg-accent text-white'
                : 'text-gray-600 hover:bg-subtle hover:text-accent'
            }`
          }
        >
          <LayoutDashboard size={16} />
          Dashboard
        </NavLink>
      </nav>

      {/* User & Logout */}
      <div className="px-3 py-4 border-t border-border space-y-1">
        <div className="px-3 py-2">
          <p className="text-xs font-medium text-accent truncate">{user.full_name || 'User'}</p>
          <p className="text-xs text-muted truncate">{user.phone_number || ''}</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
        >
          <LogOut size={16} />
          Sign out
        </button>
      </div>
    </aside>
  )
}
