{/*import { useState, useEffect, useRef } from "react";
import {ArrowUp} from 'lucide-react';
import Message from "./Message.jsx";

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
        <Message response={response} />

      )}
    </div>
  );
}

export default InputForm;*/}


import { useState, useEffect, useRef } from "react";
import { ArrowUp } from "lucide-react";
import Message from "./Message.jsx";

function InputForm() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]); // хранит все ответы
  const [connected, setConnected] = useState(false);
  const ws = useRef(null);

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8000/ws/mentor/test_user");

    socket.onopen = () => {
      console.log("✅ WebSocket подключен");
      setConnected(true);
    };

    socket.onmessage = (event) => {
      console.log("📩 Ответ от сервера:", event.data);
      // добавляем новый ответ в конец массива
      setMessages((prev) => [...prev, { type: "mentor", text: event.data }]);
    };

    socket.onclose = () => {
      console.log("❌ WebSocket закрыт");
      setConnected(false);
    };

    socket.onerror = (err) => {
      console.error("Ошибка WebSocket:", err);
    };

    ws.current = socket;

    return () => {
      socket.close();
    };
  }, []);

  const handleSend = (e) => {
    e.preventDefault();
    if (ws.current && connected) {
      ws.current.send(message);
      // сохраняем сообщение пользователя
      setMessages((prev) => [...prev, { type: "user", text: message }]);
      setMessage("");
    } else {
      alert("Соединение с сервером не установлено");
    }
  };

  return (
    <div className="inputform">
      <div className="messages-container">
        {messages.map((msg, index) => (
          <Message key={index} sender={msg.type} text={msg.text} />
        ))}
      </div>

      <form onSubmit={handleSend} className="form">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Введите сообщение..."
          className="inputtext"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          <ArrowUp />
        </button>
      </form>
    </div>
  );
}

export default InputForm;