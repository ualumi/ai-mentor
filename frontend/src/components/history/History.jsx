import Modules from "../modules/Modules";
import Item from "../mentor/Item";
import AttemptsHistory from './AttemptsHistory';
import { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { Plus} from 'lucide-react';
import s from "../mentor/FreeMode.module.css"
import ProgressBar from "../modules/module/ProgressBar";
import TasksPanel from "../modules/TasksPanel";
import Module from "../modules/module/Module";
import ModuleTask from "../modules/module/ModuleTask";

export default function History({mode, name, attempt, restoredState, code, titletask, isSidebarOpen,selectedAttemptId}) {
  const [selectedAttempt, setSelectedAttempt] = useState(null);
  const handleSelectAttempt = (attemptId) => {
    setSelectedAttempt(attemptId);
    // Здесь можно сделать запрос на сервер для полной информации по attemptId
    console.log("Выбран attempt_id:", attemptId);
  };

  const navigate = useNavigate();

  const handleClick = () => {
    {
      navigate(`/mentor/`);
      setTimeout(() => {
        window.location.reload();
      }, 0);
    }
  };
  return (
    <div className="">
      {/* 🔥 HEADER */}
      {mode === "free" && <h1 className={s["section-caption"]}>Самостоятельная практика</h1>}
      {mode === "free" && (
          titletask 
              ? <h1 className={s["section-caption"]}>Задача: {titletask}</h1>
              : <h1 className={s["section-caption"]}></h1>
      )}

      {mode === "module" && (
        <div className={s["progress"]}>
          {/*<h1 className={s["section-caption-module"]}>Модуль: {name}</h1>*/}
          <h1 className={s["section-caption-module"]}>
            Модуль: <span className={s["section-caption-module-name"]}>{name}</span>
          </h1>
          <div className="progress-info">
            {/*<span className="progress-item-text">Прогресс по модулю: </span>
            {/*<ProgressBar progress={15} />*/}
            <ProgressBar progress={restoredState?.attempts?.length || 0} />
            <Module
              //key={session.session_id}
              competency={name}
              //session={session}
              mode={"free"}
            />
          </div>
        </div>
      )}

      {mode === "history" && (
        <h1 className={s["section-caption"]}>История попытки</h1>
      )}


      

      {/*{mode === "module" && <p className="history-label">LAST MODULES</p>}*/}
      {mode === "free" && <div>
        <button
              className="item new-attempt"
              onClick={handleClick}
            ><Plus strokeWidth={1} />new</button>
        <p className="history-label">HISTORY</p></div>}
        {mode === "module" &&<ModuleTask
          mode={"view"}
          onExitView={() => navigate("/")}
        />}
        {/*{mode === "module" && <ModuleTask mode={"view"}></ModuleTask>}*/}
        {mode === "module" && <TasksPanel restoredState={restoredState}/>}
        {/*{mode === "module" && <Modules mode="history"/>}*/}
        {mode === "free" && 
          <div className="menu-list history-list history-scroll">
            {/*<button
              className="item new-attempt"
              onClick={handleClick}
            ><Plus strokeWidth={1} />new</button>*/}
            <AttemptsHistory onSelectAttempt={handleSelectAttempt} />
            {/*<Item type="text_item" text="Gjgsnrf1" clas="l" />
            <Item type="text_item" text="Gjgsnrf1gghj..." clas="l" />
            <Item type="text_item" text="Gjgsnrf1gghj..." clas="l" />*/}
          </div>
        }
      
      
    </div>
  );
}