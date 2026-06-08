import { useState, useEffect } from "react";
import AppLayout from "../layouts/AppLayout";
import notificationService from "../services/notificationService";
import useToast from "../hooks/useToast";

function NotificationsPage() {
  const [tab, setTab] = useState("email"); // email, sms
  const [sending, setSending] = useState(false);
  const [logs, setLogs] = useState([]);
  const [formData, setFormData] = useState({
    subject: "",
    message: "",
  });
  const { showToast } = useToast();

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const result = await notificationService.getLogs();
      setLogs(result.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendNotification = async () => {
    if (tab === "email" && (!formData.subject || !formData.message)) {
      showToast("Please fill in all email fields", "error");
      return;
    }
    if (tab === "sms" && !formData.message) {
      showToast("Please enter a message", "error");
      return;
    }

    setSending(true);
    try {
      const payload = {
        channel: tab,
        ...(tab === "email" && { subject: formData.subject }),
        message: formData.message,
      };

      await notificationService.send(payload);
      showToast("Notification sent!", "success");
      setFormData({ subject: "", message: "" });
      await fetchLogs();
    } catch (err) {
      showToast(
        err.response?.data?.message || "Failed to send notification",
        "error"
      );
    } finally {
      setSending(false);
    }
  };

  const getStatusBadge = (status) => {
    const baseClass = "px-3 py-1 rounded-full text-xs font-medium";
    switch (status) {
      case "sent":
        return `${baseClass} bg-emerald-400/20 text-emerald-400`;
      case "failed":
        return `${baseClass} bg-rose-400/20 text-rose-400`;
      case "pending":
        return `${baseClass} bg-amber-400/20 text-amber-400`;
      default:
        return baseClass;
    }
  };

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Section 1: Send Notification */}
        <div className="bg-navy-800 rounded-2xl border border-navy-700 p-6">
          <h2 className="font-heading font-semibold text-lg text-white mb-6">
            Send Notification
          </h2>

          {/* Tab Buttons */}
          <div className="flex gap-3 mb-6">
            <button
              onClick={() => setTab("email")}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                tab === "email"
                  ? "bg-indigo-500 text-white"
                  : "bg-navy-700 text-slate-400 hover:text-slate-200"
              }`}
            >
              📧 Email
            </button>
            <button
              onClick={() => setTab("sms")}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                tab === "sms"
                  ? "bg-indigo-500 text-white"
                  : "bg-navy-700 text-slate-400 hover:text-slate-200"
              }`}
            >
              📱 SMS
            </button>
          </div>

          {/* Email Tab */}
          {tab === "email" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) =>
                    setFormData({ ...formData, subject: e.target.value })
                  }
                  placeholder="Email subject"
                  className="w-full bg-navy-700 border border-navy-600 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  Message
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  placeholder="Email message"
                  rows={4}
                  className="w-full bg-navy-700 border border-navy-600 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>
            </div>
          )}

          {/* SMS Tab */}
          {tab === "sms" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  Message
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  placeholder="SMS message (max 160 characters)"
                  rows={4}
                  maxLength={160}
                  className="w-full bg-navy-700 border border-navy-600 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
                />
                <p className="text-xs text-slate-400 mt-1">
                  {formData.message.length}/160 characters
                </p>
              </div>
            </div>
          )}

          <button
            onClick={handleSendNotification}
            disabled={sending}
            className="w-full mt-6 bg-indigo-600 text-white rounded-lg py-3 font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
          >
            {sending ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Sending...
              </>
            ) : (
              "Send Notification"
            )}
          </button>
        </div>

        {/* Section 2: Notification Logs */}
        <div>
          <h2 className="font-heading font-semibold text-lg text-white mb-4">
            Notification History
          </h2>

          {logs.length === 0 ? (
            <div className="bg-navy-800 rounded-2xl border border-navy-700 p-12 text-center">
              <p className="text-slate-400">No notifications sent yet</p>
            </div>
          ) : (
            <div className="bg-navy-800 rounded-2xl border border-navy-700 overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-navy-700 bg-navy-900">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-200">
                      Type
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-200">
                      Channel
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-200">
                      Recipient
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-200">
                      Subject
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-200">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-200">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-700">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-navy-700/50 transition-colors">
                      <td className="px-6 py-4 text-sm text-slate-300">
                        {log.type || "Notification"}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-300">
                        {log.channel || "-"}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-300">
                        {log.recipient || "-"}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-300 max-w-xs truncate">
                        {log.subject || log.message || "-"}
                      </td>
                      <td className="px-6 py-4">
                        <span className={getStatusBadge(log.status)}>
                          {log.status || "pending"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-400">
                        {new Date(log.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

export default NotificationsPage;
