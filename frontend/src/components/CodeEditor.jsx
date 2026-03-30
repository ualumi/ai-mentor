

{/*import { useExecuteCode } from '../hooks/useCodeExecution';
import { useCode } from './CodeContext';
import { useState } from "react";
import "./ai.css";


const defaultCode = `import numpy as np
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import silhouette_score
import matplotlib.pyplot as plt

def cluster_data(data, n_clusters):
    scaler = StandardScaler()
    scaled = scaler.fit_transform(data)

    best_score = -1
    best_model = None

    for k in range(2, n_clusters + 1):
        model = KMeans(n_clusters=k)
        labels = model.fit_predict(scaled)

        score = silhouette_score(scaled, labels)

        if score > best_score:
            best_score = score
            best_model = model
    plt.scatter(scaled[:, 0], scaled[:, 1], c=best_model.labels_)
    plt.show()

    return best_model, scaler
`;

import { useRef, useEffect } from "react";
import Editor from "@monaco-editor/react";
import { useMonaco } from "@monaco-editor/react";
import "./ai.css";

export default function CodeEditor({ analysis = [], mode, attempt }) {
  const { code, setCode } = useCode();
  const editorRef = useRef(null);
  const containerRef = useRef(null);
  const zonesRef = useRef(new Map());
  const decorationsRef = useRef([]);
  const monaco = useMonaco();

  const [localAnalysis, setLocalAnalysis] = useState([]);

  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver(() => {
      if (editorRef.current) {
        requestAnimationFrame(() => {
          editorRef.current.layout();
        });
      }
    });

    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      editorRef.current?.layout();
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 🔹 синхронизация анализа
  useEffect(() => {
    if (mode === 'history' && attempt?.analysis) {
      // преобразуем под формат CodeEditor
      const mapped = [
        ...(attempt.analysis.strengths || []).map((msg, i) => ({
          line: i + 1,
          type: 'strength',
          message: msg,
          confidence: 1
        })),
        ...(attempt.analysis.weaknesses || []).map((msg, i) => ({
          line: i + 1,
          type: 'weakness',
          message: msg,
          confidence: 1
        })),
        ...(attempt.analysis.recommendations || []).map((msg, i) => ({
          line: i + 1,
          type: 'recommendation',
          message: msg,
          confidence: 1
        }))
      ];
      setLocalAnalysis(mapped);
      console.log(mapped)
    } else if (Array.isArray(analysis)) {
      setLocalAnalysis(analysis);
    } else {
      setLocalAnalysis([]);
    }
    
  }, [analysis, mode, attempt]);
  



  const handleMount = (editor) => {
    editorRef.current = editor;
  };

  useEffect(() => {
    if (!editorRef.current || !monaco) return;

    const editor = editorRef.current;
    const filteredAnalysis = localAnalysis.filter(item => item.confidence > 0.4);

    editor.changeViewZones((accessor) => {
      zonesRef.current.forEach(({ zoneId }) => accessor.removeZone(zoneId));
      zonesRef.current.clear();

      filteredAnalysis.forEach((item) => {
        const domNode = document.createElement("div");
        domNode.style.padding = "4px 8px";
        domNode.style.fontSize = "12px";
        domNode.style.background = "rgba(255,255,255,0.04)";
        let borderColor = "#6F90FF";
        if (item.type === "strength") borderColor = "#4CAF50";
        if (item.type === "recommendation") borderColor = "#FFC107";
        if (item.type === "weakness") borderColor = "#F44336";
        domNode.style.borderLeft = `3px solid ${borderColor}`;
        domNode.style.color = borderColor;
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

    decorationsRef.current = editor.deltaDecorations(
      decorationsRef.current,
      filteredAnalysis.map((item) => {
        let className = "", gutterClass = "";
        if (item.type === "strength") { className = "ai-line-green"; gutterClass = "ai-gutter-green"; }
        if (item.type === "recommendation") { className = "ai-line-yellow"; gutterClass = "ai-gutter-yellow"; }
        if (item.type === "weakness") { className = "ai-line-red"; gutterClass = "ai-gutter-red"; }
        return {
          range: new monaco.Range(item.line, 1, item.line, 1),
          options: { isWholeLine: true, className, linesDecorationsClassName: gutterClass }
        };
      })
    );

  }, [localAnalysis, monaco]);

  useEffect(() => {
    if (!monaco) return;
    monaco.editor.defineTheme("custom-dark", {
      base: "vs-dark",
      inherit: true,
      rules: [],
      colors: { "editor.background": "#202123" },
    });
    monaco.editor.setTheme("custom-dark");
  }, [monaco]);

  return (
    <div ref={containerRef} style={{ height: "57.5vh", width: "100%", minWidth: 0}}>
      <Editor
        height="100%"
        language="python"
        theme="custom-dark"
        value={code}
        options={{
          minimap: { enabled: false },
          fontSize: 12,
          automaticLayout: true,
          padding: { top: 15 },
          lineHeight: 20,
          readOnly: false // можешь добавить readOnly={mode==='history'} из SandBox
        }}
        onMount={(editor) => {
          handleMount(editor);
          if (!code) setCode(defaultCode);
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

const defaultCode = `import numpy as np
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import silhouette_score
import matplotlib.pyplot as plt

def cluster_data(data, n_clusters):
    scaler = StandardScaler()
    scaled = scaler.fit_transform(data)

    best_score = -1
    best_model = None

    for k in range(2, n_clusters + 1):
        model = KMeans(n_clusters=k)
        labels = model.fit_predict(scaled)

        score = silhouette_score(scaled, labels)

        if score > best_score:
            best_score = score
            best_model = model
    plt.scatter(scaled[:, 0], scaled[:, 1], c=best_model.labels_)
    plt.show()

    return best_model, scaler`;

export default function CodeEditor({ analysis = [], mode, attempt }) {
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
    const filtered = localAnalysis.filter(a => a.confidence > 0.4);

    editor.changeViewZones((accessor) => {
      zonesRef.current.forEach(({ zoneId }) => accessor.removeZone(zoneId));
      zonesRef.current.clear();

      filtered.forEach((item) => {
        const domNode = document.createElement("div");

        domNode.style.padding = "4px 8px";
        domNode.style.fontSize = "12px";
        domNode.style.background = "rgba(255,255,255,0.04)";
        domNode.style.borderLeft = `3px solid #FFC107`;
        domNode.style.color = "#FFC107";
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

    decorationsRef.current = editor.deltaDecorations(
      decorationsRef.current,
      filtered.map((item) => ({
        range: new monaco.Range(item.line, 1, item.line, 1),
        options: {
          isWholeLine: true,
          className: "ai-line-yellow",
          linesDecorationsClassName: "ai-gutter-yellow"
        }
      }))
    );

  }, [localAnalysis, monaco]);

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
  return (
    <div ref={containerRef} style={{ height: "57.5vh", width: "100%" }}>
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
          if (!code) setCode(defaultCode);
        }}
        onChange={(value) => setCode(value || "")}
      />
    </div>
  );
}