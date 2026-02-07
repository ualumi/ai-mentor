


{/*import { useEffect, useState } from "react";
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
}*/}

{/*import { useEffect, useState } from "react";
import CodeEditor from "./CodeEditor";
import MessagePanel from "./MessagePanel";
import TaskCondition from "./TaskCondition";
import StepProgress from "./StepProgress";
import "../App.css";

export default function Playground({ ws }) {
  const [condition, setCondition] = useState(null);
  const [nextCondition, setNextCondition] = useState(null);
  const [mentorMessages, setMentorMessages] = useState([]);
  const [sandboxMessages, setSandboxMessages] = useState([]);
  const [stepId, setStepId] = useState(1);
  const [lastStepCompleted, setLastStepCompleted] = useState(false);

  const TOTAL_STEPS = 3;

  useEffect(() => {
    if (!ws) return;

    ws.onmessage = (event) => {
      const raw = event.data;

      if (typeof raw === "string" && raw.trim().startsWith("{")) {
        try {
          const data = JSON.parse(raw);

          // 📘 Условие задачи
          if (data.event === "task_condition") {
            const text =
              typeof data.condition === "string"
                ? data.condition
                : data.condition?.description ??
                  JSON.stringify(data.condition, null, 2);

            if (!condition) {
              setCondition(text);
            } else {
              setNextCondition(text);
            }
            return;
          }

          // 🧠 Ответ ментора
          if (data.event === "mentor_reply") {
            setMentorMessages((prev) => [...prev, data.text]);
            return;
          }

          // 🧪 Ответ песочницы
          if (data.event === "sandbox_reply") {
            setSandboxMessages((prev) => [
              ...prev,
              String(data.result ?? ""),
            ]);
            return;
          }
        } catch (e) {
          console.warn("WS parse error", e);
        }
      }
    };
  }, [ws, condition]);

  const isLastStepCompleted = lastStepCompleted;

  return (
    <div className="task">
      {!isLastStepCompleted ? (
        <StepProgress stepId={stepId} totalSteps={TOTAL_STEPS} />
      ) : (
        <div style={{ margin: "10px 0", fontWeight: "bold" }}>
          Все шаги пройдены!
          <button
            style={{ marginLeft: "10px" }}
            onClick={() => console.log("К следующему заданию")}
          >
            К следующему заданию
          </button>
        </div>
      )}

      <div className="task-content">
        <TaskCondition condition={condition} />

        {!isLastStepCompleted && nextCondition && (
          <button
            className="next-step"
            onClick={() => {
              setCondition(nextCondition);
              setNextCondition(null);
              setMentorMessages([]);
              setSandboxMessages([]);

              if (stepId === TOTAL_STEPS) {
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

        <div className="mentor">
          <MessagePanel title="ИИ-ментор" messages={mentorMessages} />
        </div>

        <div className="sandbox">
          <MessagePanel title="Terminal" messages={sandboxMessages} />
        </div>
      </div>
    </div>
  );
}*/}

import { useEffect, useState } from "react";
import CodeEditor from "./CodeEditor";
import MessagePanel from "./MessagePanel";
import TaskCondition from "./TaskCondition";
import StepProgress from "./StepProgress";
import "../App.css";

export default function Playground({ ws }) {
  const [condition, setCondition] = useState(null);
  const [nextCondition, setNextCondition] = useState(null);
  const [mentorMessages, setMentorMessages] = useState([]);
  const [sandboxMessages, setSandboxMessages] = useState([]);
  const [stepId, setStepId] = useState(1);
  const [lastStepCompleted, setLastStepCompleted] = useState(false);

  // ⭐ код теперь хранится здесь
  const [code, setCode] = useState("");

  const TOTAL_STEPS = 3;

  useEffect(() => {
    if (!ws) return;

    ws.onmessage = (event) => {
      const raw = event.data;

      if (typeof raw === "string" && raw.trim().startsWith("{")) {
        try {
          const data = JSON.parse(raw);

          // 📘 Условие задачи
          if (data.event === "task_condition") {
            const text =
              typeof data.condition === "string"
                ? data.condition
                : data.condition?.description ??
                  JSON.stringify(data.condition, null, 2);

            if (!condition) {
              setCondition(text);
            } else {
              setNextCondition(text);
            }
            return;
          }

          // 🧠 Ответ ментора
          if (data.event === "mentor_reply") {
            setMentorMessages((prev) => [...prev, data.text]);
            return;
          }

          // 🧪 Ответ песочницы
          if (data.event === "sandbox_reply") {
            setSandboxMessages((prev) => [
              ...prev,
              String(data.result ?? ""),
            ]);
            return;
          }
        } catch (e) {
          console.warn("WS parse error", e);
        }
      }
    };
  }, [ws, condition]);

  // ▶️ отправка кода ТОЛЬКО по кнопке
      const runCode = () => {
      if (!ws) {
        console.warn("WS is null");
        return;
      }

      console.log("WS state:", ws.readyState);

      if (ws.readyState !== WebSocket.OPEN) {
        console.warn("WS not open");
        return;
      }

      if (!code.trim()) {
        console.warn("Empty code");
        return;
      }

      const payload = {
        event: "submit_code",
        code: code,
      };

  console.log("➡️ sending to backend:", payload);

  ws.send(JSON.stringify(payload));
};

  const isLastStepCompleted = lastStepCompleted;

  return (
    <div className="task">
      {!isLastStepCompleted ? (
        <StepProgress stepId={stepId} totalSteps={TOTAL_STEPS} />
      ) : (
        <div style={{ margin: "10px 0", fontWeight: "bold" }}>
          Все шаги пройдены!
          <button
            style={{ marginLeft: "10px" }}
            onClick={() => console.log("К следующему заданию")}
          >
            К следующему заданию
          </button>
        </div>
      )}

      <div className="task-content">
        <TaskCondition condition={condition} />

        {!isLastStepCompleted && nextCondition && (
          <button
            className="next-step"
            onClick={() => {
              setCondition(nextCondition);
              setNextCondition(null);
              setMentorMessages([]);
              setSandboxMessages([]);

              if (stepId === TOTAL_STEPS) {
                setLastStepCompleted(true);
              } else {
                setStepId((prev) => prev + 1);
              }
            }}
          >
            ▶ Следующий шаг
          </button>
        )}

        {/* ✏️ редактор кода
        <CodeEditor code={code} onChange={setCode} /> */}

        <CodeEditor ws={ws} code={code} setCode={setCode} />

        {/* ▶️ отдельная кнопка запуска */}
        <button onClick={runCode}>
          ▶ Выполнить код
        </button>

        <div className="mentor">
          <MessagePanel title="ИИ-ментор" messages={mentorMessages} />
        </div>

        <div className="sandbox">
          <MessagePanel title="Terminal" messages={sandboxMessages} />
        </div>
      </div>
    </div>
  );
}







