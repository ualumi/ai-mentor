
{/*import { useExecuteCode } from '../hooks/useCodeExecution';
import { useCode } from './CodeContext';
import { useRef, useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import "./ai.css"
import { useMonaco } from "@monaco-editor/react";

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

const analysis = [
  {
    line: 4,
    type: "strength",
    message:
      "Использование silhouette_score — объективная метрика качества кластеризации",
    confidence: 0.542,
  },
  {
    line: 26,
    type: "strength",
    message:
      "Возврат обученного scaler позволяет корректно трансформировать новые данные",
    confidence: 0.455,
  },
  {
    line: 23,
    type: "weakness",
    message: "Визуализация использует только первые 2 признака",
    confidence: 0.516,
  },
  {
    line: 18,
    type: "weakness",
    message: "Нет обработки случая одинаковых silhouette scores",
    confidence: 0.51,
  },
  {
    line: 17,
    type: "recommendation",
    message: "Добавить вывод размеров кластеров: np.bincount(...)",
    confidence: 0.516,
  },
];


export default function CodeEditor({ analysys }) {
  const editorRef = useRef(null);
  const overlayRef = useRef(null);

  const handleMount = (editor, monaco) => {
    editorRef.current = editor;

    const renderCards = () => {
      const overlay = overlayRef.current;
      if (!overlay) return;

      overlay.innerHTML = "";

      const scrollTop = editor.getScrollTop();

      analysis.forEach((item) => {
        const top =
          editor.getTopForLineNumber(item.line) - scrollTop;

        const card = document.createElement("div");
        card.className = `ai-inline-card ${item.type}`;
        card.style.position = "absolute";
        card.style.top = `${top}px`;
        card.style.right = "99%";
        card.style.width = "225px";
        card.style.pointerEvents = "auto";

        card.innerHTML = `
          <div class="ai-inline-header">
            ${item.type.toUpperCase()}
          </div>
          <div>${item.message}</div>
        `;

        overlay.appendChild(card);
      });
    };

    renderCards();

    editor.onDidScrollChange(() => {
      requestAnimationFrame(renderCards);
    });

    editor.onDidChangeModelContent(renderCards);
  };

  // ⭐ Создаем кастомную тему с фоном #1C1D25
  const monaco = useMonaco();

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

  return (
    <div className="editor-wrapper">
      <Editor
        height="52vh"
        language="python"
        options={{
          minimap: { enabled: false }
        }}
        theme="custom-dark"
        defaultLanguage="python"
        defaultValue={defaultCode}
        onMount={handleMount}
        onChange={(value) => setCode(value ?? "")}
      />
      <div className="ai-overlay" ref={overlayRef}></div>
    </div>
  );
}*/}

{/*import { useRef, useEffect } from "react";
import Editor from "@monaco-editor/react";
import { useMonaco } from "@monaco-editor/react";
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

const analysis = [
  { line: 4, type: "strength", message: "Использование silhouette_score — объективная метрика качества кластеризации" },
  { line: 26, type: "strength", message: "Возврат обученного scaler позволяет корректно трансформировать новые данные" },
  { line: 23, type: "weakness", message: "Визуализация использует только первые 2 признака" },
  { line: 18, type: "weakness", message: "Нет обработки случая одинаковых silhouette scores" },
  { line: 17, type: "recommendation", message: "Добавить вывод размеров кластеров: np.bincount(...)" },
];

export default function CodeEditor({ analysys }) {
  const editorRef = useRef(null);
  const zonesRef = useRef(new Map());
  const decorationsRef = useRef([]);
  const monaco = useMonaco();

  const handleMount = (editor, monacoInstance) => {
    editorRef.current = editor;

    // используем monacoInstance вместо useMonaco
    decorationsRef.current = editor.deltaDecorations([], 
      analysis.map(item => ({
        range: new monacoInstance.Range(item.line, 1, item.line, 1),
        options: {
          isWholeLine: true,
          className: "ai-active-line",
          linesDecorationsClassName: "ai-gutter-line",
        }
      }))
    );

    editor.changeViewZones((accessor) => {
      analysis.forEach((item) => {
        const domNode = document.createElement("div");
        domNode.className = `ai-inline-card ${item.type}`;
        domNode.style.display = "block"; 
        domNode.style.marginTop = "4px";
        domNode.style.padding = "8px";
        domNode.style.backgroundColor = "#1c1d25";
        domNode.style.borderRadius = "6px";
        domNode.style.color = "#fff";
        domNode.style.position = "relative";

        domNode.innerHTML = `
          <div class="ai-inline-header">${item.type.toUpperCase()}</div>
          <div>${item.message}</div>
        `;

        accessor.addZone({
          afterLineNumber: item.line,
          heightInLines: 3,
          domNode: domNode,
        });

        zonesRef.current.set(item.line, domNode);
      });
    });
  };

  useEffect(() => {
    if (!monaco) return;

    monaco.editor.defineTheme("custom-dark", {
      base: "vs-dark",
      inherit: true,
      rules: [],
      colors: { "editor.background": "#00000000" },
    });
    monaco.editor.setTheme("custom-dark");
  }, [monaco]);

  return (
    <Editor
      height="52vh"
      language="python"
      theme="custom-dark"
      defaultValue={defaultCode}
      options={{ minimap: { enabled: false } }}
      onMount={handleMount}
    />
  );
}*/}

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

export default function CodeEditor({ analysis = [] }) {
  console.log({ analysis });

  const editorRef = useRef(null);
  //const zonesRef = useRef([]);
  const zonesRef = useRef(new Map());
  const decorationsRef = useRef([]);
  const monaco = useMonaco();

  const handleMount = (editor, monacoInstance) => {
    editorRef.current = editor;
  };

  // 🔥 Главный эффект — реагирует на изменение analysis

useEffect(() => {
  if (!editorRef.current || !monaco) return;

  const editor = editorRef.current;

  const filteredAnalysis = analysis.filter(
    (item) => item.confidence > 0.5
  );

  editor.changeViewZones((accessor) => {

    // Удаляем старые зоны полностью
    zonesRef.current.forEach(({ zoneId }) => {
      accessor.removeZone(zoneId);
    });

    zonesRef.current.clear();

    // Добавляем простые текстовые зоны
    filteredAnalysis.forEach((item) => {

      const domNode = document.createElement("div");

      // ❗ максимально простой DOM
      domNode.style.padding = "4px 8px";
      domNode.style.fontSize = "13px";
      domNode.style.color = "#9cdcfe";
      domNode.style.background = "rgba(255,255,255,0.04)";
      domNode.style.borderLeft = "3px solid #4fc1ff";

      domNode.textContent = `AI: ${item.message}`;

      const zoneId = accessor.addZone({
        afterLineNumber: item.line,
        heightInLines: 2,
        domNode,
      });

      zonesRef.current.set(item.line, { zoneId });
    });

  });

}, [analysis, monaco]);

  useEffect(() => {
    if (!monaco) return;

    monaco.editor.defineTheme("custom-dark", {
      base: "vs-dark",
      inherit: true,
      rules: [],
      colors: { "editor.background": "#00000000" },
    });

    monaco.editor.setTheme("custom-dark");
  }, [monaco]);

  return (
    <Editor
      height="52vh"
      language="python"
      theme="custom-dark"
      defaultValue={defaultCode}
      options={{ minimap: { enabled: false } }}
      onMount={handleMount}
    />
  );
}*/}

import { useExecuteCode } from '../hooks/useCodeExecution';
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

export default function CodeEditor({ analysis = [] }) {
  console.log({ analysis });

  const editorRef = useRef(null);
  const zonesRef = useRef(new Map());
  const decorationsRef = useRef([]);
  const monaco = useMonaco();

  const handleMount = (editor) => {
    editorRef.current = editor;
  };

  useEffect(() => {
    if (!editorRef.current || !monaco) return;

    const editor = editorRef.current;

    const filteredAnalysis = analysis.filter(
      (item) => item.confidence > 0.5
    );

    // ---------------- VIEW ZONES ----------------
    editor.changeViewZones((accessor) => {

      zonesRef.current.forEach(({ zoneId }) => {
        accessor.removeZone(zoneId);
      });

      zonesRef.current.clear();

      filteredAnalysis.forEach((item) => {

        const domNode = document.createElement("div");

        domNode.style.padding = "4px 8px";
        domNode.style.fontSize = "13px";
        domNode.style.background = "rgba(255,255,255,0.04)";

        // цвет полоски слева
        let borderColor = "#4fc1ff";

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

    // ---------------- DECORATIONS ----------------
    decorationsRef.current = editor.deltaDecorations(
      decorationsRef.current,
      filteredAnalysis.map((item) => {

        let className = "";
        let gutterClass = "";

        if (item.type === "strength") {
          className = "ai-line-green";
          gutterClass = "ai-gutter-green";
        }

        if (item.type === "recommendation") {
          className = "ai-line-yellow";
          gutterClass = "ai-gutter-yellow";
        }

        if (item.type === "weakness") {
          className = "ai-line-red";
          gutterClass = "ai-gutter-red";
        }

        return {
          range: new monaco.Range(item.line, 1, item.line, 1),
          options: {
            isWholeLine: true,
            className: className,
            linesDecorationsClassName: gutterClass,
          },
        };
      })
    );

  }, [analysis, monaco]);

  useEffect(() => {
    if (!monaco) return;

    monaco.editor.defineTheme("custom-dark", {
      base: "vs-dark",
      inherit: true,
      rules: [],
      colors: { "editor.background": "#00000000" },
    });

    monaco.editor.setTheme("custom-dark");
  }, [monaco]);

  return (
    <Editor
      height="57.5vh"
      language="python"
      theme="custom-dark"
      defaultValue={defaultCode}
      options={{
            minimap: { enabled: false },
            fontSize: 15,
            automaticLayout: true,
            padding: { top: 15 },
            lineHeight: 20,
          }}
      onMount={handleMount}
    />
  );
}

{/*import { useExecuteCode } from '../hooks/useCodeExecution';
import { useCode } from './CodeContext';
import "./ai.css"
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
    </>
  );
}*/}
