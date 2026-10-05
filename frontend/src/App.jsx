import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';

function App() {
  return (
    <Router>
      <div className="App">
        {/* Temporary Navigation for Dev to switch between views */}
        <div className="fixed bottom-4 left-4 z-[9999] bg-white p-2 rounded-lg shadow-xl border border-gray-200 flex space-x-2 text-xs font-bold">
          <Link to="/" className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200">Landing</Link>
          <Link to="/dashboard" className="px-3 py-1 bg-accent text-white rounded hover:bg-opacity-90">Dashboard</Link>
        </div>

        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
