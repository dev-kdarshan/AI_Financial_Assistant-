import { useState } from "react";
import AppLayout from "../layouts/AppLayout";
import reportService from "../services/reportService";
import useToast from "../hooks/useToast";

function ReportPage() {
  const [state, setState] = useState("idle"); // idle, loading, success, error
  const [reportData, setReportData] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const { showToast } = useToast();

  const handleGenerateReport = async () => {
    setState("loading");
    try {
      const result = await reportService.generateReport();
      setReportData(result.data);
      setState("success");
      showToast("Report generated successfully!", "success");
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Failed to generate report");
      setState("error");
      showToast(errorMsg, "error");
    }
  };

  const handleDownload = () => {
    if (reportData?.downloadUrl) {
      window.open(reportData.downloadUrl, "_blank");
    }
  };

  const handleGenerateNew = () => {
    setState("idle");
    setReportData(null);
    setErrorMsg("");
  };

  return (
    <AppLayout>
      <div className="max-w-lg mx-auto pt-12 px-4">
        {/* Idle State */}
        {state === "idle" && (
          <div className="bg-navy-800 rounded-3xl border border-navy-700 p-12 text-center">
            <div className="text-6xl mb-4">📄</div>
            <h2 className="font-heading font-bold text-2xl text-white mb-2">
              Generate Financial Report
            </h2>
            <p className="text-slate-400 mb-6">
              Get a detailed PDF report with spending analysis, category breakdown,
              charts, and AI-powered insights.
            </p>

            {/* What's Included List */}
            <div className="text-left mb-8 space-y-3">
              <div className="flex items-center gap-3 text-slate-300">
                <span>✅</span>
                <span>Monthly spending summary</span>
              </div>
              <div className="flex items-center gap-3 text-slate-300">
                <span>✅</span>
                <span>Category breakdown charts</span>
              </div>
              <div className="flex items-center gap-3 text-slate-300">
                <span>✅</span>
                <span>AI-powered insights</span>
              </div>
              <div className="flex items-center gap-3 text-slate-300">
                <span>✅</span>
                <span>Next month predictions</span>
              </div>
            </div>

            <button
              onClick={handleGenerateReport}
              className="w-full bg-indigo-600 text-white rounded-xl py-3 font-semibold text-base hover:bg-indigo-700 transition-colors"
            >
              Generate Report
            </button>
          </div>
        )}

        {/* Loading State */}
        {state === "loading" && (
          <div className="bg-navy-800 rounded-3xl border border-navy-700 p-12 text-center">
            <div className="flex justify-center mb-4">
              <div className="relative w-12 h-12">
                <div className="absolute inset-0 border-4 border-navy-700 rounded-full" />
                <div className="absolute inset-0 border-4 border-transparent border-t-indigo-600 rounded-full animate-spin" />
              </div>
            </div>
            <p className="text-slate-400">Generating your report...</p>
          </div>
        )}

        {/* Success State */}
        {state === "success" && (
          <div className="bg-emerald-500/10 rounded-2xl border border-emerald-500/30 p-6">
            <h3 className="font-heading font-semibold text-lg text-emerald-400 mb-2">
              ✅ Report Ready!
            </h3>
            <p className="text-slate-300 mb-6">
              {reportData?.fileName || `AIFA_Report_${new Date().toISOString().split("T")[0]}.pdf`}
            </p>
            <button
              onClick={handleDownload}
              className="w-full bg-emerald-500 text-white rounded-xl py-3 font-semibold mb-3 hover:bg-emerald-600 transition-colors"
            >
              📥 Download Report
            </button>
            <button
              onClick={handleGenerateNew}
              className="w-full border border-emerald-500/50 text-emerald-400 rounded-xl py-3 font-semibold hover:bg-emerald-500/10 transition-colors"
            >
              Generate New Report
            </button>
          </div>
        )}

        {/* Error State */}
        {state === "error" && (
          <div className="bg-rose-500/10 rounded-2xl border border-rose-500/30 p-6">
            <h3 className="font-heading font-semibold text-lg text-rose-400 mb-2">
              ❌ Generation Failed
            </h3>
            <p className="text-slate-400 mb-6">{errorMsg}</p>
            <button
              onClick={handleGenerateReport}
              className="w-full bg-rose-500 text-white rounded-xl py-3 font-semibold hover:bg-rose-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

export default ReportPage;
