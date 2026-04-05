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
const INTEGRATION_SERVICE = "http://localhost:8012/api/integration";

import icon1 from "../../assets/module-icons/Scale.svg";
import icon2 from "../../assets/module-icons/Box2.svg";
import icon3 from "../../assets/module-icons/Layers.svg";
import ProgressBar from "./module/ProgressBar"
import Module from "./module/Module";
import { useAuth } from "../../context/AuthContext";
import { NavLink } from "react-router-dom";


const icons = [icon1, icon2, icon3];

export default function Modules({ mode}) { // добавили флаг ssoLogin
  const containerClass =
    mode === "history" ? "history-container" : "modules-container";

  //const { isSSO } = useAuth();
  const { token, isSSO } = useAuth();
  console.log(token)
  console.log('isSSO', isSSO)
  //const token = localStorage.getItem("token");
  
  // 🔹 Запрос на активные модули
  const { data: sessions, isLoading: loadingSessions, error: sessionsError } = useQuery({
    queryKey: ['activeSessions'],
    queryFn: async () => {
      console.log("IMPORT TOKEN:", token);
      const res = await fetch(`${LEARNING_SERVICE}/learning/my?status=active`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch sessions");
      return res.json();
    },
  });

  // 🔹 Запрос на импортированные SSO модули
  /*const { data: importedSkills, isLoading: loadingImported, error: importedError } = useQuery({
    queryKey: ['importedSkills'],
    queryFn: async () => {
      if (!isSSO) return null; // если не SSO — пропускаем
      const res = await fetch(`${INTEGRATION_SERVICE}/import-progress`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        localStorage.setItem("ssoImported", "true");
      }
      if (!res.ok) throw new Error("Failed to fetch imported skills");
      return res.json();
    },
    //enabled: !!isSSO && !!token, // выполняем только если SSO
    enabled: !!isSSO && !!token && !localStorage.getItem("ssoImported")
  });*/
  const { data: importedSkills, isLoading: loadingImported, error: importedError } = useQuery({
    queryKey: ['importedSkills'],
    queryFn: async () => {
      if (!isSSO) return null;

      const user = JSON.parse(localStorage.getItem("user"));

      const res = await fetch(`${INTEGRATION_SERVICE}/import-progress`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",   // ✅ обязательно
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: user?.email,                  // ✅ как в тесте
        }),
      });

      /*if (res.ok) {
        localStorage.setItem("ssoImported", "true");
        console.log("ssoImported")
      }*/

      if (!res.ok) throw new Error("Failed to fetch imported skills");

      return res.json();
    },
    enabled: !!isSSO && !!token,
    //enabled: !!isSSO && !!token && !localStorage.getItem("ssoImported"),
  });

  if (loadingSessions || loadingImported) {
    return <div className='item'>Загрузка модулей...</div>;
  }

  if (sessionsError || importedError) {
    return <div className='item'>Ошибка загрузки: {sessionsError?.message || importedError?.message}</div>;
  }

  return (
    <div className={`modules-block ${isSSO ? "modules-block-sso" : "modules-block-default"}`}>
      <div className={containerClass}>
        {/*{mode ==! "modules" && <h3 className="section-caption-module">Modules</h3>}*/}
        {mode ==! "free" && <div className="home-summary-block-label">
                            <h3 className="home-summary-block-label-text">Активные модули</h3>
                            <NavLink to="/module" className={"home-summary-block-label-link"}>перейти</NavLink>
        </div>}
        
        <div className='modules-container scroll-container'>
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
        
      </div>

      <div className={containerClass}>
        {importedSkills && importedSkills.status === "imported" && (
          <div className='modules-container modules-container-reccomended'>
            <div className="home-summary-block-label">
                            <h3 className="home-summary-block-label-text">Рекомендованные модули</h3>
                            <NavLink to="/module" className={"home-summary-block-label-link"}>перейти</NavLink>
            </div>
            {/*<h3 className="section-caption-module-recommended">Рекомендованные модули</h3>*/}
            <div className='modules-container scroll-container'>
              {Object.entries(importedSkills.skills).map(([skillName, progress], idx) => (
                <Module
                  key={`sso-${idx}`}
                  competency={skillName}
                  progress={progress} // если Module поддерживает progress
                  mode={mode}
                  isRecommended={true} // чтобы можно было стилизовать иначе
                />
              ))}
            </div>
            
          </div>
        )}
      </div>

      
      
      {/*{mode === "modules" && <h3 className="section-caption-module">Modules</h3>}*/}


        {/*{importedSkills && importedSkills.status === "imported" && (
          <div className='modules-container modules-container-reccomended'>
            <h3 className="section-caption-module-recommended">Рекомендованные модули</h3>
            <div className='modules-container scroll-container'>
              {Object.entries(importedSkills.skills).map(([skillName, progress], idx) => (
                <Module
                  key={`sso-${idx}`}
                  competency={skillName}
                  progress={progress} // если Module поддерживает progress
                  mode={mode}
                  isRecommended={true} // чтобы можно было стилизовать иначе
                />
              ))}
            </div>
            
          </div>
        )}*/}

      

      {/*{sessions && sessions.length > 0 ? (
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
      )}*/}
    </div>
  );
}