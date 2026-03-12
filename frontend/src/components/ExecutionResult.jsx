

// components/ExecutionResult.jsx
/*import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { wsService } from '../services/websocket';
import Item from './mentor/Item';
import s from "./mentor/FreeMode.module.css"

const QUERY_KEYS = {
  executionResult: (taskId) => ['executionResult', taskId],
};

export default function ExecutionResult() {
  const [liveOutput, setLiveOutput] = useState([]);
  const [mentorReplies, setMentorReplies] = useState([]);
  
  const { data: result, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.executionResult('current'),
    enabled: false,
  });

  // Подписываемся на все сообщения
  useEffect(() => {
    const handler = (data) => {
      console.log('📨 ExecutionResult received:', data);

      // ✅ Ответ ментора
      if (data.source?.startsWith("mentor_response")) {
        const hint = data.data?.hint;

        if (!hint) return;

        setMentorReplies(prev => [
          ...prev,
          {
            time: new Date().toLocaleTimeString(),
            text: hint,
            data: data
          }
        ]);
      }

    };
    wsService.on("mentor_response", handler);
    //wsService.on('*', handler);
    
    return () => {
      wsService.off('mentor_response', handler);
    };
  }, []);

  // Отображаем состояние соединения
  const [connectionState, setConnectionState] = useState(wsService.getConnectionState());
  
  useEffect(() => {
    const interval = setInterval(() => {
      setConnectionState(wsService.getConnectionState());
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  if (isLoading) return (
    <div className="execution-result">
      <div className="result-loading">
        <span className="spinner"></span>
        <span>⏳ Выполнение...</span>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="execution-result">
      <div className="result-error">❌ {error.message}</div>
    </div>
  );

  return (
    <div className={s["execution-result"]}>
      <div className="result-header">
        <h3>Результат выполнения</h3>
        <div className={`connection-status ${connectionState.toLowerCase()}`}>
          WebSocket: {connectionState}
        </div>
      </div>
      
      {mentorReplies.length > 0 && (
        <div className="mentor-replies">
          {mentorReplies.map((reply, i) => (
            <div key={i} className="mentor-message">
              <div className={s["insight-panel"]}>
                <div className='menu-item mentor-item item-light'>
                  <p className='menu-caption mentor-caption'>Mentor</p>
                  <p>{reply.text}</p>
                </div>
              </div>
              
            </div>
          ))}
        </div>
      )}
         
      {!mentorReplies.length && !liveOutput.length && !result && (
        <div className="result-empty">
          <p>Нажмите кнопку для выполнения кода</p>
          <p className="connection-hint">Статус: {connectionState}</p>
        </div>
      )}
    </div>
  );
}*/

import { useState, useEffect } from 'react';
import { wsService } from '../services/websocket';
import s from "./mentor/FreeMode.module.css";

export default function ExecutionResult() {
  const [liveOutput, setLiveOutput] = useState([]);
  const [mentorReplies, setMentorReplies] = useState([]);
  const [connectionState, setConnectionState] = useState(
    wsService.getConnectionState()
  );

  // ✅ Подписка на mentor_response
  useEffect(() => {
    console.log("🟢 ExecutionResult mounted");
    const handler = (data) => {
      console.log('📨 ExecutionResult received:', data);

      if (data.source?.startsWith("mentor_response")) {
        const hint = data.data?.hint;
        if (!hint) return;

        setMentorReplies(prev => {
          const newMessage = {
            time: new Date().toLocaleTimeString(),
            text: hint,
            data: data
          };

          // Проверяем, есть ли уже такое сообщение по тексту
          const exists = prev.some(msg => msg.text === newMessage.text);

          if (exists) return prev; // если есть, не добавляем

          return [...prev, newMessage];
        });
      }
    };

    wsService.on("mentor_response", handler);

    return () => {
      wsService.off("mentor_response", handler);
      console.log("🔴 ExecutionResult unmounted");
    };
  }, []);

  // ✅ Отслеживание состояния WebSocket
  useEffect(() => {
    const interval = setInterval(() => {
      setConnectionState(wsService.getConnectionState());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={s["execution-result"]}>

      {mentorReplies.length > 0 && (
        <div className="mentor-replies">
          {mentorReplies.map((reply, i) => (
            <div key={i} className="mentor-message">
              <div>
                <div className="menu-item mentor-item item-light">
                  <p>{reply.text}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!mentorReplies.length && !liveOutput.length && (
        <div className="result-empty">
          <p>Нажмите кнопку для выполнения кода</p>
          <p className="connection-hint">Статус: {connectionState}</p>
        </div>
      )}
    </div>
  );
}