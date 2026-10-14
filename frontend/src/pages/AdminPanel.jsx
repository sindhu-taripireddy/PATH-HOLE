import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Users, 
  Trash2, 
  Cpu, 
  HardDrive, 
  RefreshCw, 
  UserCheck, 
  Sparkles,
  CheckCircle2,
  Database
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import StatCard from '../components/StatCard';
import { adminAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [systemStats, setSystemStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [retrainDataset, setRetrainDataset] = useState('Pothole-v2-RoadSurface');
  const [retrainEpochs, setRetrainEpochs] = useState(15);
  const [retraining, setRetraining] = useState(false);
  const { showToast, user: currentUser } = useAuth();

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [uRes, sRes] = await Promise.all([
        adminAPI.getUsers(),
        adminAPI.getSystemStats()
      ]);
      setUsers(uRes.data);
      setSystemStats(sRes.data);
    } catch (err) {
      console.error("Admin data fetch error:", err);
      showToast("Failed to fetch admin statistics.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleToggle = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    try {
      await adminAPI.updateUserRole(userId, newRole);
      showToast(`User role updated to ${newRole}`, 'success');
      fetchAdminData();
    } catch (err) {
      showToast('Failed to update user role.', 'error');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (userId === currentUser?.id) {
      showToast('Cannot delete your own admin account.', 'warning');
      return;
    }
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await adminAPI.deleteUser(userId);
        showToast('User deleted successfully.', 'success');
        fetchAdminData();
      } catch (err) {
        showToast('Failed to delete user.', 'error');
      }
    }
  };

  const handleRetrainModel = async (e) => {
    e.preventDefault();
    setRetraining(true);
    try {
      const res = await adminAPI.retrainModel({
        dataset_name: retrainDataset,
        epochs: Number(retrainEpochs)
      });
      showToast(res.data.message, 'success');
    } catch (err) {
      showToast('Model retraining trigger failed.', 'error');
    } finally {
      setRetraining(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0B0F17]">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar pageTitle="System Administration Panel" />

        <main className="flex-1 p-6 overflow-y-auto space-y-6">
          
          {/* Top Admin Telemetry Banner */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-rose-500/10 via-[#131C2E] to-[#131C2E] border border-rose-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase tracking-wider">
                <ShieldAlert className="w-4 h-4" /> Root Administrator Access
              </div>
              <h2 className="text-xl font-black text-white">System Performance & User Management</h2>
              <p className="text-xs text-slate-400">Monitor system load, manage users, and trigger YOLO model retrain updates.</p>
            </div>
            <button
              onClick={fetchAdminData}
              className="px-4 py-2.5 rounded-xl bg-[#0F172A] border border-slate-800 text-slate-300 font-semibold text-xs hover:text-white transition flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh Metrics
            </button>
          </div>

          {/* System Performance Cards */}
          {systemStats && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Registered Users"
                value={systemStats.total_users}
                icon={Users}
                color="cyan"
                description="Active platform accounts"
              />
              <StatCard
                title="System CPU Load"
                value={`${systemStats.system_cpu_percent}%`}
                icon={Cpu}
                color="amber"
                description="Processor Utilization"
              />
              <StatCard
                title="System RAM Usage"
                value={`${systemStats.system_ram_percent}%`}
                icon={HardDrive}
                color="indigo"
                description="Memory Utilization"
              />
              <StatCard
                title="Total Potholes Found"
                value={systemStats.total_potholes_found}
                icon={ShieldAlert}
                color="rose"
                description="Across all user scans"
              />
            </div>
          )}

          {/* User Management Section & Model Retrain Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Registered Users Table */}
            <div className="lg:col-span-8 p-6 rounded-2xl bg-[#131C2E] border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-cyan-400" />
                Registered System Users
              </h3>

              <div className="border border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-[#0F172A] text-slate-400 uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="px-4 py-3">Full Name</th>
                      <th className="px-4 py-3">Email Address</th>
                      <th className="px-4 py-3">Role</th>
                      <th className="px-4 py-3">Joined Date</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 bg-[#131C2E]">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-800/40">
                        <td className="px-4 py-3 font-bold text-white">{u.full_name}</td>
                        <td className="px-4 py-3 font-mono text-slate-400">{u.email}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            u.role === 'admin'
                              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                              : 'bg-slate-800 text-slate-400'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-400">{new Date(u.created_at).toLocaleDateString()}</td>
                        <td className="px-4 py-3 text-right space-x-2">
                          <button
                            onClick={() => handleRoleToggle(u.id, u.role)}
                            className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 hover:text-white transition"
                          >
                            Toggle Role
                          </button>
                          <button
                            onClick={() => handleDeleteUser(u.id)}
                            className="p-1 text-slate-400 hover:text-rose-400 transition"
                          >
                            <Trash2 className="w-4 h-4 inline" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Retrain Model Pipeline Box */}
            <div className="lg:col-span-4 p-6 rounded-2xl bg-[#131C2E] border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Database className="w-4 h-4 text-amber-400" />
                Model Update & Dataset Retraining
              </h3>
              <p className="text-xs text-slate-400">
                Trigger fine-tuning of the YOLO object detection weights with additional pothole datasets.
              </p>

              <form onSubmit={handleRetrainModel} className="space-y-4 pt-2">
                <div>
                  <label className="block text-[11px] font-semibold uppercase text-slate-400 tracking-wider mb-1">Dataset Name</label>
                  <input
                    type="text"
                    required
                    value={retrainDataset}
                    onChange={(e) => setRetrainDataset(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#0F172A] border border-slate-800 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase text-slate-400 tracking-wider mb-1">Epochs</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    required
                    value={retrainEpochs}
                    onChange={(e) => setRetrainEpochs(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#0F172A] border border-slate-800 text-xs text-white"
                  />
                </div>

                <button
                  type="submit"
                  disabled={retraining}
                  className="w-full py-3 px-4 rounded-xl bg-amber-500 text-black font-extrabold text-xs hover:bg-amber-400 shadow-lg shadow-amber-500/20 transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {retraining ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                      Retraining Model...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Trigger Retraining Pipeline
                    </>
                  )}
                </button>
              </form>

              <div className="p-3 rounded-xl bg-[#0F172A] border border-slate-800 text-[11px] text-slate-400 space-y-1">
                <p className="font-bold text-emerald-400">Current Model Performance:</p>
                <p>• mAP50 Score: <span className="text-white font-mono">95.6%</span></p>
                <p>• Precision: <span className="text-white font-mono">94.2%</span></p>
                <p>• Recall: <span className="text-white font-mono">91.8%</span></p>
              </div>

            </div>

          </div>

        </main>
      </div>
    </div>
  );
};

export default AdminPanel;
