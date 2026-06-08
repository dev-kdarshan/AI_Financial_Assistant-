import { Link } from "react-router-dom"
import {
  ArrowRightIcon,
  CameraIcon,
  CpuChipIcon,
  DevicePhoneMobileIcon,
  ExclamationTriangleIcon,
  PlusIcon,
} from "@heroicons/react/24/outline"
import AppLayout from "../layouts/AppLayout"
import Loader from "../components/shared/Loader"
import useExpenses from "../hooks/useExpenses"
import formatCurrency from "../utils/formatCurrency"
import { formatDate, isSameMonth } from "../utils/dateHelpers"

const categoryToneMap = {
  food: "bg-amber-400/20 text-amber-300 border-amber-400/30",
  transport: "bg-indigo-400/20 text-indigo-300 border-indigo-400/30",
  shopping: "bg-rose-400/20 text-rose-300 border-rose-400/30",
  bills: "bg-emerald-400/20 text-emerald-300 border-emerald-400/30",
  entertainment: "bg-violet-400/20 text-violet-300 border-violet-400/30",
  health: "bg-cyan-400/20 text-cyan-300 border-cyan-400/30",
  other: "bg-slate-400/20 text-slate-300 border-slate-400/30",
}

const onboardingSteps = [
  {
    id: 1,
    icon: "💸",
    title: "Add your first expense",
    description: "Log a quick manual expense and start building your history.",
    action: "Add Expense",
    to: "/expenses",
  },
  {
    id: 2,
    icon: "📱",
    title: "Import GPay history",
    description: "Bring in your payment activity and keep everything in one place.",
    action: "Import GPay",
    to: "/gpay",
  },
  {
    id: 3,
    icon: "🤖",
    title: "Ask AI anything",
    description: "Turn spending patterns into simple next steps with AI help.",
    action: "Ask AI",
    to: "/ai",
  },
]

const quickActions = [
  {
    label: "Add Expense",
    description: "Create a new manual expense",
    icon: PlusIcon,
    to: "/expenses",
  },
  {
    label: "Scan Receipt",
    description: "Extract data from a slip image",
    icon: CameraIcon,
    to: "/expenses?tab=scan",
  },
  {
    label: "Import GPay",
    description: "Upload your GPay activity file",
    icon: DevicePhoneMobileIcon,
    to: "/gpay",
  },
  {
    label: "Ask AI",
    description: "Get spending insights instantly",
    icon: CpuChipIcon,
    to: "/ai",
  },
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

const toAmount = (value) => Number(value) || 0

const normalizeCategory = (value) => String(value || "other").toLowerCase()

const getCategoryTone = (category) =>
  categoryToneMap[normalizeCategory(category)] || categoryToneMap.other

const prettyCategory = (category) => {
  const normalized = normalizeCategory(category)
  return normalized.charAt(0).toUpperCase() + normalized.slice(1)
}

function DashboardPage() {
  const { expenses, loading, error, refetch } = useExpenses()
  const storedUser = readStoredUser()
  const displayName = storedUser?.name || storedUser?.fullName || "there"
  const salary = Number(storedUser?.salary) || 0

  const currentMonthExpenses = expenses.filter((expense) =>
    isSameMonth(expense.date),
  )
  const currentMonthSpend = currentMonthExpenses.reduce(
    (sum, expense) => sum + toAmount(expense.amount),
    0,
  )
  const totalSpend = expenses.reduce(
    (sum, expense) => sum + toAmount(expense.amount),
    0,
  )
  const transactionsThisMonth = currentMonthExpenses.length
  const categoryPool =
    currentMonthExpenses.length > 0 ? currentMonthExpenses : expenses

  const categoryTotals = categoryPool.reduce((accumulator, expense) => {
    const key = normalizeCategory(expense.category)
    accumulator[key] = (accumulator[key] || 0) + toAmount(expense.amount)
    return accumulator
  }, {})

  const topCategoryEntry = Object.entries(categoryTotals).sort(
    (left, right) => right[1] - left[1],
  )[0]
  const topCategoryName = topCategoryEntry
    ? prettyCategory(topCategoryEntry[0])
    : "No activity yet"
  const topCategoryAmount = topCategoryEntry ? topCategoryEntry[1] : 0
  const budgetUsedPercent =
    salary > 0 ? Math.min(100, (currentMonthSpend / salary) * 100) : 0
  const budgetRemaining = salary > 0 ? salary - currentMonthSpend : 0
  const recentExpenses = expenses.slice(0, 5)
  const hasExpenses = expenses.length > 0
  const showInitialLoader = loading && !hasExpenses

  if (showInitialLoader) {
    return (
      <AppLayout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader size="lg" />
        </div>
      </AppLayout>
    )
  }

  if (error && !hasExpenses) {
    return (
      <AppLayout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="w-full max-w-xl rounded-3xl border border-rose-500/30 bg-navy-800 p-8 text-center shadow-2xl shadow-black/20">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-500/10 text-rose-300">
              <ExclamationTriangleIcon className="h-7 w-7" />
            </div>
            <h1 className="mt-6 font-heading text-3xl font-bold text-white">
              We could not load your dashboard
            </h1>
            <p className="mt-3 text-sm leading-7 text-slate-400">{error}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={refetch}
                className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500"
              >
                Retry
              </button>
              <Link
                to="/expenses"
                className="inline-flex items-center justify-center rounded-xl border border-navy-700 bg-navy-900 px-5 py-3 text-sm font-semibold text-white transition hover:border-indigo-500 hover:bg-navy-700"
              >
                Go to Expenses
              </Link>
            </div>
          </div>
        </div>
      </AppLayout>
    )
  }

  if (!hasExpenses) {
    return (
      <AppLayout>
        <div className="space-y-8">
          <section className="rounded-3xl border border-indigo-500/30 bg-navy-800 p-8 shadow-2xl shadow-black/20">
            <p className="font-heading text-2xl font-bold text-white">
              Welcome to AIFA 👋
            </p>
            <p className="mt-2 text-sm leading-7 text-slate-400">
              Here is how to get started:
            </p>

            <div className="mt-8 grid gap-4 lg:grid-cols-3">
              {onboardingSteps.map((step) => (
                <article
                  key={step.id}
                  className="rounded-2xl border border-navy-700 bg-navy-900 p-5"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-navy-700 bg-navy-800 text-2xl">
                    <span aria-hidden="true">{step.icon}</span>
                  </div>
                  <p className="mt-4 text-sm font-semibold uppercase tracking-[0.22em] text-indigo-300">
                    Step {step.id}
                  </p>
                  <h2 className="mt-2 font-heading text-xl font-bold text-white">
                    {step.title}
                  </h2>
                  <p className="mt-3 text-sm leading-7 text-slate-400">
                    {step.description}
                  </p>
                  <Link
                    to={step.to}
                    className="mt-5 inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500"
                  >
                    {step.action}
                  </Link>
                </article>
              ))}
            </div>
          </section>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="space-y-8">
        {error ? (
          <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {error}
          </div>
        ) : null}

        <section className="space-y-3">
          <p className="text-sm font-medium uppercase tracking-[0.28em] text-indigo-300">
            Dashboard
          </p>
          <h1 className="font-heading text-3xl font-bold text-white md:text-4xl">
            Good to see you, {displayName}
          </h1>
          <p className="max-w-3xl text-sm leading-7 text-slate-400">
            Your expenses, priorities, and next steps are all in one place.
          </p>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <article className="rounded-2xl border border-navy-700 bg-navy-800 p-6">
            <p className="text-sm text-slate-400">Total This Month</p>
            <p className="mt-3 font-mono text-3xl font-bold text-emerald-400">
              {formatCurrency(currentMonthSpend)}
            </p>
            <p className="mt-2 text-xs text-slate-500">
              Across {transactionsThisMonth} transactions
            </p>
          </article>

          <article className="rounded-2xl border border-navy-700 bg-navy-800 p-6">
            <p className="text-sm text-slate-400">Top Category</p>
            <p className="mt-3 text-xl font-semibold text-white">
              {topCategoryName}
            </p>
            <p className="mt-2 text-sm text-slate-400">
              {formatCurrency(topCategoryAmount)}
            </p>
          </article>

          <article className="rounded-2xl border border-navy-700 bg-navy-800 p-6">
            <p className="text-sm text-slate-400">Transactions</p>
            <p className="mt-3 font-mono text-3xl font-bold text-white">
              {transactionsThisMonth}
            </p>
            <p className="mt-2 text-xs text-slate-500">
              {totalSpend > 0 ? `${expenses.length} total entries stored` : "No transactions yet"}
            </p>
          </article>

          <article className="rounded-2xl border border-navy-700 bg-navy-800 p-6">
            <p className="text-sm text-slate-400">Budget Status</p>
            {salary > 0 ? (
              <>
                <p className="mt-3 text-xl font-semibold text-white">
                  {budgetUsedPercent.toFixed(0)}% used
                </p>
                <div className="mt-4 h-2 rounded-full bg-navy-700">
                  <div
                    className={`h-2 rounded-full ${
                      budgetUsedPercent > 90 ? "bg-rose-400" : "bg-emerald-400"
                    }`}
                    style={{ width: `${Math.min(100, budgetUsedPercent)}%` }}
                  />
                </div>
                <p className="mt-3 text-sm text-slate-400">
                  {budgetRemaining >= 0
                    ? `${formatCurrency(budgetRemaining)} left this month`
                    : `${formatCurrency(Math.abs(budgetRemaining))} over budget`}
                </p>
              </>
            ) : (
              <>
                <p className="mt-3 text-xl font-semibold text-white">
                  Set salary in profile
                </p>
                <p className="mt-3 text-sm leading-7 text-slate-400">
                  Add your salary later to unlock budget progress tracking.
                </p>
              </>
            )}
          </article>
        </section>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
          <article className="rounded-3xl border border-navy-700 bg-navy-800 p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="font-heading text-2xl font-bold text-white">
                  Recent Expenses
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  The last five expenses from your history.
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {recentExpenses.map((expense) => {
                const category = normalizeCategory(expense.category)

                return (
                  <div
                    key={expense.id}
                    className="flex items-center justify-between gap-4 rounded-2xl border border-navy-700 bg-navy-900/70 px-4 py-4"
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
                    <p className="shrink-0 font-mono text-sm font-semibold text-white">
                      {formatCurrency(expense.amount)}
                    </p>
                  </div>
                )
              })}
            </div>

            <div className="mt-5 flex justify-end">
              <Link
                to="/expenses"
                className="inline-flex items-center gap-2 rounded-full border border-navy-700 bg-navy-900 px-4 py-2 text-sm font-medium text-white transition hover:border-indigo-500 hover:bg-navy-700"
              >
                View all
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
            </div>
          </article>

          <article className="rounded-3xl border border-navy-700 bg-navy-800 p-6">
            <h2 className="font-heading text-2xl font-bold text-white">
              Quick Actions
            </h2>
            <div className="mt-5 space-y-3">
              {quickActions.map((action) => {
                const Icon = action.icon

                return (
                  <Link
                    key={action.label}
                    to={action.to}
                    className="flex items-center gap-3 rounded-xl border border-navy-700 bg-navy-900 px-4 py-3 text-left text-white transition hover:border-indigo-500 hover:bg-navy-700"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-300">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold text-white">
                        {action.label}
                      </span>
                      <span className="block text-xs text-slate-400">
                        {action.description}
                      </span>
                    </span>
                    <ArrowRightIcon className="h-4 w-4 text-slate-500" />
                  </Link>
                )
              })}
            </div>
          </article>
        </section>
      </div>
    </AppLayout>
  )
}

export default DashboardPage
