// components/ExecutionResult.jsx
{/*import { useQuery } from '@tanstack/react-query';

const QUERY_KEYS = {
  executionResult: (taskId) => ['executionResult', taskId],
};

export default function ExecutionResult() {
  const { data: result, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.executionResult('current'),
    enabled: false, // не выполняем автоматически
  });

  if (isLoading) return <div className="result-loading">⏳ Выполнение...</div>;
  
  if (error) return <div className="result-error">❌ {error.message}</div>;
  
  if (!result) return <div className="result-empty">Нажмите кнопку для выполнения кода</div>;

  return (
    <div className="execution-result">
      <h3>Результат:</h3>
      <pre className="result-output">
        {JSON.stringify(result, null, 2)}
      </pre>
    </div>
  );
}*/}

// components/ExecutionResult.jsx
import { useQuery } from '@tanstack/react-query';
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

      // ✅ Ответ песочницы
      if (data.source?.startsWith("sandbox_response")) {
        const stdout = data.data?.sandbox_result?.stdout;
        if (stdout) {
          setLiveOutput(prev => [...prev, stdout]);
        }
      }
    };
    
    wsService.on('*', handler);
    
    return () => {
      wsService.off('*', handler);
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
      
      {/* Ответы ментора */}
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
              
              {/*{process.env.NODE_ENV === 'development' && (
                <pre className="debug-data">{JSON.stringify(reply.data, null, 2)}</pre>
              )}*/}
            </div>
          ))}
        </div>
      )}
      
      {/* Потоковый вывод */}
      {liveOutput.length > 0 && (
        <div className="live-output">
          <h4>Вывод программы:</h4>
          {liveOutput.map((line, i) => (
            <pre key={i} className="output-line">{line}</pre>
          ))}
        </div>
      )}
      
      {/* Финальный результат из кэша 
      {result && (
        <div className="final-result">
          <h4>Результат (из кэша):</h4>
          <pre className="result-json">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
      */}
      
      
      {/* Если нет данных */}
      {!mentorReplies.length && !liveOutput.length && !result && (
        <div className="result-empty">
          <p>Нажмите кнопку для выполнения кода</p>
          <p className="connection-hint">Статус: {connectionState}</p>
        </div>
      )}
    </div>
  );
}