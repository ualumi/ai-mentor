


{/*import { useCode } from './CodeContext';
import { useState, useRef, useEffect } from "react";
import Editor, { useMonaco } from "@monaco-editor/react";
import "./ai.css";

const defaultCode = `#напишите свой код здесь
a=10
if a:
print("Hello World")`;

export default function CodeEditor({ analysis = [], mode, attempt, hideHints = false, taskCode}) {
  const { code, setCode } = useCode();

  const editorRef = useRef(null);
  const containerRef = useRef(null);
  const zonesRef = useRef(new Map());
  const decorationsRef = useRef([]);

  const monaco = useMonaco();

  const [localAnalysis, setLocalAnalysis] = useState([]);

  // -----------------------------
  // 🔹 Resize
  // -----------------------------
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver(() => {
      editorRef.current?.layout();
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // -----------------------------
  // 🔹 HISTORY (attempt)
  // -----------------------------
  useEffect(() => {
    if (mode !== "history") return;
    if (!attempt?.analysis) return;

    const recommendations = attempt.analysis.recommendations || [];

    const mapped = recommendations.map((msg, i) => ({
      line: i + 1,
      type: 'recommendation',
      message: msg,
      confidence: 1
    }));

    console.log("📜 HISTORY RECOMMENDATIONS", mapped);

    setLocalAnalysis(mapped);

  }, [mode, attempt?.analysis]); // 🔥 важно!

  // -----------------------------
  // 🔹 LIVE (WebSocket)
  // -----------------------------
  useEffect(() => {
    if (mode === "history") return;

    if (Array.isArray(analysis)) {
      setLocalAnalysis(analysis);
    }

  }, [analysis, mode]);

  // -----------------------------
  // 🔹 Editor mount
  // -----------------------------
  const handleMount = (editor) => {
    editorRef.current = editor;
  };

  // -----------------------------
  // 🔹 Render analysis
  // -----------------------------
  
  useEffect(() => {
    if (!editorRef.current || !monaco) return;

    const editor = editorRef.current;

    // 🔥 ВСЕГДА очищаем сначала
    editor.changeViewZones((accessor) => {
      zonesRef.current.forEach(({ zoneId }) => accessor.removeZone(zoneId));
      zonesRef.current.clear();
    });

    decorationsRef.current = editor.deltaDecorations(
      decorationsRef.current,
      []
    );

    // ❗ если скрыто — просто выходим
    if (hideHints) return;

    const filtered = localAnalysis.filter(a => a.confidence > 0);

    // 🔥 добавляем зоны заново
    editor.changeViewZones((accessor) => {
      filtered.forEach((item) => {
        const domNode = document.createElement("div");

        domNode.style.padding = "4px 8px";
        domNode.style.fontSize = "12px";
        domNode.style.background = "rgba(255,255,255,0.04)";
        domNode.style.borderLeft = `3px solid #688BFF`;
        domNode.style.color = "#688BFF";
        domNode.className = "ai-zone";
        domNode.textContent = `AI: ${item.message}`;

        const zoneId = accessor.addZone({
          afterLineNumber: item.line,
          heightInLines: 2,
          domNode,
        });

        zonesRef.current.set(item.line, { zoneId });
      });
    });

    // 🔥 добавляем decorations заново (без старых ID)
    decorationsRef.current = editor.deltaDecorations(
      [],
      filtered.map((item) => ({
        range: new monaco.Range(item.line, 1, item.line, 1),
        options: {
          isWholeLine: true,
          className: "ai-line-yellow",
          linesDecorationsClassName: "ai-gutter-yellow"
        }
      }))
    );

  }, [localAnalysis, monaco, hideHints]);

  // -----------------------------
  // 🔹 Theme
  // -----------------------------
  useEffect(() => {
    if (!monaco) return;

    monaco.editor.defineTheme("custom-dark", {
      base: "vs-dark",
      inherit: true,
      rules: [],
      colors: {
        "editor.background": "#1B1C1E"
      },
    });

    monaco.editor.setTheme("custom-dark");

  }, [monaco]);

  // -----------------------------
  return (
    <div ref={containerRef} style={{ height: "57.5vh", width: "100%", marginTop: "10px" }}>
      <Editor
        height="100%"
        language="python"
        theme="custom-dark"
        value={code}
        options={{
          minimap: { enabled: false },
          fontSize: 12,
          lineHeight: 20,
          readOnly: mode === "history"
        }}
        onMount={(editor) => {
          handleMount(editor);
          //if (!code) setCode(defaultCode);
          if (!code) {
              setCode(taskCode ? taskCode : defaultCode);
          }
        }}
        onChange={(value) => setCode(value || "")}
      />
    </div>
  );
}*/}

import { useCode } from './CodeContext';
import { useState, useRef, useEffect } from "react";
import Editor, { useMonaco } from "@monaco-editor/react";
import "./ai.css";

const defaultCode = `def factorial(n):
if n == 0:
return 1
return n * factorial(n - 1)
result = factorial(5)
print(result)`;

export default function CodeEditor({
  analysis = [],
  mode,
  attempt,
  hideHints = false,
  taskCode,
  isSidebarOpen // 🔥 НОВОЕ
}) {
  const { code, setCode } = useCode();

  const editorRef = useRef(null);
  const containerRef = useRef(null);

  const monaco = useMonaco();

  const [localAnalysis, setLocalAnalysis] = useState([]);

  // -----------------------------
  // 🔥 ЖЁСТКИЙ resize (главный фикс)
  // -----------------------------
  const resizeEditor = () => {
    if (!editorRef.current || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();

    editorRef.current.layout({
      width: rect.width,
      height: rect.height
    });
  };

  // -----------------------------
  // 🔹 ResizeObserver
  // -----------------------------
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver(() => {
      resizeEditor();
    });

    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, []);

  // -----------------------------
  // 🔥 РЕАКЦИЯ НА САЙДБАР
  // -----------------------------
  /*useEffect(() => {
    const timeout = setTimeout(() => {
      resizeEditor();
    }, 80); // 🔥 важно: ждём перестроение DOM

    return () => clearTimeout(timeout);
  }, [isSidebarOpen]);*/

  // -----------------------------
  // 🔹 HISTORY
  // -----------------------------
  useEffect(() => {
    if (mode !== "history") return;
    if (!attempt?.analysis) return;

    const recommendations = attempt.analysis.recommendations || [];

    const mapped = recommendations.map((msg, i) => ({
      line: i + 1,
      type: 'recommendation',
      message: msg,
      confidence: 1
    }));

    setLocalAnalysis(mapped);

  }, [mode, attempt?.analysis]);

  // -----------------------------
  // 🔹 LIVE
  // -----------------------------
  useEffect(() => {
    if (mode === "history") return;

    if (Array.isArray(analysis)) {
      setLocalAnalysis(analysis);
    }

  }, [analysis, mode]);

  // -----------------------------
  // 🔹 Editor mount
  // -----------------------------
  const handleMount = (editor) => {
    editorRef.current = editor;

    // 🔥 сразу делаем layout
    setTimeout(resizeEditor, 0);

    if (!code) {
      setCode(taskCode ? taskCode : defaultCode);
    }
  };

  // -----------------------------
  // 🔹 Theme
  // -----------------------------
  useEffect(() => {
    if (!monaco) return;

    monaco.editor.defineTheme("custom-dark", {
      base: "vs-dark",
      inherit: true,
      rules: [],
      colors: {
        "editor.background": "#1E1F21"
      },
    });

    monaco.editor.setTheme("custom-dark");

  }, [monaco]);

  // -----------------------------
  // 🔹 Render
  // -----------------------------
  return (
    <div className="editor-wrapper">
      <div ref={containerRef} className="editor-container">
        <Editor
          height="100%"
          width="100%"
          language="python"
          theme="custom-dark"
          value={code}
          options={{
            minimap: { enabled: false },
            fontSize: 12,
            lineHeight: 20,
            readOnly: mode === "history"
          }}
          onMount={handleMount}
          //onChange={(value) => setCode(value || "")}
          onChange={(value) => {
            if (mode === "history") return; // 🔥 блокируем изменения
            setCode(value || "");
          }}
        />
      </div>
    </div>
  );
}

{/*import { useCode } from './CodeContext';
import { useState, useRef, useEffect } from "react";
import Editor, { useMonaco } from "@monaco-editor/react";
import "./ai.css";

const defaultCode = `def factorial(n):
if n == 0:
return 1
return n * factorial(n - 1)
result = factorial(5)
print(result)`;

export default function CodeEditor({ analysis = [], mode, attempt, hideHints = false, taskCode }) {
  const { code, setCode } = useCode();

  const editorRef = useRef(null);
  const containerRef = useRef(null);

  const monaco = useMonaco();

  const [localAnalysis, setLocalAnalysis] = useState([]);

  // -----------------------------
  // 🔹 Resize (фикс)
  // -----------------------------
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver(() => {
      if (editorRef.current) {
        editorRef.current.layout();
      }
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // -----------------------------
  // 🔹 HISTORY (attempt)
  // -----------------------------
  useEffect(() => {
    if (mode !== "history") return;
    if (!attempt?.analysis) return;

    const recommendations = attempt.analysis.recommendations || [];

    const mapped = recommendations.map((msg, i) => ({
      line: i + 1,
      type: 'recommendation',
      message: msg,
      confidence: 1
    }));

    console.log("📜 HISTORY RECOMMENDATIONS", mapped);

    setLocalAnalysis(mapped);

  }, [mode, attempt?.analysis]);

  // -----------------------------
  // 🔹 LIVE (WebSocket)
  // -----------------------------
  useEffect(() => {
    if (mode === "history") return;

    if (Array.isArray(analysis)) {
      setLocalAnalysis(analysis);
    }

  }, [analysis, mode]);

  // -----------------------------
  // 🔹 Editor mount
  // -----------------------------
  const handleMount = (editor) => {
    editorRef.current = editor;
  };

  // -----------------------------
  // 🔹 Theme
  // -----------------------------
  useEffect(() => {
    if (!monaco) return;

    monaco.editor.defineTheme("custom-dark", {
      base: "vs-dark",
      inherit: true,
      rules: [],
      colors: {
        "editor.background": "#1B1C1E"
      },
    });

    monaco.editor.setTheme("custom-dark");

  }, [monaco]);

  // -----------------------------
  // 🔹 Render
  // -----------------------------
  return (
    <div className="editor-wrapper">
      <div ref={containerRef} className="editor-container">
        <Editor
          height="100%"
          width="100%"
          language="python"
          theme="custom-dark"
          value={code}
          options={{
            minimap: { enabled: false },
            fontSize: 12,
            lineHeight: 20,
            readOnly: mode === "history"
          }}
          onMount={(editor) => {
            handleMount(editor);

            if (!code) {
              setCode(taskCode ? taskCode : defaultCode);
            }
          }}
          onChange={(value) => setCode(value || "")}
        />
      </div>
    </div>
  );
}*/}