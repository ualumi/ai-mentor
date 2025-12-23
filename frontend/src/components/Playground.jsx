

{/*import { useEffect, useState } from "react";
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
}*/}



{/*import { useEffect, useState } from "react";
import CodeEditor from "./CodeEditor";
import MessagePanel from "./MessagePanel";
import TaskCondition from "./TaskCondition";

export default function Playground({ ws }) {
  const [condition, setCondition] = useState(null);
  const [nextCondition, setNextCondition] = useState(null);
  const [mentorMessages, setMentorMessages] = useState([]);
  const [sandboxMessages, setSandboxMessages] = useState([]);

  useEffect(() => {
    if (!ws) return;

    ws.onmessage = (event) => {
      const raw = event.data;

      if (typeof raw === "string" && raw.trim().startsWith("{")) {
        try {
          const data = JSON.parse(raw);

          // 📘 новое условие — НЕ применяем сразу
          if (data.condition) {
            const text =
              typeof data.condition === "string"
                ? data.condition
                : data.condition.description ??
                  JSON.stringify(data.condition, null, 2);

            setNextCondition(text);
            return;
          }

          // 🧪 песочница
          if (data.type === "sandbox_result") {
            setSandboxMessages((prev) => [
              ...prev,
              String(data.output ?? ""),
            ]);
            return;
          }

          // 🧠 ментор
          if (data.type === "mentor_message") {
            setMentorMessages((prev) => [
              ...prev,
              String(data.message),
            ]);
            return;
          }
        } catch {}
      }

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
  }, [ws]);

  return (
    <div>
      <TaskCondition condition={condition} />

      {nextCondition && (
        <button
          onClick={() => {
            setCondition(nextCondition);
            setNextCondition(null);
            setMentorMessages([]);
            setSandboxMessages([]);
          }}
        >
          ▶ Следующий шаг
        </button>
      )}

      <CodeEditor ws={ws} />

      <MessagePanel title="🧠 ИИ-ментор" messages={mentorMessages} />
      <MessagePanel title="🧪 Песочница" messages={sandboxMessages} />
    </div>
  );
}*/}


import { useEffect, useState } from "react";
import CodeEditor from "./CodeEditor";
import MessagePanel from "./MessagePanel";
import TaskCondition from "./TaskCondition";

export default function Playground({ ws }) {
  const [condition, setCondition] = useState(null);
  const [nextCondition, setNextCondition] = useState(null);
  const [mentorMessages, setMentorMessages] = useState([]);
  const [sandboxMessages, setSandboxMessages] = useState([]);

  useEffect(() => {
    if (!ws) return;

    ws.onmessage = (event) => {
      const raw = event.data;

      if (typeof raw === "string" && raw.trim().startsWith("{")) {
        try {
          const data = JSON.parse(raw);

          // 📘 Условие задачи
          if (data.condition) {
            const text =
              typeof data.condition === "string"
                ? data.condition
                : data.condition.description ??
                  JSON.stringify(data.condition, null, 2);

            // ✅ первое условие — сразу показываем
            if (!condition) {
              setCondition(text);
            } else {
              // ✅ следующее — ждёт подтверждения
              setNextCondition(text);
            }
            return;
          }

          if (data.type === "sandbox_result") {
            setSandboxMessages((prev) => [
              ...prev,
              String(data.output ?? ""),
            ]);
            return;
          }

          if (data.type === "mentor_message") {
            setMentorMessages((prev) => [
              ...prev,
              String(data.message),
            ]);
            return;
          }
        } catch {}
      }

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
  }, [ws, condition]);

  return (
    <div>
      <TaskCondition condition={condition} />

      {/* ✅ Кнопка всегда под условием и появляется ТОЛЬКО если есть следующий шаг */}
      {nextCondition && (
        <button
          onClick={() => {
            setCondition(nextCondition);
            setNextCondition(null);
            setMentorMessages([]);
            setSandboxMessages([]);
          }}
        >
          ▶ Следующий шаг
        </button>
      )}

      <CodeEditor ws={ws} />

      <MessagePanel title="🧠 ИИ-ментор" messages={mentorMessages} />
      <MessagePanel title="🧪 Песочница" messages={sandboxMessages} />
    </div>
  );
}

