import api from "./api"

const getAnalytics = async () => (await api.get("/analytics")).data

const analyticsService = {
  getAnalytics,
}

export { getAnalytics }

export default analyticsService
