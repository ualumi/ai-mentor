/*import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../context/AuthContext";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const INTEGRATION_SERVICE = "http://localhost:8012/api/integration";

export default function WeakCases() {
  const { token, isSSO } = useAuth();
  const [showAll, setShowAll] = useState(false);
  const navigate = useNavigate();

  const { data, isLoading, error } = useQuery({
    queryKey: ["weakCases"],
    queryFn: async () => {
        const user = JSON.parse(localStorage.getItem("user"));

        const res = await fetch(`${INTEGRATION_SERVICE}/weak-cases`, {
        method: "POST", // 🔥 ВАЖНО
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
            email: user?.email,
        }),
        });

        if (!res.ok) {
        const text = await res.text();
        console.error("WEAK CASES ERROR:", text);
        throw new Error("Failed to fetch weak cases");
        }

        return res.json();
    },
    enabled: !!isSSO && !!token,
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
        <h3 className="home-summary-block-label-text">Рекомендованные задачи</h3>
      <p className="home-summary-block-label-link mentor-link">
        Обнаружили задачи, с которыми возникли трудности.
        Хотите разобрать их с ментором?
      </p>

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


      {!showAll && weakCases.length > 3 && (
        <button onClick={() => setShowAll(true)}>
          Другие задачи
        </button>
      )}
    </div>
  );
}*/

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../context/AuthContext";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const INTEGRATION_SERVICE = "http://localhost:8012/api/integration";

export default function WeakCases() {
  const { token, isSSO } = useAuth();
  const [showAll, setShowAll] = useState(false);
  const navigate = useNavigate();

  const { data, isLoading, error } = useQuery({
    queryKey: ["weakCases"],
    queryFn: async () => {
      // 🔥 1. пробуем взять из localStorage
      const cached = localStorage.getItem("weakCases");

      if (cached) {
        return JSON.parse(cached);
      }

      // 🔥 2. если нет — идём в бэкенд
      const user = JSON.parse(localStorage.getItem("user"));

      const res = await fetch(`${INTEGRATION_SERVICE}/weak-cases`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: user?.email,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("WEAK CASES ERROR:", text);
        throw new Error("Failed to fetch weak cases");
      }

      const json = await res.json();

      // 🔥 3. сохраняем
      localStorage.setItem("weakCases", JSON.stringify(json));

      return json;
    },

    enabled: !!isSSO && !!token,

    // 🔥 ключевой момент — отключаем авто-перезапросы
    staleTime: Infinity,
    cacheTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  if (!isSSO) return null;

  if (isLoading) {
    return <div className="item">Загрузка рекомендаций...</div>;
  }

  if (error) {
    return <div className="item">Ошибка: {error.message}</div>;
  }

  if (!data || data.weak_cases?.length === 0) {
    return null;
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
      <h3 className="home-summary-block-label-text">Рекомендованные задачи</h3>
      <p className="home-summary-block-label-link mentor-link">
        Обнаружили задачи, с которыми возникли трудности.
        Хотите разобрать их с ментором?
      </p>

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

      {!showAll && weakCases.length > 3 && (
        <button className="item tab-history-item" onClick={() => setShowAll(true)}>
          <p className="home-summary-block-label-link">Другие задачи</p>
        </button>
      )}
    </div>
  );
}