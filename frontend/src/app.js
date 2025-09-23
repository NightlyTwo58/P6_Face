import React, { useState } from "react";
import './CameraCaptureApp.css';
import MainPageContent from './MainPageContent';
import SettingsPage from './SettingsPage';

export default function App() {
  const [currentPage, setCurrentPage] = useState('main');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isImageCachingEnabled, setIsImageCachingEnabled] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const Sidebar = () => (
    <div className={`sidebar ${isSidebarOpen ? 'expanded' : ''}`}>
      <button onClick={toggleSidebar} className="toggle-button">
        {isSidebarOpen ? '✖' : '☰'}
      </button>
      {isSidebarOpen && (
        <div className="sidebar-content">
          <h2 className="text-sm">Navigation</h2>
          <div className="nav-links">
            <button className="button-link" onClick={() => setCurrentPage('main')}>Main Page</button>
            <button className="button-link" onClick={() => setCurrentPage('settings')}>Settings</button>
          </div>
          <h2 className="text-sm mt-4">Links</h2>
          <div className="nav-links">
            <a 
              href="https://github.com/NightlyTwo58"
              target="_blank"
              rel="noopener noreferrer"
            >
              Visit Me!
            </a>
            <a
              href="https://github.com/ageitgey/face_recognition"
              target="_blank"
              rel="noopener noreferrer"
            >
              face_recognition Library
            </a>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="app-container">
      <Sidebar />
      {currentPage === 'main' ? 
        <MainPageContent isImageCachingEnabled={isImageCachingEnabled} /> : 
        <SettingsPage isImageCachingEnabled={isImageCachingEnabled} setIsImageCachingEnabled={setIsImageCachingEnabled} />
      }
    </div>
  );
}