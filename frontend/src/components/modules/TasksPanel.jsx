{/*import ModuleTask from "./module/ModuleTask";
import "./module.css"
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Attempt from "../history/Attempt";

export default function TasksPanel({ mode, restoredState }) {
  const [openCondition, setOpenCondition] = useState(null);
  const groupedAttempts = useMemo(() => {
    if (!restoredState?.attempts) return {};

    return restoredState.attempts.reduce((acc, attempt) => {
      const condition = attempt.condition;

      if (!acc[condition]) {
        acc[condition] = [];
      }

      acc[condition].push(attempt);

      return acc;
    }, {});
  }, [restoredState]);
  return (
    <div className="taskspanel">
        <div className="sidebar-label">

           <h2 className="menu-caption">Module tasks</h2>
            

        </div>
        <ModuleTask restoredState={restoredState}></ModuleTask>
        <div className="module-session">


          {!restoredState?.attempts?.length && (
            <div className="result-empty">
              <p>Нет предыдущих попыток</p>
            </div>
          )}


          {Object.entries(groupedAttempts).map(([condition, attempts]) => (
            <div key={condition} className="condition-block">


              <div
                className="item item-light"
                onClick={() =>
                  setOpenCondition(prev =>
                    prev === condition ? null : condition
                  )
                }
                style={{ cursor: "pointer" }}
              >
                <p>{condition}</p>
              </div>


              {openCondition === condition && (
                <div className="attempts-list">

                  {attempts.map((attempt) => (
                    <Attempt attempt={attempt} mode="module" />

                  ))}

                </div>
              )}

            </div>
          ))}

        </div>
    </div>
  );
}*/}

import ModuleTask from "./module/ModuleTask";
import "./module.css";
import { useMemo, useState } from "react";
import Attempt from "../history/Attempt";

export default function TasksPanel({
  restoredState,
  selectedAttemptId,
  onSelectAttempt
}) {
  const [openCondition, setOpenCondition] = useState(null);
  onSelectAttempt=selectedAttemptId;
  const isAttemptView = !!selectedAttemptId;

  // 🔹 группировка
  const groupedAttempts = useMemo(() => {
    if (!restoredState?.attempts) return {};

    return restoredState.attempts.reduce((acc, attempt) => {
      const condition = attempt.condition;

      if (!acc[condition]) acc[condition] = [];
      acc[condition].push(attempt);

      return acc;
    }, {});
  }, [restoredState]);

  // 🔹 текущая выбранная попытка
  const selectedAttempt = restoredState?.attempts?.find(
    (a) => a.attempt_id === selectedAttemptId
  );

  // 🔹 условие выбранной попытки
  const activeCondition = selectedAttempt?.condition;

  // 🔥 фильтрация (ВАЖНО)
  const conditionsToRender = isAttemptView
    ? { [activeCondition]: groupedAttempts[activeCondition] }
    : groupedAttempts;

  return (
    <div className="taskspanel">

      <div className="sidebar-label">
        <h2 className="menu-caption">Module tasks</h2>
      </div>

      {/* 🔙 КНОПКА НАЗАД */}
      {isAttemptView && (
        <button
          className="item back-button"
          onClick={() => onSelectAttempt(null)}
        >
          ← К списку заданий
        </button>
      )}

      {/* 🔥 ModuleTask ТОЛЬКО если НЕ просмотр attempt */}
      {!isAttemptView && (
        <ModuleTask restoredState={restoredState} />
      )}

      <div className="module-session">

        {!restoredState?.attempts?.length && (
          <div className="result-empty">
            <p>Нет предыдущих попыток</p>
          </div>
        )}

        {Object.entries(conditionsToRender).map(([condition, attempts]) => (
          <div key={condition} className="condition-block">

            {/* 📘 CONDITION */}
            <div
              className={`item item-light module-task-item-history ${
                condition === activeCondition ? "active-condition" : ""
              }`}
              onClick={() => {
                if (isAttemptView) return; // ❌ запрещаем раскрытие в режиме attempt

                setOpenCondition(prev =>
                  prev === condition ? null : condition
                );
              }}
              style={{ cursor: "pointer" }}
            >
              <p>{condition}</p>
            </div>

            {/* 🔽 ATTEMPTS */}
            {(isAttemptView || openCondition === condition) && (
              <div className="attempts-list">

                {attempts.map((attempt) => {
                  const isActive =
                    attempt.attempt_id === selectedAttemptId;

                  return (
                    <div
                      key={attempt.attempt_id}
                      className={isActive ? "active-attempt" : ""}
                    >
                      <Attempt
                        attempt={attempt}
                        mode="module"
                        onClick={() =>
                          onSelectAttempt(attempt.attempt_id)
                        }
                      />
                    </div>
                  );
                })}

              </div>
            )}

          </div>
        ))}

      </div>
    </div>
  );
}
