import Modules from "../modules/Modules";
import Item from "../mentor/Item";
import AttemptsHistory from './AttemptsHistory';
import { useState } from 'react';

export default function History({mode}) {
  const [selectedAttempt, setSelectedAttempt] = useState(null);
  const handleSelectAttempt = (attemptId) => {
    setSelectedAttempt(attemptId);
    // Здесь можно сделать запрос на сервер для полной информации по attemptId
    console.log("Выбран attempt_id:", attemptId);
  };
  return (
    <div>
      {mode === "module" && <p className="history-label">LAST MODULES</p>}
      {mode === "free" && <p className="history-label">HISTORY</p>}
      
        {mode === "module" && <Modules />}
        {mode === "free" && 
          <div className="menu-list history-list">
            <AttemptsHistory onSelectAttempt={handleSelectAttempt} />
            <Item type="text_item" text="Gjgsnrf1" clas="l" />
            <Item type="text_item" text="Gjgsnrf1gghj..." clas="l" />
            <Item type="text_item" text="Gjgsnrf1gghj..." clas="l" />
          </div>
        }
      
      
    </div>
  );
}