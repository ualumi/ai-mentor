import React from 'react';


function ProgressBar ({ progress, height = 10, color = '#3B68FF' }) {
  return (
    <div className="progress-bar-container" style={{ height: `${height}px` }}>
      <div 
        className="progress-bar-fill"
        style={{ 
          width: `${Math.min(100, Math.max(0, progress))}%`,
        }}
      />
    </div>
  );
};

export default ProgressBar;