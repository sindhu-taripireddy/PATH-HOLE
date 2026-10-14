import React from 'react';
import { X, Download, Trash2, MapPin, Calendar, HardDrive, ShieldAlert, Cpu } from 'lucide-react';
import SeverityBadge from './SeverityBadge';
import { getUploadUrl, reportAPI, detectionAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const DetectionModal = ({ detection, onClose, onDeleteSuccess }) => {
  const { showToast } = useAuth();
  if (!detection) return null;

  const handleDownloadPDF = async () => {
    try {
      showToast('Generating inspection PDF report...', 'info');
      const response = await reportAPI.downloadPDF(detection.id);
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `PotholeGuard_Report_#${detection.id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      showToast('PDF downloaded successfully!', 'success');
    } catch (err) {
      showToast('Failed to download PDF report.', 'error');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this detection record?')) {
      try {
        await detectionAPI.deleteDetection(detection.id);
        showToast('Detection record deleted.', 'success');
        if (onDeleteSuccess) onDeleteSuccess(detection.id);
        onClose();
      } catch (err) {
        showToast('Failed to delete detection.', 'error');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#131C2E] border border-slate-800 rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-[#0F172A]">
          <div>
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-bold text-white">{detection.title || `Detection #${detection.id}`}</h3>
              <SeverityBadge 
                severity={detection.high_severity_count > 0 ? "High" : detection.medium_severity_count > 0 ? "Medium" : "Low"} 
              />
            </div>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              {new Date(detection.created_at).toLocaleString()}
              <span>•</span>
              <HardDrive className="w-3.5 h-3.5 text-cyan-400" />
              Source: <span className="uppercase font-semibold">{detection.source_type}</span>
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Main Visual Image View */}
          <div className="rounded-xl overflow-hidden bg-black border border-slate-800 relative group">
            <img
              src={getUploadUrl(detection.processed_filepath)}
              alt="Detected Potholes evidence"
              className="w-full max-h-[420px] object-contain mx-auto"
            />
            <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md border border-slate-700 text-xs font-mono text-amber-400 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 animate-pulse" />
              {detection.pothole_count} Potholes Detected
            </div>
          </div>

          {/* Key Metrics Stats Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-[#0F172A] border border-slate-800">
              <p className="text-xs text-slate-400 font-medium">Pothole Count</p>
              <p className="text-2xl font-black text-amber-400 mt-1">{detection.pothole_count}</p>
            </div>
            <div className="p-4 rounded-xl bg-[#0F172A] border border-slate-800">
              <p className="text-xs text-slate-400 font-medium">Avg Confidence</p>
              <p className="text-2xl font-black text-cyan-400 mt-1">{detection.avg_confidence}%</p>
            </div>
            <div className="p-4 rounded-xl bg-[#0F172A] border border-slate-800">
              <p className="text-xs text-slate-400 font-medium">High Severity</p>
              <p className="text-2xl font-black text-rose-400 mt-1">{detection.high_severity_count}</p>
            </div>
            <div className="p-4 rounded-xl bg-[#0F172A] border border-slate-800">
              <p className="text-xs text-slate-400 font-medium">Est. Total Area</p>
              <p className="text-2xl font-black text-emerald-400 mt-1">{detection.total_estimated_area_cm2} <span className="text-xs">cm²</span></p>
            </div>
          </div>

          {/* Location Info Card */}
          <div className="p-4 rounded-xl bg-[#0F172A] border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-400">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Captured Geolocation</p>
                <h4 className="text-sm font-semibold text-slate-200">{detection.location_name || 'Captured Coordinates'}</h4>
                <p className="text-xs text-slate-400 font-mono">
                  Lat: {detection.latitude || 'N/A'}, Lng: {detection.longitude || 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Detailed Pothole Bounding Box Table */}
          {detection.detections_json && detection.detections_json.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold uppercase text-slate-400 tracking-wider mb-3">Individual Pothole Detection Breakdown</h4>
              <div className="border border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-[#0F172A] text-slate-400 uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="px-4 py-3">Pothole ID</th>
                      <th className="px-4 py-3">Bounding Box (x1, y1, x2, y2)</th>
                      <th className="px-4 py-3">Confidence</th>
                      <th className="px-4 py-3">Severity</th>
                      <th className="px-4 py-3">Est. Area</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 bg-[#131C2E]">
                    {detection.detections_json.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/40">
                        <td className="px-4 py-3 font-bold text-amber-400">#{idx + 1}</td>
                        <td className="px-4 py-3 font-mono text-slate-400">
                          [{item.bbox.map(n => Math.round(n)).join(', ')}]
                        </td>
                        <td className="px-4 py-3 font-semibold text-cyan-400">{item.confidence}%</td>
                        <td className="px-4 py-3">
                          <SeverityBadge severity={item.severity} showIcon={false} />
                        </td>
                        <td className="px-4 py-3 font-semibold text-slate-200">{item.estimated_size_cm2} cm²</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-[#0F172A] flex items-center justify-between">
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 transition"
          >
            <Trash2 className="w-4 h-4" />
            Delete Record
          </button>
          
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition"
            >
              Close
            </button>
            <button
              onClick={handleDownloadPDF}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-500 text-black hover:bg-amber-400 shadow-lg shadow-amber-500/20 transition"
            >
              <Download className="w-4 h-4" />
              Download PDF Report
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DetectionModal;
