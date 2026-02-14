{/*import { useState } from "react";
import Editor from "@monaco-editor/react";

export default function CodeEditor({ ws }) {
  const [code, setCode] = useState("");

  const submit = () => {
    if (!ws || ws.readyState !== WebSocket.OPEN) return;

    ws.send(
      JSON.stringify({
        //type: "code",
        //code: code,
        code,
      })
    );
  };

  return (
    <>
      <Editor
        height="300px"
        language="python"
        theme="vs-dark"
        value={code}
        onChange={(value) => setCode(value ?? "")}
        options={{
          minimap: { enabled: false },
          fontSize: 16,
          automaticLayout: true,
        }}
      />

      <br />
      <button onClick={submit}>Submit code</button>
    </>
  );
}*/}




{/*import { useState } from "react";
import Editor from "@monaco-editor/react";
import '../App.css'

export default function CodeEditor({ ws }) {
  const [code, setCode] = useState("");

  const submit = () => {
    if (!ws || ws.readyState !== WebSocket.OPEN) return;

    // Отправляем только сам код как строку
    ws.send(code);
  };

  return (
    <>
      <Editor
        height="300px"
        language="python"
        theme="vs-dark"
        value={code}
        onChange={(value) => setCode(value ?? "")}
        options={{
          minimap: { enabled: false },
          fontSize: 16,
          automaticLayout: true,
        }}
      />

      <br />
      <button className="submit_code" onClick={submit}>Submit code</button>
    </>
  );
}*/}

{/*import { useState, useEffect } from "react";
import Editor, { useMonaco } from "@monaco-editor/react";
import '../App.css'

export default function CodeEditor({ ws }) {
  const [code, setCode] = useState("");
  const monaco = useMonaco();

  // ⭐ Создаем кастомную тему с фоном #1C1D25
  useEffect(() => {
    if (!monaco) return;

    monaco.editor.defineTheme("custom-dark", {
      base: "vs-dark",
      inherit: true,
      rules: [],
      colors: {
        "editor.background": "#1C1D25",
      },
    });

    monaco.editor.setTheme("custom-dark"); // ⭐ ОБЯЗАТЕЛЬНО
  }, [monaco]);

  const submit = () => {
    if (!ws || ws.readyState !== WebSocket.OPEN) return;

    ws.send(code); // Отправляем только сам код как строку
  };

  return (
    <>
      <div className="editor">
        <Editor
          height="380px"
          language="python"
          theme="custom-dark"   // Используем кастомную тему
          value={code}
          onChange={(value) => setCode(value ?? "")}
          options={{
            minimap: { enabled: false },
            fontSize: 16,
            automaticLayout: true,
            padding: { top: 8 },   // Небольшой отступ сверху
            lineHeight: 20,
          }}
        />
      </div>
      

      <br />
      <button className="submit_code" onClick={submit}>Submit code</button>
    </>
  );
}*/}

import { useExecuteCode } from '../hooks/useCodeExecution';
import { useCode } from './CodeContext';

// app/CodeEditor.jsx
import { useEffect } from "react";
import Editor, { useMonaco } from "@monaco-editor/react";
import "../App.css"

export default function CodeEditor() {
  const monaco = useMonaco();
  const { code, setCode } = useCode(); // Берем код из контекста

  // ⭐ Создаем кастомную тему с фоном #1C1D25
  useEffect(() => {
    if (!monaco) return;

    monaco.editor.defineTheme("custom-dark", {
      base: "vs-dark",
      inherit: true,
      rules: [],
      colors: {
        "editor.background": "#00000000",
      },
    });

    monaco.editor.setTheme("custom-dark");
  }, [monaco]);

  {/*const submit = () => {
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      console.warn("WebSocket not ready");
      return;
    }

    if (!code.trim()) {
      console.warn("Empty code");
      return;
    }

    // Отправляем код в формате JSON с событием run_code
    const payload = { event: "run_code", code };
    console.log("➡️ Sending code to backend:", payload);
    ws.send(JSON.stringify(payload));
  };*/}

  return (
    <>
      <div>
        <Editor
          height="49vh"
          language="python"
          theme="custom-dark"
          value={code}
          onChange={(value) => setCode(value ?? "")}
          options={{
            minimap: { enabled: false },
            fontSize: 16,
            automaticLayout: true,
            padding: { top: 15 },
            lineHeight: 20,
          }}
        />
      </div>

      <br />
      {/*<button className="submit_code" onClick={submit}>
        ▶ Submit
      </button>*/}
    </>
  );
}

