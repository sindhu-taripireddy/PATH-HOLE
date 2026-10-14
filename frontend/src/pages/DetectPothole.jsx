import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  UploadCloud, 
  Image as ImageIcon, 
  Video as VideoIcon, 
  Camera, 
  MapPin, 
  CheckCircle, 
  AlertOctagon, 
  Sparkles, 
  Download,
  RotateCcw
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import SeverityBadge from '../components/SeverityBadge';
import { detectionAPI, getUploadUrl, reportAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const DetectPothole = () => {
  const [activeTab, setActiveTab] = useState('image'); // 'image', 'video'
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [title, setTitle] = useState('');
  const [locationName, setLocationName] = useState('');
  const [coords, setCoords] = useState({ lat: '', lng: '' });
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const { showToast } = useAuth();
  const navigate = useNavigate();

  // Capture GPS on load
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoords({
            lat: pos.coords.latitude.toFixed(4),
            lng: pos.coords.longitude.toFixed(4)
          });
        },
        (err) => console.log('Geolocation permission:', err.message)
      );
    }
  }, []);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      setResult(null);
      if (!title) {
        setTitle(`Road Scan - ${selectedFile.filename || 'New Capture'}`);
      }
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      setFile(droppedFile);
      setPreviewUrl(URL.createObjectURL(droppedFile));
      setResult(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      showToast('Please select or drop a road image/video file to process.', 'warning');
      return;
    }

    setProcessing(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title || 'Road Scan');
    if (coords.lat) formData.append('latitude', coords.lat);
    if (coords.lng) formData.append('longitude', coords.lng);
    if (locationName) formData.append('location_name', locationName);

    try {
      if (activeTab === 'image') {
        const res = await detectionAPI.uploadImage(formData);
        setResult(res.data);
        showToast(`YOLO Analysis Complete: ${res.data.pothole_count} Potholes Detected!`, 'success');
      } else {
        const res = await detectionAPI.uploadVideo(formData);
        setResult(res.data);
        showToast(`Video Processing Complete: ${res.data.pothole_count} Potholes Analyzed!`, 'success');
      }
    } catch (err) {
      const msg = err.response?.data?.detail || 'Detection processing failed.';
      showToast(msg, 'error');
    } finally {
      setProcessing(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!result?.id) return;
    try {
      showToast('Generating PDF inspection report...', 'info');
      const response = await reportAPI.downloadPDF(result.id);
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `PotholeGuard_Report_#${result.id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      showToast('Failed to download PDF.', 'error');
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0B0F17]">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar pageTitle="AI Pothole Detector" />

        <main className="flex-1 p-6 overflow-y-auto space-y-6">
          
          {/* Top Options Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2 p-1 rounded-xl bg-[#131C2E] border border-slate-800">
              <button
                onClick={() => { setActiveTab('image'); setFile(null); setResult(null); setPreviewUrl(null); }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition ${
                  activeTab === 'image'
                    ? 'bg-amber-500 text-black shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <ImageIcon className="w-4 h-4" />
                Upload Image
              </button>
              <button
                onClick={() => { setActiveTab('video'); setFile(null); setResult(null); setPreviewUrl(null); }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition ${
                  activeTab === 'video'
                    ? 'bg-amber-500 text-black shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <VideoIcon className="w-4 h-4" />
                Upload Video
              </button>
              <button
                onClick={() => navigate('/live')}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold text-cyan-400 hover:bg-cyan-500/10 transition"
              >
                <Camera className="w-4 h-4" />
                Live Camera
              </button>
            </div>

            <div className="text-xs text-slate-400 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              YOLOv8 Real-Time Computer Vision Inference
            </div>
          </div>

          {/* Main Content Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Upload & Form Column */}
            <div className="lg:col-span-5 space-y-6">
              <div className="p-6 rounded-2xl bg-[#131C2E] border border-slate-800 space-y-5">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <UploadCloud className="w-4 h-4 text-amber-400" />
                  {activeTab === 'image' ? 'Select Road Surface Image' : 'Select Road Video File'}
                </h3>

                {/* Drag and Drop Box */}
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  className="border-2 border-dashed border-slate-700 hover:border-amber-500/50 rounded-xl p-6 text-center cursor-pointer transition bg-[#0F172A] relative group"
                >
                  <input
                    type="file"
                    accept={activeTab === 'image' ? 'image/*' : 'video/*'}
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  {previewUrl ? (
                    <div className="space-y-3">
                      {activeTab === 'image' ? (
                        <img src={previewUrl} alt="Preview" className="max-h-48 mx-auto rounded-lg object-cover" />
                      ) : (
                        <video src={previewUrl} controls className="max-h-48 mx-auto rounded-lg" />
                      )}
                      <p className="text-xs text-amber-400 font-semibold truncate">{file?.name}</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto">
                        <UploadCloud className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-200">Click to browse or drag & drop</p>
                        <p className="text-[11px] text-slate-500 mt-1">
                          {activeTab === 'image' ? 'Supports JPG, PNG, WebP (Max 25MB)' : 'Supports MP4, AVI, WebM (Max 100MB)'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Optional Metadata Inputs */}
                <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                  <div>
                    <label className="block text-[11px] font-semibold uppercase text-slate-400 tracking-wider mb-1">Scan Label / Title</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Highway 101 Sector 4"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#0F172A] border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase text-slate-400 tracking-wider mb-1">Road Location Name</label>
                    <input
                      type="text"
                      value={locationName}
                      onChange={(e) => setLocationName(e.target.value)}
                      placeholder="e.g. Main Expressway, Mile 14"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#0F172A] border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold uppercase text-slate-400 tracking-wider mb-1">Latitude</label>
                      <input
                        type="text"
                        value={coords.lat}
                        onChange={(e) => setCoords({ ...coords, lat: e.target.value })}
                        placeholder="37.7749"
                        className="w-full px-3.5 py-2 py-2 rounded-xl bg-[#0F172A] border border-slate-800 text-xs text-white placeholder-slate-500 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold uppercase text-slate-400 tracking-wider mb-1">Longitude</label>
                      <input
                        type="text"
                        value={coords.lng}
                        onChange={(e) => setCoords({ ...coords, lng: e.target.value })}
                        placeholder="-122.4194"
                        className="w-full px-3.5 py-2 rounded-xl bg-[#0F172A] border border-slate-800 text-xs text-white placeholder-slate-500 font-mono"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={processing || !file}
                    className="w-full py-3.5 px-4 rounded-xl bg-amber-500 text-black font-extrabold text-xs hover:bg-amber-400 focus:outline-none shadow-lg shadow-amber-500/20 transition flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {processing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                        Running YOLO Computer Vision...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Run AI Pothole Detection
                      </>
                    )}
                  </button>
                </form>

              </div>
            </div>

            {/* Right Detection Results Column */}
            <div className="lg:col-span-7 space-y-6">
              <div className="p-6 rounded-2xl bg-[#131C2E] border border-slate-800 min-h-[520px] flex flex-col justify-between">
                
                {!result ? (
                  <div className="my-auto text-center py-16 space-y-3">
                    <div className="w-16 h-16 rounded-full bg-slate-800/80 text-slate-500 flex items-center justify-center mx-auto">
                      <Sparkles className="w-8 h-8 text-amber-500/60" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-300">Detection Results Panel</h4>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      Upload an image or video on the left to run YOLO bounding box detection, severity analysis, and size estimation.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                      <div>
                        <h3 className="text-base font-bold text-white flex items-center gap-2">
                          <CheckCircle className="w-5 h-5 text-emerald-400" />
                          Detection Analysis Complete
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5">YOLO Bounding Box Annotations Applied</p>
                      </div>
                      <SeverityBadge
                        severity={result.high_severity_count > 0 ? "High" : result.medium_severity_count > 0 ? "Medium" : "Low"}
                      />
                    </div>

                    {/* Result Visual Preview */}
                    <div className="rounded-xl overflow-hidden bg-black border border-slate-800 relative group">
                      {activeTab === 'image' ? (
                        <img
                          src={getUploadUrl(result.processed_filepath)}
                          alt="Annotated Pothole Result"
                          className="w-full max-h-[360px] object-contain mx-auto"
                        />
                      ) : (
                        <video
                          src={getUploadUrl(result.processed_filepath)}
                          controls
                          className="w-full max-h-[360px]"
                        />
                      )}
                    </div>

                    {/* Quick Metrics Bar */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="p-3.5 rounded-xl bg-[#0F172A] border border-slate-800 text-center">
                        <p className="text-[10px] text-slate-400 uppercase font-semibold">Potholes Found</p>
                        <p className="text-xl font-black text-amber-400 mt-0.5">{result.pothole_count}</p>
                      </div>
                      <div className="p-3.5 rounded-xl bg-[#0F172A] border border-slate-800 text-center">
                        <p className="text-[10px] text-slate-400 uppercase font-semibold">Avg Confidence</p>
                        <p className="text-xl font-black text-cyan-400 mt-0.5">{result.avg_confidence}%</p>
                      </div>
                      <div className="p-3.5 rounded-xl bg-[#0F172A] border border-slate-800 text-center">
                        <p className="text-[10px] text-slate-400 uppercase font-semibold">High Severity</p>
                        <p className="text-xl font-black text-rose-400 mt-0.5">{result.high_severity_count}</p>
                      </div>
                      <div className="p-3.5 rounded-xl bg-[#0F172A] border border-slate-800 text-center">
                        <p className="text-[10px] text-slate-400 uppercase font-semibold">Est. Total Area</p>
                        <p className="text-xl font-black text-emerald-400 mt-0.5">{result.total_estimated_area_cm2} <span className="text-[10px]">cm²</span></p>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                      <button
                        onClick={() => setResult(null)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition"
                      >
                        <RotateCcw className="w-4 h-4" />
                        Scan Another File
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
                )}

              </div>
            </div>

          </div>

        </main>
      </div>
    </div>
  );
};

export default DetectPothole;
