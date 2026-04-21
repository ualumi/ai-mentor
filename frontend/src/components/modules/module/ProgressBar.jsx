{/*import React from 'react';



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

export default ProgressBar;*/}

{/*import React, { useEffect, useState } from 'react';

function ProgressBar({ progress, height = 10, color = '#3B68FF' }) {
  console.log("ProgressBar received progress:", progress);

  // 🔥 локальное состояние
  const [progressValue, setProgressValue] = useState(null);

  useEffect(() => {
    // Определяем, является ли progress объектом с полем ema
    const isProgressObject =
      progress && typeof progress === 'object' && 'ema' in progress;

    let value;

    if (isProgressObject) {
      value = Math.min(100, Math.max(0, progress.ema * 100));
    } else if (typeof progress === 'number') {
      value = Math.min(100, Math.max(0, progress));
    } else {
      value = null;
    }

    setProgressValue(value);

  }, [progress]); // 🔥 ключевой момент
  console.log("progress",progress)
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

{/*import React from 'react';

function ProgressBar({ progress, height = 10, color = '#3B68FF' }) {

  // 🔥 СЧИТАЕМ ПРЯМО В РЕНДЕРЕ (без useState)
  let progressValue;

  if (typeof progress === 'number') {
    // если приходит 0.449 → переводим в %
    progressValue = Math.min(100, Math.max(0, progress * 100));
  } else {
    progressValue = null;
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

{/*import React, { useEffect, useState } from 'react';
import { wsService } from "../../../services/websocket";

function ProgressBar({ progress, height = 10, color = '#3B68FF', mode }) {

  // 🔥 локальный прогресс (для listen режима)
  const [liveProgress, setLiveProgress] = useState(progress);

  // 🔥 синхронизация при обычном режиме
  useEffect(() => {
    if (mode !== "listen") {
      setLiveProgress(progress);
    }
  }, [progress, mode]);

  // 🔥 слушаем прогресс (разрешаем кнопку)
  useEffect(() => {
    if (mode !== "listen") return;
    const handler = (data) => {
      if (!data?.source?.startsWith("user_progress")) return;
      if (!data?.progress) return;

      const entries = Object.entries(data.progress);
      if (entries.length === 0) return;

      // берем первый тег
      const [, value] = entries[0];

      if (value?.ema !== undefined) {
        setLiveProgress(value.ema);
      }
    };

    wsService.on("user_progress", handler);

    return () => {
      wsService.off("user_progress", handler);
    };
  }, [mode]);



  // 🔥 вычисление процента
  let progressValue;

  if (typeof liveProgress === 'number') {
    progressValue = Math.min(100, Math.max(0, liveProgress * 100));
  } else {
    progressValue = null;
  }

  console.log(liveProgress)

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

{/*import React, { useEffect, useState } from 'react';
import { wsService } from "../../../services/websocket";

function ProgressBar({ progress, height = 10, color = '#3B68FF', mode }) {

  // 🔥 стартуем с пропса (НО слушаем изменения тоже)
  const [liveProgress, setLiveProgress] = useState(progress);

  // -----------------------------
  // 🔥 СИНХРОНИЗАЦИЯ props → state
  // (только если НЕ listen)
  // -----------------------------
  useEffect(() => {
    if (mode !== "listen") {
      setLiveProgress(progress);
    }
  }, [progress, mode]);

  // -----------------------------
  // 🔥 WS listen режим
  // -----------------------------
  useEffect(() => {
    if (mode !== "listen") return;

    const handler = (data) => {
      if (!data?.source?.startsWith("user_progress")) return;
      if (!data?.progress) return;

      const entries = Object.entries(data.progress);
      if (entries.length === 0) return;

      const [, value] = entries[0];

      // 🔥 защита от null / undefined
      if (value?.ema === null || value?.ema === undefined) return;

      setLiveProgress(value.ema);
    };

    wsService.on("user_progress", handler);

    return () => {
      wsService.off("user_progress", handler);
    };
  }, [mode]);

  // -----------------------------
  // 🔥 percent
  // -----------------------------
  let progressValue;

  if (typeof liveProgress === 'number') {
    progressValue = Math.min(100, Math.max(0, liveProgress * 100));
  } else {
    progressValue = null;
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


{/*import React, { useEffect, useState } from 'react';
import { wsService } from "../../../services/websocket";

function ProgressBar({ progress, height = 10, color = '#3B68FF', mode }) {

  // 🔥 стартуем с пропса
  const [liveProgress, setLiveProgress] = useState(progress);

  // -----------------------------
  // props sync (только не listen)
  // -----------------------------
  useEffect(() => {
    if (mode !== "listen") {
      setLiveProgress(progress);
    }
  }, [progress, mode]);

  // -----------------------------
  // WS listen режим
  // -----------------------------
  useEffect(() => {
    if (mode !== "listen") return;

    const handler = (payload) => {
      const data = payload?.data || payload; // 🔥 защита от обёртки

      if (!data?.progress) return;

      const keys = Object.keys(data.progress);
      if (!keys.length) return;

      const firstKey = keys[0];
      const ema = data.progress[firstKey]?.ema;

      if (ema === null || ema === undefined) return;

      setLiveProgress(ema);
    };

    wsService.on("user_progress", handler);

    return () => {
      wsService.off("user_progress", handler);
    };
  }, [mode]);

  // -----------------------------
  // render %
  // -----------------------------
  const progressValue =
    typeof liveProgress === "number"
      ? Math.min(100, Math.max(0, liveProgress * 100))
      : null;

  const isIndeterminate = progressValue === null;
  console.log("progressValue", progressValue)
  console.log("isIndeterminate",isIndeterminate)

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
          Загрузка...
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
