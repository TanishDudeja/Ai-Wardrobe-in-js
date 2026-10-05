import React from 'react';
import { Home, Grid, PlusCircle, Settings } from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab }) => {
  return (
    <div className="w-64 h-screen bg-white border-r border-gray-200 flex flex-col hidden md:flex sticky top-0">
      <div className="p-6">
        <div className="text-2xl font-bold tracking-tighter text-primary">AI Wardrobe</div>
      </div>
      
      <nav className="flex-1 px-4 space-y-2 mt-4">
        <button 
          onClick={() => setActiveTab('closet')}
          className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg font-medium transition-colors ${activeTab === 'closet' ? 'bg-gray-100 text-primary' : 'text-gray-500 hover:bg-gray-50'}`}
        >
          <Grid size={20} />
          <span>My Closet</span>
        </button>
        <button 
          onClick={() => setActiveTab('outfits')}
          className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg font-medium transition-colors ${activeTab === 'outfits' ? 'bg-gray-100 text-primary' : 'text-gray-500 hover:bg-gray-50'}`}
        >
          <Home size={20} />
          <span>Outfits</span>
        </button>
        <button className="w-full flex items-center space-x-3 px-3 py-2 text-gray-500 hover:bg-gray-50 rounded-lg font-medium transition-colors">
          <Settings size={20} />
          <span>Settings</span>
        </button>
      </nav>

      <div className="p-4 border-t border-gray-100">
        <button className="w-full flex items-center justify-center space-x-2 bg-primary text-white py-3 rounded-xl hover:bg-opacity-90 transition-all font-medium">
          <PlusCircle size={20} />
          <span>Add Item</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
