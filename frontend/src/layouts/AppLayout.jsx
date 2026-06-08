import { useEffect, useState } from "react"
import { useLocation } from "react-router-dom"
import BottomTabBar from "../components/shared/BottomTabBar"
import Navbar from "../components/shared/Navbar"
import Sidebar from "../components/shared/Sidebar"

function AppLayout({ children }) {
  const location = useLocation()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const toggleSidebar = () => {
    setIsSidebarOpen((current) => !current)
  }

  const closeSidebar = () => {
    setIsSidebarOpen(false)
  }

  const handleLogout = () => {
    localStorage.clear()
    window.location.href = "/auth"
  }

  useEffect(() => {
    const closeTimer = window.setTimeout(() => {
      closeSidebar()
    }, 0)

    return () => {
      window.clearTimeout(closeTimer)
    }
  }, [location.pathname])

  useEffect(() => {
    document.body.style.overflow = isSidebarOpen ? "hidden" : ""

    return () => {
      document.body.style.overflow = ""
    }
  }, [isSidebarOpen])

  return (
    <div className="min-h-screen bg-navy-950 text-white">
      {isSidebarOpen ? (
        <button
          type="button"
          aria-label="Close sidebar overlay"
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={closeSidebar}
        />
      ) : null}

      <Sidebar
        mobileOpen={isSidebarOpen}
        onClose={closeSidebar}
        onLogout={handleLogout}
      />

      <Navbar onLogout={handleLogout} onToggleSidebar={toggleSidebar} />

      <main className="min-h-screen pt-16 lg:ml-[240px]">
        <div className="px-4 py-8 pb-24 sm:px-6 lg:px-8 lg:pb-8">
          {children}
        </div>
      </main>

      <BottomTabBar />
    </div>
  )
}

export default AppLayout
