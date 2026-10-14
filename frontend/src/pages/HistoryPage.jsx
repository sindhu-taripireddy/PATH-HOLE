import React, { useState, useEffect } from 'react';
import { Search, Filter, Trash2, Download, Eye, Calendar, MapPin, HardDrive, RefreshCw } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import SeverityBadge from '../components/SeverityBadge';
import DetectionModal from '../components/DetectionModal';
import { detectionAPI, getUploadUrl, reportAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const HistoryPage = () => {
  const [history, setHistory] = useState([]);
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [loading, setLoading] = useState(true);
  const [selectedDetection, setSelectedDetection] = useState(null);
  const { showToast } = useAuth();

  useEffect(() => {
    fetchHistory();
  }, [severityFilter, sourceFilter, sortBy]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const params = {
        search: search || undefined,
        severity: severityFilter || undefined,
        source: sourceFilter || undefined,
        sort_by: sortBy,
      };
      const res = await detectionAPI.getHistory(params);
      setHistory(res.data);
    } catch (err) {
      console.error("History fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchHistory();
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this detection record?")) {
      try {
        await detectionAPI.deleteDetection(id);
        showToast("Detection record deleted.", "success");
        fetchHistory();
      } catch (err) {
        showToast("Failed to delete record.", "error");
      }
    }
  };

  const handleDownloadPDF = async (id, e) => {
    e.stopPropagation();
    try {
      showToast("Generating PDF report...", "info");
      const response = await reportAPI.downloadPDF(id);
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `PotholeGuard_Report_#${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      showToast("Failed to download PDF.", "error");
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0B0F17]">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar pageTitle="Detection Records History" />

        <main className="flex-1 p-6 overflow-y-auto space-y-6">
          
          {/* Search & Filter Header Bar */}
          <div className="p-4 rounded-2xl bg-[#131C2E] border border-slate-800 flex flex-col lg:flex-row items-center justify-between gap-4">
            
            <form onSubmit={handleSearchSubmit} className="relative w-full lg:w-80">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search title, road, or city..."
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#0F172A] border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </form>

            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
              
              {/* Severity Filter */}
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-[#0F172A] border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-amber-500"
              >
                <option value="">All Severities</option>
                <option value="High">High Severity</option>
                <option value="Medium">Medium Severity</option>
                <option value="Low">Low Severity</option>
              </select>

              {/* Source Filter */}
              <select
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-[#0F172A] border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-amber-500"
              >
                <option value="">All Sources</option>
                <option value="image">Image Scans</option>
                <option value="video">Video Scans</option>
                <option value="camera">Live Camera</option>
              </select>

              {/* Sort By */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 rounded-xl bg-[#0F172A] border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-amber-500"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="confidence">Highest Confidence</option>
              </select>

              <button
                onClick={fetchHistory}
                className="p-2 rounded-xl bg-[#0F172A] border border-slate-800 text-slate-400 hover:text-white transition"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

          </div>

          {/* Records Table & Grid */}
          {loading ? (
            <div className="py-16 text-center text-slate-500 text-xs">Loading inspection records...</div>
          ) : history.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-sm">
              No detection records match your search criteria.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {history.map((det) => (
                <div
                  key={det.id}
                  onClick={() => setSelectedDetection(det)}
                  className="p-5 rounded-2xl bg-[#131C2E] border border-slate-800 hover:border-amber-500/40 transition cursor-pointer group flex flex-col justify-between shadow-lg"
                >
                  <div className="space-y-4">
                    
                    {/* Image Preview Thumbnail */}
                    <div className="rounded-xl overflow-hidden h-40 bg-black relative">
                      <img
                        src={getUploadUrl(det.processed_filepath)}
                        alt={det.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                      <div className="absolute top-3 left-3">
                        <SeverityBadge
                          severity={det.high_severity_count > 0 ? 'High' : det.medium_severity_count > 0 ? 'Medium' : 'Low'}
                        />
                      </div>
                      <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-black/80 backdrop-blur-md border border-slate-700 text-[10px] font-mono text-cyan-400 font-bold">
                        {det.avg_confidence}% Conf
                      </div>
                    </div>

                    {/* Metadata Details */}
                    <div>
                      <h4 className="text-sm font-bold text-white group-hover:text-amber-400 transition truncate">{det.title}</h4>
                      <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1.5">
                        <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span className="truncate">{det.location_name || 'GPS Captured'}</span>
                      </p>
                      <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
                        <Calendar className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span>{new Date(det.created_at).toLocaleString()}</span>
                      </p>
                    </div>

                    {/* Stats summary */}
                    <div className="grid grid-cols-2 gap-2 text-center text-xs p-2.5 rounded-xl bg-[#0F172A] border border-slate-800">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold">Potholes</span>
                        <span className="block font-black text-amber-400 text-sm mt-0.5">{det.pothole_count}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold">Est Area</span>
                        <span className="block font-black text-emerald-400 text-sm mt-0.5">{det.total_estimated_area_cm2} cm²</span>
                      </div>
                    </div>

                  </div>

                  {/* Actions Footer */}
                  <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                    <button
                      onClick={(e) => handleDelete(det.id, e)}
                      title="Delete Record"
                      className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => handleDownloadPDF(det.id, e)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0F172A] border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white transition"
                      >
                        <Download className="w-3.5 h-3.5 text-amber-400" />
                        PDF
                      </button>
                      <button
                        onClick={() => setSelectedDetection(det)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs font-bold text-amber-400 hover:bg-amber-500/20 transition"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View
                      </button>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          )}

        </main>
      </div>

      {selectedDetection && (
        <DetectionModal
          detection={selectedDetection}
          onClose={() => setSelectedDetection(null)}
          onDeleteSuccess={() => fetchHistory()}
        />
      )}
    </div>
  );
};

export default HistoryPage;
