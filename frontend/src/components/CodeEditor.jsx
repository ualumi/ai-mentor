

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
        "editor.background": "#202123"
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
}*/}

import { useCode } from './CodeContext';
import { useState, useRef, useEffect } from "react";
import Editor, { useMonaco } from "@monaco-editor/react";
import { wsService } from "../services/websocket"; // ✅ ДОБАВИЛИ
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
  isSidebarOpen,
  restoredState // ✅ оставили только его
}) {
  const { code, setCode } = useCode();

  const editorRef = useRef(null);
  const containerRef = useRef(null);

  const monaco = useMonaco();

  const [localAnalysis, setLocalAnalysis] = useState([]);

  // -----------------------------
  // 🔥 CONDITION (как в ModuleTask)
  // -----------------------------
  const getRestoredCondition = () => {
    if (!restoredState) return null;

    const raw = restoredState.current_condition;
    if (!raw) return null;

    if (typeof raw === "string") {
      try {
        return JSON.parse(raw);
      } catch {
        return raw;
      }
    }

    return raw;
  };

  const normalizeCondition = (raw) => {
    if (!raw) return null;

    if (Array.isArray(raw)) {
      return raw[0];
    }

    return raw;
  };

  const [condition, setCondition] = useState(() =>
    normalizeCondition(getRestoredCondition())
  );

  // -----------------------------
  // 🔥 WS (как в ModuleTask)
  // -----------------------------
  useEffect(() => {
    if (mode === "history") return;

    const handler = (data) => {
      if (!data?.condition) return;
      setCondition(normalizeCondition(data.condition));
    };

    wsService.on("task_condition", handler);

    return () => {
      wsService.off("task_condition", handler);
    };
  }, [mode]);

  // -----------------------------
  // 🔥 обновление из restoredState
  // -----------------------------
  useEffect(() => {
    const restored = normalizeCondition(getRestoredCondition());
    if (restored) {
      setCondition(restored);
    }
  }, [restoredState]);

  // -----------------------------
  // 🔥 ДОСТАЁМ broken_code
  // -----------------------------
  const getInitialCodeFromCondition = () => {
    if (mode !== "module") return null;
    if (!condition) return null;

    if (
      condition.description &&
      typeof condition.description === "object"
    ) {
      return condition.description.broken_code || null;
    }

    if (condition.broken_code) {
      return condition.broken_code;
    }

    return null;
  };

  // -----------------------------
  // 🔥 ЖЁСТКИЙ resize
  // -----------------------------
  const resizeEditor = () => {
    if (!editorRef.current || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();

    editorRef.current.layout({
      width: rect.width,
      height: rect.height
    });
  };

  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver(() => {
      resizeEditor();
    });

    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, []);

  // -----------------------------
  // 🔹 HISTORY (НЕ ТРОГАЕМ)
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
  // 🔹 LIVE (НЕ ТРОГАЕМ)
  // -----------------------------
  useEffect(() => {
    if (mode === "history") return;

    if (Array.isArray(analysis)) {
      setLocalAnalysis(analysis);
    }

  }, [analysis, mode]);

  // -----------------------------
  // 🔥 РЕАКТИВНОЕ ОБНОВЛЕНИЕ КОДА
  // -----------------------------
  useEffect(() => {
    if (mode !== "module") return;

    const newCode = getInitialCodeFromCondition();

    if (newCode) {
      setCode(newCode);
    }
  }, [condition, mode]);

  // -----------------------------
  // 🔹 Editor mount
  // -----------------------------
  const handleMount = (editor) => {
    editorRef.current = editor;

    setTimeout(resizeEditor, 0);

    if (!code) {
      const conditionCode = getInitialCodeFromCondition();

      setCode(
        conditionCode ||
        taskCode ||
        defaultCode
      );
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
        "editor.background": "#202123"
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
          onChange={(value) => {
            if (mode === "history") return;
            setCode(value || "");
          }}
        />
      </div>
    </div>
  );
}
