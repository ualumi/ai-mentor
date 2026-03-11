{/*import { useEffect, useState } from 'react';
import { wsService } from '../../services/websocket';
import Item from './Item';
import "../../App.css"
import { Link, useNavigate } from "react-router-dom";
import ExecutionResult from "../ExecutionResult";

export default function Recommendation({mode}) {
  const navigate = useNavigate();
  const [recommendation, setRecommendation] = useState(null);

  useEffect(() => { 
    const handler = (data) => {
      const uniqueCompetencies = [...new Set(data.data.recommendations.map(item => item.competency))];

      console.log(data)
      // ✅ Сообщение о прогрессе пользователя
      if (
        data.source?.startsWith("user_progress") &&
        data.data?.recommendations
      ) {
        setRecommendation({
          time: new Date().toLocaleTimeString(),
          data: uniqueCompetencies[0] // Пока просто первій компонент для заглушки
        });
      }
    };

    wsService.on('user_progress', handler);

    return () => {
      wsService.off('user_progress', handler);
    };
  }, []);

  if (!recommendation) return null;

  return (
    <div className="item menu-item menu-item-input item-light recomendation-item">
          <div className="recomendation-content">
          <div className="">
            Рекомендован модуль
          </div>

          <div className="menu-caption mentor-caption">
            {typeof recommendation.data === 'string'
              ? recommendation.data
              : JSON.stringify(recommendation.data, null, 2)}
          </div>
          
          <button onClick={() => navigate(`/module/1`)} className='module-button'>
                Начать модуль
            </button>

          <div >
                              <ExecutionResult></ExecutionResult>
          </div>
        </div>
    </div>

  );
}*/}

import { MessageCircleCode, BookMarked, ChevronDown } from 'lucide-react';
import { useEffect, useState } from 'react';
import { wsService } from '../../services/websocket';
import Item from './Item';
import "../../App.css"
import { Link, useNavigate } from "react-router-dom";
import ExecutionResult from "../ExecutionResult";
import StartModuleButton from "../modules/StartModuleButton";

export default function Recommendation({mode}) {
  const resetRecommendation = () => {
    setRecommendation(null);
    setIsCollapsed(true);
  };

  const [activeTab, setActiveTab] = useState("mentor");
  const navigate = useNavigate();
  const [recommendation, setRecommendation] = useState(null);

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isHighlighted, setIsHighlighted] = useState(false);

  useEffect(() => { 
    const handler = (data) => {

      const uniqueCompetencies = [
        ...new Set((data.data?.recommendations || []).map(item => item.competency))
      ];

      console.log(data)

      if (
        data.source?.startsWith("user_progress") &&
        data.data?.recommendations
      ) {

        setRecommendation({
          time: new Date().toLocaleTimeString(),
          data: uniqueCompetencies[0]
        });

        // ⭐ автоматически открыть панель
        setIsCollapsed(false);

        // ⭐ подсветка
        setIsHighlighted(true);

        setTimeout(() => {
          setIsHighlighted(false);
        }, 2000);

      }
    };

    wsService.on('user_progress', handler);

    return () => {
      wsService.off('user_progress', handler);
    };

  }, []);

  // ⭐ toggle collapse
  const toggleCollapse = () => {
    setIsCollapsed(prev => !prev);
  };

  return (

    <div
      className={`item menu-item menu-item-input item-light
      ${recommendation && !isCollapsed ? "recomendation-item-active" : "recomendation-item"}
      ${isHighlighted ? "recommendation-highlight" : ""}`}
    >

      {/* кнопка collapse */}
      {recommendation && (
        <button
          className="recommendation-collapse"
          onClick={toggleCollapse}
        >
          {isCollapsed ? "Открыть" : <ChevronDown strokeWidth={1} />}
        </button>
      )}

      {!isCollapsed && (

        <>

        <div className="recomendation-content">

          {/* вкладка рекомендации */}
          <div style={{ display: activeTab === "recommendation" ? "block" : "none" }}>
            {recommendation ? (
              <>
                <div className='menu-caption mentor-caption'>
                  Module recomendation
                </div>

                <div>
                  Рекомендован модуль
                </div>

                <div className="menu-caption mentor-caption">
                  {typeof recommendation.data === "string"
                    ? recommendation.data
                    : JSON.stringify(recommendation.data, null, 2)}
                </div>

                {/*<button
                  onClick={() => navigate(`/module/1`)}
                  className="module-button"
                >
                  Начать модуль
                </button>*/}
                <StartModuleButton
                  competency="Clustering"
                  /*onStart={resetRecommendation}*/
                />
              </>
            ) : (
              <p>a</p>
            )}
          </div>

          {/* вкладка ментора */}
          <div style={{ display: activeTab === "mentor" ? "block" : "none" }}>
            <div className='menu-caption mentor-caption'>
              AI mentor
            </div>

            <ExecutionResult />
          </div>

        </div>

        <div className="recomentation-tabs">

          <div
            className={`mentor-tab ${activeTab === "mentor" ? "mentor-tab-active" : ""}`}
            onClick={() => setActiveTab("mentor")}
          >
            <MessageCircleCode strokeWidth={1} />
            <span>Mentor reply</span>
          </div>

          <div
            className={`mentor-tab ${activeTab === "recommendation" ? "mentor-tab-active" : ""}`}
            onClick={() => setActiveTab("recommendation")}
          >
            <BookMarked strokeWidth={1} />
            <span>Recomendations</span>
          </div>

        </div>

        </>

      )}

    </div>
  );
}

{/*import { MessageCircleCode, BookMarked } from 'lucide-react';
import { useEffect, useState } from 'react';
import { wsService } from '../../services/websocket';
import Item from './Item';
import "../../App.css"
import { Link, useNavigate } from "react-router-dom";
import ExecutionResult from "../ExecutionResult";

export default function Recommendation({mode}) {
  const [activeTab, setActiveTab] = useState("mentor");
  const navigate = useNavigate();
  const [recommendation, setRecommendation] = useState(null);

  useEffect(() => { 
    const handler = (data) => {

      const uniqueCompetencies = [
        ...new Set((data.data?.recommendations || []).map(item => item.competency))
      ];

      console.log(data)

      if (
        data.source?.startsWith("user_progress") &&
        data.data?.recommendations
      ) {
        setRecommendation({
          time: new Date().toLocaleTimeString(),
          data: uniqueCompetencies[0]
        });
      }
    };

    wsService.on('user_progress', handler);

    return () => {
      wsService.off('user_progress', handler);
    };
  }, []);

  return (
    <div className={`item menu-item menu-item-input item-light ${recommendation ? "recomendation-item-active" : "recomendation-item"}`}>

      <div className="recomendation-content">

        
        <div style={{ display: activeTab === "recommendation" ? "block" : "none" }}>
          {recommendation ? (
            <>
              <div className='menu-caption mentor-caption'>
                Module recomendation
              </div>
              <div>
                Рекомендован модуль
              </div>

              <div className="menu-caption mentor-caption">
                {typeof recommendation.data === "string"
                  ? recommendation.data
                  : JSON.stringify(recommendation.data, null, 2)}
              </div>

              <button
                onClick={() => navigate(`/module/1`)}
                className="module-button"
              >
                Начать модуль
              </button>
            </>
          ) : (
            <p>a</p>
          )}
        </div>

        
        <div style={{ display: activeTab === "mentor" ? "block" : "none" }}>
          <div className='menu-caption mentor-caption'>
                AI mentor
          </div>
          <ExecutionResult />
        </div>

      </div>

      <div className="recomentation-tabs">

        <div
          className={`mentor-tab ${activeTab === "mentor" ? "mentor-tab-active" : ""}`}
          onClick={() => setActiveTab("mentor")}
        >
          <MessageCircleCode strokeWidth={1} />
          <span>Mentor reply</span>
        </div>

        <div
          className={`mentor-tab ${activeTab === "recommendation" ? "mentor-tab-active" : ""}`}
          onClick={() => setActiveTab("recommendation")}
        >
          <BookMarked strokeWidth={1} />
          <span>Recomendations</span>
        </div>

      </div>

    </div>
  );
}*/}
