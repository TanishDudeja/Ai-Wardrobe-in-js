import React, { useState } from 'react';
import Sidebar from '../features/wardrobe/components/Sidebar';
import WardrobeGrid from '../features/wardrobe/components/WardrobeGrid';
import ItemDetails from '../features/wardrobe/components/ItemDetails';
import OutfitGenerator from '../features/generator/components/OutfitGenerator';

const DashboardPage = () => {
  const [selectedItem, setSelectedItem] = useState(null);
  const [activeTab, setActiveTab] = useState('closet'); // 'closet' or 'outfits'

  return (
    <div className="flex h-screen overflow-hidden bg-background text-primary">
      {/* Left Column: Navigation */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Middle Column: The Grid or Generator */}
      {activeTab === 'closet' ? (
        <WardrobeGrid onSelectItem={setSelectedItem} />
      ) : (
        <OutfitGenerator />
      )}

      {/* Right Column / Mobile Modal: Item Details */}
      {selectedItem && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden" 
          onClick={() => setSelectedItem(null)} 
        />
      )}
      
      <div className={`
        fixed lg:static inset-y-0 right-0 z-50 transform transition-transform duration-300 ease-in-out
        ${selectedItem ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
        ${activeTab === 'outfits' && !selectedItem ? 'lg:hidden' : ''}
      `}>
        <ItemDetails item={selectedItem} onClose={() => setSelectedItem(null)} />
      </div>

      {/* Mobile Bottom Navigation (Hidden on md+) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center h-16 z-30 pb-safe">
        <button 
          onClick={() => setActiveTab('closet')}
          className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${activeTab === 'closet' ? 'text-primary' : 'text-gray-400'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M3 15h18"/><path d="M9 3v18"/><path d="M15 3v18"/></svg>
          <span className="text-[10px] font-medium">Closet</span>
        </button>
        <button 
          onClick={() => setActiveTab('outfits')}
          className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${activeTab === 'outfits' ? 'text-primary' : 'text-gray-400'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          <span className="text-[10px] font-medium">Outfits</span>
        </button>
      </div>
    </div>
  );
};

export default DashboardPage;
