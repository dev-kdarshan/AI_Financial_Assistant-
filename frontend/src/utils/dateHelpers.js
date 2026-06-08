const formatParts = (date) => {
  const resolved = date instanceof Date ? date : new Date(date)

  if (Number.isNaN(resolved.getTime())) {
    return null
  }

  return resolved
}

export const toDateInputValue = (value = new Date()) => {
  const date = formatParts(value)

  if (!date) {
    return ""
  }

  const tzOffset = date.getTimezoneOffset() * 60000
  return new Date(date.getTime() - tzOffset).toISOString().slice(0, 10)
}

export const formatDate = (value) => {
  const date = formatParts(value)

  if (!date) {
    return ""
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
    .format(date)
    .replace(/,/g, "")
}

export const isSameMonth = (value, reference = new Date()) => {
  const date = formatParts(value)
  const ref = formatParts(reference)

  if (!date || !ref) {
    return false
  }

  return (
    date.getFullYear() === ref.getFullYear() &&
    date.getMonth() === ref.getMonth()
  )
}

export const isWithinDateRange = (value, startDate, endDate) => {
  const date = formatParts(value)

  if (!date) {
    return false
  }

  const time = date.getTime()
  const start = startDate ? new Date(`${startDate}T00:00:00`).getTime() : null
  const end = endDate ? new Date(`${endDate}T23:59:59.999`).getTime() : null

  if (start !== null && time < start) {
    return false
  }

  if (end !== null && time > end) {
    return false
  }

  return true
}

const dateHelpers = {
  toDateInputValue,
  formatDate,
  isSameMonth,
  isWithinDateRange,
}

export default dateHelpers
