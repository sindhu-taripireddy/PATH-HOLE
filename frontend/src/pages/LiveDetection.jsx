import React, { useState, useEffect, useRef } from 'react';
import { Camera, CameraOff, Sparkles, RefreshCw, AlertTriangle, ShieldCheck, Save, Play, Square, Video } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import SeverityBadge from '../components/SeverityBadge';
import { detectionAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const LiveDetection = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [streaming, setStreaming] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [annotatedFrame, setAnnotatedFrame] = useState(null);
  const [detectionMetrics, setDetectionMetrics] = useState({
    count: 0,
    conf: 0,
    high: 0,
    med: 0,
    low: 0,
  });
  const [fps, setFps] = useState(0);
  const { showToast } = useAuth();
  const intervalRef = useRef(null);
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      let stream;
      // Try HD environment camera first, fallback to generic video
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'environment' }
        });
      } catch (e1) {
        stream = await navigator.mediaDevices.getUserMedia({
          video: true
        });
      }

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setStreaming(true);
        showToast('Webcam connected! Running real-time YOLO road inspection...', 'success');
        startFrameProcessing();
      }
    } catch (err) {
      console.error("Camera access failure:", err);
      showToast(`Camera Error: ${err.message || 'Access denied or webcam unavailable.'}`, 'error');
    }
  };

  const stopCamera = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setStreaming(false);
    setIsAnalyzing(false);
    setAnnotatedFrame(null);
  };

  const startFrameProcessing = () => {
    setIsAnalyzing(true);
    intervalRef.current = setInterval(async () => {
      captureAndDetectFrame();
    }, 350); // Frame sampling interval (~3 FPS)
  };

  const captureAndDetectFrame = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    if (video.readyState < 2) return; // HAVE_CURRENT_DATA or higher

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const base64Data = canvas.toDataURL('image/jpeg', 0.75);

    try {
      const res = await detectionAPI.detectFrame(base64Data);
      setAnnotatedFrame(res.data.annotated_image_base64);
      setDetectionMetrics({
        count: res.data.pothole_count,
        conf: res.data.avg_confidence,
        high: res.data.high_severity_count,
        med: res.data.medium_severity_count,
        low: res.data.low_severity_count,
      });

      // Calculate FPS
      frameCountRef.current += 1;
      const now = performance.now();
      if (now - lastTimeRef.current >= 1000) {
        setFps(frameCountRef.current);
        frameCountRef.current = 0;
        lastTimeRef.current = now;
      }
    } catch (err) {
      // Pass frame on intermittent error
    }
  };

  const snapAndSaveDetection = async () => {
    if (!annotatedFrame) return;
    try {
      showToast('Saving snapshot detection record to database...', 'info');
      const res = await fetch(annotatedFrame);
      const blob = await res.blob();
      const file = new File([blob], `live_snapshot_${Date.now()}.jpg`, { type: 'image/jpeg' });

      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', 'Live Camera Snapshot');
      formData.append('location_name', 'Live Highway Cam');

      await detectionAPI.uploadImage(formData);
      showToast('Live snapshot record saved successfully!', 'success');
    } catch (err) {
      showToast('Failed to save live snapshot.', 'error');
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0B0F17]">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar pageTitle="Real-Time Live Camera Detection" />

        <main className="flex-1 p-6 overflow-y-auto space-y-6">
          
          {/* Header Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-[#131C2E] border border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400">
                <Camera className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Webcam Real-Time Pothole Inspector</h3>
                <p className="text-xs text-slate-400">Processes video frames on-the-fly with YOLO bounding box overlays</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {!streaming ? (
                <button
                  onClick={startCamera}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 text-black font-extrabold text-xs hover:bg-amber-400 shadow-lg shadow-amber-500/20 transition cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-black" />
                  Start Live Camera
                </button>
              ) : (
                <>
                  <button
                    onClick={snapAndSaveDetection}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 text-black font-extrabold text-xs hover:bg-emerald-400 transition"
                  >
                    <Save className="w-4 h-4" />
                    Save Snapshot
                  </button>
                  <button
                    onClick={stopCamera}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/40 text-xs font-bold hover:bg-rose-500/30 transition"
                  >
                    <Square className="w-4 h-4 fill-rose-400" />
                    Stop Stream
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Main Video & Overlay Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Live Camera Stream Box */}
            <div className="lg:col-span-8 space-y-4">
              <div className="rounded-2xl overflow-hidden bg-black border border-slate-800 relative aspect-video flex items-center justify-center shadow-2xl">
                
                {/* Hidden processing canvas */}
                <canvas ref={canvasRef} className="hidden" />

                {/* Direct Webcam HTML5 Video Element */}
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-contain ${streaming && !annotatedFrame ? 'block' : 'hidden'}`}
                />

                {/* YOLO Bounding Box Overlay Image */}
                {annotatedFrame && streaming && (
                  <img
                    src={annotatedFrame}
                    alt="Live YOLO Detection"
                    className="w-full h-full object-contain"
                  />
                )}

                {/* Placeholder when camera is inactive */}
                {!streaming && (
                  <div className="text-center p-8 space-y-3">
                    <CameraOff className="w-12 h-12 text-slate-600 mx-auto" />
                    <p className="text-xs text-slate-400">Camera stream inactive. Click "Start Live Camera" to begin.</p>
                  </div>
                )}

                {/* HUD Live Badge Overlays */}
                {streaming && (
                  <>
                    <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/80 backdrop-blur-md border border-rose-500/50 text-rose-400 text-xs font-mono font-bold">
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                      REC LIVE STREAM ({fps || 3} FPS)
                    </div>
                    <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/80 backdrop-blur-md border border-amber-500/50 text-amber-400 text-xs font-mono">
                      <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                      YOLO Vision Active
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Live Analytics HUD Panel */}
            <div className="lg:col-span-4 space-y-4">
              <div className="p-6 rounded-2xl bg-[#131C2E] border border-slate-800 space-y-5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Live Hazard Telemetry</h4>

                <div className="p-4 rounded-xl bg-[#0F172A] border border-slate-800 text-center">
                  <span className="text-xs text-slate-400 block font-medium">Real-Time Pothole Count</span>
                  <span className="text-4xl font-black text-amber-400 mt-1 block">{detectionMetrics.count}</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl bg-[#0F172A] border border-slate-800 text-center">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Avg Conf</span>
                    <span className="text-lg font-bold text-cyan-400 mt-0.5 block">{detectionMetrics.conf}%</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#0F172A] border border-slate-800 text-center">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">High Hazard</span>
                    <span className="text-lg font-bold text-rose-400 mt-0.5 block">{detectionMetrics.high}</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#0F172A] border border-slate-800 space-y-2">
                  <span className="text-xs font-bold text-slate-300 block">Severity Status</span>
                  {detectionMetrics.high > 0 ? (
                    <div className="flex items-center gap-2 text-xs text-rose-400 font-bold p-2 rounded bg-rose-500/10 border border-rose-500/20">
                      <AlertTriangle className="w-4 h-4" /> URGENT: High-Severity Pothole in Frame!
                    </div>
                  ) : detectionMetrics.count > 0 ? (
                    <div className="flex items-center gap-2 text-xs text-amber-400 font-bold p-2 rounded bg-amber-500/10 border border-amber-500/20">
                      <AlertTriangle className="w-4 h-4" /> CAUTION: Road Defects Detected
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-xs text-emerald-400 font-bold p-2 rounded bg-emerald-500/10 border border-emerald-500/20">
                      <ShieldCheck className="w-4 h-4" /> CLEAR: Road Surface Normal
                    </div>
                  )}
                </div>

              </div>
            </div>

          </div>

        </main>
      </div>
    </div>
  );
};

export default LiveDetection;
