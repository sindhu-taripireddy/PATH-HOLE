import React, { useState } from 'react';
import { Settings as SettingsIcon, Sliders, Cpu, Save, Shield } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

const Settings = () => {
  const [confidenceThreshold, setConfidenceThreshold] = useState(35);
  const [autoSaveGps, setAutoSaveGps] = useState(true);
  const [modelType, setModelType] = useState('YOLOv8n (Fast Real-Time)');
  const { showToast } = useAuth();

  const handleSave = (e) => {
    e.preventDefault();
    showToast('Detection preferences saved successfully!', 'success');
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
