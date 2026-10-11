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
        <div className="absolute top-2.5 left-2.5 z-10 max-w-[calc(100%-2.75rem)]">
          {item.userId ? (
            <span className="bg-primary/80 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs truncate block whitespace-nowrap">
              My Garment
            </span>
          ) : (
            <span className="bg-white/90 backdrop-blur-md text-gray-700 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs truncate block whitespace-nowrap">
              Starter
            </span>
          )}
        </div>

        <button
          onClick={handleDelete}
          className="absolute top-2.5 right-2.5 z-20 w-7 h-7 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-red-50 hover:text-red-500 shadow-md text-gray-600"
          title="Delete garment"
        >
          <Trash2 size={13} />
        </button>
      </div>

      {/* Info */}
      <div className="p-3.5">
        <h4 className="font-bold text-gray-900 truncate text-xs sm:text-sm mb-2" title={item.name}>
          {item.name}
        </h4>
        <div className="flex items-center gap-1.5 flex-wrap min-w-0">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold flex-shrink-0 ${colors.bg} ${colors.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
            {item.category}
          </span>
          {item.color && (
            <span className="text-[10px] text-gray-400 capitalize flex items-center gap-0.5 font-medium truncate max-w-[85px]" title={item.color}>
              <Tag size={9} className="flex-shrink-0" />
              <span className="truncate">{item.color}</span>
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ItemCard;
