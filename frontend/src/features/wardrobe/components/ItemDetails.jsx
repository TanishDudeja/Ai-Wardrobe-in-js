import React, { useEffect } from 'react';
import { X, ArrowLeft, Trash2, Tag, Calendar, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORY_COLORS = {
  tops: { bg: 'bg-blue-50', text: 'text-blue-600', dot: 'bg-blue-400' },
  bottoms: { bg: 'bg-violet-50', text: 'text-violet-600', dot: 'bg-violet-400' },
  outerwear: { bg: 'bg-amber-50', text: 'text-amber-600', dot: 'bg-amber-400' },
  shoes: { bg: 'bg-emerald-50', text: 'text-emerald-600', dot: 'bg-emerald-400' },
  default: { bg: 'bg-gray-50', text: 'text-gray-600', dot: 'bg-gray-400' },
};

const ItemDetails = ({ item, onClose, onDelete, onTryOn }) => {
  // Listen for Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!item) {
    return (
      <div className="w-80 h-screen bg-white border-l border-gray-200 hidden lg:flex flex-col items-center justify-center text-gray-400 p-6 text-center sticky top-0">
        <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-4 text-gray-300">
          <Sparkles size={28} />
        </div>
        <p className="font-medium text-gray-500">No item selected</p>
        <p className="text-xs text-gray-400 mt-1">Click any garment in your closet to inspect details or delete it.</p>
      </div>
    );
  }

  const categoryStyle = CATEGORY_COLORS[item.category?.toLowerCase()] || CATEGORY_COLORS.default;

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete "${item.name}" from your wardrobe?`)) {
      onDelete?.(item._id);
      onClose?.();
    }
  };

  return (
    <div className="w-full sm:w-96 lg:w-84 h-full bg-white border-l border-gray-200 flex flex-col shadow-2xl lg:shadow-none z-50">
      {/* Top Action Bar */}
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
        <button
          onClick={onClose}
          className="flex items-center gap-1.5 text-sm font-semibold text-gray-600 hover:text-primary transition-colors py-1 px-2 -ml-2 rounded-lg hover:bg-gray-50"
        >
          <ArrowLeft size={18} />
          <span>Back</span>
        </button>

        <h3 className="font-bold text-base text-gray-900 truncate max-w-[140px]">
          Cloth Profile
        </h3>

        <button
          onClick={onClose}
          title="Close details (Esc)"
          className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 active:scale-95 text-gray-600 flex items-center justify-center transition-all"
        >
          <X size={16} />
        </button>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto p-5 pb-28 md:pb-8 space-y-6">
        {/* Large Garment Image */}
        <div className="aspect-[4/5] w-full bg-gray-50 rounded-3xl overflow-hidden relative shadow-sm border border-gray-100">
          <img
            src={item.imageUrl}
            alt={item.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-3 left-3">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold shadow-sm ${categoryStyle.bg} ${categoryStyle.text} backdrop-blur-md bg-opacity-95`}>
              <span className={`w-1.5 h-1.5 rounded-full ${categoryStyle.dot}`} />
              {item.category?.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Title and Metadata */}
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900 leading-tight mb-2">
            {item.name}
          </h2>
          <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
            {item.color && (
              <span className="inline-flex items-center gap-1.5 bg-gray-100 px-2.5 py-1 rounded-lg font-medium text-gray-700 capitalize">
                <span
                  className="w-2.5 h-2.5 rounded-full border border-gray-300"
                  style={{ backgroundColor: item.color === 'white' ? '#ffffff' : item.color === 'black' ? '#000000' : item.color }}
                />
                {item.color}
              </span>
            )}
            {item.createdAt && (
              <span className="inline-flex items-center gap-1 bg-gray-50 px-2.5 py-1 rounded-lg text-gray-400">
                <Calendar size={12} />
                {new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            )}
          </div>
        </div>

        {/* Details Card */}
        <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 space-y-3">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500">Classification</span>
            <span className="font-semibold text-gray-900 capitalize">{item.category}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500">Color Palette</span>
            <span className="font-semibold text-gray-900 capitalize">{item.color || 'Unspecified'}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500">Wardrobe Status</span>
            <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold text-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Digitized & Ready
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2 pt-2">
          {onTryOn && (
            <button
              onClick={() => { onTryOn(item); onClose?.(); }}
              className="w-full flex items-center justify-center gap-2 bg-primary text-white py-3.5 rounded-2xl font-bold hover:bg-gray-900 active:scale-[0.98] transition-all shadow-md"
            >
              <Sparkles size={16} />
              <span>Style in Outfits</span>
            </button>
          )}

          <button
            onClick={handleDelete}
            className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 hover:bg-red-100 py-3 rounded-2xl font-bold transition-colors text-sm"
          >
            <Trash2 size={16} />
            <span>Delete Item</span>
          </button>

          <button
            onClick={onClose}
            className="w-full py-2.5 text-xs text-gray-400 hover:text-gray-700 font-semibold transition-colors"
          >
            Close Panel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ItemDetails;
