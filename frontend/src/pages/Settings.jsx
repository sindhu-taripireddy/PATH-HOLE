import { Settings as SettingsIcon, Sliders, Cpu, Save, Shield, Globe, CheckCircle2, AlertCircle } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { getBackendBase } from '../services/api';
import axios from 'axios';

const Settings = () => {
  const [confidenceThreshold, setConfidenceThreshold] = useState(35);
  const [autoSaveGps, setAutoSaveGps] = useState(true);
  const [modelType, setModelType] = useState('YOLOv8n (Fast Real-Time)');
  const [apiUrl, setApiUrl] = useState(getBackendBase());
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [testingConnection, setTestingConnection] = useState(false);
  const { showToast } = useAuth();

  const handleTestConnection = async () => {
    setTestingConnection(true);
    setConnectionStatus(null);
    try {
      const cleanUrl = apiUrl.replace(/\/+$/, '');
      const res = await axios.get(`${cleanUrl}/api/health`, { timeout: 5000 });
      if (res.status === 200) {
        setConnectionStatus({ success: true, message: 'Backend connected successfully!' });
        showToast('Backend connection verified!', 'success');
      } else {
        setConnectionStatus({ success: false, message: `Unexpected status: ${res.status}` });
      }
    } catch (err) {
      setConnectionStatus({
        success: false,
        message: err.message === 'Network Error' ? 'Cannot reach server. Ensure backend is running and CORS is allowed.' : err.message
      });
      showToast('Could not connect to backend server', 'error');
    } finally {
      setTestingConnection(false);
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (apiUrl.trim()) {
      localStorage.setItem('potholeguard_api_url', apiUrl.trim().replace(/\/+$/, ''));
    } else {
      localStorage.removeItem('potholeguard_api_url');
    }
    showToast('Detection and API preferences saved successfully!', 'success');
  };

  return (
    <div className="flex min-h-screen bg-[#0B0F17]">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar pageTitle="System Settings" />

        <main className="flex-1 p-6 overflow-y-auto space-y-6 max-w-4xl">
          
          <form onSubmit={handleSave} className="p-8 rounded-2xl bg-[#131C2E] border border-slate-800 space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400">
                <SettingsIcon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Computer Vision & AI Settings</h3>
                <p className="text-xs text-slate-400">Configure YOLO object detection thresholds and telemetry options</p>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 tracking-wider mb-2">
                  Minimum Confidence Threshold ({confidenceThreshold}%)
                </label>
                <input
                  type="range"
                  min="10"
                  max="90"
                  value={confidenceThreshold}
                  onChange={(e) => setConfidenceThreshold(e.target.value)}
                  className="w-full accent-amber-500 cursor-pointer"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Filters out low-confidence detection proposals below this percentage.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 tracking-wider mb-2">
                  Preferred Vision Engine
                </label>
                <select
                  value={modelType}
                  onChange={(e) => setModelType(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-[#0F172A] border border-slate-800 text-sm text-white"
                >
                  <option value="YOLOv8n (Fast Real-Time)">YOLOv8 Nano (Fastest - Ideal for Live Camera)</option>
                  <option value="YOLOv8s (Balanced)">YOLOv8 Small (High Precision)</option>
                  <option value="YOLOv8m (High Accuracy)">YOLOv8 Medium (Maximum Detail)</option>
                </select>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-[#0F172A] border border-slate-800">
                <div>
                  <h4 className="text-xs font-bold text-white">Auto-Capture Device GPS Location</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Automatically attach browser latitude/longitude coordinates to every scan</p>
                </div>
                <input
                  type="checkbox"
                  checked={autoSaveGps}
                  onChange={(e) => setAutoSaveGps(e.target.checked)}
                  className="w-5 h-5 accent-amber-500 cursor-pointer"
                />
              </div>

              {/* Backend API Server Endpoint (Useful for GitHub Pages / Cloud Deployment) */}
              <div className="p-4 rounded-xl bg-[#0F172A] border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-amber-400" />
                    <h4 className="text-xs font-bold text-white">Backend API Server Endpoint</h4>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                    Cloud / Local
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Target FastAPI backend URL (e.g., hosted on Render, Railway, or local machine <code className="text-amber-400">http://127.0.0.1:8000</code>).
                </p>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={apiUrl}
                    onChange={(e) => setApiUrl(e.target.value)}
                    placeholder="http://127.0.0.1:8000"
                    className="flex-1 px-4 py-2.5 rounded-xl bg-[#131C2E] border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleTestConnection}
                    disabled={testingConnection}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white border border-slate-700 transition disabled:opacity-50"
                  >
                    {testingConnection ? 'Testing...' : 'Test Connection'}
                  </button>
                </div>

                {connectionStatus && (
                  <div className={`flex items-center gap-2 p-2.5 rounded-lg text-xs ${
                    connectionStatus.success ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                  }`}>
                    {connectionStatus.success ? (
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 shrink-0" />
                    )}
                    <span>{connectionStatus.message}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-end">
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 text-black font-extrabold text-xs hover:bg-amber-400 shadow-lg shadow-amber-500/20 transition"
              >
                <Save className="w-4 h-4" />
                Save Preferences
              </button>
            </div>

          </form>

        </main>
      </div>
    </div>
  );
};

export default Settings;
