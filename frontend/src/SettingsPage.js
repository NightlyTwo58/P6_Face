import React from "react";

// Accept isImageCachingEnabled and its setter function as props
export default function SettingsPage({ isImageCachingEnabled, setIsImageCachingEnabled }) {
  return (
    <div className="main-content">
      <h1>Settings</h1>
      <p>Adjust application settings here.</p>
      <div className="card">
        <h2>Image Caching</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <label className="checkbox-container">
            <input
              type="checkbox"
              checked={isImageCachingEnabled}
              onChange={() => setIsImageCachingEnabled(!isImageCachingEnabled)}
            />
            <span className="checkmark"></span>
          </label>
          <span style={{ fontSize: '1rem', color: '#111' }}>
            Enable temporary image caching
          </span>
        </div>
        <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.5rem' }}>
          When disabled, captured and uploaded images are deleted from memory after recognition.
        </p>
      </div>
    </div>
  );
}