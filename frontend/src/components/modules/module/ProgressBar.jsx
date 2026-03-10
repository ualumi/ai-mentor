import React from 'react';


const ProgressBar = ({ progress, height = 20, color = '#4CAF50' }) => {
  return (
    <div className="progress-bar-container" style={{ height: `${height}px` }}>
      <div 
        className="progress-bar-fill"
        style={{ 
          width: `${Math.min(100, Math.max(0, progress))}%`,
          backgroundColor: color
        }}
      />
    </div>
  );
};

export default ProgressBar;