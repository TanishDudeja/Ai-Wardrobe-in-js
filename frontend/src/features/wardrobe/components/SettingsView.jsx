import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Cpu, Database, Cloud, Sparkles, CheckCircle2, Key, Info, RefreshCw, User, LogOut, LogIn, ExternalLink } from 'lucide-react';
import { useAuth } from '../../auth/context/AuthContext';

const SettingsView = () => {
  const { user, signOut } = useAuth();

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to log out?')) {
      await signOut();
    }
  };

  const displayName = user?.user_metadata?.full_name || (user?.email ? user.email.split('@')[0] : 'Stylist');
  const userInitial = (user?.user_metadata?.full_name?.[0] || user?.email?.[0] || 'U').toUpperCase();

  return (
    <div className="flex-1 bg-background overflow-y-auto min-h-screen p-6 lg:p-10 pb-28 md:pb-10">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h2 className="text-3xl font-extrabold text-primary mb-1">System & Settings</h2>
          <p className="text-gray-500 text-sm">Monitor your connected user account, AI engines, storage clusters, and configuration.</p>
        </div>

        {/* ── USER PROFILE & ACCOUNT CARD ── */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-wider">
              <User size={18} className="text-accent" />
              <span>User Profile & Authentication</span>
            </div>
            {user ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">
                <CheckCircle2 size={13} className="text-emerald-500" /> Logged In
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-600 border border-amber-100">
                Guest Mode
              </span>
            )}
          </div>

          {user ? (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 bg-gray-50/70 p-5 rounded-2xl border border-gray-100">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary to-neutral-700 text-white font-black text-xl flex items-center justify-center shadow-md">
                    {userInitial}
                  </div>
                  <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black text-gray-900 leading-tight">
                      {displayName}
                    </h3>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded-full">
                      <ShieldCheck size={11} /> Verified
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 font-medium mt-0.5">{user.email}</p>
                  <p className="text-[10px] text-gray-400 font-mono mt-1">
                    UID: {user.id?.slice(0, 18)}... · Provider: Supabase
                  </p>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold transition-colors self-stretch sm:self-auto justify-center"
              >
                <LogOut size={15} />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gray-50/70 p-5 rounded-2xl border border-gray-100">
              <div>
                <h4 className="font-extrabold text-sm text-gray-900">You are browsing as a Guest</h4>
                <p className="text-xs text-gray-500 mt-0.5">
                  Sign in or create an account to save your closet items and try-on history across devices.
                </p>
              </div>
              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <Link
                  to="/login"
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-5 py-2.5 bg-primary text-white text-xs font-bold rounded-xl hover:bg-gray-800 transition-colors shadow-sm"
                >
                  <LogIn size={14} /> Sign In
                </Link>
                <Link
                  to="/signup"
                  className="flex-1 sm:flex-none inline-flex items-center justify-center px-4 py-2.5 bg-white border border-gray-200 text-gray-800 text-xs font-bold rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Register
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* AI & Infrastructure Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Card 1: VTON Engine */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center font-bold">
                  <Cpu size={22} />
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Operational
                </span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Kwai-Kolors Virtual Try-On</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Dedicated high-performance enterprise diffusion pipeline for photorealistic cloth-warping and pose alignment.
              </p>
            </div>
            <div className="mt-5 pt-4 border-t border-gray-50 flex justify-between items-center text-xs text-gray-400">
              <span>Resolution: 1024×768</span>
              <span>Speed: ~5s/inference</span>
            </div>
          </div>

          {/* Card 2: Fashion LLM */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                  <Sparkles size={22} />
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Operational
                </span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Groq LPUs (Qwen 3.8 / LLaMA)</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Rule-based heuristic scoring engine backed by Groq LPUs for stylistic reasoning and outfit descriptions at 800 tokens/sec.
              </p>
            </div>
            <div className="mt-5 pt-4 border-t border-gray-50 flex justify-between items-center text-xs text-gray-400">
              <span>Provider: Groq Cloud</span>
              <span>Latency: &lt; 300ms</span>
            </div>
          </div>

          {/* Card 3: Cloud Storage */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <Cloud size={22} />
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Connected
                </span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Cloudinary CDN Storage</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Secure cloud asset delivery for clothing items and user photos with automatic format optimization and compression.
              </p>
            </div>
            <div className="mt-5 pt-4 border-t border-gray-50 flex justify-between items-center text-xs text-gray-400">
              <span>Cloud Name: dxqppwppo</span>
              <span>HTTPS Delivery: Active</span>
            </div>
          </div>

          {/* Card 4: Database */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <Database size={22} />
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Connected
                </span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Supabase PostgreSQL & MongoDB</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Dual cloud databases managing wardrobe items, relational tables, authenticated sessions, and timestamps.
              </p>
            </div>
            <div className="mt-5 pt-4 border-t border-gray-50 flex justify-between items-center text-xs text-gray-400">
              <span>Cluster: Supabase & Atlas</span>
              <span>Status: Live Pool</span>
            </div>
          </div>
        </div>

        {/* Configuration Guide */}
        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center text-gray-700">
              <Key size={18} />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Hugging Face Token Configuration</h3>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">
            By default, the application runs on public inference servers. To unlock dedicated personal GPU quota on Hugging Face:
          </p>
          <ol className="list-decimal pl-5 text-xs text-gray-500 space-y-2">
            <li>Create a free account at <a href="https://huggingface.co/settings/tokens" target="_blank" rel="noreferrer" className="text-primary font-bold underline">huggingface.co/settings/tokens</a></li>
            <li>Click <strong>Create New Token</strong> with type <strong>Read</strong></li>
            <li>Add <code className="bg-gray-100 px-2 py-0.5 rounded text-gray-800">HF_TOKEN=hf_your_token_here</code> in your <code className="bg-gray-100 px-2 py-0.5 rounded text-gray-800">backend/.env</code> file</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
