import { useEffect, useState } from "react";
import CodeEditor from "./CodeEditor";
import MessagePanel from "./MessagePanel";
import TaskCondition from "./TaskCondition";
import StepProgress from "./StepProgress"; // ⭐ NEW
import '../App.css'

export default function FreeModeChat({ ws }) {
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


  return (
    <div className="task">

        <CodeEditor ws={ws} />
        <div className="mentor">
          <MessagePanel title="ИИ-ментор" messages={mentorMessages} />
        </div>
        
        <div className="sandbox">
          <MessagePanel  title="Terminal" messages={sandboxMessages} />
        </div>
      
    </div>
  );
}