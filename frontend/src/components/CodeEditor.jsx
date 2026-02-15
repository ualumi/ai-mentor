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
import { useRef } from "react";
import Editor from "@monaco-editor/react";
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

export default function CodeEditor() {
  const editorRef = useRef(null);

  const handleMount = (editor, monaco) => {
    editorRef.current = editor;

    analysis.forEach((item, index) => {
      const domNode = document.createElement("div");
      domNode.className = `ai-inline-card ${item.type} fade-in`;
      domNode.innerHTML = `
        <div class="ai-inline-header">
          ${item.type.toUpperCase()} • confidence ${item.confidence}
        </div>
        <div>${item.message}</div>
      `;

      const widget = {
        getId: () => `ai.widget.${index}`,
        getDomNode: () => domNode,
        getPosition: () => ({
          position: {
            lineNumber: item.line,
            column: 1,
          },
          preference: [
            monaco.editor.ContentWidgetPositionPreference.BELOW,
          ],
        }),
      };

      editor.addContentWidget(widget);
    });
  };

  return (
    <Editor
      height="80vh"
      defaultLanguage="python"
      defaultValue={defaultCode}
      theme="vs-dark"
      onMount={handleMount}
      options={{
        minimap: { enabled: false },
        fontSize: 15,
        lineHeight: 22,
        automaticLayout: true,
      }}
    />
  );
}

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

{/*import { useExecuteCode } from '../hooks/useCodeExecution';
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
}
*/}
