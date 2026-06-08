import { useEffect, useRef, useState } from "react"
import { useLocation } from "react-router-dom"
import {
  ArrowPathIcon,
  CameraIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/24/outline"
import AppLayout from "../layouts/AppLayout"
import Loader from "../components/shared/Loader"
import Toast from "../components/shared/Toast"
import useToast from "../hooks/useToast"
import useExpenses from "../hooks/useExpenses"
import formatCurrency from "../utils/formatCurrency"
import {
  formatDate,
  isWithinDateRange,
  toDateInputValue,
} from "../utils/dateHelpers"

const tabs = [
  { id: "manual", label: "Manual Input" },
  { id: "scan", label: "Scan Slip" },
  { id: "history", label: "History" },
]

const categories = [
  "food",
  "transport",
  "shopping",
  "bills",
  "entertainment",
  "health",
  "other",
]

const categoryToneMap = {
  food: "bg-amber-400/20 text-amber-300 border-amber-400/30",
  transport: "bg-indigo-400/20 text-indigo-300 border-indigo-400/30",
  shopping: "bg-rose-400/20 text-rose-300 border-rose-400/30",
  bills: "bg-emerald-400/20 text-emerald-300 border-emerald-400/30",
  entertainment: "bg-violet-400/20 text-violet-300 border-violet-400/30",
  health: "bg-cyan-400/20 text-cyan-300 border-cyan-400/30",
  other: "bg-slate-400/20 text-slate-300 border-slate-400/30",
}

const createExpenseForm = () => ({
  amount: "",
  category: "food",
  date: toDateInputValue(),
  merchantName: "",
  description: "",
})

const normalizeCategoryValue = (value) =>
  categories.includes(String(value || "").toLowerCase())
    ? String(value).toLowerCase()
    : "other"

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

const toAmount = (value) => Number(value) || 0

const normalizeText = (value) => String(value ?? "").trim()

const buildExpensePayload = (form) => ({
  amount: toAmount(form.amount),
  category: normalizeCategoryValue(form.category),
  date: form.date,
  merchantName: normalizeText(form.merchantName) || null,
  description: normalizeText(form.description) || null,
})

const buildScanForm = (expense, ocrRaw = {}) => ({
  amount: String(ocrRaw.amount ?? expense?.amount ?? ""),
  category: normalizeCategoryValue(ocrRaw.category ?? expense?.category ?? "other"),
  date: toDateInputValue(ocrRaw.date ?? expense?.date ?? new Date()),
  merchantName: String(
    ocrRaw.merchant ??
      ocrRaw.merchantName ??
      expense?.merchantName ??
      "",
  ),
  description: String(
    ocrRaw.raw_text ?? ocrRaw.description ?? expense?.description ?? "",
  ),
})

const getCategoryTone = (category) =>
  categoryToneMap[normalizeText(category).toLowerCase()] ||
  categoryToneMap.other

const prettyCategory = (category) => {
  const normalized = normalizeText(category).toLowerCase()
  return normalized.charAt(0).toUpperCase() + normalized.slice(1)
}

function ExpensesPage() {
  const location = useLocation()
  const {
    expenses,
    loading,
    error,
    addExpense,
    updateExpense,
    addFromOCR,
    deleteExpense,
  } = useExpenses()
  const { toast, showToast, hideToast } = useToast()
  const fileInputRef = useRef(null)
  const storedUser = readStoredUser()

  const [activeTab, setActiveTab] = useState(() => {
    const params = new URLSearchParams(location.search)
    const requestedTab = params.get("tab")

    return tabs.some((tab) => tab.id === requestedTab)
      ? requestedTab
      : "manual"
  })
  const [manualForm, setManualForm] = useState(createExpenseForm)
  const [manualSubmitting, setManualSubmitting] = useState(false)
  const [scanExpense, setScanExpense] = useState(null)
  const [scanForm, setScanForm] = useState(createExpenseForm)
  const [scanPreviewUrl, setScanPreviewUrl] = useState("")
  const [scanFileName, setScanFileName] = useState("")
  const [scanLoading, setScanLoading] = useState(false)
  const [scanSaving, setScanSaving] = useState(false)
  const [scanDiscarding, setScanDiscarding] = useState(false)
  const [historyCategory, setHistoryCategory] = useState("all")
  const [historyStartDate, setHistoryStartDate] = useState("")
  const [historyEndDate, setHistoryEndDate] = useState("")
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [isDragActive, setIsDragActive] = useState(false)

  const showInitialLoader = loading && expenses.length === 0

  useEffect(() => {
    if (error) {
      showToast(error, "error")
    }
  }, [error, showToast])

  useEffect(() => {
    if (!scanPreviewUrl) {
      return undefined
    }

    return () => {
      URL.revokeObjectURL(scanPreviewUrl)
    }
  }, [scanPreviewUrl])

  const resetManualForm = () => {
    setManualForm(createExpenseForm())
  }

  const resetScanState = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }

    setScanExpense(null)
    setScanForm(createExpenseForm())
    setScanPreviewUrl("")
    setScanFileName("")
    setIsDragActive(false)
  }

  const handleFormChange = (setter) => (field) => (event) => {
    const value = event.target.value

    setter((current) => ({
      ...current,
      [field]: value,
    }))
  }

  const handleManualSubmit = async (event) => {
    event.preventDefault()
    setManualSubmitting(true)

    try {
      await addExpense(buildExpensePayload(manualForm))
      showToast("Expense added successfully", "success")
      resetManualForm()
      setActiveTab("history")
    } catch (submitError) {
      showToast(
        submitError?.response?.data?.message ||
          submitError?.message ||
          "Unable to add expense right now.",
        "error",
      )
    } finally {
      setManualSubmitting(false)
    }
  }

  const handleScanFileChange = async (event) => {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    setActiveTab("scan")
    setScanLoading(true)

    const previewUrl = URL.createObjectURL(file)
    setScanPreviewUrl(previewUrl)
    setScanFileName(file.name)
    setScanExpense(null)
    setScanForm(createExpenseForm())

    try {
      const result = await addFromOCR(file)
      const expense = result?.data || null
      const ocrRaw = result?.ocr_raw || {}

      if (!expense) {
        throw new Error("Unable to read the receipt response.")
      }

      setScanExpense(expense)
      setScanForm(buildScanForm(expense, ocrRaw))
      showToast("Receipt extracted successfully", "success")
    } catch (scanError) {
      showToast(
        scanError?.response?.data?.message ||
          scanError?.message ||
          "Unable to extract receipt data.",
        "error",
      )
      URL.revokeObjectURL(previewUrl)
      resetScanState()
    } finally {
      setScanLoading(false)
    }
  }

  const handleScanDrop = async (event) => {
    event.preventDefault()
    setIsDragActive(false)

    const file = event.dataTransfer.files?.[0]

    if (!file) {
      return
    }

    if (!file.type.startsWith("image/")) {
      showToast("Please upload an image file.", "error")
      return
    }

    await handleScanFileChange({
      target: { files: [file] },
    })
  }

  const handleConfirmScan = async (event) => {
    event.preventDefault()

    if (!scanExpense?.id) {
      return
    }

    setScanSaving(true)

    try {
      await updateExpense(scanExpense.id, buildExpensePayload(scanForm))
      showToast("Expense saved successfully", "success")
      resetScanState()
      setActiveTab("history")
    } catch (submitError) {
      showToast(
        submitError?.response?.data?.message ||
          submitError?.message ||
          "Unable to save the scanned expense.",
        "error",
      )
    } finally {
      setScanSaving(false)
    }
  }

  const handleTryAnother = async () => {
    if (!scanExpense?.id) {
      resetScanState()
      return
    }

    setScanDiscarding(true)

    try {
      await deleteExpense(scanExpense.id)
      showToast("Receipt discarded", "info")
      resetScanState()
    } catch (discardError) {
      showToast(
        discardError?.response?.data?.message ||
          discardError?.message ||
          "Unable to discard the scanned receipt.",
        "error",
      )
    } finally {
      setScanDiscarding(false)
    }
  }

  const handleDeleteExpense = (expense) => {
    setDeleteTarget(expense)
  }

  const confirmDeleteExpense = async () => {
    if (!deleteTarget?.id) {
      return
    }

    setDeleteLoading(true)

    try {
      await deleteExpense(deleteTarget.id)
      showToast("Expense removed successfully", "success")
      setDeleteTarget(null)
    } catch (deleteError) {
      showToast(
        deleteError?.response?.data?.message ||
          deleteError?.message ||
          "Unable to delete the expense.",
        "error",
      )
    } finally {
      setDeleteLoading(false)
    }
  }

  const clearFilters = () => {
    setHistoryCategory("all")
    setHistoryStartDate("")
    setHistoryEndDate("")
  }

  const filteredExpenses = expenses.filter((expense) => {
    const category = normalizeText(expense.category).toLowerCase()

    if (historyCategory !== "all" && category !== historyCategory) {
      return false
    }

    return isWithinDateRange(
      expense.date,
      historyStartDate || null,
      historyEndDate || null,
    )
  })

  const hasExpenses = expenses.length > 0
  const hasHistoryResults = filteredExpenses.length > 0

  if (showInitialLoader) {
    return (
      <AppLayout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader size="lg" />
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="space-y-8">
        {toast ? <Toast {...toast} onClose={hideToast} /> : null}

        {error && hasExpenses ? (
          <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {error}
          </div>
        ) : null}

        <section className="space-y-3">
          <p className="text-sm font-medium uppercase tracking-[0.28em] text-indigo-300">
            Expenses
          </p>
          <h1 className="font-heading text-3xl font-bold text-white md:text-4xl">
            Track, scan, and organize every expense
          </h1>
          <p className="max-w-3xl text-sm leading-7 text-slate-400">
            {storedUser?.name
              ? `Keep ${storedUser.name}'s spending current with manual entries, receipt scans, and a searchable history.`
              : "Use manual entry for quick spends, scan receipts when you have them, and keep a clean history in one place."}
          </p>
        </section>

        <section className="overflow-x-auto border-b border-navy-700">
          <div className="flex min-w-max gap-2">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`border-b-2 px-5 py-3 text-sm font-medium transition ${
                    isActive
                      ? "border-indigo-500 text-white"
                      : "border-transparent text-slate-400 hover:text-white"
                  }`}
                >
                  {tab.label}
                </button>
              )
            })}
          </div>
        </section>

        {activeTab === "manual" ? (
          <section className="rounded-3xl border border-navy-700 bg-navy-800 p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/15 text-indigo-300">
                <PlusIcon className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-heading text-2xl font-bold text-white">
                  Manual Input
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  Add a new expense entry in seconds.
                </p>
              </div>
            </div>

            <form onSubmit={handleManualSubmit} className="mt-8 space-y-5">
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label htmlFor="manual-amount" className="text-sm font-medium text-slate-300">
                    Amount
                  </label>
                  <div className="relative mt-2">
                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                      ₹
                    </span>
                    <input
                      id="manual-amount"
                      type="number"
                      min="0"
                      step="0.01"
                      required
                      value={manualForm.amount}
                      onChange={handleFormChange(setManualForm)("amount")}
                      className="w-full rounded-xl border border-navy-600 bg-navy-900 py-3 pl-9 pr-4 text-white outline-none transition placeholder:text-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="manual-category" className="text-sm font-medium text-slate-300">
                    Category
                  </label>
                  <select
                    id="manual-category"
                    required
                    value={manualForm.category}
                    onChange={handleFormChange(setManualForm)("category")}
                    className="mt-2 w-full rounded-xl border border-navy-600 bg-navy-900 px-4 py-3 text-white outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {prettyCategory(category)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="manual-date" className="text-sm font-medium text-slate-300">
                    Date
                  </label>
                  <input
                    id="manual-date"
                    type="date"
                    required
                    value={manualForm.date}
                    onChange={handleFormChange(setManualForm)("date")}
                    className="mt-2 w-full rounded-xl border border-navy-600 bg-navy-900 px-4 py-3 text-white outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                <div>
                  <label
                    htmlFor="manual-merchant"
                    className="text-sm font-medium text-slate-300"
                  >
                    Merchant Name
                  </label>
                  <input
                    id="manual-merchant"
                    type="text"
                    required
                    value={manualForm.merchantName}
                    onChange={handleFormChange(setManualForm)("merchantName")}
                    className="mt-2 w-full rounded-xl border border-navy-600 bg-navy-900 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                    placeholder="Store or merchant"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="manual-description" className="text-sm font-medium text-slate-300">
                  Description
                </label>
                <textarea
                  id="manual-description"
                  rows={4}
                  value={manualForm.description}
                  onChange={handleFormChange(setManualForm)("description")}
                  className="mt-2 w-full rounded-xl border border-navy-600 bg-navy-900 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                  placeholder="Optional notes about the expense"
                />
              </div>

              <button
                type="submit"
                disabled={manualSubmitting}
                className="flex w-full items-center justify-center rounded-xl bg-indigo-600 py-3 font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {manualSubmitting ? "Adding expense..." : "Add Expense"}
              </button>
            </form>
          </section>
        ) : null}

        {activeTab === "scan" ? (
          <section className="rounded-3xl border border-navy-700 bg-navy-800 p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/15 text-indigo-300">
                <CameraIcon className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-heading text-2xl font-bold text-white">
                  Scan Slip
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  Upload a receipt image and review the extracted details before saving.
                </p>
              </div>
            </div>

            {!scanExpense && !scanLoading ? (
              <div className="mt-8">
                <button
                  type="button"
                  onDragOver={(event) => {
                    event.preventDefault()
                    setIsDragActive(true)
                  }}
                  onDragLeave={() => setIsDragActive(false)}
                  onDrop={handleScanDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`flex min-h-[320px] w-full flex-col items-center justify-center rounded-3xl border-2 border-dashed px-6 py-12 text-center transition ${
                    isDragActive
                      ? "border-indigo-500 bg-navy-900"
                      : "border-navy-600 bg-navy-900/50 hover:border-indigo-500 hover:bg-navy-900"
                  }`}
                >
                  <span className="text-6xl" aria-hidden="true">
                    📷
                  </span>
                  <p className="mt-6 font-heading text-2xl font-bold text-white">
                    Drop your receipt here
                  </p>
                  <p className="mt-2 text-sm text-slate-400">
                    or click to browse
                  </p>
                  <p className="mt-4 text-xs uppercase tracking-[0.24em] text-slate-500">
                    Accept image files only
                  </p>
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleScanFileChange}
                />
              </div>
            ) : null}

            {scanLoading ? (
              <div className="mt-8 rounded-3xl border border-navy-700 bg-navy-900/60 p-10">
                <div className="flex min-h-[220px] items-center justify-center rounded-2xl border border-navy-700 bg-navy-950/60">
                  <div className="flex flex-col items-center gap-4 text-center">
                    <Loader size="sm" />
                    <p className="text-sm font-medium text-slate-300">
                      Extracting data...
                    </p>
                    <p className="text-xs text-slate-500">
                      We are reading the receipt and preparing the fields for review.
                    </p>
                  </div>
                </div>
              </div>
            ) : null}

            {scanExpense && !scanLoading ? (
              <form onSubmit={handleConfirmScan} className="mt-8 grid gap-6 lg:grid-cols-[320px_1fr]">
                <div className="rounded-2xl border border-navy-700 bg-navy-900 p-4">
                  {scanPreviewUrl ? (
                    <img
                      src={scanPreviewUrl}
                      alt={scanFileName || "Receipt preview"}
                      className="max-h-[320px] w-full rounded-xl object-cover"
                    />
                  ) : null}
                  <p className="mt-4 text-sm font-medium text-white">
                    {scanFileName || "Receipt image"}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    Review the extracted values on the right and adjust anything that looks off.
                  </p>
                </div>

                <div className="rounded-2xl border border-navy-700 bg-navy-900 p-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-300">
                      <CheckIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-heading text-xl font-bold text-white">
                        Extracted details
                      </h3>
                      <p className="mt-1 text-sm text-slate-400">
                        Everything below is editable before you save the expense.
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 grid gap-5 md:grid-cols-2">
                    <div>
                      <label htmlFor="scan-amount" className="text-sm font-medium text-slate-300">
                        Amount
                      </label>
                      <div className="relative mt-2">
                        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                          ₹
                        </span>
                        <input
                          id="scan-amount"
                          type="number"
                          min="0"
                          step="0.01"
                          required
                          value={scanForm.amount}
                          onChange={handleFormChange(setScanForm)("amount")}
                          className="w-full rounded-xl border border-navy-600 bg-navy-950 py-3 pl-9 pr-4 text-white outline-none transition placeholder:text-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                          placeholder="0.00"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="scan-category" className="text-sm font-medium text-slate-300">
                        Category
                      </label>
                      <select
                        id="scan-category"
                        required
                        value={scanForm.category}
                        onChange={handleFormChange(setScanForm)("category")}
                        className="mt-2 w-full rounded-xl border border-navy-600 bg-navy-950 px-4 py-3 text-white outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                      >
                        {categories.map((category) => (
                          <option key={category} value={category}>
                            {prettyCategory(category)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="scan-date" className="text-sm font-medium text-slate-300">
                        Date
                      </label>
                      <input
                        id="scan-date"
                        type="date"
                        required
                        value={scanForm.date}
                        onChange={handleFormChange(setScanForm)("date")}
                        className="mt-2 w-full rounded-xl border border-navy-600 bg-navy-950 px-4 py-3 text-white outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="scan-merchant"
                        className="text-sm font-medium text-slate-300"
                      >
                        Merchant Name
                      </label>
                      <input
                        id="scan-merchant"
                        type="text"
                        required
                        value={scanForm.merchantName}
                        onChange={handleFormChange(setScanForm)("merchantName")}
                        className="mt-2 w-full rounded-xl border border-navy-600 bg-navy-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                        placeholder="Merchant name"
                      />
                    </div>
                  </div>

                  <div className="mt-5">
                    <label htmlFor="scan-description" className="text-sm font-medium text-slate-300">
                      Description
                    </label>
                    <textarea
                      id="scan-description"
                      rows={4}
                      value={scanForm.description}
                      onChange={handleFormChange(setScanForm)("description")}
                      className="mt-2 w-full rounded-xl border border-navy-600 bg-navy-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                      placeholder="Optional note from the receipt"
                    />
                  </div>

                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    <button
                      type="submit"
                      disabled={scanSaving}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {scanSaving ? "Saving..." : "Confirm & Save"}
                    </button>
                    <button
                      type="button"
                      onClick={handleTryAnother}
                      disabled={scanDiscarding}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-navy-600 bg-transparent px-5 py-3 font-semibold text-white transition hover:border-indigo-500 hover:bg-navy-900 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      <ArrowPathIcon className="h-4 w-4" />
                      {scanDiscarding ? "Resetting..." : "Try another"}
                    </button>
                  </div>
                </div>
              </form>
            ) : null}
          </section>
        ) : null}

        {activeTab === "history" ? (
          <section className="rounded-3xl border border-navy-700 bg-navy-800 p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="font-heading text-2xl font-bold text-white">
                  History
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  Filter and review every expense you have saved.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-navy-700 bg-navy-900 px-4 py-3">
                <div>
                  <label htmlFor="history-category" className="sr-only">
                    Category filter
                  </label>
                  <select
                    id="history-category"
                    value={historyCategory}
                    onChange={(event) => setHistoryCategory(event.target.value)}
                    className="rounded-xl border border-navy-600 bg-navy-950 px-3 py-2 text-sm text-white outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                  >
                    <option value="all">All Categories</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {prettyCategory(category)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="history-start" className="sr-only">
                    Start date
                  </label>
                  <input
                    id="history-start"
                    type="date"
                    value={historyStartDate}
                    onChange={(event) => setHistoryStartDate(event.target.value)}
                    className="rounded-xl border border-navy-600 bg-navy-950 px-3 py-2 text-sm text-white outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                <div>
                  <label htmlFor="history-end" className="sr-only">
                    End date
                  </label>
                  <input
                    id="history-end"
                    type="date"
                    value={historyEndDate}
                    onChange={(event) => setHistoryEndDate(event.target.value)}
                    className="rounded-xl border border-navy-600 bg-navy-950 px-3 py-2 text-sm text-white outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                <button
                  type="button"
                  onClick={clearFilters}
                  className="rounded-xl border border-navy-600 bg-transparent px-4 py-2 text-sm font-medium text-white transition hover:border-indigo-500 hover:bg-navy-900"
                >
                  Clear filters
                </button>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {hasHistoryResults ? (
                filteredExpenses.map((expense) => {
                  const category = normalizeText(expense.category).toLowerCase()

                  return (
                    <div
                      key={expense.id}
                      className="flex flex-col gap-4 rounded-2xl border border-navy-700 bg-navy-900/70 p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="truncate text-sm font-medium text-white">
                            {expense.merchantName ||
                              expense.description ||
                              "Unnamed expense"}
                          </p>
                          <span
                            className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.24em] ${getCategoryTone(category)}`}
                          >
                            {prettyCategory(category)}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-slate-400">
                          {formatDate(expense.date)}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <p className="font-mono text-lg font-semibold text-white">
                          {formatCurrency(expense.amount)}
                        </p>
                        <button
                          type="button"
                          onClick={() => handleDeleteExpense(expense)}
                          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-300 transition hover:border-rose-400 hover:bg-rose-500/20"
                          aria-label={`Delete ${expense.merchantName || "expense"}`}
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="flex min-h-[240px] flex-col items-center justify-center rounded-3xl border border-dashed border-navy-600 bg-navy-900/40 px-6 py-10 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-500/10 text-3xl">
                    🧾
                  </div>
                  <h3 className="mt-5 font-heading text-2xl font-bold text-white">
                    {hasExpenses
                      ? "No expenses match these filters."
                      : "No expenses yet. Add your first expense above."}
                  </h3>
                  <p className="mt-3 max-w-md text-sm leading-7 text-slate-400">
                    {hasExpenses
                      ? "Clear the filters to bring back the full history."
                      : "Switch to Manual Input and create your first expense, or scan a receipt to populate the list automatically."}
                  </p>
                  {!hasExpenses ? (
                    <button
                      type="button"
                      onClick={() => setActiveTab("manual")}
                      className="mt-6 inline-flex items-center justify-center rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500"
                    >
                      Add Expense
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="mt-6 inline-flex items-center justify-center rounded-xl border border-navy-700 bg-navy-900 px-5 py-3 text-sm font-semibold text-white transition hover:border-indigo-500 hover:bg-navy-700"
                    >
                      Clear filters
                    </button>
                  )}
                </div>
              )}
            </div>
          </section>
        ) : null}
      </div>

      {deleteTarget ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-md rounded-3xl border border-navy-700 bg-navy-800 p-8 shadow-2xl shadow-black/40">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-300">
                <ExclamationTriangleIcon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-heading text-2xl font-bold text-white">
                  Remove this expense?
                </h3>
                <p className="mt-1 text-sm text-slate-400">
                  This will remove the expense from your records.
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-navy-700 bg-navy-900 p-4">
              <p className="text-sm font-medium text-white">
                {deleteTarget.merchantName || deleteTarget.description || "Unnamed expense"}
              </p>
              <p className="mt-1 text-xs text-slate-400">
                {formatDate(deleteTarget.date)} · {formatCurrency(deleteTarget.amount)}
              </p>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="inline-flex flex-1 items-center justify-center rounded-xl border border-navy-700 bg-transparent px-5 py-3 text-sm font-semibold text-white transition hover:border-indigo-500 hover:bg-navy-900"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteExpense}
                disabled={deleteLoading}
                className="inline-flex flex-1 items-center justify-center rounded-xl bg-rose-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-rose-400 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {deleteLoading ? "Removing..." : "Remove"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {deleteTarget ? (
        <button
          type="button"
          aria-label="Close delete modal overlay"
          className="fixed inset-0 z-40 cursor-default bg-black/0"
          onClick={() => setDeleteTarget(null)}
        />
      ) : null}
    </AppLayout>
  )
}

export default ExpensesPage
