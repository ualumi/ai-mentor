// components/Modules.jsx
import { useQuery } from '@tanstack/react-query';
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
      {/*{sessions.map((session) => (
        <div key={session.session_id} className="item item-light">
          <span className='menu-item-text'>{session.competency}</span>
        </div>
      ))}*/}
      {sessions.map((session) => (
        <Module
          key={session.session_id}
          competency={session.competency}
          session={session} // если захочешь расширить
          mode={mode}
        />
      ))}
      {/*{sessions.map((session, index) => (
        <div key={session.session_id} className="item item-light item-module">
          <div className='module-info'>

            <div className="module-icon">
              <img
                src={icons[index % icons.length]}
                alt="module icon"
                className="module-icon-img"
              />
            </div>

            <div className='modules-description'>
              <span className='modules-item-text'>
                {session.competency}
              </span>

              <p className='modules-item-p'>Задач решено: n</p>
            </div>
          </div>

          {mode ==! "history" && (
            <div>
              <div className='menu-item-processflag'>In process</div>
              <ProgressBar />
            </div>
            
          )}

        </div>
      ))}*/}
    </div>
  );
}