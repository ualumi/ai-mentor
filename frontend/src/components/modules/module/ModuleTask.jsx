import { useEffect, useState } from "react";
import { wsService } from "../../../services/websocket";

export default function ModuleTask({ restoredState }) {

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
            <button
              className="module-next-button module-button"
              onClick={handleNextStep}
            >
              Проверить
            </button>
            <button
              className="module-next-button module-button disabled"
              onClick={handleNextStep}
            >
              Следующий шаг
            </button>
          </div>
        </div>
      )}

    </div>
  );
}