import { useState, useEffect } from "react";
import chatService from "../services/chatService";

const useChat = () => {
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const data = await chatService.getConversations();
      setConversations(data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const openConversation = async (conv) => {
    setActiveConversation(conv);
    setLoading(true);
    try {
      const data = await chatService.getMessages(conv.id);
      setMessages(data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (question) => {
    setSending(true);
    try {
      const result = await chatService.sendMessage(
        question,
        activeConversation?.id || null
      );
      if (!activeConversation) {
        await fetchConversations();
        setActiveConversation({ id: result.data.conversationId });
      }
      setMessages((prev) => [
        ...prev,
        { role: "user", content: question },
        { role: "assistant", content: result.data.answer },
      ]);
      return result;
    } catch (err) {
      throw err;
    } finally {
      setSending(false);
    }
  };

  const newConversation = () => {
    setActiveConversation(null);
    setMessages([]);
  };

  return {
    conversations,
    activeConversation,
    messages,
    loading,
    sending,
    openConversation,
    sendMessage,
    newConversation,
  };
};

export default useChat;
