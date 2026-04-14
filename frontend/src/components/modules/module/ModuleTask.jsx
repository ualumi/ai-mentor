

/*import { useEffect, useState } from "react";
import { wsService } from "../../../services/websocket";
import CheckTaskButton from "./CheckTaskButton";
import NextStepButton from "./NextStepButton";

export default function ModuleTask({
  restoredState,
  conditionHistory,
  mode,
  onExitView
}) {

  const isViewMode = mode === "view";

  const [condition, setCondition] = useState(null);

  const [connectionState, setConnectionState] = useState(
    wsService.getConnectionState()
  );

  // 🔹 PRIORITY: conditionHistory (НО НЕ В VIEW MODE)
  useEffect(() => {
    if (isViewMode) return;
    if (!conditionHistory) return;

    setCondition({
      description: conditionHistory
    });

  }, [conditionHistory, isViewMode]);

  // 🔹 WS (ТОЛЬКО НЕ VIEW MODE)
  useEffect(() => {
    if (conditionHistory) return;
    if (isViewMode) return;

    const handler = (data) => {
      if (!data?.condition) return;
      setCondition(data.condition);
    };

    wsService.on("task_condition", handler);

    return () => {
      wsService.off("task_condition", handler);
    };
  }, [conditionHistory, isViewMode]);

  // 🔹 connection status
  useEffect(() => {
    const interval = setInterval(() => {
      setConnectionState(wsService.getConnectionState());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // 🔹 next step
  const handleNextStep = () => {
    wsService.send({ type: "next_step" });
  };

  return (
    <div
      className="module-session"
      onClick={() => {
        if (isViewMode && onExitView) {
          onExitView(); // 🔥 выход из режима просмотра
        }
      }}
      style={{ cursor: isViewMode ? "pointer" : "default" }}
    >

      {!condition && (
        <div className="result-empty">
          <p>Ожидание задания...</p>
          <p>Статус: {connectionState}</p>
        </div>
      )}

      {condition && (
        <div className="task-condition taskkk">

          <div className="item item-light module-task-item">
            <p>{condition.description}</p>
          </div>


          {!isViewMode && (
            <div className="buttons-module">
              {!conditionHistory && <CheckTaskButton />}
              <NextStepButton onNext={handleNextStep} />
            </div>
          )}

        </div>
      )}

    </div>
  );
}*/

{/*import { useEffect, useState } from "react";
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

  const [condition, setCondition] = useState(
    conditionHistory ? { description: conditionHistory } : null // 🔥 сразу подставляем
  );

  console.log(condition)

  const [connectionState, setConnectionState] = useState(
    wsService.getConnectionState()
  );

  // 🔥 ДОБАВЛЕНО: синхронизация conditionHistory
  useEffect(() => {
    if (!conditionHistory) return;

    setCondition({
      description: conditionHistory
    });
  }, [conditionHistory]);

  // 🔹 WS (ТОЛЬКО НЕ VIEW MODE)
  useEffect(() => {
    if (conditionHistory) return;
    if (isViewMode) return;

    const handler = (data) => {
      if (!data?.condition) return;
      setCondition(data.condition);
    };

    wsService.on("task_condition", handler);

    return () => {
      wsService.off("task_condition", handler);
    };
  }, [conditionHistory, isViewMode]);

  // 🔹 connection status
  useEffect(() => {
    const interval = setInterval(() => {
      setConnectionState(wsService.getConnectionState());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // 🔹 next step
  const handleNextStep = () => {
    wsService.send({ type: "next_step" });
  };

  return (
    <div
      className="module-session"
      onClick={() => {
        if (isViewMode && onExitView) {
          onExitView(); // 🔥 выход из режима просмотра
        }
      }}
      style={{ cursor: isViewMode ? "pointer" : "default" }}
    >
      <TaskProgress attempt={attempt}
                externalAnnotations={externalAnnotations} />
      {!condition && (
        <div className="result-empty">
          <p>Ожидание задания...</p>
          <p>Статус: {connectionState}</p>
        </div>
      )}

      {condition && (
        <div className="task-condition taskkk">

          <div className="item item-light module-task-item">
            <p>{condition.description}</p>
          </div>


          {!isViewMode && (
            <div className="buttons-module">
              {!conditionHistory && <CheckTaskButton />}
              <NextStepButton onNext={handleNextStep} />
            </div>
          )}

        </div>
      )}

    </div>
  );
}*/}

{/*import { useEffect, useState } from "react";
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

  const [condition, setCondition] = useState(
    conditionHistory ? { description: conditionHistory } : null
  );

  const [connectionState, setConnectionState] = useState(
    wsService.getConnectionState()
  );

  // 🔥 NEW: флаг сброса прогресса
  const [resetProgressFlag, setResetProgressFlag] = useState(0);

  useEffect(() => {
    if (!conditionHistory) return;

    setCondition({
      description: conditionHistory
    });
  }, [conditionHistory]);

  useEffect(() => {
    if (conditionHistory) return;
    if (isViewMode) return;

    const handler = (data) => {
      if (!data?.condition) return;
      setCondition(data.condition);
    };

    wsService.on("task_condition", handler);

    return () => {
      wsService.off("task_condition", handler);
    };
  }, [conditionHistory, isViewMode]);

  useEffect(() => {
    const interval = setInterval(() => {
      setConnectionState(wsService.getConnectionState());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // 🔹 next step
  const handleNextStep = () => {
    wsService.send({ type: "next_step" });

    // 🔥 триггер сброса прогресса
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
      <TaskProgress
        attempt={attempt}
        externalAnnotations={externalAnnotations}
        resetSignal={resetProgressFlag}   // 🔥 NEW
      />

      {!condition && (
        <div className="result-empty">
          <p>Ожидание задания...</p>
          <p>Статус: {connectionState}</p>
        </div>
      )}

      {condition && (
        <div className="task-condition taskkk">

          <div className="item item-light module-task-item">
            <p>{condition.description}</p>
          </div>

          {!isViewMode && (
            <div className="buttons-module">
              {!conditionHistory && <CheckTaskButton />}
              <NextStepButton onNext={handleNextStep} />
            </div>
          )}

        </div>
      )}
    </div>
  );
}*/}

import { useEffect, useState } from "react";
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

  // 🔥 helper для restored condition
  const getRestoredCondition = () => {
    if (!restoredState) return null;

    const raw = restoredState.current_condition;

    if (!raw) return null;

    // если строка → парсим
    if (typeof raw === "string") {
      try {
        return JSON.parse(raw);
      } catch {
        return { description: raw };
      }
    }

    // если уже объект
    if (typeof raw === "object") {
      return raw;
    }

    return null;
  };

  // 🔥 INIT с приоритетом restoredState
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

  // 🔥 если пришёл restoredState → обновляем condition
  useEffect(() => {
    const restored = getRestoredCondition();
    if (restored) {
      setCondition(restored);
    }
  }, [restoredState]);

  // 🔥 fallback на history
  useEffect(() => {
    if (!conditionHistory) return;

    setCondition({
      description: conditionHistory
    });
  }, [conditionHistory]);

  // 🔥 WS только если НЕТ restoredState и history
  useEffect(() => {
    const hasRestored = !!getRestoredCondition();

    if (conditionHistory || hasRestored) return;
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

  // 🔹 connection status
  useEffect(() => {
    const interval = setInterval(() => {
      setConnectionState(wsService.getConnectionState());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // 🔹 next step
  const handleNextStep = () => {
    wsService.send({ type: "next_step" });

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
            <p>{condition.description}
            </p>
            
          </div>
          
          <TaskProgress
              attempt={attempt}
              externalAnnotations={externalAnnotations}
              resetSignal={resetProgressFlag}
          />

          {!isViewMode && (
            <div className="buttons-module">
              {!conditionHistory && <CheckTaskButton />}
              <NextStepButton onNext={handleNextStep} />
            </div>
          )}

        </div>
      )}
    </div>
  );
}