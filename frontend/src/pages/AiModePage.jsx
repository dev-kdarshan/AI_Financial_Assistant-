import { useRef, useEffect, useState } from "react";
import AppLayout from "../layouts/AppLayout";
import useChat from "../hooks/useChat";
import useToast from "../hooks/useToast";

function AiModePage() {
  const {
    conversations,
    activeConversation,
    messages,
    loading,
    sending,
    openConversation,
    sendMessage,
    newConversation,
  } = useChat();

  const { showToast } = useToast();
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const [input, setInput] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSendMessage = async (text = input) => {
    if (!text.trim()) return;

    setInput("");
    try {
      await sendMessage(text.trim());
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to send message", "error");
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setInput(suggestion);
    handleSendMessage(suggestion);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const autoExpandTextarea = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      const height = Math.min(textarea.scrollHeight, 96);
      textarea.style.height = `${height}px`;
    }
  };

  useEffect(() => {
    autoExpandTextarea();
  }, [input]);

  const suggestions = [
    "What did I spend most on this month?",
    "How can I reduce my food expenses?",
    "Give me a summary of my spending",
  ];

  return (
    <AppLayout>
      <div className="flex h-screen bg-navy-900">
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Left Sidebar */}
        <div
          className={`fixed md:relative w-80 h-screen bg-navy-900 border-r border-navy-700 flex flex-col z-40 transform transition-transform duration-300 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          }`}
        >
          {/* New Chat Button */}
          <button
            onClick={() => {
              newConversation();
              setSidebarOpen(false);
            }}
            className="m-4 px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            + New Chat
          </button>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto px-4 pb-4">
            {conversations.length === 0 ? (
              <p className="text-sm text-slate-400 text-center pt-4">
                No conversations yet
              </p>
            ) : (
              <div className="space-y-2">
                {conversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => {
                      openConversation(conv);
                      setSidebarOpen(false);
                    }}
                    className={`w-full text-left p-3 rounded-xl transition-all ${
                      activeConversation?.id === conv.id
                        ? "bg-navy-700 border-l-2 border-indigo-500"
                        : "hover:bg-navy-700"
                    }`}
                  >
                    <p className="text-sm text-slate-200 truncate">
                      {conv.title}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      {new Date(conv.createdAt).toLocaleDateString()}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Chat Area */}
        <div className="flex-1 flex flex-col h-screen">
          {/* Top Bar */}
          <div className="flex items-center justify-between p-6 border-b border-navy-700 bg-navy-800">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 hover:bg-navy-700 rounded-lg"
            >
              ☰
            </button>
            <h1 className="font-heading font-semibold text-xl text-white">
              {activeConversation
                ? activeConversation.title
                : "New Conversation"}
            </h1>
            <div className="w-8" />
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
            {messages.length === 0 && !loading ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-4">
                <div className="text-6xl">🤖</div>
                <h2 className="font-heading font-semibold text-2xl text-white">
                  Ask me anything about your finances
                </h2>
                <div className="flex flex-wrap gap-3 justify-center">
                  {suggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="px-4 py-2 rounded-full text-sm bg-navy-800 border border-navy-700 text-slate-200 hover:border-indigo-500 transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${
                      msg.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md p-3 rounded-2xl text-sm ${
                        msg.role === "user"
                          ? "bg-indigo-600 text-white rounded-tr-sm"
                          : "bg-navy-800 border border-navy-700 text-slate-200 rounded-tl-sm flex gap-2"
                      }`}
                    >
                      {msg.role === "assistant" && <span>🤖</span>}
                      <p>{msg.content}</p>
                    </div>
                  </div>
                ))}

                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-navy-800 border border-navy-700 rounded-2xl rounded-tl-sm p-3 flex gap-1">
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-100" />
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-200" />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Input Area */}
          <div className="border-t border-navy-700 bg-navy-900 p-6 flex gap-3">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me anything..."
              disabled={sending}
              rows={1}
              className="flex-1 bg-navy-800 border border-navy-700 focus:border-indigo-500 focus:outline-none rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 resize-none max-h-24"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={sending || !input.trim()}
              className="bg-indigo-600 text-white rounded-xl px-4 py-2 hover:bg-indigo-700 disabled:opacity-50 transition-all font-medium"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

export default AiModePage;
