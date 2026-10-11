import React from 'react';
import { Trash2, Tag } from 'lucide-react';
import { motion } from 'framer-motion';

const CATEGORY_COLORS = {
  tops: { bg: 'bg-blue-50', text: 'text-blue-600', dot: 'bg-blue-400' },
  bottoms: { bg: 'bg-violet-50', text: 'text-violet-600', dot: 'bg-violet-400' },
  outerwear: { bg: 'bg-amber-50', text: 'text-amber-600', dot: 'bg-amber-400' },
  shoes: { bg: 'bg-emerald-50', text: 'text-emerald-600', dot: 'bg-emerald-400' },
  default: { bg: 'bg-gray-50', text: 'text-gray-600', dot: 'bg-gray-400' },
};

const ItemCard = ({ item, onClick, onDelete }) => {
  const colors = CATEGORY_COLORS[item.category?.toLowerCase()] || CATEGORY_COLORS.default;

  const handleDelete = (e) => {
    e.stopPropagation();
    if (window.confirm(`Delete "${item.name}"?`)) {
      onDelete(item._id);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2 }}
      onClick={() => onClick(item)}
      className="group relative bg-white rounded-3xl overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:-translate-y-1"
    >
      {/* Image */}
      <div className="aspect-[4/5] w-full bg-gray-100 relative overflow-hidden">
        <img
          src={item.imageUrl}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
        {/* Hover overlay with delete button */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />
        
        {/* Ownership badge */}
        <div className="absolute top-3 left-3">
          {item.userId ? (
            <span className="bg-primary/80 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
              My Garment
            </span>
          ) : (
            <span className="bg-white/80 backdrop-blur-md text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
              Starter
            </span>
          )}
        </div>

        <button
          onClick={handleDelete}
          className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-red-50 hover:text-red-500 shadow-md"
        >
          <Trash2 size={14} />
        </button>
      </div>

      {/* Info */}
      <div className="p-4">
        <h4 className="font-bold text-gray-900 truncate text-sm mb-2">{item.name}</h4>
        <div className="flex items-center justify-between">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${colors.bg} ${colors.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
            {item.category}
          </span>
          {item.color && (
            <span className="text-xs text-gray-400 capitalize flex items-center gap-1">
              <Tag size={10} /> {item.color}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ItemCard;
