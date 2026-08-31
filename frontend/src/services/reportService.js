import api from "./api";

const generateReport = async () =>
  (await api.post("/reports/generate")).data;

const downloadReport = async (fileName) => {
  return await api.get(`/reports/download/${fileName}`, {
    responseType: "blob",
  });
};

export default {
  generateReport,
  downloadReport,
};
