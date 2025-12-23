import { useEffect, useState } from "react";
import SessionStarter from "./SessionStarter";
import TaskView from "./TaskView";
import Playground from "./Playground";
import { connectTaskWS } from "../api/ws";
import { useAuth } from "./AuthContext";
import '../App.css'
import Analitycs from "./Analitycs";
import { NavLink } from "react-router-dom";

export default function LearningFlow() {
  const { token } = useAuth(); // ✅ токен берём из контекста
  const [sessionId, setSessionId] = useState(null);
  const [task, setTask] = useState(null);
  const [ws, setWs] = useState(null);

  useEffect(() => {
    if (!sessionId || !token) return;

    const socket = connectTaskWS(sessionId, token, (msg) => {
      if (msg.condition) {
        setTask(msg);
      }
    });

    setWs(socket);
    return () => socket.close();
  }, [sessionId, token]);

  if (!sessionId) {
    return <div className="learning-content">
      <div>
        <h1>Личный кабинет</h1>
        <p className="module_info">Веб-платформа предназначена для обучения навыкам разработки через практику и интерактивное взаимодействие с ИИ-ментором. </p>
      </div>
      <div>
        <div className="profile">
          <div className="nameandlink">
              <p className="module_name">Профиль</p>
              <p className="link">перейти в настройки</p>
            </div>
            <p className="module_infor">Modules section description</p>
        </div>
        <div className="kaabinet">
          <div className="chart">
            <div className="nameandlink">
              <p className="module_name">Прогресс</p>
              <NavLink to="/analitics"><p className="link">перейти к аналитике</p></NavLink>
            </div>
            <p className="module_infor">Modules section description</p>
            <div className="chartitself">
              <Analitycs  labels={["Навык 1", "Навык 2", "Навык 3", "Навык 4"]} values={[20, 40, 30, 80]}/>
            </div>
            
          </div>
          
          <div className="module_section">
            <div className="nameandlink">
              <p className="module_name">Модули</p>
              <NavLink to="/modules"><p className="link">К списку модулей</p></NavLink>
            </div>
            
            <p className="module_infor">Modules section description</p>
            <div className="modules">
              <SessionStarter token={token} onStart={setSessionId} className="module_button" />
              <SessionStarter className="disabled"></SessionStarter>
              <SessionStarter className="disabled"></SessionStarter>  
            </div>
          </div>     
        </div>
      </div>
      
    </div>
  }

  return (
    <>
      <TaskView task={task} />
      {ws && <Playground ws={ws} />}
    </>
  );
}
