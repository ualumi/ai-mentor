import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../context/AuthContext";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const INTEGRATION_SERVICE = "http://localhost:8012/api/integration";

export default function WeakCases() {
  const { token, isSSO } = useAuth();
  const [showAll, setShowAll] = useState(false);
  const navigate = useNavigate();

  // 🔹 запрос на weak-cases
  const { data, isLoading, error } = useQuery({
    queryKey: ["weakCases"],
    queryFn: async () => {
      const res = await fetch(`${INTEGRATION_SERVICE}/weak-cases`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch weak cases");

      return res.json();
    },
    enabled: !!isSSO && !!token, // 🔥 только для SSO
  });

  // 🔹 если не SSO — вообще не рендерим
  if (!isSSO) return null;

  if (isLoading) {
    return <div className="item">Загрузка рекомендаций...</div>;
  }

  if (error) {
    return <div className="item">Ошибка: {error.message}</div>;
  }

  if (!data || data.weak_cases?.length === 0) {
    return null; // нет слабых задач — не показываем блок
  }

  const weakCases = data.weak_cases;

  const visibleCases = showAll ? weakCases : weakCases.slice(0, 3);

  const handleClick = (task) => {
    navigate("/mentor", {
      state: {
        title: task.title,
        code: task.last_code,
      },
    });
  };

  return (
    <div className="weak-cases-block item item-light">
      <h3>
        Обнаружили задачи, с которыми возникли трудности. <br />
        Хотите разобрать их с ментором?
      </h3>

      <div className="weak-cases-list">
        {visibleCases.map((task, idx) => (
          <div
            key={idx}
            className="weak-case-item"
            onClick={() => handleClick(task)}
            style={{ cursor: "pointer"}}
          >
            <div className="weak-case-title">
              <b className="weak-item-text">{task.title}</b>
            </div>

            <pre className="weak-case-code">
              {task.last_code || "Нет кода"}
            </pre>
          </div>
        ))}
      </div>

      {/* 🔹 кнопка "другие задачи" */}
      {!showAll && weakCases.length > 3 && (
        <button onClick={() => setShowAll(true)}>
          Другие задачи
        </button>
      )}
    </div>
  );
}