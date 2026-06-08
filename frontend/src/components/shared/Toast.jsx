import { useEffect, useState } from "react"
import { XMarkIcon } from "@heroicons/react/24/outline"

const typeClasses = {
  success: "bg-emerald-500",
  error: "bg-rose-500",
  info: "bg-indigo-500",
}

const noop = () => {}

function Toast({ message, type = "success", onClose = noop }) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const showTimer = window.setTimeout(() => {
      setIsVisible(true)
    }, 10)

    const hideTimer = window.setTimeout(() => {
      setIsVisible(false)
    }, 3000)

    const closeTimer = window.setTimeout(() => {
      onClose()
    }, 3300)

    return () => {
      window.clearTimeout(showTimer)
      window.clearTimeout(hideTimer)
      window.clearTimeout(closeTimer)
    }
  }, [onClose])

  return (
    <div className="fixed bottom-6 right-6 z-50 w-[calc(100vw-2rem)] max-w-sm">
      <div
        className={`flex items-start gap-3 rounded-2xl px-4 py-3 text-white shadow-2xl shadow-black/30 transition-all duration-300 ${
          typeClasses[type] || typeClasses.success
        } ${isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"}`}
      >
        <div className="flex-1 text-sm font-medium leading-6">{message}</div>
        <button
          type="button"
          onClick={() => {
            setIsVisible(false)
            window.setTimeout(() => onClose(), 250)
          }}
          className="rounded-full p-1 transition hover:bg-white/15"
          aria-label="Close toast"
        >
          <XMarkIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

export default Toast
