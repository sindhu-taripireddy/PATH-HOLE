import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Filter, Search, Globe, ArrowRight, RotateCcw } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import SeverityBadge from '../components/SeverityBadge';
import DetectionModal from '../components/DetectionModal';
import { mapAPI, getUploadUrl } from '../services/api';

// Create Leaflet Custom Colored Markers
const createCustomIcon = (severity) => {
  const color = severity === 'High' ? '#EF4444' : severity === 'Medium' ? '#F97316' : '#EAB308';
  const svgHtml = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" width="32" height="32" stroke="#000" stroke-width="1">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
    </svg>
  `;
  return L.divIcon({
    html: svgHtml,
    className: 'custom-map-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

// Component to dynamically animate map center and zoom level
const MapController = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, zoom, { duration: 1.5 });
    }
  }, [center, zoom, map]);
  return null;
};

const WORLD_COUNTRIES = [
  { name: '🌍 Global World View (All Countries)', lat: 20, lng: 0, zoom: 2 },
  { name: '🇮🇳 India', lat: 20.5937, lng: 78.9629, zoom: 5 },
  { name: '🇺🇸 United States', lat: 37.0902, lng: -95.7129, zoom: 4 },
  { name: '🇬🇧 United Kingdom', lat: 55.3781, lng: -3.4360, zoom: 6 },
  { name: '🇩🇪 Germany', lat: 51.1657, lng: 10.4515, zoom: 6 },
  { name: '🇯🇵 Japan', lat: 36.2048, lng: 138.2529, zoom: 5 },
  { name: '🇦🇺 Australia', lat: -25.2744, lng: 133.7751, zoom: 4 },
  { name: '🇧🇷 Brazil', lat: -14.2350, lng: -51.9253, zoom: 4 },
  { name: '🇨🇦 Canada', lat: 56.1304, lng: -106.3468, zoom: 4 },
  { name: '🇫🇷 France', lat: 46.2276, lng: 2.2137, zoom: 6 },
];

const MapPage = () => {
  const [markers, setMarkers] = useState([]);
  const [filteredSeverity, setFilteredSeverity] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDetection, setSelectedDetection] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Default to World Center showing all countries
  const [mapTarget, setMapTarget] = useState({ center: [20, 0], zoom: 2 });

  useEffect(() => {
    fetchMarkers();
  }, [filteredSeverity]);

  const fetchMarkers = async () => {
    try {
      setLoading(true);
      const sevParam = filteredSeverity === 'All' ? null : filteredSeverity;
      const res = await mapAPI.getMarkers(sevParam);
      setMarkers(res.data);
    } catch (err) {
      console.error("Map fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const displayedMarkers = markers.filter((m) => {
    if (!searchQuery) return true;
    return (m.location_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
           (m.title || '').toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleCountrySelect = (e) => {
    const selectedName = e.target.value;
    const country = WORLD_COUNTRIES.find(c => c.name === selectedName);
    if (country) {
      setMapTarget({ center: [country.lat, country.lng], zoom: country.zoom });
    }
  };

  const resetToWorldView = () => {
    setSearchQuery('');
    setFilteredSeverity('All');
    setMapTarget({ center: [20, 0], zoom: 2 });
  };

  return (
    <div className="flex min-h-screen bg-[#0B0F17]">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar pageTitle="Global Pothole Geolocation Map" />

        <main className="flex-1 p-6 flex flex-col space-y-4 overflow-hidden">
          
          {/* Controls Bar */}
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-[#131C2E] border border-slate-800 shrink-0">
            
            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
              
              {/* Search */}
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search country, city, or road..."
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#0F172A] border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Country Jump Selector */}
              <div className="relative w-full sm:w-60">
                <select
                  onChange={handleCountrySelect}
                  className="w-full px-3 py-2 rounded-xl bg-[#0F172A] border border-slate-800 text-xs text-amber-400 font-semibold focus:outline-none focus:border-amber-500"
                >
                  {WORLD_COUNTRIES.map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={resetToWorldView}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold hover:bg-amber-500/20 transition"
              >
                <Globe className="w-4 h-4" />
                Show All Countries
              </button>
            </div>

            {/* Severity Filter Pills */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400 mr-1" />
              {['All', 'High', 'Medium', 'Low'].map((sev) => (
                <button
                  key={sev}
                  onClick={() => setFilteredSeverity(sev)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    filteredSeverity === sev
                      ? 'bg-amber-500 text-black shadow-md'
                      : 'bg-[#0F172A] text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {sev}
                </button>
              ))}
            </div>

            <div className="text-xs text-slate-400 font-mono">
              Global Markers: <span className="text-amber-400 font-bold">{displayedMarkers.length}</span>
            </div>

          </div>

          {/* Leaflet Map Display (World View Default) */}
          <div className="flex-1 rounded-2xl border border-slate-800 overflow-hidden relative shadow-2xl min-h-[500px]">
            <MapContainer
              center={mapTarget.center}
              zoom={mapTarget.zoom}
              minZoom={2}
              maxZoom={19}
              scrollWheelZoom={true}
              className="w-full h-full"
            >
              <MapController center={mapTarget.center} zoom={mapTarget.zoom} />

              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                noWrap={false}
              />

              {displayedMarkers.map((marker) => (
                <Marker
                  key={marker.id}
                  position={[marker.latitude, marker.longitude]}
                  icon={createCustomIcon(marker.highest_severity)}
                >
                  <Popup>
                    <div className="p-1 space-y-2 max-w-xs">
                      <div className="rounded-lg overflow-hidden h-28 bg-black">
                        <img
                          src={getUploadUrl(marker.processed_image_filename)}
                          alt="Pothole Map Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-sm text-slate-100">{marker.title}</h4>
                          <SeverityBadge severity={marker.highest_severity} showIcon={false} />
                        </div>
                        <p className="text-xs text-amber-400 font-bold mt-1 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-amber-400" />
                          {marker.location_name}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Detected: {marker.pothole_count} Potholes ({marker.avg_confidence}% Conf)
                        </p>
                      </div>
                      <button
                        onClick={() => setSelectedDetection(marker)}
                        className="w-full mt-2 py-1.5 rounded-lg bg-amber-500 text-black text-xs font-bold hover:bg-amber-400 transition flex items-center justify-center gap-1"
                      >
                        View Inspection Details <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>

        </main>
      </div>

      {selectedDetection && (
        <DetectionModal
          detection={selectedDetection}
          onClose={() => setSelectedDetection(null)}
          onDeleteSuccess={() => fetchMarkers()}
        />
      )}
    </div>
  );
};

export default MapPage;
