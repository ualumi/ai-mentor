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
                <p>{formatConditionTitle(condition)}</p>
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
import { ChevronDown } from "lucide-react";

const LOADING_CONDITION_KEY = "__loading_condition__";



function getConditionTitle(condition) {
  if (condition === null || condition === undefined) return null;

  if (typeof condition === "object") {
    const description = condition.description;
    const title = typeof description === "object"
      ? description?.title || description?.description
      : description;

    return normalizeConditionTitle(
      title || condition.title || condition.task_title || condition.name
    );
  }

  const raw = String(condition).trim();
  if (!raw || raw.toLowerCase() === "null") return null;

  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") {
      return getConditionTitle(parsed);
    }
  } catch {
    // condition can be plain text from analytics_response
  }

  return normalizeConditionTitle(raw);
}

function normalizeConditionTitle(value) {
  if (!value) return null;

  const firstLine = String(value)
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find(Boolean);

  return firstLine || null;
}

function getConditionKey(condition) {
  const title = getConditionTitle(condition);
  return title || LOADING_CONDITION_KEY;
}

function formatConditionTitle(condition) {
  return condition === LOADING_CONDITION_KEY ? "загрузка..." : condition;
}

export default function TasksPanel({ restoredState }) {
  const { token } = useAuth();
  const sessionId = restoredState?.session?.session_id;

  // 🔹 локальное состояние
  const [localRestoredState, setLocalRestoredState] = useState(restoredState);
  const [attempts, setAttempts] = useState(restoredState?.attempts || []);
  const [selectedAttemptId, setSelectedAttemptId] = useState(null);
  const [openCondition, setOpenCondition] = useState(null);

  const isAttemptView = !!selectedAttemptId;

  // 🔹 Polling для автоподгрузки состояния
  useEffect(() => {
    if (!sessionId || !token) return;

    const fetchState = async () => {
      try {
        const data = await getLearningState(sessionId, token);
        if (data) {
          setLocalRestoredState(data);
          if (data.attempts) setAttempts(data.attempts);
        }
      } catch (e) {
        console.error("Failed to refresh attempts", e);
      }
    };

    fetchState();
    const interval = setInterval(fetchState, 2000);

    return () => clearInterval(interval);
  }, [sessionId, token]);

  // 🔹 Группировка попыток
  const groupedAttempts = useMemo(() => {
    if (!attempts.length) return {};
    return attempts.reduce((acc, attempt) => {
      const condition = getConditionKey(attempt.condition);
      if (!acc[condition]) acc[condition] = [];
      acc[condition].push(attempt);
      return acc;
    }, {});
  }, [attempts]);

  const selectedAttempt = attempts.find(a => a.attempt_id === selectedAttemptId);
  const activeCondition = selectedAttempt
    ? getConditionKey(selectedAttempt.condition)
    : null;

  // 🔹 если просмотр attempt, автоматически раскрываем условие
  useEffect(() => {
    if (isAttemptView && activeCondition) {
      setOpenCondition(activeCondition);
    }
  }, [isAttemptView, activeCondition]);

  const conditionsToRender = isAttemptView
    ? { [activeCondition]: groupedAttempts[activeCondition] }
    : groupedAttempts;

  // 🔹 Возврат к ModuleTask
  const handleBackToModule = () => {
    setSelectedAttemptId(null);
    setOpenCondition(null);

    if (sessionId && token) {
      getLearningState(sessionId, token)
        .then(data => {
          if (data) {
            setLocalRestoredState(data);
            if (data.attempts) setAttempts(data.attempts);
          }
        })
        .catch(err => console.error(err));
    }
  };

  return (
    <div className="taskspanel">

      {isAttemptView && (
        <button className="item back-button" onClick={handleBackToModule}>
          ← К списку заданий
        </button>
      )}

  

      <div className="module-session">
        {!attempts.length && (
          <div className="result-empty">
          </div>
        )}

        <p className="history-label tasks-label">Пройденные задачи</p>
        <div className="modiles-reversed">
          {Object.entries(conditionsToRender).map(([condition, conditionAttempts]) => (
            <div key={condition} className="condition-block">


              <div
                className={`item item-light module-task-item-history ${
                  condition === activeCondition ? "active-condition" : ""
                }`}
                style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
              >

                <ChevronDown
                  className="condition-toggle"
                  size={18}
                  style={{
                    cursor: "pointer",
                    transform: openCondition === condition ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "0.2s",
                  }}
                  onClick={(e) => {
                    e.stopPropagation(); // ❗ важно
                    if (isAttemptView) return;

                    setOpenCondition(prev =>
                      prev === condition ? null : condition
                    );
                  }}
                />
                <p className="condition-title">{formatConditionTitle(condition)}</p>

                
              </div>


                <div
                  className="attempts-list"
                  style={{
                    maxHeight: (isAttemptView || openCondition === condition) ? "500px" : "0px",
                    opacity: (isAttemptView || openCondition === condition) ? 1 : 0,
                  }}
                >

                  {conditionAttempts?.map(attempt => {
                    const isActive = attempt.attempt_id === selectedAttemptId;
                    return (
                      <div key={attempt.attempt_id} className={isActive ? "active-attempt" : ""}>
                        <Attempt
                          attempt={attempt}
                          mode="module"
                          onClick={() => setSelectedAttemptId(attempt.attempt_id)}
                        />
                      </div>
                    );
                  })}
                </div>

            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

//все работает но не подсвечивается активная попытка
{/*import ModuleTask from "./module/ModuleTask";
import "./module.css";
import { useMemo, useState, useEffect } from "react";
import Attempt from "../history/Attempt";
import { getLearningState } from "../../api/learningService";
import { useAuth } from "../../context/AuthContext";

export default function TasksPanel({ restoredState }) {
  const { token } = useAuth();
  const sessionId = restoredState?.session?.session_id;

  // 🔹 локальное состояние
  const [localRestoredState, setLocalRestoredState] = useState(restoredState);
  const [attempts, setAttempts] = useState(restoredState?.attempts || []);
  const [selectedAttemptId, setSelectedAttemptId] = useState(null);
  const [openCondition, setOpenCondition] = useState(null);

  const isAttemptView = !!selectedAttemptId;

  // 🔹 Polling для автоподгрузки состояния
  useEffect(() => {
    if (!sessionId || !token) return;

    const fetchState = async () => {
      try {
        const data = await getLearningState(sessionId, token);
        if (data) {
          setLocalRestoredState(data);
          if (data.attempts) setAttempts(data.attempts);
        }
      } catch (e) {
        console.error("Failed to refresh attempts", e);
      }
    };

    fetchState(); // первый вызов сразу
    const interval = setInterval(fetchState, 2000);

    return () => clearInterval(interval);
  }, [sessionId, token]);

  // 🔹 Группировка попыток
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

  // 🔹 Возврат к ModuleTask
  const handleBackToModule = () => {
    setSelectedAttemptId(null);
    setOpenCondition(null);

    // сразу обновляем данные при возврате
    if (sessionId && token) {
      getLearningState(sessionId, token)
        .then(data => {
          if (data) {
            setLocalRestoredState(data);
            if (data.attempts) setAttempts(data.attempts);
          }
        })
        .catch(err => console.error(err));
    }
  };

  return (
    <div className="taskspanel">
      <div className="sidebar-label">
        <h2 className="menu-caption">Module tasks</h2>
      </div>

      {isAttemptView && (
        <button className="item back-button" onClick={handleBackToModule}>
          ← К списку заданий
        </button>
      )}

      {!isAttemptView && <ModuleTask restoredState={localRestoredState} />}

      <div className="module-session">
        {!attempts.length && (
          <div className="result-empty">
            <p>Нет предыдущих попыток</p>
          </div>
        )}

        <p className="history-label">Пройденные задачи</p>
        <div className="modiles-reversed">
          {Object.entries(conditionsToRender).map(([condition, conditionAttempts]) => (
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
                  {conditionAttempts?.map(attempt => {
                    const isActive = attempt.attempt_id === selectedAttemptId;
                    return (
                      <div key={attempt.attempt_id} className={isActive ? "active-attempt" : ""}>
                        <Attempt
                          attempt={attempt}
                          mode="module"
                          onClick={() => setSelectedAttemptId(attempt.attempt_id)}
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
