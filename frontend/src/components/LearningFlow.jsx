import { useEffect, useState } from "react";
import SessionStarter from "./SessionStarter";
import TaskView from "./TaskView";
import Playground from "./Playground";
import { connectTaskWS } from "../api/ws";
import { useAuth } from "./AuthContext";
import '../App.css'
import Analitycs from "./Analitycs";

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
    return <div>
      <h1>Hello username</h1>
      <p className="module_info">Modules section description</p>
      <div className="kaabinet">
          <div className="chart">
            <p className="module_name">Прогресс</p>
            <p className="module_info">Modules section description</p>
            <Analitycs  labels={["День 1", "День 2", "День 3", "День 4"]} values={[20, 40, 55, 80]}/>
          </div>
          
          <div className="module_section">
            <p className="module_name">Модули</p>
            <p className="module_info">Modules section description</p>
            <div className="modules">
              <SessionStarter token={token} onStart={setSessionId} className="module_button" />
              <SessionStarter className="disabled"></SessionStarter>
              <SessionStarter className="disabled"></SessionStarter>  
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
