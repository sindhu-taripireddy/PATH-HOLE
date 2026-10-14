import React, { useState, useEffect } from 'react';
import { Bell, Navigation, Cpu, Search, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = ({ pageTitle = 'Dashboard' }) => {
  const { user } = useAuth();
  const [gpsCoords, setGpsCoords] = useState(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setGpsCoords({ lat: pos.coords.latitude.toFixed(4), lng: pos.coords.longitude.toFixed(4) }),
        (err) => console.log('GPS Permission notice:', err.message)
      );
    }
  }, []);

  return (
    <header className="h-16 bg-[#0F172A]/80 backdrop-blur-md border-b border-slate-800 px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-bold text-white tracking-wide">{pageTitle}</h2>
        
        {/* Model Status Pill */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
          <Cpu className="w-3.5 h-3.5 animate-pulse" />
          <span>YOLOv8 Vision Active</span>
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-4">
        {/* GPS location pill */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#131C2E] border border-slate-800 text-xs text-slate-300">
          <Navigation className="w-3.5 h-3.5 text-amber-400" />
          {gpsCoords ? (
            <span>GPS: {gpsCoords.lat}, {gpsCoords.lng}</span>
          ) : (
            <span className="text-slate-400">GPS Geo-Location Ready</span>
          )}
        </div>

        {/* Notifications Icon */}
        <button className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl transition relative">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-400"></span>
        </button>

        {/* User Pill */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#131C2E] border border-slate-800">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-semibold text-slate-200">{user?.full_name || 'Inspector'}</span>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
