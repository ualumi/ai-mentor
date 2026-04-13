import { useEffect, useState, useRef } from "react";
import { wsService } from "../../services/websocket";
import "../../App.css";

export default function Review({ mode, attempt, externalAnnotations }) {
    console.log(externalAnnotations)
  const [annotations, setAnnotations] = useState([]);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isHighlighted, setIsHighlighted] = useState(false);

  const activeRef = useRef(true);


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
      className={`rewiew
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
            <div>

              <p>Здесь будет ревью по вашему коду!</p>
              <p>Чтобы получить ревью, обратитесь к ментору</p>
            </div>
            
          )}
        </div>
      </div>
    </div>
  );
}