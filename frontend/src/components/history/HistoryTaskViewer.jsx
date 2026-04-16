import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

const ATTEMPTS_SERVICE = "http://94.26.225.13:8009";

export default function HistoryTaskViewer({ attemptId, fallbackCondition }) {
  const { id } = useParams();

  const finalId = attemptId || id;

  const [condition, setCondition] = useState(null);

  // -----------------------------
  // 🔹 FETCH attempt (как в Workspace)
  // -----------------------------
  const { data, isLoading, error } = useQuery({
    queryKey: ["attempt", finalId],
    queryFn: async () => {
      const res = await fetch(`${ATTEMPTS_SERVICE}/attempt/${finalId}`);
      if (!res.ok) throw new Error("Failed to fetch attempt");
      return res.json();
    },
    enabled: !!finalId,
  });

  // -----------------------------
  // 🔹 SAFE DATA EXTRACTION
  // -----------------------------
  useEffect(() => {
    // приоритет: API → fallback
    if (data?.condition) {
      setCondition(data.condition);
    } else if (fallbackCondition) {
      setCondition(fallbackCondition);
    }
  }, [data, fallbackCondition]);

  // -----------------------------
  // 🔹 UI STATES
  // -----------------------------
  if (isLoading) {
    return (
      <div className="task-condition-loading">
        Загружаем условие...
      </div>
    );
  }

  if (error) {
    return (
      <div className="task-condition-error">
        Ошибка загрузки условия
      </div>
    );
  }

  if (!condition) {
    return (
      <div className="task-condition-empty">
        Условие недоступно
      </div>
    );
  }

  // -----------------------------
  // 🔹 RENDER
  // -----------------------------
  return (
    <div className="task-condition-view">
      <div className="task-condition-card">
        <div className="task-condition-title">
          Условие задачи
        </div>

        <div className="task-condition-text">
          {condition}
        </div>
      </div>
    </div>
  );
}