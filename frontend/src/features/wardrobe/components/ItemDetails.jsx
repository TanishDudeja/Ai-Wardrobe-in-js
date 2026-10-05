import React from 'react';
import { X, Edit2, Trash2 } from 'lucide-react';

const ItemDetails = ({ item, onClose }) => {
  if (!item) {
    return (
      <div className="w-80 h-screen bg-white border-l border-gray-200 hidden lg:flex flex-col items-center justify-center text-gray-400 p-6 text-center sticky top-0">
        <p>Select an item to view its details and styling options.</p>
      </div>
    );
  }

  return (
    <div className="w-full lg:w-80 h-screen bg-white lg:border-l border-gray-200 flex flex-col fixed lg:sticky top-0 right-0 z-50 shadow-2xl lg:shadow-none transition-transform duration-300">
      <div className="p-4 border-b border-gray-100 flex justify-between items-center">
        <h3 className="font-bold text-lg">Item Details</h3>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full lg:hidden">
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="aspect-square w-full bg-gray-100 rounded-2xl overflow-hidden mb-6">
          <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
        </div>

        <h2 className="text-2xl font-bold mb-2">{item.name}</h2>
        
        <div className="space-y-4 mb-8">
          <div>
            <p className="text-sm text-gray-500 mb-1">Category</p>
            <p className="font-medium capitalize bg-gray-100 inline-block px-3 py-1 rounded-full text-sm">{item.category}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Color</p>
            <div className="flex items-center space-x-2">
              <div 
                className="w-6 h-6 rounded-full border border-gray-200" 
                style={{ backgroundColor: item.color === 'white' ? '#fff' : item.color === 'black' ? '#000' : item.color }}
              />
              <span className="font-medium capitalize">{item.color}</span>
            </div>
          </div>
        </div>

        <div className="flex space-x-3">
          <button className="flex-1 flex items-center justify-center space-x-2 bg-gray-100 text-primary py-3 rounded-xl hover:bg-gray-200 transition-colors font-medium">
            <Edit2 size={18} />
            <span>Edit</span>
          </button>
          <button className="flex-1 flex items-center justify-center space-x-2 bg-red-50 text-red-600 py-3 rounded-xl hover:bg-red-100 transition-colors font-medium">
            <Trash2 size={18} />
            <span>Delete</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ItemDetails;
