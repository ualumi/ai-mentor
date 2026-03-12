import { useEffect, useState } from "react";
import { wsService } from "../../../services/websocket";

export default function ModuleTask() {

  const [condition, setCondition] = useState(null);
  const [connectionState, setConnectionState] = useState(
    wsService.getConnectionState()
  );

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

  // ✅ устанавливаем режим module
  useEffect(() => {

    if (wsService.getConnectionState() !== "OPEN") return;

    wsService.send({
      type: "set_mode",
      mode: "module"
    });

    console.log("📡 module mode enabled");

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
        <div className="task-condition">

          <div className="item item-light">
            <p>{condition.description}</p>
          </div>

          <button
            className="module-next-button"
            onClick={handleNextStep}
          >
            Следующий шаг
          </button>
        </div>
      )}

    </div>
  );
}