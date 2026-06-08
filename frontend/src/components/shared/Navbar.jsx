import { useEffect, useRef, useState } from "react"
import { Link, useLocation } from "react-router-dom"
import {
  Bars3Icon,
  BellIcon,
  ChevronDownIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline"

const pageTitles = {
  "/dashboard": "Dashboard",
  "/expenses": "Expenses",
  "/gpay": "GPay Import",
  "/analytics": "Analytics",
  "/ai": "AI Assistant",
  "/report": "Report",
  "/notifications": "Notifications",
}

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

function Navbar({ onToggleSidebar, onLogout }) {
  const location = useLocation()
  const dropdownRef = useRef(null)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [notificationCount] = useState(0)
  const user = readStoredUser()

  const displayName = user?.name || user?.fullName || "AIFA User"
  const avatarInitial = getInitials(displayName || user?.email)
  const normalizedPath =
    location.pathname === "/"
      ? "/"
      : location.pathname.replace(/\/+$/, "") || "/"
  const pageTitle = pageTitles[normalizedPath] || "AIFA"

  useEffect(() => {
    const closeTimer = window.setTimeout(() => {
      setIsDropdownOpen(false)
    }, 0)

    return () => {
      window.clearTimeout(closeTimer)
    }
  }, [location.pathname])

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener("mousedown", handlePointerDown)
    return () => document.removeEventListener("mousedown", handlePointerDown)
  }, [])

  const handleLogout = () => {
    setIsDropdownOpen(false)
    onLogout()
  }

  return (
    <header className="fixed inset-x-0 top-0 z-40 h-16 border-b border-navy-700 bg-navy-900">
      <div className="flex h-full items-center justify-between px-4 sm:px-6 lg:pl-[240px] lg:pr-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Toggle sidebar"
            onClick={onToggleSidebar}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-navy-700 bg-navy-800 text-white transition hover:border-indigo-500 lg:hidden"
          >
            <Bars3Icon className="h-5 w-5" />
          </button>

          <h1 className="font-heading text-lg font-semibold text-white">
            {pageTitle}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/notifications"
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-navy-700 bg-navy-800 text-slate-300 transition hover:border-indigo-500 hover:text-white"
            aria-label="Notifications"
          >
            <BellIcon className="h-5 w-5" />
            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold leading-none text-white">
              {notificationCount}
            </span>
          </Link>

          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsDropdownOpen((current) => !current)}
              className="flex items-center gap-2 rounded-full border border-navy-700 bg-navy-800 pr-2 transition hover:border-indigo-500"
              aria-label="User menu"
              aria-expanded={isDropdownOpen}
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-500 text-sm font-bold text-white">
                {avatarInitial}
              </span>
              <ChevronDownIcon className="h-4 w-4 text-slate-400" />
            </button>

            {isDropdownOpen ? (
              <div className="absolute right-0 top-12 w-40 rounded-2xl border border-navy-700 bg-navy-900 p-2 shadow-2xl shadow-black/40">
                <Link
                  to="/dashboard"
                  onClick={() => setIsDropdownOpen(false)}
                  className="block rounded-xl px-4 py-2 text-sm text-slate-300 transition hover:bg-navy-700 hover:text-white"
                >
                  Profile
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 rounded-xl px-4 py-2 text-sm text-rose-400 transition hover:bg-navy-700 hover:text-rose-300"
                >
                  <ArrowRightOnRectangleIcon className="h-4 w-4" />
                  Logout
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Navbar
