import React from 'react';
import { User, Mail, Shield, Calendar, Award } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user } = useAuth();

  return (
    <div className="flex min-h-screen bg-[#0B0F17]">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar pageTitle="Inspector Profile" />

        <main className="flex-1 p-6 overflow-y-auto space-y-6 max-w-4xl">
          
          <div className="p-8 rounded-2xl bg-[#131C2E] border border-slate-800 space-y-6">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-3xl font-black text-black shadow-xl shadow-amber-500/20">
                {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{user?.full_name}</h2>
                <p className="text-xs text-slate-400 mt-1 capitalize">{user?.role} Account Privilege</p>
                <span className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  Certified Pothole Inspector
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-slate-800">
              <div className="p-4 rounded-xl bg-[#0F172A] border border-slate-800 space-y-1">
                <span className="text-xs text-slate-400 font-semibold uppercase flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-cyan-400" /> Email Address
                </span>
                <p className="text-sm font-bold text-white">{user?.email}</p>
              </div>

              <div className="p-4 rounded-xl bg-[#0F172A] border border-slate-800 space-y-1">
                <span className="text-xs text-slate-400 font-semibold uppercase flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-amber-400" /> Access Role
                </span>
                <p className="text-sm font-bold text-white capitalize">{user?.role}</p>
              </div>

              <div className="p-4 rounded-xl bg-[#0F172A] border border-slate-800 space-y-1">
                <span className="text-xs text-slate-400 font-semibold uppercase flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-emerald-400" /> Account Registered
                </span>
                <p className="text-sm font-bold text-white">
                  {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Active Member'}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#0F172A] border border-slate-800 space-y-1">
                <span className="text-xs text-slate-400 font-semibold uppercase flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-rose-400" /> AI System Access
                </span>
                <p className="text-sm font-bold text-emerald-400">YOLOv8 Vision Enabled</p>
              </div>
            </div>

          </div>

        </main>
      </div>
    </div>
  );
};

export default Profile;
