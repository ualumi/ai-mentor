

import CodeEditor from "../CodeEditor";
import s from "./FreeMode.module.css"
import Item from "./Item";
import Terminal from "./Terminal";
import { Terminal as Therminal, Lightbulb, Paperclip } from 'lucide-react';
import { useState } from "react";
import ToggleButton from "./ToggleButton";

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CodeProvider } from '../CodeContext';
import SubmitCodeButton from '../SubmitCodeButton';
import ExecutionResult from '../ExecutionResult';
import { wsService } from '../../services/websocket';
import { useEffect } from 'react';
import Actionpanel from './Actionpanel'
import { RunCodeButton } from "../RunCodeSutton";
import ProgressBar from "../modules/module/ProgressBar";
import ModuleTask from "../modules/module/ModuleTask";


{/*export default function SandBox({mode, name}) {
    const [isTerminalOpen, setIsTerminalOpen] = useState(false);
    const handleToggle = () => {
        setIsTerminalOpen(!isTerminalOpen);
    };
    const [analysis, setAnalysis] = useState([]);

    useEffect(() => { 
      const handler = (data) => {
        console.log("WS MESSAGE:", data);

        // ✅ Аннотации кода
        if (
          data.source?.startsWith("code_annotations") &&
          data.data?.annotations
        ) {
          const newAnnotations = data.data.annotations;

          setAnalysis(prev => {
            // фильтруем, чтобы не добавлять дубли
            const filtered = newAnnotations.filter(
              ann => !prev.some(p => p.id === ann.id) // предполагаем, что у каждой аннотации есть уникальный id
            );

            // если новых аннотаций нет — возвращаем старое состояние
            if (filtered.length === 0) return prev;

            return [...prev, ...filtered];
          });
        }
      };

      wsService.on("code_annotations", handler);

      return () => {
        wsService.off("code_annotations", handler);
      };
    }, []);
  return (
    <section className={s["section-sandbox"]}>
        {mode === "free" && <h1 className={s["section-caption"]}>Free mode</h1>}
        {mode === "module" && 
          <div className="progress">
            
            <h1 className={s["section-caption-module"]}>{name}</h1>
            <div className="progress-info">
              <span className="progress-item-text">Прогресс по модулю: </span>
              <ProgressBar progress={15} />
            </div>
            
          </div>
        }
        
        <div className={s["section-panel"]}>
            
            <div className={s["section-panel-main"]}>
              
              {mode === "free" && <Item type="text_item" clas="item-light icon-only" icon={<Paperclip strokeWidth={1} />}/>}
              
              
              <SubmitCodeButton></SubmitCodeButton>
            </div>
            
            <RunCodeButton className="item-light"></RunCodeButton>
        </div>
        <div className="editor">
            <CodeEditor analysis={analysis}></CodeEditor>
            {mode === "free" && <Terminal isOpen={isTerminalOpen} onToggle={handleToggle}></Terminal>}
            {mode === "module" && <Terminal isOpen={isTerminalOpen} onToggle={handleToggle}></Terminal>}
            
            
        </div>
        
    </section>
  );
}*/}

export default function SandBox({ mode, name, attempt, restoredState, code, titletask, isSidebarOpen, selectedAttemptId}) {
  const [hideHints, setHideHints] = useState(false);
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [analysis, setAnalysis] = useState([]);

  // 🔥 если есть восстановленное состояние
  useEffect(() => {
    if (!restoredState) return;

    console.log("♻️ restoring state", restoredState);

    // пример:
    if (restoredState.attempts) {
      setAnalysis(restoredState.attempts);
    }

  }, [restoredState]);
  const competency = restoredState?.session?.competency;

  const progress = restoredState?.progress;

  // 🔥 последняя попытка
  const lastAttempt = restoredState?.attempts?.length
    ? restoredState.attempts[restoredState.attempts.length - 1]
    : null;

  const restoredCode = lastAttempt?.code;


  const handleToggle = () => {
    setIsTerminalOpen(!isTerminalOpen);
  };

  // 🔥 WebSocket только НЕ для history
  useEffect(() => {
    if (mode === "history") return;

    const handler = (data) => {
      if (
        data.source?.startsWith("code_annotations") &&
        data.data?.annotations
      ) {
        const newAnnotations = data.data.annotations;

        setAnalysis(prev => {
          const filtered = newAnnotations.filter(
            ann => !prev.some(p => p.id === ann.id)
          );

          if (filtered.length === 0) return prev;

          return [...prev, ...filtered];
        });
      }
    };

    wsService.on("code_annotations", handler);

    return () => {
      wsService.off("code_annotations", handler);
    };
  }, [mode]);

  return (
    <section className={s["section-sandbox"]}>

      {/* 🔥 HEADER */}
      {/*{mode === "free" && <h1 className={s["section-caption"]}>Самостоятельная практика</h1>}
      {mode === "free" && (
          titletask 
              ? <h1 className={s["section-caption"]}>Задача: {titletask}</h1>
              : <h1 className={s["section-caption"]}></h1>
      )}

      {mode === "module" && (
        <div className={s["progress"]}>
          
          <h1 className={s["section-caption-module"]}>
            Модуль: <span className={s["section-caption-module-name"]}>{competency || name}</span>
          </h1>
          <div className="progress-info">
            
            <ProgressBar progress={restoredState?.attempts?.length || 0} />
          </div>
        </div>
      )}

      {mode === "history" && (
        <h1 className={s["section-caption"]}>История попытки</h1>
      )}*/}

      {/*{mode === "module" && <div className="module-task-header">
        <ModuleTask />
      </div>}
      {/* 🔥 PANEL */}
      <div className={s["section-panel"]}>
        <div className={s["section-panel-main"]}>

          {/*{mode === "free" && (
            <Item type="text_item" clas="item-light icon-only" icon={<Paperclip strokeWidth={1} />} />
          )}*/}
          

          {/* ❌ отключаем submit в history */}
          {mode !== "history" && <SubmitCodeButton />}
          {/*<button
            onClick={() => setHideHints(prev => !prev)}
            className="item item-light"
          >
            {hideHints ? "Показать подсказки" : "Скрыть подсказки"}
          </button>*/}
          {mode !== "history" && (
            <RunCodeButton className="item-light" />
          )}

        </div>

        

        {/* ❌ отключаем run в history */}
        
      </div>

      {/* 🔥 EDITOR */}
      <div className="editor">
        <CodeEditor
          mode={mode}
          attempt={attempt}
          analysis={analysis}  //для free/module
          hideHints={hideHints} 
          taskCode={code}
          key={isSidebarOpen ? "open" : "closed"}
          restoredState={restoredState}
        />


        <Terminal
          isOpen={isTerminalOpen}
          onToggle={handleToggle}
          readOnly={mode === "history"}
        />
      </div>

      {/* 🔥 ДОП. ИНФА ИЗ ATTEMPT */}
      {/*{mode === "history" && attempt && (
        <div className={s["history-info"]}>
          <div>
            <h3>Оценка</h3>
            <p>{attempt.total_score}</p>
          </div>

          <div>
            <h3>Результат</h3>
            <p>{attempt.is_correct ? "✅ Верно" : "❌ Ошибка"}</p>
          </div>

        </div>
      )}*/}

    </section>
  );
}
