import api from "./api";

const generateReport = async () => (await api.post("/reports/generate")).data;

export default { generateReport };
