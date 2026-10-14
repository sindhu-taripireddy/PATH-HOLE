import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Scan, 
  Camera, 
  AlertTriangle, 
  CheckCircle, 
  Percent, 
  Layers, 
  MapPin, 
  ArrowUpRight,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import StatCard from '../components/StatCard';
import SeverityBadge from '../components/SeverityBadge';
import DetectionModal from '../components/DetectionModal';
import { detectionAPI, mapAPI, getUploadUrl } from '../services/api';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title
);

const Dashboard = () => {
  const [history, setHistory] = useState([]);
  const [locationStats, setLocationStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDetection, setSelectedDetection] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [histRes, locRes] = await Promise.all([
        detectionAPI.getHistory({ sort_by: 'newest' }),
        mapAPI.getLocationStats()
      ]);
      setHistory(histRes.data);
      setLocationStats(locRes.data);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Compute Aggregates
  const totalProcessed = history.length;
  const totalPotholes = history.reduce((acc, curr) => acc + curr.pothole_count, 0);
  const highSevCount = history.reduce((acc, curr) => acc + curr.high_severity_count, 0);
  const medSevCount = history.reduce((acc, curr) => acc + curr.medium_severity_count, 0);
  const lowSevCount = history.reduce((acc, curr) => acc + curr.low_severity_count, 0);
  const avgConfidence = totalProcessed > 0
    ? (history.reduce((acc, curr) => acc + curr.avg_confidence, 0) / totalProcessed).toFixed(1)
    : 0;

  // Chart 1: Severity Doughnut
  const severityChartData = {
    labels: ['High Severity', 'Medium Severity', 'Low Severity'],
    datasets: [
      {
        data: [highSevCount || 1, medSevCount || 1, lowSevCount || 1],
        backgroundColor: ['#EF4444', '#F97316', '#EAB308'],
        borderColor: '#0F172A',
        borderWidth: 3,
        hoverOffset: 6,
      },
    ],
  };

  // Chart 2: Location Statistics Bar
  const topLocations = locationStats.slice(0, 6);
  const locationChartData = {
    labels: topLocations.map(l => l.location_name),
    datasets: [
      {
        label: 'Potholes Found',
        data: topLocations.map(l => l.pothole_count),
        backgroundColor: '#F59E0B',
        borderRadius: 6,
      },
    ],
  };

  return (
    <div className="flex min-h-screen bg-[#0B0F17]">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar pageTitle="Infrastructure Dashboard" />

        <main className="flex-1 p-6 overflow-y-auto space-y-6">
          
          {/* Top Banner Quick Start */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-500/10 via-[#131C2E] to-[#131C2E] border border-amber-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                <Sparkles className="w-4 h-4" /> AI Computer Vision Ready
              </div>
              <h2 className="text-xl font-black text-white">Real-Time Road Safety & Pothole Analytics</h2>
              <p className="text-xs text-slate-400">Detect potholes from uploaded road images, videos, and live webcam feeds.</p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                to="/detect"
                className="px-4 py-2.5 rounded-xl bg-amber-500 text-black font-extrabold text-xs hover:bg-amber-400 shadow-lg shadow-amber-500/20 transition flex items-center gap-2"
              >
                <Scan className="w-4 h-4" />
                Upload Image/Video
              </Link>
              <Link
                to="/live"
                className="px-4 py-2.5 rounded-xl bg-[#0F172A] border border-cyan-500/40 text-cyan-400 font-extrabold text-xs hover:bg-cyan-500/10 transition flex items-center gap-2"
              >
                <Camera className="w-4 h-4" />
                Live Camera Detection
              </Link>
            </div>
          </div>

          {/* KPI Stat Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <StatCard
              title="Total Potholes"
              value={totalPotholes}
              icon={AlertTriangle}
              color="amber"
              description="Detected across scans"
            />
            <StatCard
              title="Files Processed"
              value={totalProcessed}
              icon={Layers}
              color="cyan"
              description="Images & Videos"
            />
            <StatCard
              title="High Severity"
              value={highSevCount}
              icon={AlertTriangle}
              color="rose"
              description="Requires Urgent Repair"
            />
            <StatCard
              title="Medium Severity"
              value={medSevCount}
              icon={AlertTriangle}
              color="amber"
              description="Moderate Depression"
            />
            <StatCard
              title="Low Severity"
              value={lowSevCount}
              icon={CheckCircle}
              color="emerald"
              description="Minor Surface Damage"
            />
            <StatCard
              title="Avg Confidence"
              value={`${avgConfidence}%`}
              icon={Percent}
              color="indigo"
              description="YOLO Model Accuracy"
            />
          </div>

          {/* Analytics Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Doughnut Chart */}
            <div className="p-6 rounded-2xl bg-[#131C2E] border border-slate-800 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-white mb-1">Severity Distribution</h3>
                <p className="text-xs text-slate-400 mb-4">Breakdown of detected pothole hazard levels</p>
              </div>
              <div className="w-48 h-48 mx-auto relative flex items-center justify-center my-2">
                <Doughnut
                  data={severityChartData}
                  options={{
                    plugins: { legend: { display: false } },
                    cutout: '72%',
                    responsive: true,
                    maintainAspectRatio: false,
                  }}
                />
                <div className="absolute text-center">
                  <span className="text-2xl font-black text-white">{totalPotholes}</span>
                  <span className="block text-[10px] text-slate-400 uppercase font-semibold">Potholes</span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-xs pt-4 border-t border-slate-800">
                <div>
                  <span className="block w-2.5 h-2.5 rounded-full bg-rose-500 mx-auto mb-1"></span>
                  <span className="text-slate-400 block text-[10px]">High</span>
                  <span className="font-bold text-white">{highSevCount}</span>
                </div>
                <div>
                  <span className="block w-2.5 h-2.5 rounded-full bg-amber-500 mx-auto mb-1"></span>
                  <span className="text-slate-400 block text-[10px]">Medium</span>
                  <span className="font-bold text-white">{medSevCount}</span>
                </div>
                <div>
                  <span className="block w-2.5 h-2.5 rounded-full bg-yellow-400 mx-auto mb-1"></span>
                  <span className="text-slate-400 block text-[10px]">Low</span>
                  <span className="font-bold text-white">{lowSevCount}</span>
                </div>
              </div>
            </div>

            {/* Location Bar Chart */}
            <div className="lg:col-span-2 p-6 rounded-2xl bg-[#131C2E] border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-sm font-bold text-white">Location-Wise Pothole Density</h3>
                  <Link to="/map" className="text-xs text-amber-400 hover:underline flex items-center gap-1">
                    Interactive Map <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
                <p className="text-xs text-slate-400 mb-4">Top road sectors with highest pothole counts</p>
              </div>
              <div className="h-56 w-full">
                <Bar
                  data={locationChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                      x: { grid: { display: false }, ticks: { color: '#94A3B8', font: { size: 10 } } },
                      y: { grid: { color: '#1E293B' }, ticks: { color: '#94A3B8', font: { size: 10 } } },
                    },
                  }}
                />
              </div>
            </div>

          </div>

          {/* Recent Detections Section */}
          <div className="p-6 rounded-2xl bg-[#131C2E] border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Recent Inspection Records</h3>
                <p className="text-xs text-slate-400">Latest AI computer vision scans</p>
              </div>
              <Link
                to="/history"
                className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1"
              >
                View Full History <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {loading ? (
              <div className="py-8 text-center text-slate-500 text-xs">Loading recent detections...</div>
            ) : history.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-sm">
                No pothole detections recorded yet. Start by uploading an image or launching the live camera.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {history.slice(0, 6).map((det) => (
                  <div
                    key={det.id}
                    onClick={() => setSelectedDetection(det)}
                    className="p-4 rounded-xl bg-[#0F172A] border border-slate-800/80 hover:border-amber-500/40 transition cursor-pointer group flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="relative rounded-lg overflow-hidden h-36 bg-black">
                        <img
                          src={getUploadUrl(det.processed_filepath)}
                          alt={det.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        />
                        <div className="absolute top-2 left-2">
                          <SeverityBadge 
                            severity={det.high_severity_count > 0 ? 'High' : det.medium_severity_count > 0 ? 'Medium' : 'Low'} 
                          />
                        </div>
                        <div className="absolute bottom-2 right-2 px-2 py-1 rounded bg-black/80 text-[10px] font-mono text-cyan-400 border border-slate-700">
                          {det.avg_confidence}% Conf
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-bold text-white group-hover:text-amber-400 transition truncate">{det.title}</h4>
                        <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
                          <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span className="truncate">{det.location_name || 'GPS Captured'}</span>
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                      <span>{new Date(det.created_at).toLocaleDateString()}</span>
                      <span className="font-bold text-white">{det.pothole_count} Potholes</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </main>
      </div>

      {/* Detection Detail Modal */}
      {selectedDetection && (
        <DetectionModal
          detection={selectedDetection}
          onClose={() => setSelectedDetection(null)}
          onDeleteSuccess={() => fetchDashboardData()}
        />
      )}
    </div>
  );
};

export default Dashboard;
