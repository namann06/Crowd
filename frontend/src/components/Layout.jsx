import { Outlet, NavLink, useNavigate } from 'react-router-dom'

/**
 * Layout Component
 * ----------------
 * Main layout wrapper for authenticated pages.
 * Includes:
 * - Sidebar navigation
 * - Header with logout
 * - Content area (Outlet for nested routes)
 */
function Layout({ onLogout }) {
  const navigate = useNavigate()

  // Handle logout
  const handleLogout = () => {
    onLogout()
    navigate('/login')
  }

  // Navigation items
  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/areas', label: 'Areas', icon: '🏢' },
    { path: '/analytics', label: 'Analytics', icon: '📈' },
  ]

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-800 text-white flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-slate-700">
          <h1 className="text-xl font-bold">🎯 Crowd Control</h1>
          <p className="text-sm text-slate-400 mt-1">Management System</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-300 hover:bg-slate-700'
                    }`
                  }
                >
                  <span className="text-xl">{item.icon}</span>
                  <span>{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-slate-700">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-red-600 hover:text-white transition-colors"
          >
            <span className="text-xl">🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800">
              Admin Panel
            </h2>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                👤 Admin
              </span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default Layout
