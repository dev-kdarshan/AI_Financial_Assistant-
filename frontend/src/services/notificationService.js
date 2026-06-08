import api from "./api";

const send = async (data) => (await api.post("/notifications/send", data)).data;

const getLogs = async () => (await api.get("/notifications/logs")).data;

export default { send, getLogs };
