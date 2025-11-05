import { useState, useEffect, useRef } from "react";
import {ArrowUp} from 'lucide-react';

function InputForm() {
  const [message, setMessage] = useState("");
  const [response, setResponse] = useState("");
  const [connected, setConnected] = useState(false);
  const ws = useRef(null);

  // подключаемся при монтировании компонента
  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8000/ws/mentor/test_user");

    socket.onopen = () => {
      console.log("✅ WebSocket подключен");
      setConnected(true);
    };

    socket.onmessage = (event) => {
      console.log("📩 Ответ от сервера:", event.data);
      setResponse(event.data);
    };

    socket.onclose = () => {
      console.log("❌ WebSocket закрыт");
      setConnected(false);
    };

    socket.onerror = (err) => {
      console.error("Ошибка WebSocket:", err);
    };

    ws.current = socket;

    // закрываем соединение при размонтировании компонента
    return () => {
      socket.close();
    };
  }, []);

  const handleSend = (e) => {
    e.preventDefault();
    if (ws.current && connected) {
      ws.current.send(message);
      setMessage("");
    } else {
      alert("Соединение с сервером не установлено");
    }
  };

  return (
    <div className="inputform">
      {/*<h2 className="text-lg font-semibold">
        WebSocket клиент {connected ? "🟢 Подключен" : "🔴 Отключен"}
      </h2>*/}

      <form onSubmit={handleSend} className="form">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Введите"
          className="inputtext"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          <ArrowUp />
        </button>
      </form>

      {response && (
        <div className="border p-2 bg-gray-100 rounded">
          <b>Ответ от сервера:</b>
          <pre>{response}</pre>
        </div>
      )}
    </div>
  );
}

export default InputForm;