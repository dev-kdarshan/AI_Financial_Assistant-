import { NavLink } from "react-router-dom"

const tabs = [
  { icon: "🏠", label: "Dashboard", path: "/dashboard" },
  { icon: "💸", label: "Expenses", path: "/expenses" },
  { icon: "📱", label: "GPay", path: "/gpay" },
  { icon: "📊", label: "Analytics", path: "/analytics" },
  { icon: "🤖", label: "AI", path: "/ai" },
]

function BottomTabBar() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-navy-700 bg-navy-900 lg:hidden">
      <div className="grid grid-cols-5">
        {tabs.map((tab) => (
          <NavLink
            key={tab.path}
            to={tab.path}
            className={({ isActive }) =>
              [
                "flex flex-col items-center justify-center gap-1 py-2 text-center text-[10px] font-medium transition",
                isActive ? "text-indigo-400" : "text-slate-400",
              ].join(" ")
            }
          >
            <span aria-hidden="true" className="text-lg leading-none">
              {tab.icon}
            </span>
            <span>{tab.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

export default BottomTabBar
