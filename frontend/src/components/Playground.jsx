{/*import { useEffect, useState } from "react";
import CodeEditor from "./CodeEditor";
import MessagePanel from "./MessagePanel";

export default function Playground({ ws }) {
  const [mentorMessages, setMentorMessages] = useState([]);
  const [sandboxMessages, setSandboxMessages] = useState([]);

  useEffect(() => {
    if (!ws) return;

    ws.onmessage = (event) => {
      const raw = event.data;

      // 1️⃣ JSON-сообщения
      try {
        const data = JSON.parse(raw);

        if (data.type === "sandbox_result") {
          setSandboxMessages((prev) => [...prev, data.output]);
        }

        return;
      } catch {
        // не JSON — идём дальше
      }

      // 2️⃣ Текстовые сообщения
      if (raw.startsWith("ИИ-ментор:")) {
        setMentorMessages((prev) => [
          ...prev,
          raw.replace("ИИ-ментор:", "").trim(),
        ]);
      }

      if (raw.startsWith("Песочница:")) {
        setSandboxMessages((prev) => [
          ...prev,
          raw.replace("Песочница:", "").trim(),
        ]);
      }
    };
  }, [ws]);

  return (
    <div>
      <CodeEditor ws={ws} />

      <MessagePanel
        title="🧠 ИИ-ментор"
        messages={mentorMessages}
      />

      <MessagePanel
        title="🧪 Песочница"
        messages={sandboxMessages}
      />
    </div>
  );
}*/}

import { useEffect, useState } from "react";
import CodeEditor from "./CodeEditor";
import MessagePanel from "./MessagePanel";
import TaskCondition from "./TaskCondition";

export default function Playground({ ws }) {
  const [condition, setCondition] = useState(null);
  const [mentorMessages, setMentorMessages] = useState([]);
  const [sandboxMessages, setSandboxMessages] = useState([]);

  useEffect(() => {
    if (!ws) return;

    ws.onmessage = (event) => {
      console.log("WS MESSAGE:", event.data);
      const raw = event.data;

      // ---------- JSON сообщения ----------
      if (typeof raw === "string" && raw.trim().startsWith("{")) {
        try {
          const data = JSON.parse(raw);

          // 📘 Новое условие задачи
          if (data.condition) {
            const text =
              typeof data.condition === "string"
                ? data.condition
                : data.condition.description ??
                  JSON.stringify(data.condition, null, 2);

            setCondition(text);
            setMentorMessages([]);     // очищаем прошлые подсказки
            setSandboxMessages([]);    // очищаем прошлый вывод
            return;
          }

          // 🧪 Ответ песочницы
          if (data.type === "sandbox_result") {
            setSandboxMessages((prev) => [
              ...prev,
              String(
                data.output ??
                data.stdout ??
                data.result ??
                ""
              ),
            ]);
            return;
          }

          // 🧠 Сообщение ментора
          if (data.type === "mentor_message" && data.message) {
            setMentorMessages((prev) => [
              ...prev,
              String(data.message),
            ]);
            return;
          }
        } catch {
          // невалидный JSON — игнорируем
        }
      }

      // ---------- Текстовые сообщения ----------
      if (typeof raw === "string") {
        if (raw.startsWith("ИИ-ментор:")) {
          setMentorMessages((prev) => [
            ...prev,
            raw.replace("ИИ-ментор:", "").trim(),
          ]);
        }

        if (raw.startsWith("Песочница:")) {
          setSandboxMessages((prev) => [
            ...prev,
            raw.replace("Песочница:", "").trim(),
          ]);
        }
      }
    };

    // ❌ ВАЖНО: НЕ закрываем соединение
    return () => {};
  }, [ws]);

  return (
    <div>
      <TaskCondition condition={condition} />

      <CodeEditor ws={ws} />

      <MessagePanel
        title="🧠 ИИ-ментор"
        messages={mentorMessages}
      />

      <MessagePanel
        title="🧪 Песочница"
        messages={sandboxMessages}
      />
    </div>
  );
}
