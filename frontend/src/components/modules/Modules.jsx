// components/Modules.jsx
{/*import { useQuery } from '@tanstack/react-query';
import "../../App.css"
import "./module.css"
const LEARNING_SERVICE = "http://155.212.237.86:8001";

import icon1 from "../../assets/module-icons/Scale.svg";
import icon2 from "../../assets/module-icons/Box2.svg";
import icon3 from "../../assets/module-icons/Layers.svg";
import ProgressBar from "./module/ProgressBar"
import Module from "./module/Module";

const icons = [icon1, icon2, icon3];

export default function Modules({mode}) {
  const containerClass =
    mode === "history" ? "history-container" : "modules-container";

  const token = localStorage.getItem("token");
  console.log("TOKEN:", token);
  const { data: sessions, isLoading, error } = useQuery({
    queryKey: ['activeSessions'],
    queryFn: async () => {
      const res = await fetch(
        `${LEARNING_SERVICE}/learning/my?status=active`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        throw new Error("Failed to fetch sessions");
      }

      return res.json();
    },
  });

  if (isLoading) {
    return <div className='item'> Загрузка активных модулей...</div>;
  }

  if (error) {
    return <div className='item'> Ошибка загрузки: {error.message}</div>;
  }

  if (!sessions || sessions.length === 0) {
    return <div className='item'> Нет активных модулей</div>;
  }

  return (
    <div className={containerClass}>
      
      {mode === "modules" && (
        <h3 className="section-caption-module">Modules</h3>
      )}

      {sessions.map((session) => (
        <Module
          key={session.session_id}
          competency={session.competency}
          session={session} // если захочешь расширить
          mode={mode}
        />
      ))}

    </div>
  );
}*/}


// components/Modules.jsx
import { useQuery } from '@tanstack/react-query';
import "../../App.css"
import "./module.css"
const LEARNING_SERVICE = "http://localhost:8001";
const INTEGRATION_SERVICE = "http://localhost:8012/api/integration/";

import icon1 from "../../assets/module-icons/Scale.svg";
import icon2 from "../../assets/module-icons/Box2.svg";
import icon3 from "../../assets/module-icons/Layers.svg";
import ProgressBar from "./module/ProgressBar"
import Module from "./module/Module";

const icons = [icon1, icon2, icon3];

export default function Modules({ mode, ssoLogin }) { // добавили флаг ssoLogin
  const containerClass =
    mode === "history" ? "history-container" : "modules-container";

  const token = localStorage.getItem("token");

  // 🔹 Запрос на активные модули
  const { data: sessions, isLoading: loadingSessions, error: sessionsError } = useQuery({
    queryKey: ['activeSessions'],
    queryFn: async () => {
      const res = await fetch(`${LEARNING_SERVICE}/learning/my?status=active`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch sessions");
      return res.json();
    },
  });

  // 🔹 Запрос на импортированные SSO модули
  const { data: importedSkills, isLoading: loadingImported, error: importedError } = useQuery({
    queryKey: ['importedSkills'],
    queryFn: async () => {
      if (!ssoLogin) return null; // если не SSO — пропускаем
      const res = await fetch(`${INTEGRATION_SERVICE}/import-progress`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch imported skills");
      return res.json();
    },
    enabled: !!ssoLogin && !!token, // выполняем только если SSO
  });

  if (loadingSessions || loadingImported) {
    return <div className='item'>Загрузка модулей...</div>;
  }

  if (sessionsError || importedError) {
    return <div className='item'>Ошибка загрузки: {sessionsError?.message || importedError?.message}</div>;
  }

  return (
    <div className={containerClass}>
      {mode === "modules" && <h3 className="section-caption-module">Modules</h3>}

      {/* 🔹 Рекомендованные модули из SSO */}
      {importedSkills && importedSkills.status === "imported" && (
        <>
          <h3 className="section-caption-module">Рекомендованные модули</h3>
          {Object.entries(importedSkills.skills).map(([skillName, progress], idx) => (
            <Module
              key={`sso-${idx}`}
              competency={skillName}
              progress={progress} // если Module поддерживает progress
              mode={mode}
              isRecommended={true} // чтобы можно было стилизовать иначе
            />
          ))}
        </>
      )}

      {/* 🔹 Активные сессии */}
      {sessions && sessions.length > 0 ? (
        sessions.map((session) => (
          <Module
            key={session.session_id}
            competency={session.competency}
            session={session}
            mode={mode}
          />
        ))
      ) : (
        <div className='item'>Нет активных модулей</div>
      )}
    </div>
  );
}