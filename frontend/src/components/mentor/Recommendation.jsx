

{/*import { MessageCircleCode, BookMarked, ChevronDown } from 'lucide-react';
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


          <div className="reco-content" style={{ display: activeTab === "recommendation" ? "flex" : "none" }}>
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


                <StartModuleButton
                  competency={recommendation.data}
                  //onStart={resetRecommendation}
                />
              </>
            ) : (
              <p>a</p>
            )}
          </div>

          //вкладка ментора
          <div className="reco-content" style={{ display: activeTab === "mentor" ? "flex" : "none" }}>
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
}*/}


import { MessageCircleCode, BookMarked, ChevronDown } from 'lucide-react';
import { useEffect, useState } from 'react';
import { wsService } from '../../services/websocket';
import Item from './Item';
import "../../App.css"
import { Link, useNavigate } from "react-router-dom";
import ExecutionResult from "../ExecutionResult";
import StartModuleButton from "../modules/StartModuleButton";

export default function Recommendation({ mode, attempt }) {
  const [activeTab, setActiveTab] = useState("mentor");
  const [recommendation, setRecommendation] = useState(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isHighlighted, setIsHighlighted] = useState(false);

  const resetRecommendation = () => {
    setRecommendation(null);
    setIsCollapsed(true);
  };

  // 🔹 WebSocket для обычного режима
  useEffect(() => {
    if (mode === "history") return; // отключаем WS в истории

    const handler = (data) => {
      if (data.source?.startsWith("user_progress") && data.data?.recommendations) {
        const uniqueCompetencies = [
          ...new Set(data.data.recommendations.map(item => item.competency))
        ];

        setRecommendation({
          time: new Date().toLocaleTimeString(),
          data: uniqueCompetencies[0],
        });

        setIsCollapsed(false);
        setIsHighlighted(true);
        setTimeout(() => setIsHighlighted(false), 2000);
      }
    };

    wsService.on("user_progress", handler);
    return () => wsService.off("user_progress", handler);
  }, [mode]);

  // 🔹 Установка recommendation из attempt при истории
  useEffect(() => {
    if (mode === "history" && attempt?.analysis) {
      setRecommendation({
        time: new Date(attempt.timestamp).toLocaleTimeString(),
        data: attempt.analysis.recommendations || [],
      });
      setIsCollapsed(false);
    }
  }, [mode, attempt]);

  const toggleCollapse = () => setIsCollapsed((prev) => !prev);

  return (
    <div
      className={`item menu-item menu-item-input item-light
      ${recommendation && !isCollapsed ? "recomendation-item-active" : "recomendation-item"}
      ${isHighlighted ? "recommendation-highlight" : ""}`}
    >
      {recommendation && (
        <button className="recommendation-collapse" onClick={toggleCollapse}>
          {isCollapsed ? "Открыть" : <ChevronDown strokeWidth={1} />}
        </button>
      )}

      {!isCollapsed && (
        <>
          <div className="recomendation-content">
            <div className="reco-content" style={{ display: activeTab === "recommendation" ? "flex" : "none" }}>
              {recommendation ? (
                <>
                  <div className="menu-caption mentor-caption">Module recommendation</div>
                  <div>
                    {Array.isArray(recommendation.data)
                      ? recommendation.data.map((r, i) => <div key={i}>{r}</div>)
                      : recommendation.data}
                  </div>
                  <StartModuleButton
                    competency={recommendation.data}
                    //onStart={resetRecommendation}
                  />
                </>
              ) : (
                <p>Нет рекомендаций</p>
              )}
            </div>

            <div className="reco-content" style={{ display: activeTab === "mentor" ? "flex" : "none" }}>
              <div className="menu-caption mentor-caption">AI mentor</div>
              <ExecutionResult attempt={attempt} />
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
              <span>Recommendations</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
