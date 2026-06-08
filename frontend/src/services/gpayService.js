import api from "./api"

const importFile = async (file) => {
  const form = new FormData()
  form.append("file", file)

  return (
    await api.post("/gpay/import", form, {
      headers: { "Content-Type": "multipart/form-data" },
    })
  ).data
}

const getTransactions = async () => (await api.get("/transaction")).data

const softDelete = async (id) => (await api.delete(`/transaction/${id}`)).data

const gpayService = {
  importFile,
  getTransactions,
  softDelete,
}

export { importFile, getTransactions, softDelete }

export default gpayService
