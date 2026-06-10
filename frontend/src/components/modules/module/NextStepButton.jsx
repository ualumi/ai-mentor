import { useEffect, useState } from "react";
import { wsService } from "../../../services/websocket";

export default function NextStepButton({ onNext }) {
  const [isEnabled, setIsEnabled] = useState(false);
  const [waitingForCondition, setWaitingForCondition] = useState(false);

  useEffect(() => {
    const completedHandler = (data) => {
      setIsEnabled(data?.next_step_available === true);
    };
    const unavailableHandler = () => {
      setIsEnabled(false);
    };
    const errorHandler = (data) => {
      if (data?.next_step_available === false) {
        setIsEnabled(false);
      }
    };

    wsService.on("task_completed", completedHandler);
    wsService.on("task_failed", unavailableHandler);
    wsService.on("error", errorHandler);

    return () => {
      wsService.off("task_completed", completedHandler);
      wsService.off("task_failed", unavailableHandler);
      wsService.off("error", errorHandler);
    };
  }, []);

  useEffect(() => {
    const conditionHandler = (data) => {
      if (!data?.condition) return;

      setIsEnabled(data?.next_step_available === true);
      setWaitingForCondition(false);
    };

    wsService.on("task_condition", conditionHandler);

    return () => {
      wsService.off("task_condition", conditionHandler);
    };
  }, []);

  const handleClick = () => {
    if (!isEnabled || waitingForCondition) return;

    onNext();
    setIsEnabled(false);
    setWaitingForCondition(true);
  };

  const isLoading = waitingForCondition;

  return (
    <button
      className={`module-next-button module-button ${
        !isEnabled || isLoading ? "disabled" : ""
      }`}
      onClick={handleClick}
      disabled={!isEnabled || isLoading}
    >
      {isLoading ? "Загрузка..." : "Следующий шаг"}
    </button>
  );
}
