import { useState } from "react";

export default function CodeEditor({ ws }) {
  const [code, setCode] = useState("");

  const submit = () => {
    if (!ws || ws.readyState !== WebSocket.OPEN) return;

    ws.send(
      JSON.stringify({
        type: "code",
        payload: code,
      })
    );
  };

  return (
    <>
      <textarea
        rows={10}
        cols={70}
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Введи код..."
      />
      <br />
      <button onClick={submit}>Submit code</button>
    </>
  );
}
