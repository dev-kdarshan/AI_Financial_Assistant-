import api from "./api"

const getAll = async () => (await api.get("/expense")).data

const addManual = async (data) => (await api.post("/expense", data)).data

const updateExpense = async (id, data) =>
  (await api.put(`/expense/${id}`, data)).data

const addFromOCR = async (file) => {
  const form = new FormData()
  form.append("slip", file)

  return (
    await api.post("/expense/ocr", form, {
      headers: { "Content-Type": "multipart/form-data" },
    })
  ).data
}

const softDelete = async (id) => (await api.delete(`/expense/${id}`)).data

const expenseService = {
  getAll,
  addManual,
  updateExpense,
  addFromOCR,
  softDelete,
}

export { getAll, addManual, addFromOCR, softDelete }
export { updateExpense }

export default expenseService
