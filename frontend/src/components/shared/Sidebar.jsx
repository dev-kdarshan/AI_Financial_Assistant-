import { NavLink, Link } from "react-router-dom"
import { ArrowRightOnRectangleIcon } from "@heroicons/react/24/outline"

const navItems = [
  { icon: "🏠", label: "Dashboard", path: "/dashboard" },
  { icon: "💸", label: "Expenses", path: "/expenses" },
  { icon: "📱", label: "GPay Import", path: "/gpay" },
  { icon: "📊", label: "Analytics", path: "/analytics" },
  { icon: "🤖", label: "AI Assistant", path: "/ai" },
  { icon: "📄", label: "Report", path: "/report" },
  { icon: "🔔", label: "Notifications", path: "/notifications" },
]

const readStoredUser = () => {
  if (typeof window === "undefined") {
    return null
  }

  try {
    const rawUser = localStorage.getItem("user")
    return rawUser ? JSON.parse(rawUser) : null
  } catch {
    return null
  }
}

const getInitials = (nameOrEmail) => {
  if (!nameOrEmail) {
    return "A"
  }

  const parts = String(nameOrEmail).trim().split(/\s+/)
  if (parts.length === 1) {
    return parts[0].slice(0, 1).toUpperCase()
  }

  return `${parts[0].slice(0, 1)}${parts[1].slice(0, 1)}`.toUpperCase()
}

function Sidebar({ mobileOpen = false, onClose, onLogout }) {
  const user = readStoredUser()
  const displayName = user?.name || user?.fullName || "AIFA User"
  const email = user?.email || "user@aifa.com"
  const initials = getInitials(displayName || email)

  const handleLogout = () => {
    if (onClose) {
      onClose()
    }

    onLogout()
  }

  return (
    <>
      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-[240px] -translate-x-full flex-col border-r border-navy-700 bg-navy-900 transition-transform duration-300 lg:z-30 lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : ""
        }`}
      >
        <div className="pt-16">
          <div className="px-6 py-6">
            <Link
              to="/dashboard"
              className="font-heading text-xl font-bold text-indigo-400"
            >
              AIFA
            </Link>
          </div>

          <div className="border-t border-navy-700" />

          <nav className="flex-1 overflow-y-auto px-2 py-4">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  [
                    "mx-2 flex items-center gap-3 rounded-xl border-l-2 px-4 py-2.5 text-sm transition",
                    isActive
                      ? "border-indigo-500 bg-navy-700 font-medium text-white"
                      : "border-transparent text-slate-400 hover:bg-navy-700 hover:text-white",
                  ].join(" ")
                }
              >
                <span aria-hidden="true" className="text-lg">
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="border-t border-navy-700 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-500 text-sm font-bold text-white">
              {initials}
            </div>
            <div>
              <p className="text-sm font-medium text-white">{displayName}</p>
              <p className="text-xs text-slate-400">{email}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="mt-4 flex items-center gap-2 text-sm text-rose-400 transition hover:text-rose-300"
          >
            <ArrowRightOnRectangleIcon className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>
    </>
  )
}

export default Sidebar
