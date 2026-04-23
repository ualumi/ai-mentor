import { useEffect, useState } from "react";
import "../../App.css";

export default function Review({ mode, attempt, externalAnnotations }) {
  const [blocks, setBlocks] = useState([]);

  const isNonEmptyString = (v) =>
    typeof v === "string" && v.trim().length > 0;

  const isNonEmptyNumber = (v) =>
    typeof v === "number" && !Number.isNaN(v);

  const isNonEmptyArray = (v) =>
    Array.isArray(v) && v.length > 0;

  const isNonEmptyObject = (v) =>
    v && typeof v === "object" && Object.keys(v).length > 0;

  const ALLOWED = new Set([
    "score",
    "strengths",
    "weaknesses",
    "recommendations",
  ]);

  // -----------------------------
  // 🔥 PARSE attempt.analysis
  // -----------------------------
  useEffect(() => {
    if (!attempt?.analysis) return;

    const a = attempt.analysis;

    const mapped = [];

    if (isNonEmptyNumber(a.overall_score)) {
      mapped.push({ type: "score", value: a.overall_score });
    }

    if (isNonEmptyArray(a.strengths)) {
      mapped.push({ type: "strengths", items: a.strengths });
    }

    if (isNonEmptyArray(a.weaknesses)) {
      mapped.push({ type: "weaknesses", items: a.weaknesses });
    }

    if (isNonEmptyArray(a.recommendations)) {
      mapped.push({ type: "recommendations", items: a.recommendations });
    }

    // 🔥 FILTER (строго только разрешённые типы)
    const filtered = mapped.filter((b) => ALLOWED.has(b.type));

    setBlocks(filtered);
  }, [attempt]);

  // -----------------------------
  // 🔥 externalAnnotations fallback (WS)
  // -----------------------------
  useEffect(() => {
    if (!externalAnnotations?.length) return;

    const filtered = externalAnnotations.filter((b) =>
      ALLOWED.has(b.type)
    );

    setBlocks(filtered);
  }, [externalAnnotations]);

  // -----------------------------
  // UI
  // -----------------------------
  if (!blocks.length) {
    return (
      <div className="review">
        <p className="home-summary-block-label-text">
          Здесь будет ревью по вашему коду
        </p>
      </div>
    );
  }

  const formatLabel = (type) =>
    type.replace(/\b\w/g, (l) => l.toUpperCase());

  return (
    <div className="review">
      <div className="menu-caption mentor-caption">Code Review</div>

      <div className="review-blocks">
        {blocks.map((b, i) => (
          <div key={i} className={`review-block review-${b.type}`}>
            
            <div className="review-block-title">
              {formatLabel(b.type)}
            </div>

            {b.value !== undefined && (
              <p>{b.value}</p>
            )}

            {b.items && (
              <ul>
                {b.items.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            )}

          </div>
        ))}
      </div>
    </div>
  );
}