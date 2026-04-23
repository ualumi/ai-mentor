

import { useEffect, useState } from "react";
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
                  <p className="" style={{margin: 0, marginTop: 10}}>{condition.task_context}</p>
                  <p className="" style={{margin: 0, marginTop: 10}}>Исправьте сломанный код ниже.</p>
                </div>}
            </p>
          </div>

          {/*<TaskProgress
              attempt={attempt}
              externalAnnotations={externalAnnotations}
              resetSignal={resetProgressFlag}
          />*/}

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