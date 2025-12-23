

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




{/*import { useEffect, useState } from "react";
import CodeEditor from "./CodeEditor";
import MessagePanel from "./MessagePanel";
import TaskCondition from "./TaskCondition";

export default function Playground({ ws }) {
  const [condition, setCondition] = useState(null);
  const [nextCondition, setNextCondition] = useState(null);
  const [mentorMessages, setMentorMessages] = useState([]);
  const [sandboxMessages, setSandboxMessages] = useState([]);
  const [stepId, setStepId] = useState(null);
  const TOTAL_STEPS = 3; // временно

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

{/*import { useEffect, useState } from "react";
import CodeEditor from "./CodeEditor";
import MessagePanel from "./MessagePanel";
import TaskCondition from "./TaskCondition";
import StepProgress from "./StepProgress"; // ⭐ NEW

export default function Playground({ ws }) {
  const [condition, setCondition] = useState(null);
  const [nextCondition, setNextCondition] = useState(null);
  const [mentorMessages, setMentorMessages] = useState([]);
  const [sandboxMessages, setSandboxMessages] = useState([]);
  const [stepId, setStepId] = useState(1); // ⭐ NEW: начинаем с 1
  const TOTAL_STEPS = 3; // временно

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
      <StepProgress
        stepId={stepId}
        totalSteps={TOTAL_STEPS}
      />

      <TaskCondition condition={condition} />

      {nextCondition && stepId < TOTAL_STEPS && (
        <button
          onClick={() => {
            setCondition(nextCondition);
            setNextCondition(null);
            setMentorMessages([]);
            setSandboxMessages([]);
            setStepId((prev) => prev + 1); // ⭐ NEW
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

{/*import { useEffect, useState } from "react";
import CodeEditor from "./CodeEditor";
import MessagePanel from "./MessagePanel";
import TaskCondition from "./TaskCondition";
import StepProgress from "./StepProgress"; // ⭐ NEW

export default function Playground({ ws }) {
  const [condition, setCondition] = useState(null);
  const [nextCondition, setNextCondition] = useState(null);
  const [mentorMessages, setMentorMessages] = useState([]);
  const [sandboxMessages, setSandboxMessages] = useState([]);
  const [stepId, setStepId] = useState(1); // ⭐ NEW: начинаем с 1
  const TOTAL_STEPS = 3; // временно

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
      {stepId <= TOTAL_STEPS ? (
        <StepProgress stepId={stepId} totalSteps={TOTAL_STEPS} />
      ) : (
        <div style={{ margin: "10px 0", fontWeight: "bold" }}>
          Все шаги пройдены!
          <button
            style={{ marginLeft: "10px" }}
            onClick={() => {
              // здесь можно добавить переход к следующему заданию
              console.log("К следующему заданию");
            }}
          >
            К следующему заданию
          </button>
        </div>
      )}

      <TaskCondition condition={condition} />

      {nextCondition && stepId <= TOTAL_STEPS && (
        <button
          onClick={() => {
            setCondition(nextCondition);
            setNextCondition(null);
            setMentorMessages([]);
            setSandboxMessages([]);
            setStepId((prev) => prev + 1);
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

{/*import { useEffect, useState } from "react";
import CodeEditor from "./CodeEditor";
import MessagePanel from "./MessagePanel";
import TaskCondition from "./TaskCondition";
import StepProgress from "./StepProgress"; // ⭐ NEW

export default function Playground({ ws }) {
  const [condition, setCondition] = useState(null);
  const [nextCondition, setNextCondition] = useState(null);
  const [mentorMessages, setMentorMessages] = useState([]);
  const [sandboxMessages, setSandboxMessages] = useState([]);
  const [stepId, setStepId] = useState(1); // ⭐ NEW: начинаем с 1
  const TOTAL_STEPS = 3; // временно

  // ⭐ NEW: состояние для отслеживания завершения последнего шага после сабмита
  const [lastStepCompleted, setLastStepCompleted] = useState(false);

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
                : data.condition.description ?? JSON.stringify(data.condition, null, 2);

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
            setSandboxMessages((prev) => [...prev, String(data.output ?? "")]);
            return;
          }

          if (data.type === "mentor_message") {
            setMentorMessages((prev) => [...prev, String(data.message)]);
            return;
          }
        } catch {}
      }

      if (typeof raw === "string") {
        if (raw.startsWith("ИИ-ментор:")) {
          setMentorMessages((prev) => [...prev, raw.replace("ИИ-ментор:", "").trim()]);
        }

        if (raw.startsWith("Песочница:")) {
          setSandboxMessages((prev) => [...prev, raw.replace("Песочница:", "").trim()]);
        }
      }
    };
  }, [ws, condition]);

  // ⭐ NEW: вычисляем, завершен ли последний шаг после сабмита
  const isLastStepCompleted = lastStepCompleted || (stepId > TOTAL_STEPS);

  return (
    <div>
      {!isLastStepCompleted ? (
        <StepProgress stepId={stepId} totalSteps={TOTAL_STEPS} />
      ) : (
        <div style={{ margin: "10px 0", fontWeight: "bold" }}>
          Все шаги пройдены!
          <button
            style={{ marginLeft: "10px" }}
            onClick={() => {
              console.log("К следующему заданию");
            }}
          >
            К следующему заданию
          </button>
        </div>
      )}

      <TaskCondition condition={condition} />

      {nextCondition && stepId <= TOTAL_STEPS && (
        <button
          onClick={() => {
            setCondition(nextCondition);
            setNextCondition(null);
            setMentorMessages([]);
            setSandboxMessages([]);
            if (stepId === TOTAL_STEPS) {
              // ⭐ последний шаг завершён после сабмита
              setLastStepCompleted(true);
            } else {
              setStepId((prev) => prev + 1);
            }
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
import StepProgress from "./StepProgress"; // ⭐ NEW
import '../App.css'

export default function Playground({ ws }) {
  const [condition, setCondition] = useState(null);
  const [nextCondition, setNextCondition] = useState(null);
  const [mentorMessages, setMentorMessages] = useState([]);
  const [sandboxMessages, setSandboxMessages] = useState([]);
  const [stepId, setStepId] = useState(1); // ⭐ NEW: начинаем с 1
  const [lastStepCompleted, setLastStepCompleted] = useState(false); // ⭐ NEW
  const TOTAL_STEPS = 3; // временно

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
                : data.condition.description ?? JSON.stringify(data.condition, null, 2);

            // ✅ первое условие — сразу показываем
            if (!condition) {
              setCondition(text);
            } else {
              // ✅ следующее — ждёт подтверждения
              setNextCondition(text);
            }
            return;
          }

          // 🧪 Песочница
          if (data.type === "sandbox_result") {
            setSandboxMessages((prev) => [...prev, String(data.output ?? "")]);
            return;
          }

          // 🧠 Ментор
          if (data.type === "mentor_message") {
            setMentorMessages((prev) => [...prev, String(data.message)]);
            return;
          }
        } catch {}
      }

      if (typeof raw === "string") {
        if (raw.startsWith("ИИ-ментор:")) {
          setMentorMessages((prev) => [...prev, raw.replace("ИИ-ментор:", "").trim()]);
        }

        if (raw.startsWith("Песочница:")) {
          setSandboxMessages((prev) => [...prev, raw.replace("Песочница:", "").trim()]);
        }
      }
    };
  }, [ws, condition]);

  // ⭐ NEW: проверяем, завершен ли последний шаг
  const isLastStepCompleted = lastStepCompleted;

  return (
    <div className="task">
      {/* ⭐ NEW: Прогресс-бар или сообщение о завершении */}
      {!isLastStepCompleted ? (
        <StepProgress stepId={stepId} totalSteps={TOTAL_STEPS} />
      ) : (
        <div style={{ margin: "10px 0", fontWeight: "bold" }}>
          Все шаги пройдены!
          <button
            style={{ marginLeft: "10px" }}
            onClick={() => {
              console.log("К следующему заданию");
            }}
          >
            К следующему заданию
          </button>
        </div>
      )}
      <div className="task-content">
        <TaskCondition condition={condition} />
        <button className="next-step-disabled">▶ Следующий шаг</button>

        {/* ✅ Кнопка следующего шага */}
        {!isLastStepCompleted && nextCondition && (
          <button className="next-step"
            onClick={() => {
              setCondition(nextCondition);
              setNextCondition(null);
              setMentorMessages([]);
              setSandboxMessages([]);
              if (stepId === TOTAL_STEPS) {
                setLastStepCompleted(true); // последний шаг завершен
              } else {
                setStepId((prev) => prev + 1);
              }
            }}
          >
            ▶ Следующий шаг
          </button>
        )}

        <CodeEditor ws={ws} />
        <div className="mentor">
          <MessagePanel title="ИИ-ментор" messages={mentorMessages} />
        </div>
        
        <div className="sandbox">
          <MessagePanel  title="Terminal" messages={sandboxMessages} />
        </div>
        
      </div>
      
    </div>
  );
}





