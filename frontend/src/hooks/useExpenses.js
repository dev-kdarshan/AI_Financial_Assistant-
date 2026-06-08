import { useEffect, useState } from "react"
import expenseService from "../services/expenseService"

const useExpenses = () => {
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchExpenses = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await expenseService.getAll()
      setExpenses(data.data || [])
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Unable to load expenses")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const initialLoad = window.setTimeout(() => {
      fetchExpenses().catch(() => {})
    }, 0)

    return () => {
      window.clearTimeout(initialLoad)
    }
  }, [])

  const addExpense = async (formData) => {
    const result = await expenseService.addManual(formData)
    await fetchExpenses().catch(() => {})
    return result
  }

  const updateExpense = async (id, formData) => {
    const result = await expenseService.updateExpense(id, formData)
    setExpenses((prev) => {
      const nextExpenses = prev.map((expense) =>
        expense.id === id ? result.data || expense : expense,
      )

      return [...nextExpenses].sort(
        (left, right) => new Date(right.date) - new Date(left.date),
      )
    })
    return result
  }

  const addFromOCR = async (file) => {
    const result = await expenseService.addFromOCR(file)
    await fetchExpenses().catch(() => {})
    return result
  }

  const deleteExpense = async (id) => {
    const result = await expenseService.softDelete(id)
    setExpenses((prev) => prev.filter((expense) => expense.id !== id))
    return result
  }

  return {
    expenses,
    loading,
    error,
    addExpense,
    updateExpense,
    addFromOCR,
    deleteExpense,
    refetch: fetchExpenses,
  }
}

export default useExpenses
