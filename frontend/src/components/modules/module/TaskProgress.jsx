{/*import { useMemo } from "react";

export default function TaskProgress({ attempt, externalAnnotations }) {

  // 🔹 достаём score из разных источников
  const score = useMemo(() => {
    // 1. приоритет — externalAnnotations (review pipeline)
    const fromExternal = externalAnnotations?.find(
      (item) => item.type === "score"
    )?.value;

    if (typeof fromExternal === "number") return fromExternal;

    // 2. attempt (history / backend)
    if (typeof attempt?.total_score === "number") {
      return attempt.total_score;
    }

    // 3. analytics fallback (если вдруг лежит внутри analysis)
    if (typeof attempt?.analysis?.overall_score === "number") {
      return attempt.analysis.overall_score;
    }

    return 0;
  }, [attempt, externalAnnotations]);

  const safeScore = Math.max(0, Math.min(score, 10)); // clamp 0–10

  const percent = (safeScore / 10) * 100;

  return (
    <div className="task-progress">
      <div className="task-progress-header">
        <span>Progress</span>
        <span>{safeScore} / 10</span>
      </div>

      <div className="task-progress-bar">
        <div
          className="task-progress-fill"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}*/}

{/*import { useMemo } from "react";

export default function TaskProgress({
  attempt,
  externalAnnotations,
  resetSignal
}) {

  const score = useMemo(() => {

    if (resetSignal > 0) return 0;

    const scoreObj = externalAnnotations?.find(
      (item) => item.type === "score"
    );

    const externalScore = scoreObj?.value;

    if (typeof externalScore === "number") return externalScore;

    if (typeof attempt?.total_score === "number") return attempt.total_score;

    if (typeof attempt?.analysis?.overall_score === "number") {
      return attempt.analysis.overall_score;
    }

    return 0;
  }, [externalAnnotations, attempt, resetSignal]);

  const safeScore = Math.max(0, Math.min(score, 10));
  const percent = (safeScore / 10) * 100;

  return (
    <div className="task-progress">
      <div className="task-progress-header">
        <span>Progress</span>
        <span>{safeScore} / 10</span>
      </div>

      <div className="task-progress-bar">
        <div
          className="task-progress-fill"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}*/}

import { useMemo } from "react";

export default function TaskProgress({
  attempt,
  externalAnnotations,
  resetSignal
}) {

  const score = useMemo(() => {

    const scoreObj = externalAnnotations?.find(
      (item) => item.type === "score"
    );

    const externalScore = scoreObj?.value;

    if (typeof externalScore === "number") return externalScore;

    if (typeof attempt?.total_score === "number") return attempt.total_score;

    if (typeof attempt?.analysis?.overall_score === "number") {
      return attempt.analysis.overall_score;
    }

    return 0;
  }, [externalAnnotations, attempt, resetSignal]); // 🔥 важно оставить resetSignal здесь

  const safeScore = Math.max(0, Math.min(score, 10));
  const percent = (safeScore / 10) * 100;

  return (
    <div className="task-progress">
      {/*<div className="task-progress-header">
        <span>Progress</span>
        <span>{safeScore} / 10</span>
      </div>*/}

      <div className="task-progress-bar">
        <div
          className="task-progress-fill"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}