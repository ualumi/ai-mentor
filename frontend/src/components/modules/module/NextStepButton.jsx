/*import { useEffect, useState } from "react";
import { wsService } from "../../../services/websocket";

export default function NextStepButton({ onNext }) {
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    const handler = (data) => {
      if (!data.source?.startsWith("user_progress")) return;

      const score = data.data?.score?.score || data.data?.score;

      console.log("📊 score received:", score);

      if (score >= 9) {
        setIsEnabled(true);
      }
    };

    wsService.on("user_progress", handler);

    return () => {
      wsService.off("user_progress", handler);
    };
  }, []);

  const handleClick = () => {
    if (!isEnabled) return;
    onNext();
  };

  return (
    <button
      className={`module-next-button module-button ${
        isEnabled ? "" : "disabled"
      }`}
      onClick={handleClick}
    >
      Следующий шаг
    </button>
  );
}*/

import { useEffect, useState } from "react";
import { wsService } from "../../../services/websocket";

export default function NextStepButton({ onNext }) {
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    const handler = (data) => {
      if (!data.source?.startsWith("user_progress")) return;

      const score = data.data?.score?.score || data.data?.score;

      if (score >= 9) {
        setIsEnabled(true);
      }
    };

    wsService.on("user_progress", handler);

    return () => {
      wsService.off("user_progress", handler);
    };
  }, []);

  const handleClick = () => {
    if (!isEnabled) return;

    onNext();

    // 🔥 сразу блокируем кнопку для нового шага
    setIsEnabled(false);
  };

  return (
    <button
      className={`module-next-button module-button ${
        isEnabled ? "" : "disabled"
      }`}
      onClick={handleClick}
    >
      Следующий шаг
    </button>
  );
}