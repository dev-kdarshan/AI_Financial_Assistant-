import { useEffect, useRef, useState } from "react"
import {
  TrashIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline"
import AppLayout from "../layouts/AppLayout"
import Loader from "../components/shared/Loader"
import gpayService from "../services/gpayService"
import formatCurrency from "../utils/formatCurrency"
import { formatDate } from "../utils/dateHelpers"

const typeBadgeClasses = {
  debit: "bg-rose-400/20 text-rose-300 border-rose-400/30",
  credit: "bg-emerald-400/20 text-emerald-300 border-emerald-400/30",
}

const feedbackToneClasses = {
  success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-200",
  error: "border-rose-500/30 bg-rose-500/10 text-rose-200",
  info: "border-slate-600 bg-navy-900 text-slate-300",
}

const sortTransactionsDesc = (transactions = []) =>
  [...transactions].sort(
    (left, right) => new Date(right.date).getTime() - new Date(left.date).getTime(),
  )

const extractImportedTransactions = (response) => {
  const transactions = response?.data?.transactions

  if (Array.isArray(transactions)) {
    return transactions
  }

  if (Array.isArray(response?.data)) {
    return response.data
  }

  return []
}

const readTransactionLabel = (transaction) =>
  transaction?.recipient || transaction?.description || "Unknown recipient"

const isHtmlFile = (file) => {
  if (!file) {
    return false
  }

  const lowerName = file.name?.toLowerCase() || ""
  return (
    lowerName.endsWith(".html") ||
    file.type === "text/html" ||
    file.type === "application/xhtml+xml"
  )
}

function GpayPage() {
  const fileInputRef = useRef(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const [selectedFileName, setSelectedFileName] = useState("")
  const [importing, setImporting] = useState(false)
  const [feedback, setFeedback] = useState(null)
  const [reviewTransactions, setReviewTransactions] = useState([])
  const [selectedReviewIds, setSelectedReviewIds] = useState([])
  const [reviewActionLoading, setReviewActionLoading] = useState(false)
  const [historyTransactions, setHistoryTransactions] = useState([])
  const [historyLoading, setHistoryLoading] = useState(true)
  const [historyError, setHistoryError] = useState("")
  const [historyDeletingId, setHistoryDeletingId] = useState(null)
  const [isDragging, setIsDragging] = useState(false)

  const showInitialLoader =
    historyLoading && historyTransactions.length === 0 && reviewTransactions.length === 0
  const reviewActive = reviewTransactions.length > 0

  const loadHistory = async () => {
    try {
      setHistoryLoading(true)
      setHistoryError("")

      const response = await gpayService.getTransactions()
      setHistoryTransactions(sortTransactionsDesc(response.data || []))
    } catch (error) {
      setHistoryError(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to load your GPay history.",
      )
    } finally {
      setHistoryLoading(false)
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadHistory()
    }, 0)

    return () => {
      window.clearTimeout(timer)
    }
  }, [])

  const resetUpload = () => {
    setSelectedFile(null)
    setSelectedFileName("")
    setIsDragging(false)

    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const clearReview = () => {
    setReviewTransactions([])
    setSelectedReviewIds([])
    resetUpload()
  }

  const setFileSelection = (file) => {
    if (!file) {
      return
    }

    if (reviewActive) {
      setFeedback({
        type: "info",
        text: "Finish the current review before importing another file.",
      })
      return
    }

    if (!isHtmlFile(file)) {
      setSelectedFile(null)
      setSelectedFileName("")
      setFeedback({
        type: "error",
        text: "Please upload the extracted activity.html file.",
      })

      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }

      return
    }

    setSelectedFile(file)
    setSelectedFileName(file.name)
    setFeedback(null)
  }

  const handleFileChange = (event) => {
    setFileSelection(event.target.files?.[0])
  }

  const handleDrop = (event) => {
    event.preventDefault()
    setIsDragging(false)
    setFileSelection(event.dataTransfer.files?.[0])
  }

  const handleDragOver = (event) => {
    event.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleImportSubmit = async (event) => {
    event.preventDefault()

    if (!selectedFile) {
      setFeedback({
        type: "error",
        text: "Choose your activity.html file before importing.",
      })
      return
    }

    setImporting(true)
    setFeedback(null)

    try {
      const response = await gpayService.importFile(selectedFile)
      const importedTransactions = sortTransactionsDesc(
        extractImportedTransactions(response),
      )

      if (importedTransactions.length === 0) {
        clearReview()
        setFeedback({
          type: "info",
          text: "No transactions found in the uploaded file.",
        })
        await loadHistory()
        return
      }

      setReviewTransactions(importedTransactions)
      setSelectedReviewIds(importedTransactions.map((transaction) => transaction.id))
      setFeedback({
        type: "success",
        text: `Imported ${importedTransactions.length} transactions. Review them below.`,
      })

      await loadHistory()
    } catch (error) {
      setFeedback({
        type: "error",
        text:
          error?.response?.data?.message ||
          error?.message ||
          "Unable to import your GPay history.",
      })
    } finally {
      setImporting(false)
    }
  }

  const handleToggleReviewId = (id) => {
    setSelectedReviewIds((current) =>
      current.includes(id)
        ? current.filter((value) => value !== id)
        : [...current, id],
    )
  }

  const handleToggleAllReview = (checked) => {
    setSelectedReviewIds(checked ? reviewTransactions.map((transaction) => transaction.id) : [])
  }

  const handleConfirmSelected = async () => {
    if (reviewTransactions.length === 0) {
      return
    }

    setReviewActionLoading(true)

    try {
      const idsToDelete = reviewTransactions
        .filter((transaction) => !selectedReviewIds.includes(transaction.id))
        .map((transaction) => transaction.id)

      if (idsToDelete.length > 0) {
        await Promise.all(idsToDelete.map((id) => gpayService.softDelete(id)))
      }

      setFeedback({
        type: "success",
        text:
          idsToDelete.length > 0
            ? `Saved ${selectedReviewIds.length} selected transactions.`
            : "All imported transactions were kept.",
      })
    } catch (error) {
      setFeedback({
        type: "error",
        text:
          error?.response?.data?.message ||
          error?.message ||
          "Unable to confirm the selected transactions.",
      })
      return
    } finally {
      setReviewActionLoading(false)
    }

    setReviewTransactions([])
    setSelectedReviewIds([])
    resetUpload()
    await loadHistory()
  }

  const handleCancelReview = async () => {
    if (reviewTransactions.length === 0) {
      return
    }

    setReviewActionLoading(true)

    try {
      await Promise.all(
        reviewTransactions.map((transaction) => gpayService.softDelete(transaction.id)),
      )
      setFeedback({
        type: "info",
        text: "Import cancelled and review cleared.",
      })
    } catch (error) {
      setFeedback({
        type: "error",
        text:
          error?.response?.data?.message ||
          error?.message ||
          "Unable to cancel the current review.",
      })
      return
    } finally {
      setReviewActionLoading(false)
    }

    setReviewTransactions([])
    setSelectedReviewIds([])
    resetUpload()
    await loadHistory()
  }

  const handleDeleteHistoryTransaction = async (transaction) => {
    if (!transaction?.id) {
      return
    }

    setHistoryDeletingId(transaction.id)

    try {
      await gpayService.softDelete(transaction.id)
      setFeedback({
        type: "success",
        text: "Transaction removed successfully.",
      })
      await loadHistory()
    } catch (error) {
      setFeedback({
        type: "error",
        text:
          error?.response?.data?.message ||
          error?.message ||
          "Unable to delete the transaction.",
      })
    } finally {
      setHistoryDeletingId(null)
    }
  }

  if (showInitialLoader) {
    return (
      <AppLayout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader size="lg" />
        </div>
      </AppLayout>
    )
  }

  const allReviewSelected =
    reviewTransactions.length > 0 &&
    selectedReviewIds.length === reviewTransactions.length

  return (
    <AppLayout>
      <div className="space-y-8">
        <section className="space-y-3">
          <p className="text-sm font-medium uppercase tracking-[0.28em] text-indigo-300">
            GPay Import
          </p>
          <h1 className="font-heading text-3xl font-bold text-white md:text-4xl">
            Bring your GPay history into AIFA
          </h1>
          <p className="max-w-3xl text-sm leading-7 text-slate-400">
            Import your activity.html file, review the parsed transactions, and keep
            your payment history in sync with the rest of your finance dashboard.
          </p>
        </section>

        {historyError ? (
          <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {historyError}
          </div>
        ) : null}

        <section className="space-y-6 rounded-3xl border border-navy-700 bg-navy-800 p-6">
          <article className="rounded-2xl border border-navy-700 bg-navy-900 p-6">
            <h2 className="font-heading text-2xl font-bold text-white">
              Import Google Pay History
            </h2>
            <ol className="mt-4 space-y-2 text-sm leading-7 text-slate-400">
              <li>1. Open Google Pay app</li>
              <li>2. Go to Profile - Privacy & Security - Download your data</li>
              <li>3. Download and extract the ZIP file</li>
              <li>4. Find "activity.html" inside the extracted folder</li>
              <li>5. Upload that file below</li>
            </ol>
          </article>

          <form onSubmit={handleImportSubmit} className="space-y-5">
            {importing ? (
              <div className="rounded-3xl border border-navy-700 bg-navy-900/70 p-6">
                <div className="flex min-h-[220px] items-center justify-center rounded-2xl border border-navy-700 bg-navy-950/60">
                  <div className="text-center">
                    <Loader size="sm" />
                    <p className="mt-4 text-sm font-medium text-slate-300">
                      Parsing your GPay history...
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  disabled={reviewActive || importing}
                  className={`flex min-h-[280px] w-full flex-col items-center justify-center rounded-3xl border-2 border-dashed px-6 py-12 text-center transition ${
                    reviewActive || importing
                      ? "cursor-not-allowed border-navy-700 bg-navy-900/30 text-slate-500"
                      : isDragging
                      ? "border-indigo-500 bg-navy-900"
                      : "border-navy-600 bg-navy-900/50 hover:border-indigo-500 hover:bg-navy-900"
                  }`}
                >
                  <span className="text-6xl" aria-hidden="true">
                    📱
                  </span>
                  <p className="mt-6 font-heading text-2xl font-bold text-white">
                    Drop activity.html here
                  </p>
                  <p className="mt-2 text-sm text-slate-400">
                    or click to browse
                  </p>
                  <p className="mt-4 text-xs uppercase tracking-[0.24em] text-slate-500">
                    Accept .html files only
                  </p>
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".html,text/html"
                  className="hidden"
                  onChange={handleFileChange}
                />

                {selectedFileName ? (
                  <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-navy-700 bg-navy-900 px-4 py-3 text-sm text-slate-300">
                    <span className="rounded-full bg-indigo-500/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-indigo-300">
                      Selected
                    </span>
                    <span className="break-all">{selectedFileName}</span>
                    <button
                      type="button"
                      onClick={() => {
                        resetUpload()
                        setFeedback(null)
                      }}
                      className="ml-auto inline-flex items-center gap-2 rounded-full border border-navy-700 px-3 py-1 text-xs font-medium text-slate-300 transition hover:border-indigo-500 hover:text-white"
                    >
                      <XMarkIcon className="h-3.5 w-3.5" />
                      Clear
                    </button>
                  </div>
                ) : null}

                {reviewActive ? (
                  <p className="text-sm text-slate-400">
                    Finish the current review before importing another file.
                  </p>
                ) : null}

                {feedback ? (
                  <div
                    className={`rounded-2xl border px-4 py-3 text-sm ${feedbackToneClasses[feedback.type] || feedbackToneClasses.info}`}
                  >
                    {feedback.text}
                  </div>
                ) : null}

                <button
                  type="submit"
                  disabled={importing || !selectedFile || reviewActive}
                  className="flex w-full items-center justify-center rounded-xl bg-indigo-600 py-3 font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  Import GPay History
                </button>
              </>
            )}
          </form>
        </section>

        {reviewTransactions.length > 0 ? (
          <section className="rounded-3xl border border-navy-700 bg-navy-800 p-6">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h2 className="font-heading text-2xl font-bold text-white">
                  Review imported transactions ({reviewTransactions.length} found)
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  Uncheck any you want to skip. Click Confirm to save.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleConfirmSelected}
                  disabled={reviewActionLoading}
                  className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {reviewActionLoading ? "Saving..." : "Confirm Selected"}
                </button>
                <button
                  type="button"
                  onClick={handleCancelReview}
                  disabled={reviewActionLoading}
                  className="inline-flex items-center justify-center rounded-xl border border-navy-700 bg-transparent px-5 py-3 text-sm font-semibold text-white transition hover:border-indigo-500 hover:bg-navy-900 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  Cancel
                </button>
              </div>
            </div>

            <div className="mt-6 overflow-x-auto">
              <table className="min-w-[920px] w-full border-separate border-spacing-y-3">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-[0.22em] text-slate-400">
                    <th className="w-12 px-4 py-2">
                      <input
                        type="checkbox"
                        checked={allReviewSelected}
                        onChange={(event) => handleToggleAllReview(event.target.checked)}
                        className="h-4 w-4 rounded border-navy-600 bg-navy-950 text-indigo-500 focus:ring-indigo-500"
                        aria-label="Select all imported transactions"
                      />
                    </th>
                    <th className="px-4 py-2">Date</th>
                    <th className="px-4 py-2">Recipient</th>
                    <th className="px-4 py-2">Amount</th>
                    <th className="px-4 py-2">Type</th>
                    <th className="px-4 py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {reviewTransactions.map((transaction, index) => {
                    const isSelected = selectedReviewIds.includes(transaction.id)
                    const type = transaction.type === "credit" ? "credit" : "debit"

                    return (
                      <tr
                        key={transaction.id}
                        className={`rounded-2xl border border-navy-700 ${
                          index % 2 === 0 ? "bg-navy-900/70" : "bg-navy-950/70"
                        }`}
                      >
                        <td className="rounded-l-2xl px-4 py-4 align-middle">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleReviewId(transaction.id)}
                            className="h-4 w-4 rounded border-navy-600 bg-navy-950 text-indigo-500 focus:ring-indigo-500"
                            aria-label={`Select transaction from ${readTransactionLabel(transaction)}`}
                          />
                        </td>
                        <td className="px-4 py-4 align-middle text-sm text-slate-300">
                          {formatDate(transaction.date)}
                        </td>
                        <td className="px-4 py-4 align-middle text-sm font-medium text-white">
                          {readTransactionLabel(transaction)}
                        </td>
                        <td className="px-4 py-4 align-middle font-mono text-sm font-semibold text-white">
                          {formatCurrency(transaction.amount)}
                        </td>
                        <td className="px-4 py-4 align-middle">
                          <span
                            className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] ${
                              typeBadgeClasses[type] || typeBadgeClasses.debit
                            }`}
                          >
                            {type}
                          </span>
                        </td>
                        <td className="rounded-r-2xl px-4 py-4 align-middle">
                          <span
                            className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] ${
                              isSelected
                                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                                : "border-slate-600 bg-slate-500/10 text-slate-300"
                            }`}
                          >
                            {isSelected ? "Selected" : "Skipped"}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </section>
        ) : null}

        <section className="rounded-3xl border border-navy-700 bg-navy-800 p-6">
          <h2 className="font-heading text-2xl font-bold text-white">
            Transaction History
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            All imported GPay transactions are shown here, sorted newest first.
          </p>

          <div className="mt-6 overflow-x-auto">
            {historyTransactions.length > 0 ? (
              <table className="min-w-[880px] w-full border-separate border-spacing-y-2">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-[0.22em] text-slate-400">
                    <th className="px-4 py-2">Date</th>
                    <th className="px-4 py-2">Recipient</th>
                    <th className="px-4 py-2">Amount</th>
                    <th className="px-4 py-2">Type</th>
                    <th className="px-4 py-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {sortTransactionsDesc(historyTransactions).map((transaction, index) => {
                    const type = transaction.type === "credit" ? "credit" : "debit"

                    return (
                      <tr
                        key={transaction.id}
                        className={`rounded-2xl ${
                          index % 2 === 0 ? "bg-navy-800" : "bg-navy-900"
                        }`}
                      >
                        <td className="rounded-l-2xl px-4 py-4 text-sm text-slate-300">
                          {formatDate(transaction.date)}
                        </td>
                        <td className="px-4 py-4 text-sm font-medium text-white">
                          {readTransactionLabel(transaction)}
                        </td>
                        <td className="px-4 py-4 font-mono text-sm font-semibold text-white">
                          {formatCurrency(transaction.amount)}
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] ${
                              typeBadgeClasses[type] || typeBadgeClasses.debit
                            }`}
                          >
                            {type}
                          </span>
                        </td>
                        <td className="rounded-r-2xl px-4 py-4 text-right">
                          <button
                            type="button"
                            onClick={() => handleDeleteHistoryTransaction(transaction)}
                            disabled={historyDeletingId === transaction.id}
                            className="inline-flex items-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-sm font-medium text-rose-300 transition hover:border-rose-400 hover:bg-rose-500/20 disabled:cursor-not-allowed disabled:opacity-70"
                          >
                            <TrashIcon className="h-4 w-4" />
                            {historyDeletingId === transaction.id ? "Deleting..." : "Delete"}
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            ) : (
              <div className="flex min-h-[220px] flex-col items-center justify-center rounded-3xl border border-dashed border-navy-600 bg-navy-900/40 px-6 py-10 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-500/10 text-3xl">
                  🧾
                </div>
                <p className="mt-5 font-heading text-2xl font-bold text-white">
                  No transactions yet. Import your GPay history above.
                </p>
                <p className="mt-3 max-w-xl text-sm leading-7 text-slate-400">
                  Once you upload activity.html, parsed transactions will appear here
                  with the latest activity at the top.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </AppLayout>
  )
}

export default GpayPage
