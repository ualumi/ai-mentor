import { useState, useEffect } from "react";
import Editor, { useMonaco } from "@monaco-editor/react";

function CodeEditor() {
  const [code, setCode] = useState("print('Hello, world!')");
  const monaco = useMonaco();

  const handleChange = (value) => {
    setCode(value);
  };

  // ✅ Добавляем кастомную тему с нужным фоном
  useEffect(() => {
    if (monaco) {
      monaco.editor.defineTheme("custom-dark", {
        base: "vs-dark",
        inherit: true,
        rules: [],
        colors: {
          "editor.background": "#23292E", // ← твой новый фон
        },
      });
      monaco.editor.setTheme("custom-dark");
    }
  }, [monaco]);

  return (
    <div style={{ backgroundColor: "#111219" }}>
      <Editor
        height="100%"
        defaultLanguage="python"
        value={code}
        onChange={handleChange}
        theme="custom-dark" // ← применяем кастомную тему
        options={{
          fontSize: 16,
          minimap: { enabled: false },
          automaticLayout: true,
        }}
      />
    </div>
  );
}

export default CodeEditor;



{/*import { useState } from "react";
import Editor from "@monaco-editor/react";

function CodeEditor() {
  const [code, setCode] = useState("print('Hello, world!')");

  const handleChange = (value) => {
    setCode(value);
  };



  return (
    <div style={{ backgroundColor: "#111219" }}>
      <Editor
        height="100%"
        defaultLanguage="python"   // можно поставить "javascript", "html", "cpp" и т.д.
        value={code}
        onChange={handleChange}
        theme="vs-dark"            // или "light", "vs-dark", "hc-black"
        options={{
          fontSize: 16,
          minimap: { enabled: false },
          automaticLayout: true,
        }}
      />
    </div>
  );
}

export default CodeEditor;*/}
