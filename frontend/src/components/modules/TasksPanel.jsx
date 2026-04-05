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
import { useMemo, useState, useEffect } from "react";
import Attempt from "../history/Attempt";
import { getLearningState } from "../../api/learningService";
import { useAuth } from "../../context/AuthContext";

export default function TasksPanel({ restoredState, selectedAttemptId, onSelectAttempt }) {
  const [openCondition, setOpenCondition] = useState(null);
  const [attempts, setAttempts] = useState([]);

  const { token } = useAuth();
  const sessionId = restoredState?.session?.session_id;

  // 🔹 начальная инициализация
  useEffect(() => {
    if (!restoredState?.attempts) return;
    setAttempts([...restoredState.attempts]);
  }, [restoredState?.attempts?.length]);

  // 🔹 polling с сервера
  useEffect(() => {
    if (!sessionId || !token) return;

    const fetchState = async () => {
      try {
        const data = await getLearningState(sessionId, token);
        if (data?.attempts) {
          setAttempts(data.attempts);
        }
      } catch (e) {
        console.error("Failed to refresh attempts", e);
      }
    };

    fetchState();
    const interval = setInterval(fetchState, 2000);
    return () => clearInterval(interval);
  }, [sessionId, token]);

  const isAttemptView = !!selectedAttemptId;

  // 🔹 группировка
  const groupedAttempts = useMemo(() => {
    if (!attempts.length) return {};
    return attempts.reduce((acc, attempt) => {
      const condition = attempt.condition;
      if (!acc[condition]) acc[condition] = [];
      acc[condition].push(attempt);
      return acc;
    }, {});
  }, [attempts]);

  const selectedAttempt = attempts.find(a => a.attempt_id === selectedAttemptId);
  const activeCondition = selectedAttempt?.condition;

  const conditionsToRender = isAttemptView
    ? { [activeCondition]: groupedAttempts[activeCondition] }
    : groupedAttempts;

  return (
    <div className="taskspanel">
      <div className="sidebar-label">
        <h2 className="menu-caption">Module tasks</h2>
      </div>

      {isAttemptView && typeof onSelectAttempt === "function" && (
        <button
          className="item back-button"
          onClick={() => {
            onSelectAttempt(null); // сбрасываем выбранную попытку
            setOpenCondition(null); // закрываем раскрытые условия
          }}
        >
          ← К списку заданий
        </button>
      )}

      {!isAttemptView && <ModuleTask restoredState={restoredState} />}

      <div className="module-session">
        {!attempts.length && (
          <div className="result-empty">
            <p>Нет предыдущих попыток</p>
          </div>
        )}

        <p className="history-label">Пройденные задачи</p>
        <div className="modiles-reversed">
          {Object.entries(conditionsToRender).map(([condition, attempts]) => (
            <div key={condition} className="condition-block">
              <div
                className={`item item-light module-task-item-history ${
                  condition === activeCondition ? "active-condition" : ""
                }`}
                onClick={() => {
                  if (isAttemptView) return;
                  setOpenCondition(prev => (prev === condition ? null : condition));
                }}
                style={{ cursor: "pointer" }}
              >
                <p>{condition}</p>
              </div>

              {(isAttemptView || openCondition === condition) && (
                <div className="attempts-list">
                  {attempts?.map(attempt => {
                    const isActive = attempt.attempt_id === selectedAttemptId;
                    return (
                      <div key={attempt.attempt_id} className={isActive ? "active-attempt" : ""}>
                        <Attempt
                          attempt={attempt}
                          mode="module"
                          onClick={() => onSelectAttempt(attempt.attempt_id)}
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
    </div>
  );
}


//работает одновление но не работает кнопка к списку заданий
{/*import ModuleTask from "./module/ModuleTask";
import "./module.css";
import { useMemo, useState, useEffect } from "react";
import Attempt from "../history/Attempt";
import { getLearningState } from "../../api/learningService"; // 🔥 импорт
import { useAuth } from "../../context/AuthContext";   // 🔥 токен

export default function TasksPanel({
  restoredState,
  selectedAttemptId,
  onSelectAttempt
}) {
  const [openCondition, setOpenCondition] = useState(null);
  const [attempts, setAttempts] = useState([]);

  const { token } = useAuth(); // 🔥 берём токен

  const sessionId = restoredState?.session?.session_id;

  // 🔥 1. начальная инициализация (как было)
  useEffect(() => {
    if (!restoredState?.attempts) return;
    setAttempts([...restoredState.attempts]);
  }, [restoredState?.attempts?.length]);

  // 🔥 2. polling с сервера (ГЛАВНОЕ ИСПРАВЛЕНИЕ)
  useEffect(() => {
    if (!sessionId || !token) return;

    const fetchState = async () => {
      try {
        const data = await getLearningState(sessionId, token);

        if (data?.attempts) {
          setAttempts(data.attempts); // 🔥 всегда актуальные данные
        }

      } catch (e) {
        console.error("Failed to refresh attempts", e);
      }
    };

    // первый вызов сразу
    fetchState();

    const interval = setInterval(fetchState, 2000); // 🔥 раз в 2 сек

    return () => clearInterval(interval);
  }, [sessionId, token]);

  const isAttemptView = !!selectedAttemptId;

  // 🔹 группировка (НЕ МЕНЯЕМ)
  const groupedAttempts = useMemo(() => {
    if (!attempts.length) return {};

    return attempts.reduce((acc, attempt) => {
      const condition = attempt.condition;

      if (!acc[condition]) acc[condition] = [];
      acc[condition].push(attempt);

      return acc;
    }, {});
  }, [attempts]);

  const selectedAttempt = attempts.find(
    (a) => a.attempt_id === selectedAttemptId
  );

  const activeCondition = selectedAttempt?.condition;

  const conditionsToRender = isAttemptView
    ? { [activeCondition]: groupedAttempts[activeCondition] }
    : groupedAttempts;

  return (
    <div className="taskspanel">

      <div className="sidebar-label">
        <h2 className="menu-caption">Module tasks</h2>
      </div>

      {isAttemptView && (
        <button
          className="item back-button"
          onClick={() => onSelectAttempt(null)}
        >
          ← К списку заданий
        </button>
      )}
      

      {!isAttemptView && (
        <ModuleTask restoredState={restoredState} />
      )}

      <div className="module-session">

        {!attempts.length && (
          <div className="result-empty">
            <p>Нет предыдущих попыток</p>
          </div>
        )}

        <p className="history-label">Пройденные задачи</p>
        <div className="modiles-reversed">
          {Object.entries(conditionsToRender).map(([condition, attempts]) => (
            <div key={condition} className="condition-block">

              <div
                className={`item item-light module-task-item-history ${
                  condition === activeCondition ? "active-condition" : ""
                }`}
                onClick={() => {
                  if (isAttemptView) return;

                  setOpenCondition(prev =>
                    prev === condition ? null : condition
                  );
                }}
                style={{ cursor: "pointer" }}
              >
                <p>{condition}</p>
              </div>

              {(isAttemptView || openCondition === condition) && (
                <div className="attempts-list">

                  {attempts?.map((attempt) => {
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
    </div>
  );
}*/}


//не работает обновление
{/*import ModuleTask from "./module/ModuleTask";
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


      {isAttemptView && (
        <button
          className="item back-button"
          onClick={() => onSelectAttempt(null)}
        >
          ← К списку заданий
        </button>
      )}


      {!isAttemptView && (
        <ModuleTask restoredState={restoredState} />
      )}

      <div className="module-session">

        {!restoredState?.attempts?.length && (
          <div className="result-empty">
            <p>Нет предыдущих попыток</p>
          </div>
        )}

        <p className="history-label">Пройденные задачи</p>

        {Object.entries(conditionsToRender).map(([condition, attempts]) => (
          <div key={condition} className="condition-block">


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
}*/}
