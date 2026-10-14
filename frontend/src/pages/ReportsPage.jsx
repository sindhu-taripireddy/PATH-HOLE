import React, { useState, useEffect } from 'react';
import { FileText, Download, Calendar, MapPin, ShieldAlert, CheckCircle2 } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import SeverityBadge from '../components/SeverityBadge';
import { detectionAPI, getUploadUrl, reportAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const ReportsPage = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useAuth();

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await detectionAPI.getHistory({ sort_by: 'newest' });
      setHistory(res.data);
    } catch (err) {
      console.error("Reports fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async (id) => {
    try {
      showToast('Generating official PDF inspection report...', 'info');
      const response = await reportAPI.downloadPDF(id);
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `PotholeGuard_Report_#${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      showToast('Inspection report downloaded successfully!', 'success');
    } catch (err) {
      showToast('Failed to download PDF report.', 'error');
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0B0F17]">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar pageTitle="Infrastructure Inspection Reports" />

        <main className="flex-1 p-6 overflow-y-auto space-y-6">
          
          {/* Header Banner */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-500/10 via-[#131C2E] to-[#131C2E] border border-amber-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-400" />
                Automated Inspection Reports
              </h3>
              <p className="text-xs text-slate-400">Generate and download official PDF reports with AI evidence and geolocation coordinates.</p>
            </div>
            <div className="text-xs font-mono text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-xl">
              PDF Engine Ready
            </div>
          </div>

          {/* List of Reports */}
          {loading ? (
            <div className="py-16 text-center text-slate-500 text-xs">Loading inspection reports...</div>
          ) : history.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-sm">
              No inspection records available to generate reports.
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((det) => (
                <div
                  key={det.id}
                  className="p-5 rounded-2xl bg-[#131C2E] border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6 hover:border-slate-700 transition"
                >
                  <div className="flex items-center gap-5 w-full md:w-auto">
                    {/* Thumbnail */}
                    <div className="w-24 h-24 rounded-xl overflow-hidden bg-black shrink-0 border border-slate-800">
                      <img
                        src={getUploadUrl(det.processed_filepath)}
                        alt={det.title}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="space-y-1 truncate">
                      <div className="flex items-center gap-3">
                        <h4 className="text-base font-bold text-white truncate">{det.title}</h4>
                        <SeverityBadge
                          severity={det.high_severity_count > 0 ? 'High' : det.medium_severity_count > 0 ? 'Medium' : 'Low'}
                        />
                      </div>
                      <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-amber-400" />
                        {det.location_name || 'GPS Coordinates Captured'}
                      </p>
                      <p className="text-xs text-slate-400 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                        {new Date(det.created_at).toLocaleString()}
                        <span className="text-slate-600">•</span>
                        Source: <span className="uppercase font-semibold text-slate-300">{det.source_type}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end pt-4 md:pt-0 border-t md:border-t-0 border-slate-800">
                    <div className="text-right">
                      <span className="text-xs text-slate-400 block font-medium">Potholes / Est Area</span>
                      <span className="text-sm font-black text-amber-400">{det.pothole_count} Found ({det.total_estimated_area_cm2} cm²)</span>
                    </div>

                    <button
                      onClick={() => handleDownloadPDF(det.id)}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 text-black font-extrabold text-xs hover:bg-amber-400 shadow-lg shadow-amber-500/20 transition shrink-0"
                    >
                      <Download className="w-4 h-4" />
                      Download PDF Report
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

        </main>
      </div>
    </div>
  );
};

export default ReportsPage;
