import { useEffect, useState, useRef } from "react";
import { wsService } from "../../services/websocket";
import "../../App.css";

export default function Review({ mode, attempt, externalAnnotations }) {
    console.log(externalAnnotations)
  const [annotations, setAnnotations] = useState([]);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isHighlighted, setIsHighlighted] = useState(false);

  const activeRef = useRef(true);

  // -----------------------------
  // 🔹 WebSocket (LIVE)
  // -----------------------------
  {/*useEffect(() => {
    if (mode === "history") return;

    const handler = (data) => {
      console.log("📡 CODE ANNOTATION:", data);

      if (!data.source?.startsWith("analytics_response")) return;

      const anns = data.data?.annotations || data.data;

      if (!anns || !anns.length) return;

      setAnnotations(anns);

      // 🔥 сохраняем флаг
      localStorage.setItem("hasReview", "true");

      setIsCollapsed(false);
      setIsHighlighted(true);
      setTimeout(() => setIsHighlighted(false), 2000);
    };

    wsService.on("analytics_response", handler);

    return () => {
      wsService.off("analytics_response", handler);
    };
  }, [mode]);*/}

    useEffect(() => {
    if (externalAnnotations.length) {
        setAnnotations(externalAnnotations);
        setIsCollapsed(false);
    }
    }, [externalAnnotations]);
  // -----------------------------
  // 🔹 HISTORY режим (как recommendations)
  // -----------------------------
  useEffect(() => {
    if (attempt?.analysis) {
      const recs = attempt.analysis.recommendations || [];
        console.log("ATTEMPT ANALYSIS", attempt.analysis)
      const mapped = recs.map((r, i) => ({
        message: r,
        id: i,
      }));

      setAnnotations(mapped);
      setIsCollapsed(false);
    }
  }, [mode, attempt]);

  // -----------------------------
  // 🔹 UI
  // -----------------------------
  if (isCollapsed) return null;

  return (
    <div
      className={`item menu-item menu-item-input item-light
      ${annotations.length ? "" : ""}
      ${isHighlighted ? "" : ""}`}
    >
      <div className="">
        <div className="" style={{ display: "flex" }}>
          {annotations.length ? (
            <>
              <div className="menu-caption mentor-caption">
                Code Review
              </div>

              <div className="">
                {annotations.map((a, i) => (
                  <div key={i} className="">
                    {a.message || a.text || JSON.stringify(a)}
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p>Нет ревью</p>
          )}
        </div>
      </div>
    </div>
  );
}