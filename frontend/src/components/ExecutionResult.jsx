

{/*import { useState, useEffect } from 'react';
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
}*/}

import { useState, useEffect } from 'react';
import { wsService } from '../services/websocket';
import s from "./mentor/FreeMode.module.css";

export default function ExecutionResult({ attempt }) {
  const [mentorReplies, setMentorReplies] = useState([]);
  const [connectionState, setConnectionState] = useState(
    wsService.getConnectionState()
  );

  // 🔹 Если есть attempt, используем mentor_reply напрямую
  useEffect(() => {
    if (attempt?.mentor_reply) {
      setMentorReplies([
        {
          time: new Date(attempt.timestamp).toLocaleTimeString(),
          text: attempt.mentor_reply,
        },
      ]);
    }
  }, [attempt]);

  // 🔹 WebSocket только если нет attempt
  useEffect(() => {
    if (attempt) return; // отключаем WS при истории

    console.log("🟢 ExecutionResult mounted (WS mode)");

    const handler = (data) => {
      console.log('📨 ExecutionResult received:', data);

      if (data.source?.startsWith("mentor_response")) {
        const hint = data.data?.hint;
        if (!hint) return;

        setMentorReplies((prev) => {
          const newMessage = {
            time: new Date().toLocaleTimeString(),
            text: hint,
            data: data
          };

          // Проверяем, есть ли уже такое сообщение
          if (prev.some(msg => msg.text === newMessage.text)) return prev;

          return [...prev, newMessage];
        });
      }
    };

    wsService.on("mentor_response", handler);

    return () => {
      wsService.off("mentor_response", handler);
      console.log("🔴 ExecutionResult unmounted (WS mode)");
    };
  }, [attempt]);

  // 🔹 Отслеживание состояния WebSocket только если нет attempt
  useEffect(() => {
    if (attempt) return;

    const interval = setInterval(() => {
      setConnectionState(wsService.getConnectionState());
    }, 1000);

    return () => clearInterval(interval);
  }, [attempt]);

  return (
    <div className={s["execution-result"]}>
      {mentorReplies.length > 0 ? (
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
      ) : (
        <div className="result-empty">
          <p>Нажмите кнопку для выполнения кода</p>
          {!attempt && <p className="connection-hint">Статус: {connectionState}</p>}
        </div>
      )}
    </div>
  );
}