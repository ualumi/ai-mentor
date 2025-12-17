import { useState } from "react";
import {SquareTerminal}from 'lucide-react';

function RunButton({ code, addMessage }) {
  const handleRun = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Пожалуйста, войдите в систему, чтобы отправить код");
      return;
    }

    const socket = new WebSocket(`ws://localhost:8000/ws/mentor?token=${token}`);

    socket.onopen = () => {
      console.log("✅ CONNECTED");
      socket.send(code); // отправляем текущий код
    };

    socket.onmessage = (e) => {
      console.log("📩 MESSAGE", e.data);
      // добавляем сообщение в терминал
      addMessage({ type: "server", text: e.data });
    };

    socket.onerror = (e) => {
      console.log("❌ ERROR", e);
      addMessage({ type: "error", text: "Ошибка WebSocket" });
    };

    socket.onclose = (e) => {
      console.log("❌ CLOSED", e);
    };
  };

  return (
    <button onClick={handleRun}>
      <a><SquareTerminal size={32} /></a>
    </button>
  );
}

export default RunButton;
