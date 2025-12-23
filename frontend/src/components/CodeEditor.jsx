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

import { useState } from "react";
import Editor from "@monaco-editor/react";

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
      <button onClick={submit}>Submit code</button>
    </>
  );
}

