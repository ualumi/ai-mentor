

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { wsService } from "../../../services/websocket";
import CheckTaskButton from "./CheckTaskButton";
import NextStepButton from "./NextStepButton";
import TaskProgress from "./TaskProgress";
import {Loader} from 'lucide-react'

export default function ModuleTask({
  restoredState,
  conditionHistory,
  mode,
  onExitView,
  attempt,
  externalAnnotations
}) {
  
  const isViewMode = mode === "view";
  const navigate = useNavigate();
  console.log(restoredState)
  console.log(conditionHistory)
  console.log(attempt)

  // 🔥 helper для restored condition
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

  const [condition, setCondition] = useState(() => {
    const restored = getRestoredCondition();
    if (restored) return restored;

    if (conditionHistory) return { description: conditionHistory };

    return null;
  });
  
  const [connectionState, setConnectionState] = useState(
    wsService.getConnectionState()
  );

  const [resetProgressFlag, setResetProgressFlag] = useState(0);

  // ✅ флаг завершения модуля
  const isModuleFinished =
    condition &&
    (!condition.description || condition.description.trim() === "");

  useEffect(() => {
    const restored = getRestoredCondition();
    if (restored) {
      setCondition(restored);
    }
  }, [restoredState]);

  useEffect(() => {
    if (!conditionHistory) return;

    setCondition({
      description: conditionHistory
    });
  }, [conditionHistory]);

  useEffect(() => {
    const hasRestored = !!getRestoredCondition();
    if (conditionHistory && !hasRestored) return;
    if (isViewMode) return;

    const handler = (data) => {
      if (!data?.condition) return;
      setCondition(data.condition);
    };

    wsService.on("task_condition", handler);

    return () => {
      wsService.off("task_condition", handler);
    };
  }, [conditionHistory, restoredState, isViewMode]);

  useEffect(() => {
    const interval = setInterval(() => {
      setConnectionState(wsService.getConnectionState());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleNextStep = () => {
    wsService.send({ type: "next_step" });
    console.log("next_srep_sended")
    setResetProgressFlag(prev => prev + 1);
  };

  console.log(condition)

  return (
    <div
      className="module-session"
      onClick={() => {
        if (isViewMode && onExitView) {
          onExitView();
        }
      }}
      style={{ cursor: isViewMode ? "pointer" : "default" }}
    >
      {!condition && (
        <div className="task-condition taskkk">
          <p className="modules-item-text home-summary-block-label-text">Загрузка..</p>
          <p style={{margin: 0, marginTop: 10}}>Загрузка...</p>
        </div>
      )}

      {condition && (
        <div className="task-condition taskkk">
          <div className="item item-light module-task-item">
            <p>
              {isModuleFinished
                ? "Модуль завершен!"
                : <div>
                  <p className="modules-item-text home-summary-block-label-text">{condition.description}</p>
                  <p className="" style={{margin: 0, marginTop: 10}}>Исправьте сломанный код ниже.</p>
                </div>}
            </p>
          </div>



          {!isViewMode && (
            <div className="buttons-module">
              {isModuleFinished ? (
                <button className='module-next-button module-button' onClick={() => navigate("/module")}>
                  К модулям
                </button>
              ) : (
                <>
                  {!conditionHistory && <CheckTaskButton />}
                  <NextStepButton onNext={handleNextStep} />
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

{/*import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { wsService } from "../../../services/websocket";
import CheckTaskButton from "./CheckTaskButton";
import NextStepButton from "./NextStepButton";
import TaskProgress from "./TaskProgress";

export default function ModuleTask({
  restoredState,
  conditionHistory,
  mode,
  onExitView,
  attempt,
  externalAnnotations
}) {

  const isViewMode = mode === "view";
  const navigate = useNavigate();

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
      if (raw.length === 0) return null;
      return raw[0];
    }

    return raw;
  };

  // 🔥 ИСПРАВЛЕНО: достаём title из вложенного description
  const getTitle = (cond) => {
    if (!cond) return null;

    // твой текущий формат: condition.description.title
    if (cond.description && typeof cond.description === "object") {
      return cond.description.title || null;
    }

    // fallback (если придёт старый формат)
    if (typeof cond.title === "string") {
      return cond.title;
    }

    return null;
  };

  const [condition, setCondition] = useState(() => {
    const restored = normalizeCondition(getRestoredCondition());
    if (restored) return restored;

    if (conditionHistory) {
      return { description: { title: conditionHistory } };
    }

    return null;
  });

  const [connectionState, setConnectionState] = useState(
    wsService.getConnectionState()
  );

  const [resetProgressFlag, setResetProgressFlag] = useState(0);

  const title = getTitle(condition);

  // ✅ модуль завершён только если title пустой
  const isModuleFinished =
    !title || (typeof title === "string" && title.trim().length === 0);

  useEffect(() => {
    const restored = normalizeCondition(getRestoredCondition());
    if (restored) {
      setCondition(restored);
    }
  }, [restoredState]);

  useEffect(() => {
    if (!conditionHistory) return;

    setCondition({
      description: { title: conditionHistory }
    });
  }, [conditionHistory]);

  useEffect(() => {
    const hasRestored = !!getRestoredCondition();
    if (conditionHistory && !hasRestored) return;
    if (isViewMode) return;

    const handler = (data) => {
      if (!data?.condition) return;
      setCondition(normalizeCondition(data.condition));
    };

    wsService.on("task_condition", handler);

    return () => {
      wsService.off("task_condition", handler);
    };
  }, [conditionHistory, restoredState, isViewMode]);

  useEffect(() => {
    const interval = setInterval(() => {
      setConnectionState(wsService.getConnectionState());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleNextStep = () => {
    wsService.send({ type: "next_step" });
    setResetProgressFlag(prev => prev + 1);
  };

  console.log("condition:", condition);

  return (
    <div
      className="module-session"
      onClick={() => {
        if (isViewMode && onExitView) {
          onExitView();
        }
      }}
      style={{ cursor: isViewMode ? "pointer" : "default" }}
    >
      {!condition && (
        <div className="task-condition taskkk">
          <p>Ожидание задания...</p>
          <p>Статус: {connectionState}</p>
        </div>
      )}

      {condition && (
        <div className="task-condition taskkk">
          <div className="item item-light module-task-item">
            <p>
              {isModuleFinished
                ? "Модуль завершен!"
                : title}
            </p>
          </div>

          {!isViewMode && (
            <div className="buttons-module">
              {isModuleFinished ? (
                <button
                  className="module-next-button module-button"
                  onClick={() => navigate("/module")}
                >
                  К модулям
                </button>
              ) : (
                <>
                  {!conditionHistory && <CheckTaskButton />}
                  <NextStepButton onNext={handleNextStep} />
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
  }*/}

{/*import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { wsService } from "../../../services/websocket";
import CheckTaskButton from "./CheckTaskButton";
import NextStepButton from "./NextStepButton";

export default function ModuleTask({
  restoredState,
  conditionHistory,
  mode,
  onExitView,
  attempt,
  externalAnnotations
}) {

  const isViewMode = mode === "view";
  const navigate = useNavigate();

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
      if (!raw.length) return null;
      return raw[0];
    }

    return raw;
  };

  const [condition, setCondition] = useState(() => {
    const restored = normalizeCondition(getRestoredCondition());
    if (restored) return restored;

    if (conditionHistory) {
      return { description: { title: conditionHistory } };
    }

    return null;
  });

  const [connectionState, setConnectionState] = useState(
    wsService.getConnectionState()
  );

  const [resetProgressFlag, setResetProgressFlag] = useState(0);

  // 🔥 safe title getter
  const title =
    typeof condition?.description === "object"
      ? condition.description?.title
      : condition?.description;

  const isModuleFinished =
    !title || (typeof title === "string" && title.trim() === "");

  useEffect(() => {
    const restored = normalizeCondition(getRestoredCondition());
    if (restored) setCondition(restored);
  }, [restoredState]);

  useEffect(() => {
    if (!conditionHistory) return;

    setCondition({
      description: { title: conditionHistory }
    });
  }, [conditionHistory]);

  useEffect(() => {
    const hasRestored = !!getRestoredCondition();
    if (conditionHistory && !hasRestored) return;
    if (isViewMode) return;

    const handler = (data) => {
      if (!data) return;

      // 🔥 FIX: не залипаем на старом состоянии
      if (!data.condition) {
        setCondition(null);
        return;
      }

      setCondition(normalizeCondition(data.condition));
    };

    wsService.on("task_condition", handler);

    return () => {
      wsService.off("task_condition", handler);
    };
  }, [conditionHistory, restoredState, isViewMode]);

  useEffect(() => {
    const interval = setInterval(() => {
      setConnectionState(wsService.getConnectionState());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // 🔥 FIXED handleNextStep
  const handleNextStep = () => {
    wsService.send({ type: "next_step" });

    // 🔥 ключевой фикс: сброс UI в "ожидание"
    setCondition(null);

    setResetProgressFlag(prev => prev + 1);
  };

  return (
    <div
      className="module-session"
      onClick={() => {
        if (isViewMode && onExitView) {
          onExitView();
        }
      }}
      style={{ cursor: isViewMode ? "pointer" : "default" }}
    >
      {!condition && (
        <div className="task-condition taskkk">
          <p>Ожидание задания...</p>
          <p>Статус: {connectionState}</p>
        </div>
      )}

      {condition && (
        <div className="task-condition taskkk">
          <div className="item item-light module-task-item">
            <p>
              {isModuleFinished
                ? "Модуль завершен!"
                : title}
            </p>
          </div>

          {!isViewMode && (
            <div className="buttons-module">
              {isModuleFinished ? (
                <button
                  className="module-next-button module-button"
                  onClick={() => navigate("/module")}
                >
                  К модулям
                </button>
              ) : (
                <>
                  {!conditionHistory && <CheckTaskButton />}
                  <NextStepButton onNext={handleNextStep} />
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}*/}

{/*import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { wsService } from "../../../services/websocket";
import CheckTaskButton from "./CheckTaskButton";
import NextStepButton from "./NextStepButton";

export default function ModuleTask({
  restoredState,
  conditionHistory,
  mode,
  onExitView,
  attempt,
  externalAnnotations
}) {
  const isViewMode = mode === "view";
  const navigate = useNavigate();

  // -------------------------
  // RESTORE (НЕ ТРОГАЕМ ЛОГИКУ)
  // -------------------------
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

    return raw;
  };

  // -------------------------
  // STATE (ХРАНИМ RAW WS ДАННЫЕ)
  // -------------------------
  const [condition, setCondition] = useState(() => {
    const restored = getRestoredCondition();
    if (restored) return restored;

    if (conditionHistory) {
      return { description: { title: conditionHistory } };
    }

    return null;
  });

  const [connectionState, setConnectionState] = useState(
    wsService.getConnectionState()
  );

  const [resetProgressFlag, setResetProgressFlag] = useState(0);

  // -------------------------
  // SAFE TITLE EXTRACTOR (ВАЖНО!)
  // -------------------------
  const getTitle = (cond) => {
    if (!cond) return "";

    if (typeof cond.description === "string") {
      return cond.description;
    }

    if (typeof cond.description === "object") {
      return cond.description?.title || "";
    }

    return "";
  };

  const title = getTitle(condition);

  //const isModuleFinished = title.trim().length === 0;
  const isModuleFinished =
  typeof title !== "string" || title.trim().length === 1;

  // -------------------------
  // WS LISTENER (КЛЮЧЕВОЕ ИСПРАВЛЕНИЕ)
  // -------------------------
  useEffect(() => {
    const hasRestored = !!getRestoredCondition();
    if (conditionHistory && !hasRestored) return;
    if (isViewMode) return;

    const handler = (data) => {
      if (!data?.condition) return;

      // ❗ ВАЖНО: НЕ НОРМАЛИЗУЕМ — ХРАНИМ RAW
      setCondition(data.condition);
    };

    wsService.on("task_condition", handler);

    return () => {
      wsService.off("task_condition", handler);
    };
  }, [conditionHistory, restoredState, isViewMode]);

  // -------------------------
  // CONNECTION STATE
  // -------------------------
  useEffect(() => {
    const interval = setInterval(() => {
      setConnectionState(wsService.getConnectionState());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // -------------------------
  // NEXT STEP (РЕАКТИВНЫЙ, БЕЗ БАГОВ)
  // -------------------------
  const handleNextStep = () => {
    wsService.send({ type: "next_step" });

    // ⚡ оптимистичный UI-тик, но НЕ ломаем condition
    setResetProgressFlag(prev => prev + 1);
  };

  return (
    <div
      className="module-session"
      onClick={() => {
        if (isViewMode && onExitView) {
          onExitView();
        }
      }}
      style={{ cursor: isViewMode ? "pointer" : "default" }}
    >
      {!condition && (
        <div className="task-condition taskkk">
          <p>Ожидание задания...</p>
          <p>Статус: {connectionState}</p>
        </div>
      )}

      {condition && (
        <div className="task-condition taskkk">
          <div className="item item-light module-task-item">
            <p>
              {isModuleFinished
                ? "Модуль завершен!"
                : title}
            </p>
          </div>

          {!isViewMode && (
            <div className="buttons-module">
              {isModuleFinished ? (
                <button
                  className="module-next-button module-button"
                  onClick={() => navigate("/module")}
                >
                  К модулям
                </button>
              ) : (
                <>
                  {!conditionHistory && <CheckTaskButton />}
                  <NextStepButton onNext={handleNextStep} />
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}*/}