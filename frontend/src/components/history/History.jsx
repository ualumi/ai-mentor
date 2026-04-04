import Modules from "../modules/Modules";
import Item from "../mentor/Item";
import AttemptsHistory from './AttemptsHistory';
import { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { Plus} from 'lucide-react';

export default function History({mode}) {
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
      {mode === "module" && <p className="history-label">LAST MODULES</p>}
      {mode === "free" && <p className="history-label">HISTORY</p>}
      
        {mode === "module" && <Modules mode="history"/>}
        {mode === "free" && 
          <div className="menu-list history-list history-scroll">
            <button
              className="item new-attempt"
              onClick={handleClick}
            ><Plus strokeWidth={1} />new</button>
            <AttemptsHistory onSelectAttempt={handleSelectAttempt} />
            {/*<Item type="text_item" text="Gjgsnrf1" clas="l" />
            <Item type="text_item" text="Gjgsnrf1gghj..." clas="l" />
            <Item type="text_item" text="Gjgsnrf1gghj..." clas="l" />*/}
          </div>
        }
      
      
    </div>
  );
}