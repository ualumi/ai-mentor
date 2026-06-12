import { useEffect, useMemo, useState } from "react";
import { wsService } from "../../../services/websocket";

const PROGRESS_CACHE_KEY = "latest_user_progress_payload";

function ProgressBar({
  progress,
  height = 10,
  color = "#3B68FF",
  mode,
  competency,
  progressBaseline,
}) {
  const useLiveProgress = mode === "listen";
  const [liveProgress, setLiveProgress] = useState(() =>
    chooseProgressValue(progress, competency, useLiveProgress, progressBaseline)
  );

  const normalizedCompetency = useMemo(
    () => normalizeSkillName(competency),
    [competency]
  );

  useEffect(() => {
    setLiveProgress(
      chooseProgressValue(progress, competency, useLiveProgress, progressBaseline)
    );
  }, [progress, competency, useLiveProgress, progressBaseline]);

  useEffect(() => {
    if (!competency || !useLiveProgress) return;

    const handler = (payload) => {
      const event = unwrapProgressEvent(payload);
      if (!event) return;

      cacheProgressEvent(event);

      const nextProgress = applyProgressBaseline(
        resolveProgressValue(event, competency),
        progressBaseline
      );
      if (nextProgress === null || nextProgress === undefined) return;

      setLiveProgress(nextProgress);
    };

    wsService.on("user_progress", handler);

    return () => {
      wsService.off("user_progress", handler);
    };
  }, [competency, normalizedCompetency, useLiveProgress, progressBaseline]);

  const progressValue = toPercent(liveProgress);
  const isIndeterminate = progressValue === null;

  return (
    <div
      className={`progress-bar-container ${
        isIndeterminate ? "indeterminate" : ""
      }`}
      style={{
        height: `${height}px`,
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-start",
        position: "relative",
        borderRadius: "6px",
        overflow: "hidden",
      }}
    >
      <div
        className="progress-bar-fill"
        style={{
          width: `${isIndeterminate ? 0 : progressValue}%`,
          height: "100%",
          backgroundColor: color,
          transition: "width 0.3s ease",
        }}
      />
    </div>
  );
}

function resolveProgressValue(source, competency) {
  if (source === null || source === undefined) return null;

  if (typeof source === "number") return source;

  if (typeof source !== "object") return null;

  const directProgress = progressFromSkillState(source);
  if (directProgress !== null) return directProgress;

  const event = unwrapProgressEvent(source);
  const progressRoot = event?.progress ?? event;
  const skills = progressRoot?.skills ?? event?.skills;
  const skillState = findSkillState(skills, competency);
  const skillProgress = progressFromSkillState(skillState);
  if (skillProgress !== null) return skillProgress;

  const recommendation = findRecommendation(event, competency);
  const recommendationProgress = progressFromRecommendation(
    recommendation,
    skills,
    competency
  );
  if (recommendationProgress !== null) return recommendationProgress;

  return null;
}

function chooseProgressValue(
  progress,
  competency,
  useLiveProgress = false,
  progressBaseline
) {
  const propProgress = resolveProgressValue(progress, competency);
  const hasBaseline = isFiniteProgress(progressBaseline);

  if (!useLiveProgress) return propProgress;

  const cachedProgress = readCachedProgress(competency);

  if (hasBaseline) {
    return propProgress ?? applyProgressBaseline(cachedProgress, progressBaseline);
  }

  if (cachedProgress !== null && (propProgress === null || propProgress === 0)) {
    return cachedProgress;
  }

  return propProgress ?? cachedProgress;
}

function progressFromSkillState(skillState) {
  if (!skillState || typeof skillState !== "object") return null;

  return firstFiniteNumber(
    skillState.bkt_mastery,
    skillState.mastery,
    skillState.ema_mastery,
    skillState.ema,
    skillState.progress
  );
}

function progressFromRecommendation(recommendation, skills, competency) {
  if (!recommendation || typeof recommendation !== "object") return null;

  const mainCompetency =
    recommendation.main_competency ||
    recommendation.competency ||
    recommendation.module?.main_competency ||
    competency;

  const mainProgress = progressFromSkillState(
    findSkillState(skills, mainCompetency)
  );
  if (mainProgress !== null) return mainProgress;

  const tags = Array.isArray(recommendation.tags) ? recommendation.tags : [];
  const tagProgress = tags
    .map((tag) => progressFromSkillState(findSkillState(skills, tag.name)))
    .filter((value) => value !== null);

  if (!tagProgress.length) return null;

  return tagProgress.reduce((sum, value) => sum + value, 0) / tagProgress.length;
}

function findSkillState(skills, competency) {
  if (!skills || typeof skills !== "object") return null;

  const normalizedCompetency = normalizeSkillName(competency);
  if (normalizedCompetency && skills[normalizedCompetency]) {
    return skills[normalizedCompetency];
  }

  for (const [skillName, skillState] of Object.entries(skills)) {
    if (normalizeSkillName(skillName) === normalizedCompetency) {
      return skillState;
    }
  }

  return null;
}

function findRecommendation(event, competency) {
  if (!event || typeof event !== "object") return null;

  const progressRoot = event.progress ?? event;
  const recommendations = [
    ...(Array.isArray(event.recommendations) ? event.recommendations : []),
    ...(Array.isArray(event.module_recommendations)
      ? event.module_recommendations
      : []),
    ...(Array.isArray(progressRoot.recommendations)
      ? progressRoot.recommendations
      : []),
    ...(Array.isArray(progressRoot.module_recommendations)
      ? progressRoot.module_recommendations
      : []),
  ];
  const normalizedCompetency = normalizeSkillName(competency);

  return (
    recommendations.find((recommendation) => {
      const recommendationCompetency =
        recommendation?.main_competency ||
        recommendation?.competency ||
        recommendation?.module?.main_competency;

      return normalizeSkillName(recommendationCompetency) === normalizedCompetency;
    }) || null
  );
}

function unwrapProgressEvent(payload) {
  if (!payload || typeof payload !== "object") return null;

  return payload.data && typeof payload.data === "object"
    ? payload.data
    : payload;
}

function cacheProgressEvent(event) {
  try {
    localStorage.setItem(PROGRESS_CACHE_KEY, JSON.stringify(event));
  } catch {
    // Ignore storage failures; live websocket updates still work.
  }
}

function readCachedProgress(competency) {
  try {
    const raw = localStorage.getItem(PROGRESS_CACHE_KEY);
    if (!raw) return null;

    return resolveProgressValue(JSON.parse(raw), competency);
  } catch {
    return null;
  }
}

function applyProgressBaseline(currentProgress, progressBaseline) {
  if (!isFiniteProgress(progressBaseline)) return currentProgress;
  if (!isFiniteProgress(currentProgress)) return null;

  const current = clampProgress(Number(currentProgress));
  const baseline = clampProgress(Number(progressBaseline));

  if (current <= baseline) return 0;

  const remaining = 1 - baseline;
  if (remaining <= 0) return 0;

  return clampProgress((current - baseline) / remaining);
}

function isFiniteProgress(value) {
  return Number.isFinite(Number(value));
}

function clampProgress(value) {
  return Math.min(1, Math.max(0, value));
}

function toPercent(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return null;

  const percent = numeric <= 1 ? numeric * 100 : numeric;
  return Math.min(100, Math.max(0, percent));
}

function firstFiniteNumber(...values) {
  for (const value of values) {
    const numeric = Number(value);
    if (Number.isFinite(numeric)) return numeric;
  }

  return null;
}

function normalizeSkillName(name) {
  return String(name || "")
    .trim()
    .toLowerCase()
    .replace(/[-/\s]+/g, "_");
}

export default ProgressBar;
