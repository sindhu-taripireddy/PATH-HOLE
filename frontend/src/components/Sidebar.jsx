import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Scan, 
  Camera, 
  MapPin, 
  History, 
  FileText, 
  ShieldAlert, 
  User, 
  Settings, 
  LogOut,
  Crosshair
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { user, logout } = useAuth();

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Detect Pothole', path: '/detect', icon: Scan },
    { label: 'Live Detection', path: '/live', icon: Camera },
    { label: 'Pothole Map', path: '/map', icon: MapPin },
    { label: 'Detection History', path: '/history', icon: History },
    { label: 'Reports', path: '/reports', icon: FileText },
  ];

  if (user?.role === 'admin') {
    navItems.push({ label: 'Admin Panel', path: '/admin', icon: ShieldAlert });
  }

  const userItems = [
    { label: 'Profile', path: '/profile', icon: User },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-[#0F172A] border-r border-slate-800 flex flex-col h-screen sticky top-0 shrink-0">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-800/80 flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 text-black shadow-lg shadow-amber-500/20">
          <Crosshair className="w-6 h-6 stroke-[2.5]" />
        </div>
        <div>
          <h1 className="font-black text-lg text-white tracking-wider">POTHOLE<span className="text-amber-400">GUARD</span></h1>
          <p className="text-[10px] text-amber-500/90 font-mono tracking-tighter uppercase">AI Road Vision v1.0</p>
        </div>
      </div>

      {/* Main Nav Navigation */}
      <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        <p className="px-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Main System</p>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30 shadow-inner'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}

        <p className="px-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider mt-6 mb-2">Account</p>
        {userItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>

      {/* User Footer Profile & Logout */}
      <div className="p-4 border-t border-slate-800/80 bg-[#0B0F17]/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center font-bold text-black text-sm shrink-0">
              {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="truncate">
              <p className="text-xs font-bold text-slate-200 truncate">{user?.full_name || 'Inspector'}</p>
              <p className="text-[10px] text-slate-400 capitalize truncate">{user?.role || 'User'} Access</p>
            </div>
          </div>
          <button
            onClick={logout}
            title="Logout"
            className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
