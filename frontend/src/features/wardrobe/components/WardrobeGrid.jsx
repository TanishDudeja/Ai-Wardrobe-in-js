import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import ItemCard from './ItemCard';
import { UploadCloud, X, Loader2, Search, SlidersHorizontal, Grid3X3, LayoutList, Sparkles, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../auth/context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const CATEGORIES = ['All', 'Tops', 'Bottoms', 'Outerwear', 'Shoes'];
const SORT_OPTIONS = ['Newest First', 'Oldest First', 'Name A-Z', 'Name Z-A'];

const WardrobeGrid = ({ onSelectItem }) => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('Newest First');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [showSort, setShowSort] = useState(false);

  // Upload State
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [color, setColor] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [ownershipFilter, setOwnershipFilter] = useState('all'); // 'all' | 'mine' | 'starter'
  const [uploadError, setUploadError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const fetchItems = async () => {
    try {
      setLoading(true);
      if (!user?.id) {
        setItems([]);
        setLoading(false);
        return;
      }
      const url = `${API_URL}/api/wardrobe?userId=${encodeURIComponent(user.id)}`;
      const res = await fetch(url);
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch wardrobe:', error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchItems(); 

    const handleOpenUpload = () => setShowUpload(true);
    const handleWardrobeUpdated = () => fetchItems();

    window.addEventListener('open_upload_modal', handleOpenUpload);
    window.addEventListener('wardrobe_updated', handleWardrobeUpdated);

    return () => {
      window.removeEventListener('open_upload_modal', handleOpenUpload);
      window.removeEventListener('wardrobe_updated', handleWardrobeUpdated);
    };
  }, [user?.id]);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) { setFile(selected); setPreviewUrl(URL.createObjectURL(selected)); }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped && dropped.type.startsWith('image/')) {
      setFile(dropped); setPreviewUrl(URL.createObjectURL(dropped));
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!file || !name || !category || !color) return;
    setIsUploading(true);
    setUploadError('');
    const formData = new FormData();
    formData.append('image', file);
    formData.append('name', name);
    formData.append('category', category);
    formData.append('color', color);
    if (user?.id) {
      formData.append('userId', user.id);
    }
    try {
      const res = await fetch(`${API_URL}/api/wardrobe`, { method: 'POST', body: formData });
      if (res.ok) {
        setShowUpload(false);
        setFile(null); setPreviewUrl(null); setName(''); setCategory(''); setColor('');
        fetchItems();
      } else {
        const err = await res.json();
        setUploadError(err.message || 'Upload failed');
      }
    } catch (error) {
      setUploadError('Network error. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await fetch(`${API_URL}/api/wardrobe/${id}`, { method: 'DELETE' });
      setItems(prev => prev.filter(i => i._id !== id));
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  // Filter + Search + Sort
  const filteredItems = items
    .filter(item => {
      // Security: Never display items belonging to another user
      if (item.userId && item.userId !== user?.id) {
        return false;
      }
      const matchesCategory = activeFilter === 'All' || item.category?.toLowerCase() === activeFilter.toLowerCase();
      const matchesSearch = item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.color?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesOwnership =
        ownershipFilter === 'all'
          ? true
          : ownershipFilter === 'mine'
          ? item.userId === user?.id
          : !item.userId;
      return matchesCategory && matchesSearch && matchesOwnership;
    })
    .sort((a, b) => {
      if (sortBy === 'Name A-Z') return a.name.localeCompare(b.name);
      if (sortBy === 'Name Z-A') return b.name.localeCompare(a.name);
      if (sortBy === 'Oldest First') return new Date(a.createdAt) - new Date(b.createdAt);
      return new Date(b.createdAt) - new Date(a.createdAt); // Newest First
    });

  const myItemsCount = items.filter(i => !!i.userId && i.userId === user?.id).length;
  const starterItemsCount = items.filter(i => !i.userId).length;

  // Category counts
  const categoryCounts = CATEGORIES.reduce((acc, cat) => {
    acc[cat] = cat === 'All' ? items.length : items.filter(i => i.category?.toLowerCase() === cat.toLowerCase()).length;
    return acc;
  }, {});

  return (
    <div className="flex-1 bg-background overflow-y-auto min-h-screen pb-24 md:pb-0">
      <div className="max-w-7xl mx-auto p-6 lg:p-10">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-extrabold text-primary mb-1">
              {user ? (
                <>Welcome back, <span className="text-accent">{user.user_metadata?.full_name || user.email?.split('@')[0]}</span> 👋</>
              ) : (
                'My Digital Closet'
              )}
            </h2>
            <p className="text-gray-500">
              {user ? (
                <>{items.length} garments organized in your personal wardrobe</>
              ) : (
                'Sign in to access, digitize, and style your private clothes'
              )}
              {user && (searchQuery || activeFilter !== 'All') ? ` · ${filteredItems.length} showing` : ''}
            </p>
          </div>
          {user ? (
            <button
              onClick={() => setShowUpload(true)}
              className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-full font-bold hover:bg-gray-900 transition-all hover:shadow-lg hover:-translate-y-0.5 self-start md:self-auto"
            >
              <Sparkles size={16} /> Add Item
            </button>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-full font-bold hover:bg-gray-900 transition-all hover:shadow-lg hover:-translate-y-0.5 self-start md:self-auto text-sm"
            >
              <Lock size={15} /> Sign In to Access
            </Link>
          )}
        </div>

        {!user ? (
          <div className="bg-white rounded-3xl p-10 sm:p-14 border border-gray-100 shadow-sm text-center max-w-xl mx-auto my-12 animate-in fade-in duration-300">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 text-gray-700 mx-auto flex items-center justify-center mb-5 shadow-xs">
              <Lock size={28} />
            </div>
            <h3 className="text-2xl font-black text-gray-900 mb-2">Your Wardrobe is Private</h3>
            <p className="text-sm text-gray-500 mb-6 leading-relaxed max-w-md mx-auto">
              Your garments are securely tied to your personal styling account. Sign in or register to view your closet, digitize garments, and generate AI outfits.
            </p>
            <div className="flex items-center justify-center gap-3">
              <Link
                to="/login"
                className="px-6 py-3 bg-primary text-white text-xs font-bold rounded-2xl hover:bg-gray-800 transition-colors shadow-sm"
              >
                Sign In to Closet
              </Link>
              <Link
                to="/signup"
                className="px-6 py-3 bg-white border border-gray-200 text-gray-800 text-xs font-bold rounded-2xl hover:bg-gray-50 transition-colors"
              >
                Create Account
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Search + Controls */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
          {/* Search */}
          <div className="relative flex-1">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, color..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700">
                <X size={14} />
              </button>
            )}
          </div>

          {/* Sort dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowSort(s => !s)}
              className="flex items-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              <SlidersHorizontal size={15} /> {sortBy}
            </button>
            <AnimatePresence>
              {showSort && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                  className="absolute right-0 top-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden z-20 min-w-[160px]"
                >
                  {SORT_OPTIONS.map(opt => (
                    <button
                      key={opt}
                      onClick={() => { setSortBy(opt); setShowSort(false); }}
                      className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-50 transition-colors ${sortBy === opt ? 'font-bold text-primary' : 'text-gray-700'}`}
                    >
                      {opt}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* View Mode Toggle */}
          <div className="flex bg-white border border-gray-200 rounded-2xl overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-3 transition-colors ${viewMode === 'grid' ? 'bg-primary text-white' : 'text-gray-400 hover:bg-gray-50'}`}
            >
              <Grid3X3 size={16} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-3 transition-colors ${viewMode === 'list' ? 'bg-primary text-white' : 'text-gray-400 hover:bg-gray-50'}`}
            >
              <LayoutList size={16} />
            </button>
          </div>
        </div>

        {/* Ownership Scope Tabs (When logged in) */}
        {user && (
          <div className="flex items-center gap-2 mb-4 bg-gray-100/80 p-1 rounded-2xl w-fit">
            <button
              onClick={() => setOwnershipFilter('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                ownershipFilter === 'all'
                  ? 'bg-white text-primary shadow-xs'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              All Garments ({items.length})
            </button>
            <button
              onClick={() => setOwnershipFilter('mine')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                ownershipFilter === 'mine'
                  ? 'bg-white text-primary shadow-xs'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              My Uploads ({myItemsCount})
            </button>
            <button
              onClick={() => setOwnershipFilter('starter')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                ownershipFilter === 'starter'
                  ? 'bg-white text-primary shadow-xs'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Starter Catalog ({starterItemsCount})
            </button>
          </div>
        )}

        {/* Category Filters */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
          {CATEGORIES.map(filter => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                activeFilter === filter
                  ? 'bg-primary text-white shadow-md'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {filter}
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeFilter === filter ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
                {categoryCounts[filter]}
              </span>
            </button>
          ))}
        </div>

        {/* Grid / List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 gap-4">
            <div className="w-12 h-12 border-4 border-gray-200 border-t-primary rounded-full animate-spin" />
            <p className="text-gray-400 font-medium">Loading your closet...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center h-64 text-gray-400">
            <UploadCloud size={64} className="mb-4 opacity-30" />
            <p className="text-xl font-bold text-gray-700">
              {items.length === 0 ? 'Your closet is empty' : 'No items match your search'}
            </p>
            <p className="text-sm mt-1">
              {items.length === 0 ? 'Click "Add Item" to start digitizing!' : 'Try a different filter or search term'}
            </p>
          </motion.div>
        ) : viewMode === 'grid' ? (
          <motion.div layout className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
            <AnimatePresence>
              {filteredItems.map(item => (
                <ItemCard key={item._id} item={item} onClick={onSelectItem} onDelete={handleDelete} />
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div layout className="flex flex-col gap-3">
            <AnimatePresence>
              {filteredItems.map(item => (
                <motion.div
                  key={item._id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onClick={() => onSelectItem(item)}
                  className="group flex items-center gap-5 bg-white rounded-2xl p-4 border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all cursor-pointer"
                >
                  <img src={item.imageUrl} alt={item.name} className="w-16 h-16 rounded-xl object-cover bg-gray-100 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-gray-900 truncate">{item.name}</h4>
                    <p className="text-sm text-gray-400 capitalize">{item.category} · {item.color}</p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); if (window.confirm(`Delete "${item.name}"?`)) handleDelete(item._id); }}
                    className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                  >
                    <X size={16} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
          </>
        )}
      </div>

      {/* Upload Modal */}
      <AnimatePresence>
        {showUpload && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={(e) => e.target === e.currentTarget && setShowUpload(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-2xl rounded-[2rem] overflow-hidden shadow-2xl relative"
            >
              {/* Modal Header */}
              <div className="p-8 pb-6 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold">Digitize New Item</h3>
                  <p className="text-gray-500 text-sm mt-1">Upload a photo to add it to your AI Wardrobe</p>
                </div>
                <button
                  onClick={() => setShowUpload(false)}
                  className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {!user ? (
                <div className="p-10 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4 text-gray-700 shadow-xs">
                    <Lock size={26} />
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-2">Account Required</h4>
                  <p className="text-sm text-gray-500 max-w-sm mx-auto mb-6 leading-relaxed">
                    Please sign in or create an account to upload and save personal garments to your digital closet.
                  </p>
                  <div className="flex justify-center gap-3">
                    <Link
                      to="/login"
                      onClick={() => setShowUpload(false)}
                      className="px-6 py-3 bg-primary text-white text-xs font-bold rounded-xl hover:bg-gray-800 transition-colors shadow-sm"
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/signup"
                      onClick={() => setShowUpload(false)}
                      className="px-6 py-3 bg-white border border-gray-200 text-gray-800 text-xs font-bold rounded-xl hover:bg-gray-50 transition-colors"
                    >
                      Create Account
                    </Link>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleUploadSubmit} className="p-8 flex flex-col md:flex-row gap-8">

                  {/* Left: Image Drop Zone */}
                  <div className="flex-1 flex flex-col">
                    <input type="file" accept="image/*" onChange={handleFileChange} ref={fileInputRef} className="hidden" />
                    <div
                      onClick={() => fileInputRef.current.click()}
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    className={`flex-1 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all relative overflow-hidden min-h-[260px] ${
                      isDragging ? 'border-primary bg-blue-50 scale-[1.02]' :
                      previewUrl ? 'border-transparent' : 'border-gray-300 hover:border-primary hover:bg-gray-50'
                    }`}
                  >
                    {previewUrl ? (
                      <>
                        <img src={previewUrl} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/30 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                          <p className="text-white font-bold text-sm">Click to change</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <UploadCloud size={40} className={`mb-3 transition-colors ${isDragging ? 'text-primary' : 'text-gray-300'}`} />
                        <p className="font-bold text-gray-700">{isDragging ? 'Drop it here!' : 'Click or drag to upload'}</p>
                        <p className="text-sm text-gray-400 mt-1">JPG, PNG, WEBP up to 10MB</p>
                      </>
                    )}
                  </div>
                </div>

                {/* Right: Metadata Form */}
                <div className="flex-1 flex flex-col gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Item Name</label>
                    <input
                      required type="text" value={name} onChange={e => setName(e.target.value)}
                      className="w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none transition-all"
                      placeholder="e.g. Navy Blue Blazer"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Category</label>
                    <select
                      required value={category} onChange={e => setCategory(e.target.value)}
                      className="w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none bg-white transition-all"
                    >
                      <option value="">Select category...</option>
                      <option value="tops">👕 Tops</option>
                      <option value="bottoms">👖 Bottoms</option>
                      <option value="outerwear">🧥 Outerwear</option>
                      <option value="shoes">👟 Shoes</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Color</label>
                    <input
                      required type="text" value={color} onChange={e => setColor(e.target.value)}
                      className="w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none transition-all"
                      placeholder="e.g. Navy Blue"
                    />
                  </div>

                  {uploadError && (
                    <p className="text-sm text-red-500 font-medium bg-red-50 px-4 py-3 rounded-xl">{uploadError}</p>
                  )}

                  <button
                    disabled={isUploading || !file || !name || !category || !color}
                    type="submit"
                    className="mt-auto w-full bg-primary text-white py-4 rounded-xl font-bold hover:bg-gray-900 disabled:opacity-40 transition-all flex items-center justify-center gap-2 hover:shadow-lg"
                  >
                    {isUploading ? (
                      <><Loader2 className="animate-spin" size={18} /> Uploading to Cloud...</>
                    ) : (
                      <><Sparkles size={18} /> Save to Closet</>
                    )}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WardrobeGrid;
