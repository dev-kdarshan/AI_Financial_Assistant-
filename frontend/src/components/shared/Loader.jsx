const sizeClasses = {
  sm: "h-5 w-5",
  md: "h-8 w-8",
  lg: "h-12 w-12",
}

function Loader({ size = "md" }) {
  const spinnerSize = sizeClasses[size] || sizeClasses.md

  return (
    <div className="flex h-full w-full items-center justify-center">
      <div
        className={`${spinnerSize} animate-spin rounded-full border-2 border-navy-700 border-t-indigo-500`}
        role="status"
        aria-label="Loading"
      />
    </div>
  )
}

export default Loader
