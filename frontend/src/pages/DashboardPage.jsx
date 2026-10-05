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
    </div>
  );
};

export default DashboardPage;
