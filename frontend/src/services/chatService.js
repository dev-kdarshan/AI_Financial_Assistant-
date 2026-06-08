import api from "./api";

const sendMessage = async (question, conversationId = null) =>
  (await api.post("/chat/ask", { question, conversationId })).data;

const getConversations = async () =>
  (await api.get("/chat/conversations")).data;

const getMessages = async (conversationId) =>
  (await api.get(`/chat/conversations/${conversationId}/messages`)).data;

export default { sendMessage, getConversations, getMessages };
