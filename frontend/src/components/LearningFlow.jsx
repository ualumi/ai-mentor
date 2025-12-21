import { useEffect, useState } from "react";
import Login from "./Login";
import SessionStarter from "./SessionStarter";
import TaskView from "./TaskView";
import CodeEditor from "./CodeEditor";
import { connectTaskWS } from "../api/ws";
import Playground from "./Playground";

export default function LearningFlow() {
  const [token, setToken] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [task, setTask] = useState(null);
  const [ws, setWs] = useState(null);

  useEffect(() => {
    if (!sessionId) return;

    const socket = connectTaskWS(sessionId, token, (msg) => {
      if (msg.condition) {
        setTask(msg);
      }
    });

    setWs(socket);
    return () => socket.close();
  }, [sessionId]);

  if (!token) return <Login onAuth={setToken} />;
  if (!sessionId) return <SessionStarter token={token} onStart={setSessionId} />;

  return (
    <>
      <TaskView task={task} />
      {ws && <Playground ws={ws} />}
    </>
  );
}
