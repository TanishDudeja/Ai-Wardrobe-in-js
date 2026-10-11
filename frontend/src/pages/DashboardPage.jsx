import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Shirt, Sparkles, Grid, Settings as SettingsIcon, User, LogOut, ChevronDown, CheckCircle2, ShieldCheck, PlusCircle } from 'lucide-react';
import { useAuth } from '../features/auth/context/AuthContext';
import Sidebar from '../features/wardrobe/components/Sidebar';
import WardrobeGrid from '../features/wardrobe/components/WardrobeGrid';
import ItemDetails from '../features/wardrobe/components/ItemDetails';
import OutfitGenerator from '../features/generator/components/OutfitGenerator';
import SettingsView from '../features/wardrobe/components/SettingsView';

const DashboardPage = () => {
  const { user, signOut } = useAuth();
  const [selectedItem, setSelectedItem] = useState(null);
  const [activeTab, setActiveTab] = useState('closet'); // 'closet' | 'outfits' | 'settings'
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const profileDropdownRef = useRef(null);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle deletion of an item
  const handleDeleteItem = async (id) => {
    try {
      const url = user?.id
        ? `http://localhost:5000/api/wardrobe/${id}?userId=${encodeURIComponent(user.id)}`
        : `http://localhost:5000/api/wardrobe/${id}`;
      await fetch(url, { method: 'DELETE' });
      setSelectedItem(null);
      window.dispatchEvent(new Event('wardrobe_updated'));
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to sign out?')) {
      setShowProfileDropdown(false);
      await signOut();
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab !== 'closet') {
      setSelectedItem(null);
    }
  };

  const displayName = user?.user_metadata?.full_name || (user?.email ? user.email.split('@')[0] : 'Stylist');
  const userInitial = (user?.user_metadata?.full_name?.[0] || user?.email?.[0] || 'U').toUpperCase();

  const tabLabels = {
    closet: { title: 'My Digital Closet', icon: Grid, subtitle: 'Organize & browse clothing items' },
    outfits: { title: 'AI Outfit & Try-On Studio', icon: Sparkles, subtitle: 'Virtual try-on & smart outfit curation' },
    settings: { title: 'System & Account Settings', icon: SettingsIcon, subtitle: 'Connected models, auth & cluster status' },
  };

  const CurrentIcon = tabLabels[activeTab]?.icon || Grid;

  return (
    <div className="flex h-screen overflow-hidden bg-background text-primary">
      {/* ── 1. DESKTOP SIDEBAR (Visible on md+) ── */}
      <div className="hidden md:flex flex-shrink-0">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={handleTabChange}
          onOpenUpload={() => {
            handleTabChange('closet');
            window.dispatchEvent(new CustomEvent('open_upload_modal'));
          }}
        />
      </div>

      {/* ── 2. MOBILE DRAWER SIDEBAR (Slide-out on mobile) ── */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Drawer Panel */}
          <div className="relative z-10 flex flex-col w-72 max-w-[85vw] bg-white h-full shadow-2xl animate-in slide-in-from-left duration-300">
            <Sidebar
              activeTab={activeTab}
              setActiveTab={(tab) => {
                handleTabChange(tab);
                setIsMobileMenuOpen(false);
              }}
              isMobile={true}
              onCloseMobile={() => setIsMobileMenuOpen(false)}
              onOpenUpload={() => {
                handleTabChange('closet');
                setIsMobileMenuOpen(false);
                window.dispatchEvent(new CustomEvent('open_upload_modal'));
              }}
            />
          </div>
        </div>
      )}

      {/* ── 3. MAIN CONTENT COLUMN ── */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Header Bar (Unified Responsive) */}
        <header className="flex items-center justify-between px-4 md:px-8 py-3.5 bg-white border-b border-gray-200/80 z-30 sticky top-0 flex-shrink-0">
          {/* Mobile hamburger & Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 -ml-2 rounded-xl text-gray-700 hover:bg-gray-100 active:scale-95 transition-all"
              aria-label="Open navigation menu"
            >
              <Menu size={22} />
            </button>

            <Link to="/" className="flex md:hidden items-center gap-2 hover:opacity-85 transition-opacity">
              <div className="w-7 h-7 rounded-lg bg-primary text-white flex items-center justify-center font-bold text-xs">
                <Shirt size={16} />
              </div>
              <span className="font-extrabold text-base tracking-tight text-gray-900">
                AI Wardrobe
              </span>
            </Link>

            {/* Desktop Active Tab Title & Breadcrumb */}
            <div className="hidden md:flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center text-primary font-bold">
                <CurrentIcon size={17} />
              </div>
              <div>
                <h1 className="font-extrabold text-base text-gray-900 leading-tight">
                  {tabLabels[activeTab]?.title}
                </h1>
                <p className="text-[11px] text-gray-400 font-medium">
                  {tabLabels[activeTab]?.subtitle}
                </p>
              </div>
            </div>
          </div>

          {/* Right Header Controls & User Profile */}
          <div className="flex items-center gap-3" ref={profileDropdownRef}>
            {/* Quick Add Button */}
            <button
              onClick={() => {
                setActiveTab('closet');
                window.dispatchEvent(new CustomEvent('open_upload_modal'));
              }}
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold bg-primary text-white px-4 py-2 rounded-xl hover:bg-gray-800 active:scale-95 transition-all shadow-xs"
            >
              <PlusCircle size={15} />
              <span>Add Garment</span>
            </button>

            {/* User Profile Pill / Auth Button */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-2xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 active:scale-[0.98] transition-all bg-white"
                  aria-label="User Profile Menu"
                >
                  <div className="relative">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-primary to-neutral-700 text-white font-black text-xs flex items-center justify-center shadow-xs">
                      {userInitial}
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
                  </div>
                  <div className="hidden sm:block text-left min-w-0 pr-1">
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-bold text-gray-900 max-w-[110px] truncate block">
                        {displayName}
                      </span>
                      <CheckCircle2 size={12} className="text-emerald-500" />
                    </div>
                    <span className="text-[10px] text-gray-400 block -mt-0.5 max-w-[110px] truncate">
                      {user.email}
                    </span>
                  </div>
                  <ChevronDown size={14} className="hidden sm:block text-gray-400" />
                </button>

                {/* Dropdown Popover */}
                {showProfileDropdown && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="p-3 border-b border-gray-100 bg-gray-50/70 rounded-xl mb-1.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-primary text-white font-black text-sm flex items-center justify-center">
                          {userInitial}
                        </div>
                        <div className="min-w-0">
                          <p className="font-extrabold text-sm text-gray-900 truncate">
                            {displayName}
                          </p>
                          <p className="text-xs text-gray-500 truncate">{user.email}</p>
                          <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                            <ShieldCheck size={10} /> Verified User
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        handleTabChange('settings');
                        setShowProfileDropdown(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-gray-700 hover:bg-gray-100 rounded-xl transition-colors text-left"
                    >
                      <SettingsIcon size={15} />
                      <span>Account & Settings</span>
                    </button>

                    <button
                      onClick={() => {
                        handleTabChange('closet');
                        setShowProfileDropdown(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-gray-700 hover:bg-gray-100 rounded-xl transition-colors text-left"
                    >
                      <Grid size={15} />
                      <span>My Wardrobe</span>
                    </button>

                    <div className="my-1 border-t border-gray-100" />

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors text-left"
                    >
                      <LogOut size={15} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="text-xs font-bold bg-primary text-white px-4 py-2 rounded-xl hover:bg-gray-800 active:scale-95 transition-all shadow-xs"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="hidden sm:inline-block text-xs font-bold text-gray-600 hover:text-gray-900 px-3 py-2"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </header>

        {/* Dynamic Main View */}
        <main className="flex-1 overflow-y-auto">
          {activeTab === 'closet' && (
            <WardrobeGrid onSelectItem={setSelectedItem} />
          )}

          {activeTab === 'outfits' && (
            <OutfitGenerator />
          )}

          {activeTab === 'settings' && (
            <SettingsView />
          )}
        </main>
      </div>

      {/* ── 4. RIGHT SIDE CLOTH PROFILE / ITEM DETAILS (Only in Closet) ── */}
      {activeTab === 'closet' && (
        <>
          {/* Mobile Backdrop for ItemDetails */}
          {selectedItem && (
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setSelectedItem(null)}
            />
          )}

          {/* Sliding Panel */}
          <div
            className={`
              fixed lg:static inset-y-0 right-0 z-40 flex-shrink-0 transform transition-transform duration-300 ease-in-out
              ${selectedItem ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
              ${!selectedItem ? 'hidden lg:block' : ''}
            `}
          >
            <ItemDetails
              item={selectedItem}
              onClose={() => setSelectedItem(null)}
              onDelete={handleDeleteItem}
              onTryOn={(item) => {
                handleTabChange('outfits');
                setSelectedItem(null);
              }}
            />
          </div>
        </>
      )}

      {/* ── 5. MOBILE BOTTOM NAVIGATION BAR ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 flex justify-around items-center h-16 z-30 pb-safe shadow-lg">
        <button
          onClick={() => handleTabChange('closet')}
          className={`flex flex-col items-center justify-center flex-1 h-full py-1 transition-all ${
            activeTab === 'closet' ? 'text-primary font-bold' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <Grid size={20} className={activeTab === 'closet' ? 'stroke-[2.5]' : ''} />
          <span className="text-[11px] mt-0.5">Closet</span>
        </button>

        <button
          onClick={() => handleTabChange('outfits')}
          className={`flex flex-col items-center justify-center flex-1 h-full py-1 transition-all ${
            activeTab === 'outfits' ? 'text-primary font-bold' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <Sparkles size={20} className={activeTab === 'outfits' ? 'stroke-[2.5]' : ''} />
          <span className="text-[11px] mt-0.5">Outfits</span>
        </button>

        <button
          onClick={() => handleTabChange('settings')}
          className={`flex flex-col items-center justify-center flex-1 h-full py-1 transition-all ${
            activeTab === 'settings' ? 'text-primary font-bold' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <SettingsIcon size={20} className={activeTab === 'settings' ? 'stroke-[2.5]' : ''} />
          <span className="text-[11px] mt-0.5">Settings</span>
        </button>
      </nav>
    </div>
  );
};

export default DashboardPage;
