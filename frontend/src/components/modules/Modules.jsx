import { useQuery } from '@tanstack/react-query';
import "../../App.css";
import "./module.css";
import { useEffect, useMemo, useState } from "react";

const LEARNING_SERVICE = "/api/learning";
const INTEGRATION_SERVICE = "/api/integration";

import Module from "./module/Module";
import { useAuth } from "../../context/AuthContext";
import { NavLink } from "react-router-dom";

export default function Modules({ mode }) {
  const containerClass =
    mode === "history" ? "history-container" : "modules-container";

  const { token, isSSO } = useAuth();
  const [activeTab, setActiveTab] = useState(isSSO ? "recommended" : "active");

  useEffect(() => {
    setActiveTab(isSSO ? "recommended" : "active");
  }, [isSSO]);

  useEffect(() => {
    cleanupRecommendedModulesStorage();
  }, []);

  const activeSessionsQuery = useSessionsQuery(token, "active");
  const completedSessionsQuery = useSessionsQuery(token, "completed");
  const importedSkillsQuery = useImportedSkillsQuery(isSSO);

  const localRecommended = useMemo(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("recommended_modules") || "[]");
      return Array.isArray(stored) ? stored : [];
    } catch {
      return [];
    }
  }, []);

  if (activeSessionsQuery.isLoading || completedSessionsQuery.isLoading) {
    return <div className="item">Загрузка модулей...</div>;
  }

  if (activeSessionsQuery.error || completedSessionsQuery.error) {
    return (
      <div className="item">
        Ошибка загрузки: {
          activeSessionsQuery.error?.message ||
          completedSessionsQuery.error?.message
        }
      </div>
    );
  }

  const activeSessions = activeSessionsQuery.data || [];
  const completedSessions = completedSessionsQuery.data || [];
  const importedSkills = importedSkillsQuery.error ? null : importedSkillsQuery.data;

  const startedNames = new Set([
    ...activeSessions.map((session) => normalizeName(session.competency)),
    ...completedSessions.map((session) => normalizeName(session.competency)),
  ]);

  const ssoEntries =
    importedSkills?.status === "imported" && importedSkills.skills
      ? Object.entries(importedSkills.skills)
      : [];

  const ssoNames = new Set(ssoEntries.map(([name]) => normalizeName(name)));
  const recommendedFromSso = ssoEntries.filter(
    ([name]) => !startedNames.has(normalizeName(name))
  );
  const recommendedFromLocal = localRecommended
    .map(normalizeStoredRecommendation)
    .filter(Boolean)
    .filter((recommendation) => {
      const normalized = normalizeName(recommendation.competency);
      return !startedNames.has(normalized) && !ssoNames.has(normalized);
    });

  return (
    <div className={`modules-block ${isSSO ? "modules-block-sso" : "modules-block-default"}`}>
      <div className={containerClass}>
        {mode !== "free" && (
          <div className="home-summary-block-label">
            <h3 className="home-label module-label">Модули</h3>
            <NavLink to="/module" className="home-summary-block-label-link">
              перейти
            </NavLink>
          </div>
        )}

        <ul className="module-type-list">
          <li
            className={`module-type-list-item ${activeTab === "recommended" ? "module-type-list-item-active" : ""}`}
            onClick={() => setActiveTab("recommended")}
          >
            Recommended
          </li>
          <li
            className={`module-type-list-item ${activeTab === "active" ? "module-type-list-item-active" : ""}`}
            onClick={() => setActiveTab("active")}
          >
            Active
          </li>
          <li
            className={`module-type-list-item ${activeTab === "finished" ? "module-type-list-item-active" : ""}`}
            onClick={() => setActiveTab("finished")}
          >
            Finished
          </li>
        </ul>

        <div className="module-types">
          {activeTab === "recommended" && (
            <ModuleList emptyText="Нет рекомендованных модулей">
              {recommendedFromSso.map(([skillName], idx) => (
                <Module
                  key={`sso-${normalizeName(skillName)}-${idx}`}
                  competency={skillName}
                  progress={0}
                  mode="recommended"
                />
              ))}

              {recommendedFromLocal.map((recommendation, idx) => (
                <Module
                  key={`local-${normalizeName(recommendation.competency)}-${idx}`}
                  competency={recommendation.competency}
                  explainGoal={recommendation.explainGoal}
                  progress={0}
                  mode="recommended"
                />
              ))}
            </ModuleList>
          )}

          {activeTab === "active" && (
            <ModuleList emptyText="Нет активных модулей">
              {activeSessions.map((session) => (
                <Module
                  key={session.session_id}
                  competency={session.competency}
                  session={session}
                  mode={mode}
                  progress={session.progress}
                  progressBaseline={session.progress_baseline}
                />
              ))}
            </ModuleList>
          )}

          {activeTab === "finished" && (
            <ModuleList emptyText="Нет завершенных модулей">
              {completedSessions.map((session) => (
                <Module
                  key={session.session_id}
                  competency={session.competency}
                  session={session}
                  mode={mode}
                  progress={session.progress ?? 1}
                  progressBaseline={session.progress_baseline}
                />
              ))}
            </ModuleList>
          )}
        </div>
      </div>
    </div>
  );
}

function ModuleList({ children, emptyText }) {
  const items = Array.isArray(children) ? children.filter(Boolean) : [children].filter(Boolean);

  return (
    <div className="modules-container modules-container-reccomended">
      <div className="modules-container scroll-container">
        {items.length > 0 ? items : <div className="item">{emptyText}</div>}
      </div>
    </div>
  );
}

function useSessionsQuery(token, status) {
  return useQuery({
    queryKey: ["learningSessions", status, token],
    queryFn: async () => {
      const res = await fetch(`${LEARNING_SERVICE}/learning/my?status=${status}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch sessions");
      return res.json();
    },
    enabled: !!token,
  });
}

function useImportedSkillsQuery(isSSO) {
  return useQuery({
    queryKey: ["importedSkills"],
    queryFn: async () => {
      if (!isSSO) return null;

      const user = JSON.parse(localStorage.getItem("user"));
      if (!user?.email) throw new Error("No user email found");

      const res = await fetch(`${INTEGRATION_SERVICE}/import-progress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email }),
      });

      if (!res.ok) throw new Error("Failed to fetch imported skills");
      return res.json();
    },
    enabled: !!isSSO,
    retry: false,
  });
}

function normalizeName(name) {
  return String(name || "")
    .trim()
    .toLowerCase()
    .replace(/[-/\s]+/g, "_");
}

function normalizeStoredRecommendation(recommendation) {
  if (typeof recommendation === "string") {
    return null;
  }

  if (!recommendation || typeof recommendation !== "object") return null;

  const competency =
    recommendation.competency ||
    recommendation.main_competency ||
    recommendation.module?.main_competency;

  if (!competency) return null;

  return {
    competency,
    explainGoal:
      recommendation.explainGoal ||
      recommendation.explain_goal ||
      recommendation.explanation?.module_reason ||
      recommendation.explanation?.reason ||
      null,
  };
}

function cleanupRecommendedModulesStorage() {
  try {
    const stored = JSON.parse(localStorage.getItem("recommended_modules") || "[]");
    if (!Array.isArray(stored)) {
      localStorage.setItem("recommended_modules", "[]");
      return;
    }

    const cleaned = stored
      .map(normalizeStoredRecommendation)
      .filter(Boolean);

    localStorage.setItem("recommended_modules", JSON.stringify(cleaned));
  } catch {
    localStorage.setItem("recommended_modules", "[]");
  }
}
