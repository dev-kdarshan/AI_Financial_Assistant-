import api from "./api";

const generateReport = async () =>
  (await api.post("/reports/generate")).data;

const downloadReport = async (url) =>
  api.get(url, {
    responseType: "blob",
  });

export default { generateReport, downloadReport };
