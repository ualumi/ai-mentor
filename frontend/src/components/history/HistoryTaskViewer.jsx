import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

<<<<<<< HEAD
const ATTEMPTS_SERVICE = "/api/attempts/";
=======
const ATTEMPTS_SERVICE = "/api/attempts";
>>>>>>> frontend-dev

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
      const res = await fetch(`${ATTEMPTS_SERVICE}attempt/${finalId}`);
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

/*import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

const ATTEMPTS_SERVICE = "/api/attempts";

export default function HistoryTaskViewer({ attemptId, fallbackCondition }) {
  const { id } = useParams();

  const finalId = attemptId || id;

  const [condition, setCondition] = useState(null);

  // -----------------------------
  // 🔹 FETCH attempt
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
  // 🔹 NORMALIZATION (НОВЫЙ ФОРМАТ)
  // -----------------------------
  const normalizeCondition = (raw) => {
    if (!raw) return null;

    // массив → берем первый элемент
    if (Array.isArray(raw)) {
      if (raw.length === 0) return null;
      return raw[0];
    }

    return raw;
  };

  const getTitle = (cond) => {
    if (!cond) return null;

    // новый формат: condition.description.title
    if (cond.description && typeof cond.description === "object") {
      return cond.description.title || null;
    }

    // fallback: старый формат
    if (typeof cond.title === "string") {
      return cond.title;
    }

    // fallback: строка
    if (typeof cond === "string") {
      return cond;
    }

    return null;
  };

  // -----------------------------
  // 🔹 SAFE DATA EXTRACTION
  // -----------------------------
  useEffect(() => {
    if (data?.condition) {
      setCondition(normalizeCondition(data.condition));
    } else if (fallbackCondition) {
      setCondition(normalizeCondition(fallbackCondition));
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

  const title = getTitle(condition);

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
          {title || "Нет условия"}
        </div>
      </div>
    </div>
  );
}*/