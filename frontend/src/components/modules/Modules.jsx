// components/Modules.jsx
{/*import { useQuery } from '@tanstack/react-query';
import "../../App.css"
import "./module.css"
const LEARNING_SERVICE = "http://localhost:8001";

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
{/*import { useQuery } from '@tanstack/react-query';
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

  const { data: importedSkills, isLoading: loadingImported, error: importedError } = useQuery({
    queryKey: ['importedSkills'],
    queryFn: async () => {
      if (!isSSO) return null;

      const user = JSON.parse(localStorage.getItem("user"));

      if (!user?.email) {
        throw new Error("No user email found");
      }

      const res = await fetch(`${INTEGRATION_SERVICE}/import-progress`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // ❌ Authorization можно убрать (он больше не нужен)
        },
        body: JSON.stringify({
          email: user.email, // ✅ ОБЯЗАТЕЛЬНО строка
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("IMPORT ERROR:", text);
        throw new Error("Failed to fetch imported skills");
      }

      return res.json();
    },
    enabled: !!isSSO,
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
   
        {mode ==! "free" && <div className="home-summary-block-label">
                            <h3 className="home-label module-label">Модули</h3>
                            <NavLink to="/module" className={"home-summary-block-label-link"}>перейти</NavLink>
        </div>}
        <ul className='module-type-list'>
            <li className='module-type-list-item'>Recommended</li>
            <li className='module-type-list-item'>Active</li>
            <li className='module-type-list-item'>Finished</li>
        </ul>
        <div className='module-types'>
          
          
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
        
        
      </div>

      <div className={containerClass}>
        {importedSkills && importedSkills.status === "imported" && (
          <div className='modules-container modules-container-reccomended'>
            <div className="home-summary-block-label">
                            <h3 className="home-summary-block-label-text">Рекомендованные модули</h3>
                            <NavLink to="/module" className={"home-summary-block-label-link"}>перейти</NavLink>
            </div>
  
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

    </div>
  );
}*/}



{/*import { useQuery } from '@tanstack/react-query';
import "../../App.css";
import "./module.css";
import { useState, useEffect } from "react";

const LEARNING_SERVICE = "http://localhost:8001";
const INTEGRATION_SERVICE = "http://localhost:8012/api/integration";

import icon1 from "../../assets/module-icons/Scale.svg";
import icon2 from "../../assets/module-icons/Box2.svg";
import icon3 from "../../assets/module-icons/Layers.svg";

import ProgressBar from "./module/ProgressBar";
import Module from "./module/Module";
import { useAuth } from "../../context/AuthContext";
import { NavLink } from "react-router-dom";



const icons = [icon1, icon2, icon3];

export default function Modules({ mode }) {

  const containerClass =
    mode === "history" ? "history-container" : "modules-container";

  const { token, isSSO } = useAuth();

  // 🔥 TAB STATE (добавлено минимально)
 // const [activeTab, setActiveTab] = useState("recommended");
  const [activeTab, setActiveTab] = useState(
    isSSO ? "recommended" : "active"
  );

  useEffect(() => {
    setActiveTab(isSSO ? "recommended" : "active");
  }, [isSSO]);


    console.log(token);
  console.log('isSSO', isSSO);

  // ---------------------------
  // ACTIVE sessions
  // ---------------------------
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

  // ---------------------------
  // SSO recommended
  // ---------------------------
  const { data: importedSkills, isLoading: loadingImported, error: importedError } = useQuery({
    queryKey: ['importedSkills'],
    queryFn: async () => {
      if (!isSSO) return null;

      const user = JSON.parse(localStorage.getItem("user"));

      if (!user?.email) {
        throw new Error("No user email found");
      }

      const res = await fetch(`${INTEGRATION_SERVICE}/import-progress`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: user.email,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("IMPORT ERROR:", text);
        throw new Error("Failed to fetch imported skills");
      }

      return res.json();
    },
    enabled: !!isSSO,
  });

  if (loadingSessions || loadingImported) {
    return <div className='item'>Загрузка модулей...</div>;
  }

  if (sessionsError || importedError) {
    return (
      <div className='item'>
        Ошибка загрузки: {sessionsError?.message || importedError?.message}
      </div>
    );
  }

  return (
    <div className={`modules-block ${isSSO ? "modules-block-sso" : "modules-block-default"}`}>

      <div className={containerClass}>

        {mode ==! "free" && (
          <div className="home-summary-block-label">
            <h3 className="home-label module-label">Модули</h3>
            <NavLink to="/module" className={"home-summary-block-label-link"}>
              перейти
            </NavLink>
          </div>
        )}


        <ul className='module-type-list'>
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

        <div className='module-types'>


          {activeTab === "recommended" && (
            <div className='modules-container modules-container-reccomended'>
              {importedSkills && importedSkills.status === "imported" && (
                <>
                  <div className="home-summary-block-label">
                    <h3 className="home-summary-block-label-text">
                      Рекомендованные модули
                    </h3>
                    <NavLink to="/module" className={"home-summary-block-label-link"}>
                      перейти
                    </NavLink>
                  </div>

                  <div className='modules-container scroll-container'>
                    {Object.entries(importedSkills.skills).map(([skillName, progress], idx) => (
                      <Module
                        key={`sso-${idx}`}
                        competency={skillName}
                        progress={progress}
                        mode={mode}
                        isRecommended={true}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          )}


          {activeTab === "active" && (
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
          )}


          {activeTab === "finished" && (
            <div className='item'>
              Завершённые модули появятся здесь
            </div>
          )}

        </div>
      </div>
    </div>
  );
}*/}



{/*import { useQuery } from '@tanstack/react-query';
import "../../App.css";
import "./module.css";
import { useState, useEffect } from "react";

const LEARNING_SERVICE = "http://localhost:8001";
const INTEGRATION_SERVICE = "http://localhost:8012/api/integration";

import icon1 from "../../assets/module-icons/Scale.svg";
import icon2 from "../../assets/module-icons/Box2.svg";
import icon3 from "../../assets/module-icons/Layers.svg";

import ProgressBar from "./module/ProgressBar";
import Module from "./module/Module";
import { useAuth } from "../../context/AuthContext";
import { data, NavLink } from "react-router-dom";

const icons = [icon1, icon2, icon3];

export default function Modules({ mode }) {

  const containerClass =
    mode === "history" ? "history-container" : "modules-container";

  const { token, isSSO } = useAuth();

  const [activeTab, setActiveTab] = useState(
    isSSO ? "recommended" : "active"
  );

  useEffect(() => {
    setActiveTab(isSSO ? "recommended" : "active");
  }, [isSSO]);

  // 🔥 localStorage recommended
  const [localRecommended, setLocalRecommended] = useState([]);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("recommended_modules") || "[]");
      setLocalRecommended(Array.isArray(stored) ? stored : []);
    } catch (e) {
      console.error("Failed to parse local recommended modules", e);
      setLocalRecommended([]);
    }
  }, []);
  

  // ---------------------------
  // ACTIVE sessions
  // ---------------------------
  const { data: sessions, isLoading: loadingSessions, error: sessionsError } = useQuery({
    queryKey: ['activeSessions'],
    queryFn: async () => {
      const res = await fetch(`${LEARNING_SERVICE}/learning/my?status=active`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch sessions");
      return res.json();
      console.log("RES" ,res.json())
    },
  });
  console.log("DATA", sessions)

  // ---------------------------
  // SSO recommended
  // ---------------------------
  const { data: importedSkills, isLoading: loadingImported, error: importedError } = useQuery({
    queryKey: ['importedSkills'],
    queryFn: async () => {
      if (!isSSO) return null;

      const user = JSON.parse(localStorage.getItem("user"));

      if (!user?.email) {
        throw new Error("No user email found");
      }

      const res = await fetch(`${INTEGRATION_SERVICE}/import-progress`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: user.email,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("IMPORT ERROR:", text);
        throw new Error("Failed to fetch imported skills");
      }

      return res.json();
    },
    enabled: !!isSSO,
  });

  if (loadingSessions || loadingImported) {
    return <div className='item'>Загрузка модулей...</div>;
  }

  if (sessionsError || importedError) {
    return (
      <div className='item'>
        Ошибка загрузки: {sessionsError?.message || importedError?.message}
      </div>
    );
  }

  // 🔥 фильтрация
  const activeNames = new Set(
    (sessions || []).map(s => s.competency)
  );

  const filteredLocalRecommended = localRecommended.filter(
    (name) => !activeNames.has(name)
  );

  const ssoNames = importedSkills?.skills
    ? Object.keys(importedSkills.skills)
    : [];

  const finalLocalRecommended = filteredLocalRecommended.filter(
    (name) => !ssoNames.includes(name)
  );

  console.log(filteredLocalRecommended);
  console.log(finalLocalRecommended);

  return (
    <div className={`modules-block ${isSSO ? "modules-block-sso" : "modules-block-default"}`}>

      <div className={containerClass}>

        {mode ==! "free" && (
          <div className="home-summary-block-label">
            <h3 className="home-label module-label">Модули</h3>
            <NavLink to="/module" className={"home-summary-block-label-link"}>
              перейти
            </NavLink>
          </div>
        )}

        <ul className='module-type-list'>
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

        <div className='module-types'>


          {activeTab === "recommended" && (
            <div className='modules-container modules-container-reccomended'>

              {(importedSkills?.status === "imported" || finalLocalRecommended.length > 0) && (
                <>


                  <div className='modules-container scroll-container'>


                    {importedSkills?.status === "imported" &&
                      Object.entries(importedSkills.skills).map(([skillName, progress], idx) => (
                        <Module
                          key={`sso-${idx}`}
                          competency={skillName}
                          progress={0}
                          mode={'module'}
                          //isRecommended={true}
                        />
                      ))
                    }


                    {finalLocalRecommended.map((name, idx) => (
                      <Module
                        key={`local-${idx}`}
                        competency={name}
                        progress={0}
                        mode={mode}
                      />
                    ))}

                  </div>
                </>
              )}

            </div>
          )}


          {activeTab === "active" && (
            <div className='modules-container scroll-container'>
              {sessions && sessions.length > 0 ? (
                sessions.map((session) => (
                  <Module
                    key={session.session_id}
                    competency={session.competency}
                    session={session}
                    mode={mode}
                    progress={session.progress} // если Module поддерживает прогресс
                  />
                ))
              ) : (
                <div className='item'>Нет активных модулей</div>
              )}
            </div>
          )}


          {activeTab === "finished" && (
            <div className='item'>
              Завершённые модули появятся здесь
            </div>
          )}

        </div>
      </div>
    </div>
  );
}*/}


{/*import { useQuery } from '@tanstack/react-query';
import "../../App.css";
import "./module.css";
import { useState, useEffect } from "react";

const LEARNING_SERVICE = "http://localhost:8001";
const INTEGRATION_SERVICE = "http://localhost:8012/api/integration";

import icon1 from "../../assets/module-icons/Scale.svg";
import icon2 from "../../assets/module-icons/Box2.svg";
import icon3 from "../../assets/module-icons/Layers.svg";

import ProgressBar from "./module/ProgressBar";
import Module from "./module/Module";
import { useAuth } from "../../context/AuthContext";
import { NavLink } from "react-router-dom";

const icons = [icon1, icon2, icon3];

export default function Modules({ mode }) {

  const containerClass =
    mode === "history" ? "history-container" : "modules-container";

  const { token, isSSO } = useAuth();

  const [activeTab, setActiveTab] = useState(
    isSSO ? "recommended" : "active"
  );

  useEffect(() => {
    setActiveTab(isSSO ? "recommended" : "active");
  }, [isSSO]);

  // ---------------------------
  // ACTIVE sessions
  // ---------------------------
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

  const localRecommended = (() => {
    try {
      const stored = JSON.parse(localStorage.getItem("recommended_modules") || "[]");
      return Array.isArray(stored) ? stored : [];
    } catch {
      return [];
    }
  })();

  // ---------------------------
  // SSO recommended
  // ---------------------------
  const { data: importedSkills, isLoading: loadingImported, error: importedError } = useQuery({
    queryKey: ['importedSkills'],
    queryFn: async () => {
      if (!isSSO) return null;

      const user = JSON.parse(localStorage.getItem("user"));

      if (!user?.email) {
        throw new Error("No user email found");
      }

      const res = await fetch(`${INTEGRATION_SERVICE}/import-progress`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: user.email,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("IMPORT ERROR:", text);
        throw new Error("Failed to fetch imported skills");
      }

      return res.json();
    },
    enabled: !!isSSO,
  });

  if (loadingSessions || loadingImported) {
    return <div className='item'>Загрузка модулей...</div>;
  }

  if (sessionsError || importedError) {
    return (
      <div className='item'>
        Ошибка загрузки: {sessionsError?.message || importedError?.message}
      </div>
    );
  }

  // 🔥 фильтрация
  const activeNames = new Set(
    (sessions || []).map(s => s.competency)
  );

  const filteredLocalRecommended = localRecommended.filter(
    (name) => !activeNames.has(name)
  );

  const ssoNames = importedSkills?.skills
    ? Object.keys(importedSkills.skills)
    : [];

  const finalLocalRecommended = filteredLocalRecommended.filter(
    (name) => !ssoNames.includes(name)
  );

  return (
    <div className={`modules-block ${isSSO ? "modules-block-sso" : "modules-block-default"}`}>

      <div className={containerClass}>

        {mode ==! "free" && (
          <div className="home-summary-block-label">
            <h3 className="home-label module-label">Модули</h3>
            <NavLink to="/module" className={"home-summary-block-label-link"}>
              перейти
            </NavLink>
          </div>
        )}

        <ul className='module-type-list'>
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

        <div className='module-types'>


          {activeTab === "recommended" && (
            <div className='modules-container modules-container-reccomended'>

              {(importedSkills?.status === "imported" || finalLocalRecommended.length > 0) && (
                <div className='modules-container scroll-container'>


                  {importedSkills?.status === "imported" &&
                    Object.entries(importedSkills.skills)
                      .filter(([skillName]) => !activeNames.has(skillName)) // ✅ FIX
                      .map(([skillName, progress], idx) => (
                        <Module
                          key={`sso-${idx}`}
                          competency={skillName}
                          progress={0}
                          mode={'module'}
                        />
                      ))
                  }


                  {finalLocalRecommended.map((name, idx) => (
                    <Module
                      key={`local-${idx}`}
                      competency={name}
                      progress={0}
                      mode={mode}
                    />
                  ))}

                </div>
              )}

            </div>
          )}


          {activeTab === "active" && (
            <div className='modules-container scroll-container'>
              {sessions && sessions.length > 0 ? (
                sessions.map((session) => (
                  <Module
                    key={session.session_id}
                    competency={session.competency}
                    session={session}
                    mode={mode}
                    progress={session.progress}
                  />
                ))
              ) : (
                <div className='item'>Нет активных модулей</div>
              )}
            </div>
          )}


          {activeTab === "finished" && (
            <div className='item'>
              Завершённые модули появятся здесь
            </div>
          )}

        </div>
      </div>
    </div>
  );
}*/}

import { useQuery } from '@tanstack/react-query';
import "../../App.css";
import "./module.css";
import { useState, useEffect } from "react";

const LEARNING_SERVICE = "http://localhost:8001";
const INTEGRATION_SERVICE = "http://localhost:8012/api/integration";

import icon1 from "../../assets/module-icons/Scale.svg";
import icon2 from "../../assets/module-icons/Box2.svg";
import icon3 from "../../assets/module-icons/Layers.svg";

import ProgressBar from "./module/ProgressBar";
import Module from "./module/Module";
import { useAuth } from "../../context/AuthContext";
import { NavLink } from "react-router-dom";

const icons = [icon1, icon2, icon3];

export default function Modules({ mode }) {

  const containerClass =
    mode === "history" ? "history-container" : "modules-container";

  const { token, isSSO } = useAuth();

  const [activeTab, setActiveTab] = useState(
    isSSO ? "recommended" : "active"
  );

  useEffect(() => {
    setActiveTab(isSSO ? "recommended" : "active");
  }, [isSSO]);

  // ---------------------------
  // ACTIVE sessions
  // ---------------------------
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

  // ---------------------------
  // LOCAL recommended
  // ---------------------------
  const localRecommended = (() => {
    try {
      const stored = JSON.parse(localStorage.getItem("recommended_modules") || "[]");
      return Array.isArray(stored) ? stored : [];
    } catch {
      return [];
    }
  })();

  // ---------------------------
  // SSO recommended (НЕ ЛОМАЕТ UI)
  // ---------------------------
  const {
    data: importedSkills,
    isLoading: loadingImported,
    error: importedError
  } = useQuery({
    queryKey: ['importedSkills'],
    queryFn: async () => {
      if (!isSSO) return null;

      const user = JSON.parse(localStorage.getItem("user"));

      if (!user?.email) {
        throw new Error("No user email found");
      }

      const res = await fetch(`${INTEGRATION_SERVICE}/import-progress`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: user.email,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to fetch imported skills");
      }

      return res.json();
    },
    enabled: !!isSSO,
    retry: false, // 🔥 важно: не долбим API при ошибке
  });

  // ---------------------------
  // LOADING (только sessions критичны)
  // ---------------------------
  if (loadingSessions) {
    return <div className='item'>Загрузка модулей...</div>;
  }

  if (sessionsError) {
    return (
      <div className='item'>
        Ошибка загрузки: {sessionsError.message}
      </div>
    );
  }

  // ---------------------------
  // ACTIVE SET
  // ---------------------------
  const activeNames = new Set(
    (sessions || []).map(s => s.competency)
  );

  // ---------------------------
  // SAFE SSO (если ошибка — просто пусто)
  // ---------------------------
  const safeImportedSkills = importedError ? null : importedSkills;

  const ssoNames = safeImportedSkills?.skills
    ? Object.keys(safeImportedSkills.skills)
    : [];

  const filteredLocalRecommended = localRecommended.filter(
    (name) => !activeNames.has(name)
  );

  const finalLocalRecommended = filteredLocalRecommended.filter(
    (name) => !ssoNames.includes(name)
  );

  return (
    <div className={`modules-block ${isSSO ? "modules-block-sso" : "modules-block-default"}`}>

      <div className={containerClass}>

        {mode ==! "free" && (
          <div className="home-summary-block-label">
            <h3 className="home-label module-label">Модули</h3>
            <NavLink to="/module" className={"home-summary-block-label-link"}>
              перейти
            </NavLink>
          </div>
        )}

        <ul className='module-type-list'>
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

        <div className='module-types'>

          {/* ---------------- RECOMMENDED ---------------- */}
          {activeTab === "recommended" && (
            <div className='modules-container modules-container-reccomended'>

              {(safeImportedSkills?.status === "imported" || finalLocalRecommended.length > 0) && (
                <div className='modules-container scroll-container'>

                  {/* SSO */}
                  {safeImportedSkills?.status === "imported" &&
                    Object.entries(safeImportedSkills.skills)
                      .filter(([skillName]) => !activeNames.has(skillName))
                      .map(([skillName], idx) => (
                        <Module
                          key={`sso-${idx}`}
                          competency={skillName}
                          progress={0}
                          mode={'module'}
                        />
                      ))
                  }

                  {/* LOCAL */}
                  {finalLocalRecommended.map((name, idx) => (
                    <Module
                      key={`local-${idx}`}
                      competency={name}
                      progress={0}
                      mode={mode}
                    />
                  ))}

                </div>
              )}

            </div>
          )}

          {/* ---------------- ACTIVE ---------------- */}
          {activeTab === "active" && (
            <div className='modules-container scroll-container'>
              {sessions && sessions.length > 0 ? (
                sessions.map((session) => (
                  <Module
                    key={session.session_id}
                    competency={session.competency}
                    session={session}
                    mode={mode}
                    progress={session.progress}
                  />
                ))
              ) : (
                <div className='item'>Нет активных модулей</div>
              )}
            </div>
          )}

          {/* ---------------- FINISHED ---------------- */}
          {activeTab === "finished" && (
            <div className='item'>
              Завершённые модули появятся здесь
            </div>
          )}

        </div>
      </div>
    </div>
  );
}