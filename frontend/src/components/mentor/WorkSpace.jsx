
{/*import SandBox from "./SandBox";
import React, { useState } from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CodeProvider } from '../CodeContext';
import Item from "./Item";
import s from "./FreeMode.module.css"
import Recommendation from "./Recommendation";
import { useParams } from "react-router-dom";
import TasksPanel from "../modules/TasksPanel";
import { useLocation } from "react-router-dom";

export default function WorkSpace({ mode }) {
    const location = useLocation();

    const competency = location.state?.competency;
    
  return (
        <CodeProvider>
            <div className={`free-mode `}>
                
                <div className={`${mode}`}>
                    <SandBox mode={mode} name={competency}></SandBox>
                    {mode === "module" && <TasksPanel />}
                </div>  
                <Recommendation mode={mode}/>
                
                
            </div>
        </CodeProvider>
  );
}*/}



import SandBox from "./SandBox";
import {React} from "react";
import { useQuery } from "@tanstack/react-query";
import { CodeProvider } from "../CodeContext";
import Recommendation from "./Recommendation";
import TasksPanel from "../modules/TasksPanel";
import { useLocation, useParams } from "react-router-dom";
import { useState, useEffect } from "react";

const ATTEMPTS_SERVICE = "http://localhost:8009";

export default function WorkSpace({ mode }) {
  console.log(mode)
  const location = useLocation();
  const { id } = useParams(); // 🔥 attempt_id


  const taskData = location.state;

  console.log("TASK FROM SSO:", taskData);
  const initialCode = taskData?.code;
  const taskTitle = taskData?.title;

  const [stableRestoredState, setStableRestoredState] = useState(null);
  const selectedAttemptId = location.state?.selectedAttemptId;

  const competency = location.state?.competency;
  const restoredState = location.state?.restoredState;
  const isExisting = location.state?.isExisting;
  useEffect(() => {
    if (restoredState && !stableRestoredState) {
      setStableRestoredState(restoredState);
    }
  }, [restoredState]);

  console.log("restoredState", mode)
  //const competency = location.state?.competency;

  // 🔥 Загружаем attempt ТОЛЬКО если есть id

  const attemptIdToLoad = selectedAttemptId || id;

  const {
    data: attempt,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["attempt", attemptIdToLoad],
    queryFn: async () => {
      const res = await fetch(`${ATTEMPTS_SERVICE}/attempt/${attemptIdToLoad}`);
      if (!res.ok) throw new Error("Failed to fetch attempt");
      return res.json();
    },
    enabled: !!attemptIdToLoad,
  });

  // 🔥 LOADING / ERROR только для history режима
  if (mode === "history") {
    if (isLoading) return <div>Загрузка попытки...</div>;
    if (error) return <div>Ошибка загрузки</div>;
  }
  console.log(attempt)
  console.log("id", id, "selected_id", selectedAttemptId)

  return (
    <CodeProvider initialCode={attempt?.code}>
      <div className="free-mode">

        <div className={mode}>
          <SandBox
            mode={mode}
            name={competency}
            attempt={attempt} // 🔥 прокидываем данные
            restoredState={restoredState}
            code={initialCode}
            titletask={taskTitle}
          />

          {mode === "module" && <TasksPanel restoredState={stableRestoredState} selectedAttemptId={selectedAttemptId} />}
        </div>


        {attempt ? (
          <Recommendation mode={"history"} attempt={attempt} />
        ) : (
          <Recommendation mode={mode} attempt={attempt} />
        )}

      </div>
    </CodeProvider>
  );
}