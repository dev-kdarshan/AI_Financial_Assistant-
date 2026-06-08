import { Link } from "react-router-dom"
import { useEffect, useState } from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import AppLayout from "../layouts/AppLayout"
import Loader from "../components/shared/Loader"
import analyticsService from "../services/analyticsService"
import expenseService from "../services/expenseService"
import formatCurrency from "../utils/formatCurrency"
import { formatDate } from "../utils/dateHelpers"

const CATEGORY_COLORS = {
  food: "#FBBF24",
  transport: "#818CF8",
  shopping: "#FB7185",
  bills: "#34D399",
  other: "#94A3B8",
  entertainment: "#A78BFA",
  health: "#22D3EE",
}

const categoryBadgeClasses = {
  food: "bg-amber-400/20 text-amber-300 border-amber-400/30",
  transport: "bg-indigo-400/20 text-indigo-300 border-indigo-400/30",
  shopping: "bg-rose-400/20 text-rose-300 border-rose-400/30",
  bills: "bg-emerald-400/20 text-emerald-300 border-emerald-400/30",
  entertainment: "bg-violet-400/20 text-violet-300 border-violet-400/30",
  health: "bg-cyan-400/20 text-cyan-300 border-cyan-400/30",
  other: "bg-slate-400/20 text-slate-300 border-slate-400/30",
}

const chartTooltipStyle = {
  backgroundColor: "#0f172a",
  border: "1px solid #1f2937",
  borderRadius: "16px",
  boxShadow: "0 24px 60px rgba(0, 0, 0, 0.35)",
}

const normalizeCategory = (value) => String(value || "other").toLowerCase()

const prettyCategory = (value) => {
  const normalized = normalizeCategory(value)
  return normalized.charAt(0).toUpperCase() + normalized.slice(1)
}

const toAmount = (value) => Number(value) || 0

const sortExpensesDesc = (items = []) =>
  [...items].sort((left, right) => new Date(right.date) - new Date(left.date))

const groupByMonth = (expenses = []) => {
  const monthTotals = expenses.reduce((accumulator, expense) => {
    const date = new Date(expense.date)

    if (Number.isNaN(date.getTime())) {
      return accumulator
    }

    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      "0",
    )}`

    accumulator[monthKey] = (accumulator[monthKey] || 0) + toAmount(expense.amount)
    return accumulator
  }, {})

  return Object.entries(monthTotals)
    .sort(([leftMonth], [rightMonth]) => leftMonth.localeCompare(rightMonth))
    .map(([monthKey, amount]) => {
      const [year, month] = monthKey.split("-").map(Number)
      const date = new Date(year, month - 1, 1)

      return {
        month: new Intl.DateTimeFormat("en-IN", {
          month: "short",
          year: "numeric",
        }).format(date),
        amount,
      }
    })
}

const groupByCategory = (expenses = []) => {
  const categoryTotals = expenses.reduce((accumulator, expense) => {
    const category = normalizeCategory(expense.category)
    accumulator[category] = (accumulator[category] || 0) + toAmount(expense.amount)
    return accumulator
  }, {})

  return Object.entries(categoryTotals)
    .sort((left, right) => right[1] - left[1])
    .map(([category, amount]) => ({
      name: prettyCategory(category),
      key: category,
      value: amount,
      color: CATEGORY_COLORS[category] || CATEGORY_COLORS.other,
    }))
}

const resolveInsights = (insights) => {
  if (!insights) {
    return []
  }

  if (Array.isArray(insights)) {
    return insights
      .map((item) => {
        if (typeof item === "string") {
          return item
        }

        if (item && typeof item === "object") {
          return (
            item.message ||
            item.text ||
            item.insight ||
            item.title ||
            Object.values(item).find((value) => typeof value === "string") ||
            ""
          )
        }

        return ""
      })
      .filter(Boolean)
  }

  if (typeof insights === "string") {
    return [insights]
  }

  return []
}

const resolveTopCategory = (analyticsData, expenses) => {
  const analyticsTopCategory =
    analyticsData?.topCategory ??
    analyticsData?.top_category ??
    analyticsData?.topCategoryName ??
    analyticsData?.top_category_name ??
    null

  if (analyticsTopCategory && typeof analyticsTopCategory === "object") {
    return {
      name:
        analyticsTopCategory.name ||
        analyticsTopCategory.category ||
        analyticsTopCategory.label ||
        "Other",
      amount: toAmount(
        analyticsTopCategory.amount ||
          analyticsTopCategory.total ||
          analyticsTopCategory.value ||
          0,
      ),
    }
  }

  if (typeof analyticsTopCategory === "string") {
    const amountFromAnalytics = toAmount(
      analyticsData?.topCategoryAmount ??
        analyticsData?.top_category_amount ??
        analyticsData?.topAmount ??
        0,
    )

    return {
      name: prettyCategory(analyticsTopCategory),
      amount: amountFromAnalytics,
    }
  }

  const grouped = groupByCategory(expenses)

  if (grouped.length === 0) {
    return {
      name: "No activity yet",
      amount: 0,
    }
  }

  return {
    name: grouped[0].name,
    amount: grouped[0].value,
  }
}

function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState(null)
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const loadData = async () => {
    try {
      setLoading(true)
      setError("")

      const [analyticsResult, expensesResult] = await Promise.allSettled([
        analyticsService.getAnalytics(),
        expenseService.getAll(),
      ])

      const nextAnalyticsData =
        analyticsResult.status === "fulfilled"
          ? analyticsResult.value?.data ?? null
          : null
      const nextExpenses =
        expensesResult.status === "fulfilled"
          ? expensesResult.value?.data || []
          : []

      setAnalyticsData(nextAnalyticsData)
      setExpenses(nextExpenses)

      if (analyticsResult.status === "rejected") {
        throw new Error(
          analyticsResult.reason?.response?.data?.message ||
            analyticsResult.reason?.message ||
            "Unable to load analytics.",
        )
      }

      if (expensesResult.status === "rejected") {
        throw new Error(
          expensesResult.reason?.response?.data?.message ||
            expensesResult.reason?.message ||
            "Unable to load expenses for analytics.",
        )
      }
    } catch (loadError) {
      setError(
        loadError?.message ||
          "Unable to load analytics right now.",
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadData()
    }, 0)

    return () => {
      window.clearTimeout(timer)
    }
  }, [])

  if (loading) {
    return (
      <AppLayout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader size="lg" />
        </div>
      </AppLayout>
    )
  }

  if (error) {
    return (
      <AppLayout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="w-full max-w-xl rounded-3xl border border-rose-500/30 bg-navy-800 p-8 text-center shadow-2xl shadow-black/20">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-500/10 text-rose-300">
              <span className="text-3xl" aria-hidden="true">
                📊
              </span>
            </div>
            <h1 className="mt-6 font-heading text-3xl font-bold text-white">
              We could not load analytics
            </h1>
            <p className="mt-3 text-sm leading-7 text-slate-400">{error}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={loadData}
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

  if (!analyticsData) {
    return (
      <AppLayout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="w-full max-w-xl rounded-3xl border border-navy-700 bg-navy-800 p-8 text-center shadow-2xl shadow-black/20">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-indigo-500/10 text-3xl">
              🤖
            </div>
            <h1 className="mt-6 font-heading text-3xl font-bold text-white">
              Add expenses to see your analytics
            </h1>
            <p className="mt-3 text-sm leading-7 text-slate-400">
              Once you start tracking expenses, AIFA will build monthly trends,
              category breakdowns, and AI insights for you here.
            </p>
            <div className="mt-8">
              <Link
                to="/expenses"
                className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500"
              >
                Add Expenses
              </Link>
            </div>
          </div>
        </div>
      </AppLayout>
    )
  }

  const totalSpent =
    analyticsData?.total ?? analyticsData?.totalSpent

  const normalizedTotalSpent =
    totalSpent != null
      ? toAmount(totalSpent)
      : expenses.reduce((sum, expense) => sum + toAmount(expense.amount), 0)
  const predictionValue = toAmount(
    analyticsData?.prediction ??
      analyticsData?.predicted ??
      analyticsData?.nextMonthPrediction ??
      analyticsData?.next_month_prediction ??
      0,
  )
  const topCategory = resolveTopCategory(analyticsData, expenses)
  const insights = resolveInsights(analyticsData?.insights)
  const monthlyChartData = groupByMonth(expenses)
  const pieChartData = groupByCategory(expenses)
  const recentTransactions = sortExpensesDesc(expenses).slice(0, 10)

  return (
    <AppLayout>
      <div className="space-y-8">
        <section className="space-y-3">
          <p className="text-sm font-medium uppercase tracking-[0.28em] text-indigo-300">
            Analytics
          </p>
          <h1 className="font-heading text-3xl font-bold text-white md:text-4xl">
            Understand where your money goes
          </h1>
          <p className="max-w-3xl text-sm leading-7 text-slate-400">
            Monthly trends, category mix, and AI insights are pulled from your live
            expense history.
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <article className="rounded-2xl border border-navy-700 bg-navy-800 p-6">
            <p className="text-sm text-slate-400">Total Spent</p>
            <p className="mt-3 font-mono text-3xl font-bold text-emerald-400">
              {formatCurrency(normalizedTotalSpent)}
            </p>
          </article>

          <article className="rounded-2xl border border-navy-700 bg-navy-800 p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm text-slate-400">Next Month Prediction</p>
                <p className="mt-3 font-mono text-3xl font-bold text-amber-400">
              {formatCurrency(predictionValue)}
            </p>
              </div>
              <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-amber-300">
                estimated
              </span>
            </div>
          </article>

          <article className="rounded-2xl border border-navy-700 bg-navy-800 p-6">
            <p className="text-sm text-slate-400">Top Category</p>
            <p className="mt-3 text-xl font-semibold text-white">
              {topCategory.name}
            </p>
            <p className="mt-2 font-mono text-sm text-slate-400">
              {formatCurrency(topCategory.amount)}
            </p>
          </article>
        </section>

        <section className="rounded-3xl border border-navy-700 bg-navy-800 p-6">
          <h2 className="font-heading text-2xl font-bold text-white">
            Monthly Spending Overview
          </h2>
          <div className="mt-6">
            {monthlyChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyChartData}>
                  <CartesianGrid stroke="#1f2937" vertical={false} />
                  <XAxis
                    dataKey="month"
                    tick={{ fill: "#94a3b8", fontSize: 12 }}
                    axisLine={{ stroke: "#1f2937" }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: "#94a3b8", fontSize: 12 }}
                    axisLine={{ stroke: "#1f2937" }}
                    tickLine={false}
                    tickFormatter={(value) => formatCurrency(value)}
                  />
                  <Tooltip
                    contentStyle={chartTooltipStyle}
                    labelStyle={{ color: "#e2e8f0", fontWeight: 600 }}
                    itemStyle={{ color: "#cbd5e1" }}
                    cursor={{ fill: "rgba(99, 102, 241, 0.08)" }}
                    formatter={(value) => [formatCurrency(value), "Spent"]}
                  />
                  <Bar dataKey="amount" fill="#6366F1" radius={[10, 10, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex min-h-[300px] items-center justify-center rounded-2xl border border-dashed border-navy-700 bg-navy-900/50 text-slate-400">
                No monthly spending data yet.
              </div>
            )}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <article className="rounded-3xl border border-navy-700 bg-navy-800 p-6">
            <h2 className="font-heading text-2xl font-bold text-white">
              Spending by Category
            </h2>
            <div className="mt-6">
              {pieChartData.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Tooltip
                        contentStyle={chartTooltipStyle}
                        labelStyle={{ color: "#e2e8f0", fontWeight: 600 }}
                        itemStyle={{ color: "#cbd5e1" }}
                        formatter={(value, name) => [formatCurrency(value), name]}
                      />
                      <Pie
                        data={pieChartData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={60}
                        outerRadius={95}
                        paddingAngle={4}
                      >
                        {pieChartData.map((entry) => (
                          <Cell key={entry.key} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>

                  <div className="mt-5 flex flex-wrap gap-3">
                    {pieChartData.map((entry) => (
                      <div
                        key={entry.key}
                        className="flex items-center gap-2 rounded-full border border-navy-700 bg-navy-900 px-3 py-2 text-xs text-slate-300"
                      >
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: entry.color }}
                        />
                        <span>{entry.name}</span>
                        <span className="font-mono text-slate-400">
                          {formatCurrency(entry.value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex min-h-[280px] items-center justify-center rounded-2xl border border-dashed border-navy-700 bg-navy-900/50 text-slate-400">
                  No category data yet.
                </div>
              )}
            </div>
          </article>

          <article className="rounded-3xl border border-indigo-500/30 bg-navy-800 p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/15 text-2xl">
                🤖
              </div>
              <div>
                <h2 className="font-heading text-2xl font-bold text-white">
                  AI Insights
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  Personalized guidance based on your recent spending.
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {insights.length > 0 ? (
                insights.map((insight, index) => (
                  <div
                    key={`${insight}-${index}`}
                    className="rounded-r-xl border-l-2 border-indigo-500 bg-indigo-500/10 px-4 py-3 text-sm leading-7 text-slate-300"
                  >
                    {insight}
                  </div>
                ))
              ) : (
                <p className="text-sm leading-7 text-slate-400">
                  Add more expenses for AI insights.
                </p>
              )}
            </div>
          </article>
        </section>

        <section className="rounded-3xl border border-navy-700 bg-navy-800 p-6">
          <h2 className="font-heading text-2xl font-bold text-white">
            Recent Transactions
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            The latest 10 expenses from your account.
          </p>

          <div className="mt-6 overflow-x-auto">
            {recentTransactions.length > 0 ? (
              <table className="min-w-[860px] w-full border-separate border-spacing-y-2">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-[0.22em] text-slate-400">
                    <th className="px-4 py-2">Date</th>
                    <th className="px-4 py-2">Merchant</th>
                    <th className="px-4 py-2">Category</th>
                    <th className="px-4 py-2">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTransactions.map((expense, index) => {
                    const category = normalizeCategory(expense.category)

                    return (
                      <tr
                        key={expense.id}
                        className={`rounded-2xl ${
                          index % 2 === 0 ? "bg-navy-800" : "bg-navy-900"
                        }`}
                      >
                        <td className="rounded-l-2xl px-4 py-4 text-sm text-slate-300">
                          {formatDate(expense.date)}
                        </td>
                        <td className="px-4 py-4 text-sm font-medium text-white">
                          {expense.merchantName || expense.description || "Unnamed expense"}
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] ${
                              categoryBadgeClasses[category] || categoryBadgeClasses.other
                            }`}
                          >
                            {prettyCategory(category)}
                          </span>
                        </td>
                        <td className="rounded-r-2xl px-4 py-4 font-mono text-sm font-semibold text-white">
                          {formatCurrency(expense.amount)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            ) : (
              <div className="flex min-h-[220px] items-center justify-center rounded-2xl border border-dashed border-navy-700 bg-navy-900/50 text-slate-400">
                No recent transactions available.
              </div>
            )}
          </div>
        </section>
      </div>
    </AppLayout>
  )
}

export default AnalyticsPage
