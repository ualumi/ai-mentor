{/*import Modules from "../modules/Modules";
import Item from "../mentor/Item";
import AttemptsHistory from './AttemptsHistory';
import { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { Plus} from 'lucide-react';
import s from "../mentor/FreeMode.module.css"
import ProgressBar from "../modules/module/ProgressBar";
import TasksPanel from "../modules/TasksPanel";
import Module from "../modules/module/Module";
import ModuleTask from "../modules/module/ModuleTask";
import { useEffect } from "react";
import HistoryTaskViewer from "./HistoryTaskViewer";

export default function History({mode, name, attempt, restoredState, code, titletask, isSidebarOpen,selectedAttemptId, conditionHistory}) {
  console.log(conditionHistory)
  
  const [selectedAttempt, setSelectedAttempt] = useState(null);
  const handleSelectAttempt = (attemptId) => {
    setSelectedAttempt(attemptId);
    // Здесь можно сделать запрос на сервер для полной информации по attemptId
    console.log("Выбран attempt_id:", attemptId);
  };

  const navigate = useNavigate();

  const handleClick = () => {
    {
      navigate(`/mentor/`);

    }
  };
  return (
    <div className="">

      {mode === "free" && <h1 className={s["section-caption"]}>Самостоятельная практика</h1>}
      {mode === "free" && (
          titletask 
              ? <h1 className={s["section-caption"]}>Задача: {titletask}</h1>
              : <h1 className={s["section-caption"]}></h1>
      )}

      {mode === "module" && (
        <div>
            <button onClick={() => navigate('/module')}>
              Все модули
            </button>
            <div className={s["progress"]}>

              <h1 className={s["section-caption-module"]}>
                Модуль: <span className={s["section-caption-module-name"]}>{name}</span>
              </h1>
              <div className="progress-info">

                <ProgressBar progress={restoredState?.attempts?.length || 0} />
                <Module

                  competency={name}

                  mode={"free"}
                />
              </div>
            </div>
        </div>
        
      )}

      {mode === "history" && (
        <h1 className={s["section-caption"]}>История</h1>
      )}


      


      {(mode === "free" || mode === "history") && <div>
        <button
              className="item new-attempt"
              onClick={handleClick}
            ><Plus strokeWidth={1} />new</button>
        <p className="history-label">HISTORY</p></div>}
        {mode === "module" &&
          <button className="condition-block" onClick={() => navigate('/module/')}>К текущей задаче</button>}

        {mode === "module" && <TasksPanel restoredState={restoredState}/>}

        {(mode === "free" || mode === "history") && 
          <div className="menu-list history-list history-scroll">

            <AttemptsHistory onSelectAttempt={handleSelectAttempt} />

          </div>
        }
      
      
    </div>
  );
}*/}


{/*import Modules from "../modules/Modules";
import Item from "../mentor/Item";
import AttemptsHistory from './AttemptsHistory';
import { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { Plus} from 'lucide-react';
import s from "../mentor/FreeMode.module.css"
import ProgressBar from "../modules/module/ProgressBar";
import TasksPanel from "../modules/TasksPanel";
import Module from "../modules/module/Module";
import ModuleTask from "../modules/module/ModuleTask";
import { useEffect } from "react";
import HistoryTaskViewer from "./HistoryTaskViewer";

export default function History({mode, name, attempt, restoredState, code, titletask, isSidebarOpen,selectedAttemptId, conditionHistory}) {
  console.log(conditionHistory)
  
  const [selectedAttempt, setSelectedAttempt] = useState(null);
  const handleSelectAttempt = (attemptId) => {
    setSelectedAttempt(attemptId);
    console.log("Выбран attempt_id:", attemptId);
  };

  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/mentor/`);
  };

  return (
    <div className="">

      {mode === "free" && <h1 className={s["section-caption"]}>Самостоятельная практика</h1>}
      {mode === "free" && (
          titletask 
              ? <h1 className={s["section-caption"]}>Задача: {titletask}</h1>
              : <h1 className={s["section-caption"]}></h1>
      )}

      {mode === "module" && (
        <div>
            <button onClick={() => navigate('/module')}>
              Все модули
            </button>
            <div className={s["progress"]}>

              <h1 className={s["section-caption-module"]}>
                Модуль: <span className={s["section-caption-module-name"]}>{name}</span>
              </h1>
              <div className="progress-info">

                <ProgressBar progress={restoredState?.attempts?.length || 0} />
                <Module
                  competency={name}
                  mode={"free"}
                />
              </div>
            </div>
        </div>
      )}

      {mode === "history" && (
        <h1 className={s["section-caption"]}>История</h1>
      )}

      {(mode === "free" || mode === "history") && <div>
        <button
          className="item new-attempt"
          onClick={handleClick}
        >
          <Plus strokeWidth={1} />new
        </button>
        <p className="history-label">HISTORY</p>
      </div>}


      {mode === "module" && (() => {
        let condition = null;

        const raw = restoredState?.current_condition;

        if (typeof raw === "string") {
          try {
            condition = JSON.parse(raw);
          } catch {
            condition = { description: raw };
          }
        } else if (typeof raw === "object") {
          condition = raw;
        }

        const sessionId = restoredState?.session?.session_id;

        if (!condition || !sessionId) return null;

        return (
          <div
            className="item item-light module-task-item"
            onClick={() =>
              navigate(`/module/${sessionId}`, {
                state: {
                  competency: name,
                  restoredState
                }
              })
            }
            style={{ cursor: "pointer" }}
          >
            {condition.description}
          </div>
        );
      })()}

      {mode === "module" && <TasksPanel restoredState={restoredState}/>}

      {(mode === "free" || mode === "history") && 
        <div className="menu-list history-list history-scroll">
          <AttemptsHistory onSelectAttempt={handleSelectAttempt} />
        </div>
      }
      
    </div>
  );
}*/}

import Modules from "../modules/Modules";
import Item from "../mentor/Item";
import AttemptsHistory from './AttemptsHistory';
import { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { Plus} from 'lucide-react';
import s from "../mentor/FreeMode.module.css"
import ProgressBar from "../modules/module/ProgressBar";
import TasksPanel from "../modules/TasksPanel";
import Module from "../modules/module/Module";
import ModuleTask from "../modules/module/ModuleTask";
import { useEffect } from "react";
import HistoryTaskViewer from "./HistoryTaskViewer";
import { wsService } from "../../services/websocket"; // 🔥 ДОБАВИЛ

export default function History({mode, name, attempt, restoredState, code, titletask, isSidebarOpen,selectedAttemptId, conditionHistory}) {
  console.log(conditionHistory)
  
  const [selectedAttempt, setSelectedAttempt] = useState(null);

  const handleSelectAttempt = (attemptId) => {
    setSelectedAttempt(attemptId);
    console.log("Выбран attempt_id:", attemptId);
  };

  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/mentor/`);
  };

  // 🔥 helper как в ModuleTask
  const getRestoredCondition = () => {
    if (!restoredState) return null;

    const raw = restoredState.current_condition;

    if (!raw) return null;

    if (typeof raw === "string") {
      try {
        return JSON.parse(raw);
      } catch {
        return { description: raw };
      }
    }

    if (typeof raw === "object") {
      return raw;
    }

    return null;
  };

  // 🔥 состояние condition
  const [condition, setCondition] = useState(() => {
    return getRestoredCondition();
  });

  // 🔥 обновление при смене restoredState
  useEffect(() => {
    const restored = getRestoredCondition();
    if (restored) {
      setCondition(restored);
    }
  }, [restoredState]);

  // 🔥 WS обновление (ГЛАВНОЕ)
  useEffect(() => {
    if (mode !== "module") return;

    const handler = (data) => {
      if (!data?.condition) return;

      setCondition(data.condition);
    };

    wsService.on("task_condition", handler);

    return () => {
      wsService.off("task_condition", handler);
    };
  }, [mode]);

  const sessionId = restoredState?.session?.session_id;

  const moduleName =
  restoredState?.session?.competency || name;

  return (
    <div className="">
      {/* 🔥 HEADER */}
      {mode === "free" && <h1 className={s["section-caption"]}>Самостоятельная практика</h1>}
      {mode === "free" && (
          titletask 
              ? <h1 className={s["section-caption"]}>Задача: {titletask}</h1>
              : <h1 style={{display: "none"}}></h1>
      )}

      {mode === "module" && (
        <div>
            <button className="item tab-history-item" onClick={() => navigate('/module')}>
              <p className="home-summary-block-label-link">Все модули</p>
            </button>
            <div className={s["progress"]}>

              {/*<h1 className={s["section-caption-module"]}>
                Модуль: <span className={s["section-caption-module-name"]}>{moduleName}</span>
              </h1>*/}
              <h1 className={s["section-caption-module"]}>
                current module
              </h1>
              <div className="progress-info">

                <ProgressBar progress={restoredState?.attempts?.length || 0} />
                <Module
                  competency={moduleName}
                  mode={"free"}
                />
              </div>
            </div>
        </div>
      )}

      {mode === "history" && (
        <h1 className={s["section-caption"]}>История</h1>
      )}

      {(mode === "free" || mode === "history") && <div>
        <button
          className="item new-attempt"
          onClick={handleClick}
        >
          <Plus strokeWidth={1} />new
        </button>
        <p className="history-label">HISTORY</p>
      </div>}

      {/* 🔥 ОБНОВЛЯЕМЫЙ CONDITION */}
      {mode === "module" && condition && sessionId && (
        <div
          className="item item-light module-task-item-history"
          onClick={() =>
            navigate(`/module/${sessionId}`, {
              state: {
                competency: name,
                restoredState
              }
            })
          }
          style={{ cursor: "pointer" }}
        >
          <p>{condition.description}</p>
        </div>
      )}

      {mode === "module" && <TasksPanel restoredState={restoredState}/>}

      {(mode === "free" || mode === "history") && 
        <div className="menu-list history-list history-scroll">
          <AttemptsHistory onSelectAttempt={handleSelectAttempt} />
        </div>
      }
      
    </div>
  );
}