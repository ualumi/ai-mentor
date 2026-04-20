

/*import { MessageCircleCode, BookMarked, ChevronDown } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { wsService } from '../../services/websocket';
import "../../App.css";
import StartModuleButton from "../modules/StartModuleButton";
import Module from '../modules/module/Module';

export default function Recommendation({ mode, attempt }) {

  const [activeTab, setActiveTab] = useState("mentor");
  const [recommendations, setRecommendations] = useState([]);
  const [mentorReplies, setMentorReplies] = useState([]);
  const [score, setScore] = useState(null);

  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isHighlighted, setIsHighlighted] = useState(false);

  const [hasNewRecommendation, setHasNewRecommendation] = useState(false);
  const [hasNewMentorReply, setHasNewMentorReply] = useState(false);

  const [showBubbleMessage, setShowBubbleMessage] = useState(false);
  const [eyePos, setEyePos] = useState({ x: 0, y: 0 });

  const activeTabRef = useRef(activeTab);

  // 🔥 NEW: флаг WS-источника рекомендаций
  const wsRecommendationRef = useRef(false);

  useEffect(() => {
    activeTabRef.current = activeTab;
  }, [activeTab]);

  // 👁️ ГЛАЗА
  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 10;
      const y = (e.clientY / window.innerHeight - 0.5) * 10;
      setEyePos({ x, y });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // WebSocket handler
  useEffect(() => {
    if (mode === "history") return;

    const handler = (data) => {
      console.log("📡 WS EVENT RECEIVED:", data);

      if (data.source?.startsWith("user_progress")) {
        if (data.data?.score) setScore(data.data.score);

        if (data.data?.recommendations && data.data.recommendations.length > 0) {

          wsRecommendationRef.current = true; // 🔥 MARK WS SOURCE

          const unique = [...new Set(data.data.recommendations.map(r => r.competency))];

          setRecommendations(prev => {
            const newOnes = unique.filter(r => !prev.includes(r));
            return newOnes.length ? [...prev, ...newOnes] : prev;
          });

        } else {
          setRecommendations(["пока нет рекомендаций"]);
        }

        if (activeTabRef.current !== "recommendation") setHasNewRecommendation(true);

        setIsCollapsed(false);
        setIsHighlighted(true);
        setTimeout(() => setIsHighlighted(false), 2000);
      }

      if (data.source?.startsWith("mentor_response")) {
        console.log("MENTOR", data);

        const hint = data.data?.hint;
        if (!hint || hint.trim() === "") return;

        setMentorReplies(prev => [
          ...prev,
          { text: hint, time: new Date().toLocaleTimeString() }
        ]);

        setIsCollapsed(false);

        if (activeTabRef.current !== "mentor") setHasNewMentorReply(true);
      }
    };

    wsService.on("user_progress", handler);
    wsService.on("mentor_response", handler);

    return () => {
      wsService.off("user_progress", handler);
      wsService.off("mentor_response", handler);
    };
  }, [mode]);

  // History mode
  useEffect(() => {
    if (mode === "history" && attempt?.analysis) {
      setRecommendations(attempt.analysis.recommendations || []);

      let mentorData = [];

      if (attempt.analysis?.hints?.length) {
        mentorData = attempt.analysis.hints.map(h => ({
          text: h,
          time: new Date(attempt.timestamp).toLocaleTimeString()
        }));
      } else if (attempt.mentor_reply) {
        mentorData = [{
          text: attempt.mentor_reply,
          time: new Date(attempt.timestamp).toLocaleTimeString()
        }];
      }

      setMentorReplies(mentorData);

      setScore(attempt.total_score ? { score: attempt.total_score } : null);
      setIsCollapsed(false);
    }
  }, [mode, attempt]);

  const toggleCollapse = () => {
    setIsCollapsed(prev => !prev);
    setShowBubbleMessage(false);
  };

  const handleBubbleClick = () => {
    if (!recommendations.length && !mentorReplies.length) {
      setShowBubbleMessage(true);
    } else {
      setIsCollapsed(false);
    }
  };

  // 🔥 SAVE ONLY WS RECOMMENDATIONS
  useEffect(() => {
    if (!wsRecommendationRef.current) return;
    if (!recommendations || !recommendations.length) return;

    try {
      const existing = JSON.parse(localStorage.getItem("recommended_modules") || "[]");

      const merged = Array.from(new Set([...existing, ...recommendations]));

      localStorage.setItem("recommended_modules", JSON.stringify(merged));

      wsRecommendationRef.current = false; // reset flag
    } catch (e) {
      console.error("Ошибка сохранения рекомендаций:", e);
    }
  }, [recommendations]);

  // BUBBLE
  if (isCollapsed) {
    return (
      <div className="recommendation-bubble" onClick={handleBubbleClick}>
        <div className="ai-face"></div>

        {showBubbleMessage && (
          <div className="bubble-message">
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={`item menu-item menu-item-input item-light
      ${recommendations.length ? "recomendation-item-active" : "recomendation-item"}
      ${isHighlighted ? "recommendation-highlight" : ""}`}
    >
      {(recommendations.length || mentorReplies.length) && (
        <button className="recommendation-collapse" onClick={toggleCollapse}>
          <ChevronDown strokeWidth={1} />
        </button>
      )}

      <div className="recomendation-content">

        <div
          className="reco-content"
          style={{ display: activeTab === "recommendation" ? "flex" : "none" }}
        >
          {recommendations.length ? (
            <>
              <div className="menu-caption mentor-caption">Module recommendation</div>
              <div className='menu-list history-list recommendation-list'>
                {recommendations.map((r, i) => {
                  // Проверяем, является ли элемент последним и содержит ли текст "пока нет рекомендаций"
                  const isLastAndNoRecommendations = 
                    i === recommendations.length - 1 && 
                    r === "пока нет рекомендаций";
                  
                  return isLastAndNoRecommendations ? (
                    <p key={i}>{r}</p>
                  ) : (
                    <div key={i}><Module competency={r} /></div>
                  );
                })}
              </div>
            </>
          ) : <p>Нет рекомендаций</p>}
        </div>

        <div
          className="reco-content"
          style={{ display: activeTab === "mentor" ? "flex" : "none" }}
        >
          <div className="menu-caption mentor-caption">AI mentor</div>
          <div className='recommendation-list'>
            {score && (
              <div className="menu-item mentor-item item-light mentor-score">
                Score: {score.score} / 10
              </div>
            )}
            <div className="menu-item mentor-item item-light">
              {mentorReplies.length > 0
                ? mentorReplies[mentorReplies.length - 1].text
                : null}
            </div>
          </div>
        </div>
      </div>

      <div className="recomentation-tabs">
        <div
          className={`mentor-tab ${activeTab === "mentor" ? "mentor-tab-active" : ""}`}
          onClick={() => {
            setActiveTab("mentor");
            setHasNewMentorReply(false);
          }}
        >
          <MessageCircleCode strokeWidth={1} />
          <span>Mentor reply</span>
          {hasNewMentorReply && <span className="new-dot"></span>}
        </div>

        {mode !== "history" && (
          <div
            className={`mentor-tab ${activeTab === "recommendation" ? "mentor-tab-active" : ""}`}
            onClick={() => {
              setActiveTab("recommendation");
              setHasNewRecommendation(false);
            }}
          >
            <BookMarked strokeWidth={1} />
            <span>Recommendations</span>
            {hasNewRecommendation && <span className="new-dot"></span>}
          </div>
        )}
      </div>
    </div>
  );
}*/

{/*import { MessageCircleCode, BookMarked, ChevronDown, ChevronUp } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { wsService } from '../../services/websocket';
import "../../App.css";
import StartModuleButton from "../modules/StartModuleButton";
import Module from '../modules/module/Module';

export default function Recommendation({ mode, attempt }) {

  const [activeTab, setActiveTab] = useState("mentor");
  const [recommendations, setRecommendations] = useState([]);
  const [mentorReplies, setMentorReplies] = useState([]);
  const [score, setScore] = useState(null);

  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isHighlighted, setIsHighlighted] = useState(false);

  const [hasNewRecommendation, setHasNewRecommendation] = useState(false);
  const [hasNewMentorReply, setHasNewMentorReply] = useState(false);

  const [showBubbleMessage, setShowBubbleMessage] = useState(false);
  const [eyePos, setEyePos] = useState({ x: 0, y: 0 });

  const activeTabRef = useRef(activeTab);

  const wsRecommendationRef = useRef(false);

  useEffect(() => {
    activeTabRef.current = activeTab;
  }, [activeTab]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 10;
      const y = (e.clientY / window.innerHeight - 0.5) * 10;
      setEyePos({ x, y });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    if (mode === "history") return;

    const handler = (data) => {
      console.log("📡 WS EVENT RECEIVED:", data);

      if (data.source?.startsWith("user_progress")) {
        if (data.data?.score) setScore(data.data.score);

        if (data.data?.recommendations && data.data.recommendations.length > 0) {

          wsRecommendationRef.current = true;

          const unique = [...new Set(data.data.recommendations.map(r => r.competency))];

          setRecommendations(prev => {
            const newOnes = unique.filter(r => !prev.includes(r));
            return newOnes.length ? [...prev, ...newOnes] : prev;
          });

        } else {
          setRecommendations(["пока нет рекомендаций"]);
        }

        if (activeTabRef.current !== "recommendation") setHasNewRecommendation(true);

        setIsCollapsed(false);
        setIsHighlighted(true);
        setTimeout(() => setIsHighlighted(false), 2000);
      }

      if (data.source?.startsWith("mentor_response")) {
        console.log("MENTOR", data);

        const hint = data.data?.hint;
        if (!hint || hint.trim() === "") return;

        setMentorReplies(prev => [
          ...prev,
          { text: hint, time: new Date().toLocaleTimeString() }
        ]);

        setIsCollapsed(false);

        if (activeTabRef.current !== "mentor") setHasNewMentorReply(true);
      }
    };

    wsService.on("user_progress", handler);
    wsService.on("mentor_response", handler);

    return () => {
      wsService.off("user_progress", handler);
      wsService.off("mentor_response", handler);
    };
  }, [mode]);

  useEffect(() => {
    if (mode === "history" && attempt?.analysis) {
      setRecommendations(attempt.analysis.recommendations || []);

      let mentorData = [];

      if (attempt.analysis?.hints?.length) {
        mentorData = attempt.analysis.hints.map(h => ({
          text: h,
          time: new Date(attempt.timestamp).toLocaleTimeString()
        }));
      } else if (attempt.mentor_reply) {
        mentorData = [{
          text: attempt.mentor_reply,
          time: new Date(attempt.timestamp).toLocaleTimeString()
        }];
      }

      setMentorReplies(mentorData);

      setScore(attempt.total_score ? { score: attempt.total_score } : null);
      setIsCollapsed(false);
    }
  }, [mode, attempt]);

  const toggleCollapse = () => {
    setIsCollapsed(prev => !prev);
    setShowBubbleMessage(false);
  };

  const handleBubbleClick = () => {
    if (!recommendations.length && !mentorReplies.length) {
      setShowBubbleMessage(true);
    } else {
      setIsCollapsed(false);
    }
  };

  useEffect(() => {
    if (!wsRecommendationRef.current) return;
    if (!recommendations || !recommendations.length) return;

    try {
      const existing = JSON.parse(localStorage.getItem("recommended_modules") || "[]");
      const merged = Array.from(new Set([...existing, ...recommendations]));
      localStorage.setItem("recommended_modules", JSON.stringify(merged));
      wsRecommendationRef.current = false;
    } catch (e) {
      console.error("Ошибка сохранения рекомендаций:", e);
    }
  }, [recommendations]);

  // ✅ НОВОЕ: есть ли вообще данные
  const hasAnyData =
    recommendations.length > 0 ||
    mentorReplies.length > 0 ||
    score;

  // ❌ вообще ничего не показываем
  if (!hasAnyData) return null;

  // 🔽 свернуто → только кнопка вверх
  if (isCollapsed) {
  return (
    <div className="item menu-item menu-item-input item-light recomendation-item">
      <button className="recommendation-collapse" onClick={toggleCollapse}>
        <ChevronUp strokeWidth={1} />
      </button>
    </div>
  );
}

  return (
    <div
      className={`item menu-item menu-item-input item-light
      ${recommendations.length ? "recomendation-item-active" : "recomendation-item"}
      ${isHighlighted ? "recommendation-highlight" : ""}`}
    >
      <button className="recommendation-collapse" onClick={toggleCollapse}>
        <ChevronDown strokeWidth={1} />
      </button>

      <div className="recomendation-content">
        <div
          className="reco-content"
          style={{ display: activeTab === "recommendation" ? "flex" : "none" }}
        >
          {recommendations.length ? (
            <>
              <div className="menu-caption mentor-caption">Module recommendation</div>
              <div className='menu-list history-list recommendation-list'>
                {recommendations.map((r, i) => {
                  const isLastAndNoRecommendations = 
                    i === recommendations.length - 1 && 
                    r === "пока нет рекомендаций";
                  
                  return isLastAndNoRecommendations ? (
                    <p key={i}>{r}</p>
                  ) : (
                    <div key={i}><Module competency={r} /></div>
                  );
                })}
              </div>
            </>
          ) : <p>Нет рекомендаций</p>}
        </div>

        <div
          className="reco-content"
          style={{ display: activeTab === "mentor" ? "flex" : "none" }}
        >
          <div className="menu-caption mentor-caption">AI mentor</div>
          <div className='recommendation-list'>
            {score && (
              <div className="menu-item mentor-item item-light mentor-score">
                Score: {score.score} / 10
              </div>
            )}
            <div className="menu-item mentor-item item-light">
              {mentorReplies.length > 0
                ? mentorReplies[mentorReplies.length - 1].text
                : null}
            </div>
          </div>
        </div>
      </div>

      <div className="recomentation-tabs">
        <div
          className={`mentor-tab ${activeTab === "mentor" ? "mentor-tab-active" : ""}`}
          onClick={() => {
            setActiveTab("mentor");
            setHasNewMentorReply(false);
          }}
        >
          <MessageCircleCode strokeWidth={1} />
          <span>Mentor reply</span>
          {hasNewMentorReply && <span className="new-dot"></span>}
        </div>

        {mode !== "history" && (
          <div
            className={`mentor-tab ${activeTab === "recommendation" ? "mentor-tab-active" : ""}`}
            onClick={() => {
              setActiveTab("recommendation");
              setHasNewRecommendation(false);
            }}
          >
            <BookMarked strokeWidth={1} />
            <span>Recommendations</span>
            {hasNewRecommendation && <span className="new-dot"></span>}
          </div>
        )}
      </div>
    </div>
  );
}*/}



import { MessageCircleCode, BookMarked, ChevronDown, ChevronUp } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { wsService } from '../../services/websocket';
import "../../App.css";
import StartModuleButton from "../modules/StartModuleButton";
import Module from '../modules/module/Module';

export default function Recommendation({ mode, attempt }) {

  const [activeTab, setActiveTab] = useState("mentor");
  const [recommendations, setRecommendations] = useState([]);
  const [noRecommendations, setNoRecommendations] = useState([]); // ✅ новый список
  const [mentorReplies, setMentorReplies] = useState([]);
  const [score, setScore] = useState(null);

  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isHighlighted, setIsHighlighted] = useState(false);

  const [hasNewRecommendation, setHasNewRecommendation] = useState(false);
  const [hasNewMentorReply, setHasNewMentorReply] = useState(false);

  const [showBubbleMessage, setShowBubbleMessage] = useState(false);
  const [eyePos, setEyePos] = useState({ x: 0, y: 0 });

  const activeTabRef = useRef(activeTab);
  const wsRecommendationRef = useRef(false);

  useEffect(() => {
    activeTabRef.current = activeTab;
  }, [activeTab]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 10;
      const y = (e.clientY / window.innerHeight - 0.5) * 10;
      setEyePos({ x, y });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    if (mode === "history") return;

    const handler = (data) => {
      console.log("📡 WS EVENT RECEIVED:", data);

      if (data.source?.startsWith("user_progress")) {
        if (data.data?.score) setScore(data.data.score);

        if (data.data?.recommendations && data.data.recommendations.length > 0) {

          wsRecommendationRef.current = true;

          const unique = [...new Set(
            data.data.recommendations.map(r => r.competency)
          )];

          setRecommendations(prev => {
            const newOnes = unique.filter(r => !prev.includes(r));
            return newOnes.length ? [...prev, ...newOnes] : prev;
          });

          setNoRecommendations([]); // ✅ очищаем fallback

        } else {
          setRecommendations([]);
          setNoRecommendations(["пока нет рекомендаций"]); // ✅ теперь отдельно
        }

        if (activeTabRef.current !== "recommendation") setHasNewRecommendation(true);

        setIsCollapsed(false);
        setIsHighlighted(true);
        setTimeout(() => setIsHighlighted(false), 2000);
      }

      if (data.source?.startsWith("mentor_response")) {
        console.log("MENTOR", data);

        const hint = data.data?.hint;
        if (!hint || hint.trim() === "") return;

        setMentorReplies(prev => [
          ...prev,
          { text: hint, time: new Date().toLocaleTimeString() }
        ]);

        setIsCollapsed(false);

        if (activeTabRef.current !== "mentor") setHasNewMentorReply(true);
      }
    };

    wsService.on("user_progress", handler);
    wsService.on("mentor_response", handler);

    return () => {
      wsService.off("user_progress", handler);
      wsService.off("mentor_response", handler);
    };
  }, [mode]);

  useEffect(() => {
    if (mode === "history" && attempt?.analysis) {
      const recs = attempt.analysis.recommendations || [];

      if (recs.length > 0) {
        setRecommendations(recs);
        setNoRecommendations([]);
      } else {
        setRecommendations([]);
        setNoRecommendations(["пока нет рекомендаций"]);
      }

      let mentorData = [];

      if (attempt.analysis?.hints?.length) {
        mentorData = attempt.analysis.hints.map(h => ({
          text: h,
          time: new Date(attempt.timestamp).toLocaleTimeString()
        }));
      } else if (attempt.mentor_reply) {
        mentorData = [{
          text: attempt.mentor_reply,
          time: new Date(attempt.timestamp).toLocaleTimeString()
        }];
      }

      setMentorReplies(mentorData);
      setScore(attempt.total_score ? { score: attempt.total_score } : null);
      setIsCollapsed(false);
    }
  }, [mode, attempt]);

  const toggleCollapse = () => {
    setIsCollapsed(prev => !prev);
    setShowBubbleMessage(false);
  };

  const handleBubbleClick = () => {
    if (!recommendations.length && !mentorReplies.length) {
      setShowBubbleMessage(true);
    } else {
      setIsCollapsed(false);
    }
  };

  useEffect(() => {
    if (!wsRecommendationRef.current) return;
    if (!recommendations || !recommendations.length) return;

    try {
      const existing = JSON.parse(localStorage.getItem("recommended_modules") || "[]");
      const merged = Array.from(new Set([...existing, ...recommendations]));
      localStorage.setItem("recommended_modules", JSON.stringify(merged));
      wsRecommendationRef.current = false;
    } catch (e) {
      console.error("Ошибка сохранения рекомендаций:", e);
    }
  }, [recommendations]);

  // ✅ теперь учитываем оба списка
  const hasAnyData =
    recommendations.length > 0 ||
    noRecommendations.length > 0 ||
    mentorReplies.length > 0;

  if (!hasAnyData) return null;

  if (isCollapsed) {
    return (
      <div className="item menu-item menu-item-input item-light recomendation-item">
        <button className="recommendation-collapse" onClick={toggleCollapse}>
          <ChevronUp strokeWidth={1} />
        </button>
      </div>
    );
  }

  console.log("ACTIVE TAB:", activeTab);
  console.log("MENTOR REPLIES:", mentorReplies);

  return (
    <div
      className={`item menu-item menu-item-input item-light
      ${mentorReplies.length ? "recomendation-item-active" : "recomendation-item"}
      ${isHighlighted ? "recommendation-highlight" : ""}`}
    >
      <button className="recommendation-collapse" onClick={toggleCollapse}>
        <ChevronDown strokeWidth={1} />
      </button>

      <div className="recomendation-content">
        <div
          className="reco-content"
          style={{ display: activeTab === "recommendation" ? "flex" : "none" }}
        >
          {(recommendations.length > 0 || noRecommendations.length > 0) ? (
            <>
              <div className="menu-caption mentor-caption">Module recommendation</div>

              <div className='menu-list history-list recommendation-list'>

                {recommendations.map((r, i) => (
                  <div key={i}>
                    <Module competency={r} />
                  </div>
                ))}

                {noRecommendations.map((text, i) => (
                  <p key={`empty-${i}`}>{text}</p>
                ))}

              </div>
            </>
          ) : (
            <p>Нет рекомендаций</p>
          )}
        </div>

        <div
          className="reco-content"
          style={{ display: activeTab === "mentor" ? "flex" : "none" }}
        >
          <div className="menu-caption mentor-caption">AI mentor</div>
          <div className='recommendation-list'>
            {score && (
              <div className="menu-item mentor-item item-light mentor-score">
                Score: {score.score} / 10
              </div>
            )}
            <div className="menu-item mentor-item item-light">
              {/*{mentorReplies.length > 0
                ? mentorReplies[mentorReplies.length - 1].text
                : null}*/}
              {mentorReplies.length > 0 ? (
                  mentorReplies[mentorReplies.length - 1].text
                ) : (
                  <span style={{ opacity: 0.6 }}>
                    Нет ответа ментора
                  </span>
                )}
            </div>
          </div>
        </div>
      </div>

      <div className="recomentation-tabs">
        <div
          className={`mentor-tab ${activeTab === "mentor" ? "mentor-tab-active" : ""}`}
          onClick={() => {
            setActiveTab("mentor");
            setHasNewMentorReply(false);
          }}
        >
          <MessageCircleCode strokeWidth={1} />
          <span>Mentor reply</span>
          {hasNewMentorReply && <span className="new-dot"></span>}
        </div>

        {mode !== "history" && (
          <div
            className={`mentor-tab ${activeTab === "recommendation" ? "mentor-tab-active" : ""}`}
            onClick={() => {
              setActiveTab("recommendation");
              setHasNewRecommendation(false);
            }}
          >
            <BookMarked strokeWidth={1} />
            <span>Recommendations</span>
            {hasNewRecommendation && <span className="new-dot"></span>}
          </div>
        )}
      </div>
    </div>
  );
}

