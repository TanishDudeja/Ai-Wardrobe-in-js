import React from 'react';
import { Link } from 'react-router-dom';
import { Grid, PlusCircle, Settings, X, Sparkles, Shirt, LogIn, LogOut, User, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../auth/context/AuthContext';

const Sidebar = ({ activeTab, setActiveTab, onOpenUpload, isMobile = false, onCloseMobile }) => {
  const { user, signOut } = useAuth();

  const handleNav = (tab) => {
    setActiveTab(tab);
    if (isMobile && onCloseMobile) {
      onCloseMobile();
    }
  };

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to log out?')) {
      await signOut();
      if (isMobile && onCloseMobile) onCloseMobile();
    }
  };

  const displayName = user?.user_metadata?.full_name || (user?.email ? user.email.split('@')[0] : 'Stylist');
  const userInitial = (user?.user_metadata?.full_name?.[0] || user?.email?.[0] || 'U').toUpperCase();

  return (
    <div className={`h-full bg-white flex flex-col ${isMobile ? 'w-72 max-w-[85vw]' : 'w-64 border-r border-gray-200 sticky top-0 h-screen'}`}>
      {/* Brand Header */}
      <div className="p-6 flex items-center justify-between border-b border-gray-100">
        <Link to="/" className="flex items-center gap-2.5 hover:opacity-85 transition-opacity group">
          <div className="w-9 h-9 rounded-xl bg-primary text-white flex items-center justify-center font-black text-lg shadow-sm group-hover:scale-105 transition-transform">
            <Shirt size={20} />
          </div>
          <div>
            <div className="text-xl font-extrabold tracking-tight text-primary leading-none">
              AI Wardrobe
            </div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Digital Stylist
            </span>
          </div>
        </Link>

        {isMobile && (
          <button
            onClick={onCloseMobile}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        <button
          onClick={() => handleNav('closet')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-semibold text-sm transition-all ${
            activeTab === 'closet'
              ? 'bg-primary text-white shadow-md shadow-gray-200'
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
          }`}
        >
          <Grid size={18} />
          <span>My Closet</span>
        </button>

        <button
          onClick={() => handleNav('outfits')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-semibold text-sm transition-all ${
            activeTab === 'outfits'
              ? 'bg-primary text-white shadow-md shadow-gray-200'
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
          }`}
        >
          <Sparkles size={18} />
          <span>AI Outfit & Try-On</span>
        </button>

        <button
          onClick={() => handleNav('settings')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-semibold text-sm transition-all ${
            activeTab === 'settings'
              ? 'bg-primary text-white shadow-md shadow-gray-200'
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
          }`}
        >
          <Settings size={18} />
          <span>System & Settings</span>
        </button>
      </nav>

      {/* User Auth Profile Section */}
      <div className="px-4 py-3.5 border-t border-gray-100 bg-gray-50/70">
        {user ? (
          <div className="flex items-center justify-between gap-2 bg-white p-2.5 rounded-2xl border border-gray-200/80 shadow-xs">
            <button
              onClick={() => handleNav('settings')}
              className="flex items-center gap-2.5 min-w-0 text-left hover:opacity-80 transition-opacity flex-1"
              title="Click to view Settings & Profile"
            >
              <div className="relative">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary to-neutral-700 text-white font-extrabold text-sm flex items-center justify-center flex-shrink-0 shadow-sm">
                  {userInitial}
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1">
                  <p className="text-xs font-bold text-gray-900 truncate">
                    {displayName}
                  </p>
                  <CheckCircle2 size={12} className="text-emerald-500 flex-shrink-0" />
                </div>
                <p className="text-[10px] text-gray-400 truncate max-w-[120px]">{user.email}</p>
              </div>
            </button>
            <button
              onClick={handleLogout}
              title="Sign Out"
              className="p-2 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors flex-shrink-0"
              aria-label="Log Out"
            >
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <Link
            to="/login"
            onClick={() => { if (isMobile && onCloseMobile) onCloseMobile(); }}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl border border-gray-200 bg-white hover:bg-gray-50 text-xs font-bold text-gray-800 transition-all shadow-xs"
          >
            <LogIn size={15} className="text-primary" />
            <span>Sign In / Register</span>
          </Link>
        )}
      </div>

      {/* Add Item Action */}
      <div className="p-4 border-t border-gray-100">
        <button
          onClick={() => {
            if (onOpenUpload) onOpenUpload();
            if (isMobile && onCloseMobile) onCloseMobile();
          }}
          className="w-full flex items-center justify-center gap-2 bg-primary text-white py-3.5 rounded-2xl hover:bg-gray-900 active:scale-[0.98] transition-all font-bold text-sm shadow-md"
        >
          <PlusCircle size={18} />
          <span>+ Add Garment</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
