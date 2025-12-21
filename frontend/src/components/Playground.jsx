import { useEffect, useState } from "react";
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
}
