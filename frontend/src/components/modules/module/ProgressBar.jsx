{/*import React from 'react';


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

{/*function ProgressBar({ progress, height = 10, color = '#3B68FF' }) {
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

export default ProgressBar;*/}


import React, { useEffect, useState } from 'react';
import { wsService } from "../../../services/websocket";

function ProgressBar({ progress, height = 10, color = '#3B68FF', mode, competency }) {

  const [liveProgress, setLiveProgress] = useState(progress);

  useEffect(() => {
    if (mode !== "listen") {
      setLiveProgress(progress);
    }
  }, [progress, mode]);

  useEffect(() => {
    if (mode !== "listen") return;

    const handler = (payload) => {
      const data = payload?.data || payload;

      if (!data?.progress) return;

      /*const keys = Object.keys(data.progress);
      if (!keys.length) return;

      const firstKey = keys[0];
      const ema = data.progress[firstKey]?.ema;

      if (ema === null || ema === undefined) return;*/
      // 🔥 ищем нужную компетенцию
      const skill = data.progress[competency];

      if (!skill) return;

      const ema = skill.ema;

      if (ema === null || ema === undefined) return;

      //setLiveProgress(ema);

      setLiveProgress(ema);
    };

    wsService.on("user_progress", handler);

    return () => {
      wsService.off("user_progress", handler);
    };
  }, [mode]);


  const progressValue =
    typeof liveProgress === "number"
      ? Math.min(100, Math.max(0, liveProgress * 100))
      : null;

  const isIndeterminate = progressValue === null;

  return (
    <div
      className="progress-bar-container"
      style={{
        height: `${height}px`,
        display: "flex",
        alignItems: "center",
        justifyContent: isIndeterminate ? "center" : "flex-start",
        position: "relative",
        borderRadius: "6px",
        overflow: "hidden"
      }}
    >
      {isIndeterminate ? (
        <span style={{ fontSize: "12px", color: "#666" }}>
          
        </span>
      ) : (
        <div
          className="progress-bar-fill"
          style={{
            width: `${progressValue}%`,
            height: "100%",
            backgroundColor: color,
            transition: "width 0.3s ease"
          }}
        />
      )}
    </div>
  );
}

export default ProgressBar;
