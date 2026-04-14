{/*import { useEffect, useState, useRef } from "react";
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
}*/}

{/*import { useEffect, useState } from "react";
import "../../App.css";

export default function Review({ mode, attempt, externalAnnotations }) {
  console.log(attempt)
  const [blocks, setBlocks] = useState([]);

  // -----------------------------
  // 🔥 PARSE attempt.analysis
  // -----------------------------
  useEffect(() => {
    if (!attempt?.analysis) return;

    const a = attempt.analysis;

    const mapped = [];

    // 🔹 summary
    if (a.summary) {
      mapped.push({
        type: "summary",
        value: a.summary,
      });
    }

    // 🔹 score
    if (a.overall_score != null) {
      mapped.push({
        type: "score",
        value: a.overall_score,
      });
    }

    if (a.code_quality_score != null) {
      mapped.push({
        type: "quality",
        value: a.code_quality_score,
      });
    }

    // 🔹 correctness
    if (a.correctness) {
      mapped.push({
        type: "correctness",
        value: a.correctness,
      });
    }

    // 🔹 task compliance
    if (a.task_compliance) {
      mapped.push({
        type: "compliance",
        value: a.task_compliance,
      });
    }

    // 🔹 strengths
    if (Array.isArray(a.strengths)) {
      mapped.push({
        type: "strengths",
        items: a.strengths,
      });
    }

    // 🔹 weaknesses
    if (Array.isArray(a.weaknesses)) {
      mapped.push({
        type: "weaknesses",
        items: a.weaknesses,
      });
    }

    // 🔹 recommendations
    if (Array.isArray(a.recommendations)) {
      mapped.push({
        type: "recommendations",
        items: a.recommendations,
      });
    }

    // 🔹 tags
    if (Array.isArray(a.tags)) {
      mapped.push({
        type: "tags",
        items: a.tags,
      });
    }

    // 🔹 detailed analysis
    if (a.detailed_analysis) {
      mapped.push({
        type: "detailed",
        value: a.detailed_analysis,
      });
    }

    setBlocks(mapped);
  }, [attempt]);

  // -----------------------------
  // 🔥 externalAnnotations fallback (WS)
  // -----------------------------
  useEffect(() => {
    if (!externalAnnotations?.length) return;
    setBlocks(externalAnnotations);
  }, [externalAnnotations]);

  // -----------------------------
  // UI
  // -----------------------------
  if (!blocks.length) {
    return (
      <div className="review">
        <p className="home-summary-block-label-text">Здесь будет ревью по вашему коду</p>
      </div>
    );
  }

  return (
    <div className="review">

      <div className="menu-caption mentor-caption">
        Code Review
      </div>

      <div className="review-blocks">

        {blocks.map((b, i) => (
          <div key={i} className={`review-block review-${b.type}`}>


            {b.value && typeof b.value === "string" && <p>{b.value}</p>}
            {b.value && typeof b.value === "number" && <p>{b.value}</p>}


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
}*/}


{/*import { useEffect, useState } from "react";
import "../../App.css";

export default function Review({ mode, attempt, externalAnnotations }) {
  console.log(attempt);
  const [blocks, setBlocks] = useState([]);

  // -----------------------------
  // 🔥 PARSE attempt.analysis
  // -----------------------------
  useEffect(() => {
    if (!attempt?.analysis) return;

    const a = attempt.analysis;

    const mapped = [];

    const isNonEmptyString = (v) =>
      typeof v === "string" && v.trim().length > 0;

    const isNonEmptyNumber = (v) =>
      typeof v === "number" && !Number.isNaN(v);

    const isNonEmptyArray = (v) =>
      Array.isArray(v) && v.length > 0;

    const isNonEmptyObject = (v) =>
      v && typeof v === "object" && Object.keys(v).length > 0;

    // 🔹 summary
    if (isNonEmptyString(a.summary)) {
      mapped.push({
        type: "summary",
        value: a.summary,
      });
    }

    // 🔹 score
    if (isNonEmptyNumber(a.overall_score)) {
      mapped.push({
        type: "score",
        value: a.overall_score,
      });
    }

    if (isNonEmptyNumber(a.code_quality_score)) {
      mapped.push({
        type: "quality",
        value: a.code_quality_score,
      });
    }

    // 🔹 correctness (ВАЖНО: object check)
    if (isNonEmptyObject(a.correctness)) {
      mapped.push({
        type: "correctness",
        value: a.correctness,
      });
    }

    // 🔹 task compliance
    if (isNonEmptyObject(a.task_compliance)) {
      mapped.push({
        type: "compliance",
        value: a.task_compliance,
      });
    }

    // 🔹 strengths
    if (isNonEmptyArray(a.strengths)) {
      mapped.push({
        type: "strengths",
        items: a.strengths,
      });
    }

    // 🔹 weaknesses
    if (isNonEmptyArray(a.weaknesses)) {
      mapped.push({
        type: "weaknesses",
        items: a.weaknesses,
      });
    }

    // 🔹 recommendations
    if (isNonEmptyArray(a.recommendations)) {
      mapped.push({
        type: "recommendations",
        items: a.recommendations,
      });
    }

    // 🔹 tags (ВАЖНО: фильтруем внутри массива)
    if (isNonEmptyArray(a.tags)) {
      const cleanedTags = a.tags.filter(t =>
        t && (typeof t === "string" ? t.trim() : true)
      );

      if (cleanedTags.length) {
        mapped.push({
          type: "tags",
          items: cleanedTags,
        });
      }
    }

    // 🔹 detailed analysis
    if (isNonEmptyString(a.detailed_analysis)) {
      mapped.push({
        type: "detailed",
        value: a.detailed_analysis,
      });
    }

    setBlocks(mapped);
  }, [attempt]);



  // -----------------------------
  // 🔥 externalAnnotations fallback (WS)
  // -----------------------------
  useEffect(() => {
    if (!externalAnnotations?.length) return;
    setBlocks(externalAnnotations);
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

  return (
    <div className="review">

      <div className="menu-caption mentor-caption">
        Code Review
      </div>

      <div className="review-blocks">

        {blocks.map((b, i) => (
          <div key={i} className={`review-block review-${b.type}`}>


            {b.value && typeof b.value === "string" && <p>{b.value}</p>}
            {b.value && typeof b.value === "number" && <p>{b.value}</p>}


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
}*/}

{/*import { useEffect, useState } from "react";
import "../../App.css";

export default function Review({ mode, attempt, externalAnnotations }) {
  console.log(attempt);
  const [blocks, setBlocks] = useState([]);

  // -----------------------------
  // 🔥 PARSE attempt.analysis
  // -----------------------------
  useEffect(() => {
    if (!attempt?.analysis) return;

    const a = attempt.analysis;

    const mapped = [];

    const isNonEmptyString = (v) =>
      typeof v === "string" && v.trim().length > 0;

    const isNonEmptyNumber = (v) =>
      typeof v === "number" && !Number.isNaN(v);

    const isNonEmptyArray = (v) =>
      Array.isArray(v) && v.length > 0;

    const isNonEmptyObject = (v) =>
      v && typeof v === "object" && Object.keys(v).length > 0;

    // 🔹 summary
    if (isNonEmptyString(a.summary)) {
      mapped.push({
        type: "summary",
        value: a.summary,
      });
    }

    // 🔹 score
    if (isNonEmptyNumber(a.overall_score)) {
      mapped.push({
        type: "score",
        value: a.overall_score,
      });
    }

    if (isNonEmptyNumber(a.code_quality_score)) {
      mapped.push({
        type: "quality",
        value: a.code_quality_score,
      });
    }

    // 🔹 correctness
    if (isNonEmptyObject(a.correctness)) {
      mapped.push({
        type: "correctness",
        value: a.correctness,
      });
    }

    // 🔹 task compliance
    if (isNonEmptyObject(a.task_compliance)) {
      mapped.push({
        type: "compliance",
        value: a.task_compliance,
      });
    }

    // 🔹 strengths
    if (isNonEmptyArray(a.strengths)) {
      mapped.push({
        type: "strengths",
        items: a.strengths,
      });
    }

    // 🔹 weaknesses
    if (isNonEmptyArray(a.weaknesses)) {
      mapped.push({
        type: "weaknesses",
        items: a.weaknesses,
      });
    }

    // 🔹 recommendations
    if (isNonEmptyArray(a.recommendations)) {
      mapped.push({
        type: "recommendations",
        items: a.recommendations,
      });
    }

    // 🔹 tags
    if (isNonEmptyArray(a.tags)) {
      const cleanedTags = a.tags.filter(
        (t) => t && (typeof t === "string" ? t.trim() : true)
      );

      if (cleanedTags.length) {
        mapped.push({
          type: "tags",
          items: cleanedTags,
        });
      }
    }

    // 🔹 detailed analysis
    if (isNonEmptyString(a.detailed_analysis)) {
      mapped.push({
        type: "detailed",
        value: a.detailed_analysis,
      });
    }

    setBlocks(mapped);
  }, [attempt]);

  // -----------------------------
  // 🔥 externalAnnotations fallback (WS)
  // -----------------------------
  useEffect(() => {
    if (!externalAnnotations?.length) return;
    setBlocks(externalAnnotations);
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

  // 🔥 format label
  const formatLabel = (type) =>
    type
      .replace(/_/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase());

  return (
    <div className="review">
      <div className="menu-caption mentor-caption">Code Review</div>

      <div className="review-blocks">
        {blocks.map((b, i) => (
          <div key={i} className={`review-block review-${b.type}`}>
            

            <div className="review-block-title">
              {formatLabel(b.type)}
            </div>


            {b.value && typeof b.value === "string" && <p>{b.value}</p>}
            {b.value && typeof b.value === "number" && <p>{b.value}</p>}


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
}*/}

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