/*import { useEffect, useState } from "react";
import { wsService } from "../../../services/websocket";
import CheckTaskButton from "./CheckTaskButton";
import NextStepButton from "./NextStepButton";

export default function ModuleTask({ restoredState, conditionHistory }) {

  const [condition, setCondition] = useState(null);

  

  const [connectionState, setConnectionState] = useState(
    wsService.getConnectionState()
  );

  // 🔹 восстановление состояния при монтировании
  useEffect(() => {
    if (!restoredState?.attempts) return;

    const lastAttempt = restoredState.attempts.slice(-1)[0];

    setCondition({
      description: lastAttempt.condition
    });

  }, [restoredState]);


  // ✅ подписка на task_condition
  useEffect(() => {
    console.log("🟢 ModuleSession mounted");

    const handler = (data) => {
      console.log("📘 condition received:", data);

      if (!data?.condition) return;

      setCondition(data.condition);
    };

    wsService.on("task_condition", handler);

    return () => {
      wsService.off("task_condition", handler);
      console.log("🔴 ModuleSession unmounted");
    };
  }, []);

  // ✅ отслеживание состояния соединения
  useEffect(() => {

    const interval = setInterval(() => {
      setConnectionState(wsService.getConnectionState());
    }, 1000);

    return () => clearInterval(interval);

  }, []);

  // ✅ следующий шаг
  const handleNextStep = () => {

    wsService.send({
      type: "next_step"
    });

    console.log("➡️ next_step sent");

  };

  return (
    <div className="module-session">

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
          <div className="buttons-module">
            
            <CheckTaskButton />
            <NextStepButton onNext={handleNextStep} />

          </div>
        </div>
      )}

    </div>
  );
}*/

/*import { useEffect, useState } from "react";
import { wsService } from "../../../services/websocket";
import CheckTaskButton from "./CheckTaskButton";
import NextStepButton from "./NextStepButton";

export default function ModuleTask({ restoredState, conditionHistory, mode}) {

  const [condition, setCondition] = useState(null);

  const [connectionState, setConnectionState] = useState(
    wsService.getConnectionState()
  );

  // 🔹 PRIORITY: conditionHistory
  useEffect(() => {
    if (!conditionHistory) return;

    setCondition({
      description: conditionHistory
    });

  }, [conditionHistory]);


  useEffect(() => {
    if (conditionHistory) return; // 🔥 блокируем

    console.log("🟢 ModuleSession mounted");

    const handler = (data) => {
      console.log("📘 condition received:", data);

      if (!data?.condition) return;

      setCondition(data.condition);
    };

    wsService.on("task_condition", handler);

    return () => {
      wsService.off("task_condition", handler);
      console.log("🔴 ModuleSession unmounted");
    };
  }, [conditionHistory]);

  // 🔹 статус соединения
  useEffect(() => {
    const interval = setInterval(() => {
      setConnectionState(wsService.getConnectionState());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // 🔹 следующий шаг
  const handleNextStep = () => {
    wsService.send({
      type: "next_step"
    });

    console.log("➡️ next_step sent");
  };

  return (
    <div className="module-session">

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

          <div className="buttons-module">

            {!conditionHistory && <CheckTaskButton />}

            <NextStepButton onNext={handleNextStep} />
          </div>

        </div>
      )}

    </div>
  );
}*/

import { useEffect, useState } from "react";
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

          {/* 🔥 КНОПКИ СКРЫТЫ В VIEW MODE */}
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