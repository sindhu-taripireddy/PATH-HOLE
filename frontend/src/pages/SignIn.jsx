import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Crosshair, Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, showToast } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      // error handled in AuthContext
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F17] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background ambient glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md bg-[#131C2E] border border-slate-800 rounded-3xl p-8 shadow-2xl relative z-10">
        
        {/* Logo Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="p-3.5 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 text-black shadow-xl shadow-amber-500/20 mb-4">
            <Crosshair className="w-8 h-8 stroke-[2.5]" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-wider">POTHOLE<span className="text-amber-400">GUARD</span></h1>
          <p className="text-xs text-slate-400 mt-1">AI Road Safety & Geolocation Monitoring System</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-400 tracking-wider mb-2">Email Address</label>
            <div className="relative">
              <Mail className="w-5 h-5 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="inspector@potholeguard.ai"
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-[#0F172A] border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold uppercase text-slate-400 tracking-wider">Password</label>
              <button
                type="button"
                onClick={() => showToast('Enter your registered email to reset password.', 'info')}
                className="text-xs text-amber-400 hover:underline"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <Lock className="w-5 h-5 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-[#0F172A] border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-xl bg-amber-500 text-black font-extrabold text-sm hover:bg-amber-400 focus:outline-none shadow-lg shadow-amber-500/20 transition flex items-center justify-center gap-2 mt-6 disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                Sign In to Dashboard
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Credentials */}
        <div className="mt-6 p-4 rounded-xl bg-[#0F172A] border border-slate-800/80 text-xs text-slate-400 space-y-1">
          <div className="flex items-center gap-1.5 text-amber-400 font-bold mb-1">
            <ShieldCheck className="w-4 h-4" /> Demo Quick Logins:
          </div>
          <p><span className="text-slate-300 font-mono">Admin:</span> admin@potholeguard.ai / admin123</p>
          <p><span className="text-slate-300 font-mono">Inspector:</span> user@potholeguard.ai / user123</p>
        </div>

        {/* Footer link */}
        <p className="text-center text-xs text-slate-400 mt-6">
          Don't have an account?{' '}
          <Link to="/signup" className="text-amber-400 font-semibold hover:underline">
            Sign Up here
          </Link>
        </p>

      </div>
    </div>
  );
};

export default SignIn;
