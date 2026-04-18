import React from 'react';


{/*function ProgressBar ({ progress, height = 10, color = '#3B68FF' }) {
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

export default ProgressBar;*/}

/*function ProgressBar({ progress, height = 10, color = '#3B68FF' }) {
  console.log(progress)
  const clampedProgress = progress !== undefined 
    ? Math.min(100, Math.max(0, progress))
    : null;

  return (
    <div 
      className={`progress-bar-container ${progress === undefined ? 'indeterminate' : ''}`}
      style={{ height: `${height}px` }}
    >
      <div 
        className="progress-bar-fill"
        style={{ 
          width: clampedProgress !== null ? `${clampedProgress}%` : '100%',
          backgroundColor: color,
          ...(progress === undefined && { animation: 'indeterminate 1.5s infinite' })
        }}
      />
    </div>
  );
}

export default ProgressBar;*/

function ProgressBar({ progress, height = 10, color = '#3B68FF' }) {
  // Определяем, является ли progress объектом с полем ema
  const isProgressObject = progress && typeof progress === 'object' && 'ema' in progress;
  
  // Если progress - объект, используем ema, иначе проверяем на число
  let progressValue;
  
  if (isProgressObject) {
    // Преобразуем ema (0.374 -> 37.4%)
    progressValue = Math.min(100, Math.max(0, progress.ema * 100));
  } else if (typeof progress === 'number') {
    progressValue = Math.min(100, Math.max(0, progress));
  } else {
    progressValue = null; // indeterminate
  }

  const isIndeterminate = progressValue === null;

  return (
    <div 
      className={`progress-bar-container ${isIndeterminate ? 'indeterminate' : ''}`}
      style={{ height: `${height}px` }}
    >
      <div 
        className="progress-bar-fill"
        style={{ 
          width: !isIndeterminate ? `${progressValue}%` : '100%',
          backgroundColor: color,
          ...(isIndeterminate && { animation: 'indeterminate 1.5s infinite' })
        }}
      />
    </div>
  );
}

export default ProgressBar;