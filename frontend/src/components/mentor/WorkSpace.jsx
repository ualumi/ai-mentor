
{/*import SandBox from "./SandBox";
import React, { useState } from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CodeProvider } from '../CodeContext';
import Item from "./Item";
import s from "./FreeMode.module.css"
import Recommendation from "./Recommendation";
import { useParams } from "react-router-dom";
import TasksPanel from "../modules/TasksPanel";
import { useLocation } from "react-router-dom";

export default function WorkSpace({ mode }) {
    const location = useLocation();

    const competency = location.state?.competency;
    
  return (
        <CodeProvider>
            <div className={`free-mode `}>
                
                <div className={`${mode}`}>
                    <SandBox mode={mode} name={competency}></SandBox>
                    {mode === "module" && <TasksPanel />}
                </div>  
                <Recommendation mode={mode}/>
                
                
            </div>
        </CodeProvider>
  );
}*/}



{/*import SandBox from "./SandBox";
import {React} from "react";
import { useQuery } from "@tanstack/react-query";
import { CodeProvider } from "../CodeContext";
import Recommendation from "./Recommendation";
import TasksPanel from "../modules/TasksPanel";
import { useLocation, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import History from "../history/History";
import "./workspace.css"
import Review from "./Review";
import ModuleTask from "../modules/module/ModuleTask";
import { wsService } from "../../services/websocket";
import { useAuth } from "../../context/AuthContext";

const ATTEMPTS_SERVICE = "http://89.248.207.102:8009";

export default function WorkSpace({ mode, isSidebarOpen }) {
  
  const [reviewData, setReviewData] = useState([]);
  const { token } = useAuth();

  useEffect(() => {
    if (!token) return;

    const handler = (data) => {
      if (!data.source?.startsWith("analytics_response")) return;

      console.log("📡 ANALYTICS (GLOBAL):", data);

      const analysis = data.data?.analysis;
      if (!analysis) return;

      // 🔥 ПРАВИЛЬНЫЙ МАППИНГ В МАССИВ
      const mapped = [
        {
          type: "summary",
          message: analysis.summary,
        },
        {
          type: "score",
          message: `Score: ${analysis.overall_score}/10`,
        },
        {
          type: "quality",
          message: `Code quality: ${analysis.code_quality_score}`,
        },
        ...(analysis.tags || []).map(tag => ({
          type: "tag",
          message: `Tag: ${tag.name || tag.label || tag}`, 
        })),
      ];

      console.log("🔥 MAPPED REVIEW:", mapped);

      setReviewData(mapped);

      localStorage.setItem("hasReview", "true");
    };

    wsService.on("analytics_response", handler);

    wsService.connect(token).catch(console.error);

    return () => {
      wsService.off("analytics_response", handler);
    };
  }, [token]);
  console.log(mode)

  const hasReview = reviewData.length > 0;

  const location = useLocation();
  const { id } = useParams(); // 🔥 attempt_id


  const taskData = location.state;

  console.log("TASK FROM SSO:", taskData);
  const initialCode = taskData?.code;
  const taskTitle = taskData?.title;

  const [stableRestoredState, setStableRestoredState] = useState(null);
  const selectedAttemptId = location.state?.selectedAttemptId;

  const competency = location.state?.competency;
  const restoredState = location.state?.restoredState;
  const isExisting = location.state?.isExisting;
  useEffect(() => {
    if (restoredState && !stableRestoredState) {
      setStableRestoredState(restoredState);
    }
  }, [restoredState]);

  console.log("restoredState",restoredState, mode)
  //const competency = location.state?.competency;

  // 🔥 Загружаем attempt ТОЛЬКО если есть id

  const attemptIdToLoad = selectedAttemptId || id;

  const {
    data: attempt,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["attempt", attemptIdToLoad],
    queryFn: async () => {
      const res = await fetch(`${ATTEMPTS_SERVICE}/attempt/${attemptIdToLoad}`);
      if (!res.ok) throw new Error("Failed to fetch attempt");
      return res.json();
    },
    enabled: !!attemptIdToLoad,
  });

  // 🔥 LOADING / ERROR только для history режима
  if (mode === "history") {
    if (isLoading) return <div>Загрузка попытки...</div>;
    if (error) return <div>Ошибка загрузки</div>;
  }
  console.log(attempt)
  console.log("id", id, "selected_id", selectedAttemptId)
  const [activeTab, setActiveTab] = useState("code");
  return (
    <CodeProvider initialCode={attempt?.code}>
      <div className="free-mode">

        <div className={mode}>
          
          {mode !== "" && <div className="history-wrapper"><History mode={mode}
            name={competency}
            attempt={attempt} // 🔥 прокидываем данные
            restoredState={restoredState}
            code={initialCode}
            titletask={taskTitle}
            isSidebarOpen = {isSidebarOpen}
            selectedAttemptId={selectedAttemptId}/></div>}
          
          <div className="code-section">
            {mode === "module" && <div className="module-task-header">
              {attempt?.condition ? (
                <ModuleTask conditionHistory={attempt.condition} />
              ) : (
                <ModuleTask />
              )}
            </div>}

            <div className="workspace-tabs">
              <button
                className={`workspace-tab ${activeTab === "code" ? "workspace-tab-active" : ""}`}
                onClick={() => setActiveTab("code")}
              >
                Код
              </button>


              <button
                className={`workspace-tab 
                  ${activeTab === "review" ? "workspace-tab-active" : ""} 
                  ${hasReview && activeTab !== "review" ? "has-notification" : ""}
                `}
                onClick={() => setActiveTab("review")}
              >
                Ревью
              </button>
            </div>

            {activeTab === "code" ? (
              <SandBox
                mode={mode}
                name={competency}
                attempt={attempt}
                restoredState={restoredState}
                code={initialCode}
                titletask={taskTitle}
                isSidebarOpen={isSidebarOpen}
                selectedAttemptId={selectedAttemptId}
              />
            ) : (
              <Review
                attempt={attempt}
                mode={mode}
                externalAnnotations={reviewData}
              />
            )}

            
          </div>
          </div>
          


        {attempt ? (
          <Recommendation mode={"history"} attempt={attempt} />
        ) : (
          <Recommendation mode={mode} attempt={attempt} />
        )}

      </div>
    </CodeProvider>
  );
}*/}


import SandBox from "./SandBox";
import { useQuery } from "@tanstack/react-query";
import { CodeProvider } from "../CodeContext";
import Recommendation from "./Recommendation";
import { useLocation, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import History from "../history/History";
import "./workspace.css";
import Review from "./Review";
import ModuleTask from "../modules/module/ModuleTask";
import { wsService } from "../../services/websocket";
import { useAuth } from "../../context/AuthContext";
import CheckTaskButton from "../modules/module/CheckTaskButton";
import NextStepButton from "../modules/module/NextStepButton";

const ATTEMPTS_SERVICE = "http://92.255.67.163:8009";

export default function WorkSpace({ mode, isSidebarOpen }) {
  const { token } = useAuth();

  const location = useLocation();
  const { id } = useParams();

  // -----------------------------
  // 🔹 SAFE STATE (без undefined крашей)
  // -----------------------------
  const taskData = location.state || {};

  const initialCode = taskData?.code;
  const taskTitle = taskData?.title;
  const selectedAttemptId = taskData?.selectedAttemptId;
  const competency = taskData?.competency;
  const restoredStateFromRoute = taskData?.restoredState;

  // -----------------------------
  // 🔹 LOCAL STATE
  // -----------------------------
  const [reviewData, setReviewData] = useState([]);
  const [activeTab, setActiveTab] = useState("code");
  const [stableRestoredState, setStableRestoredState] = useState(null);

  const hasReview = reviewData.length > 0;

  // -----------------------------
  // 🔹 RESTORED STATE FIX
  // -----------------------------
  useEffect(() => {
    if (restoredStateFromRoute && !stableRestoredState) {
      setStableRestoredState(restoredStateFromRoute);
    }
  }, [restoredStateFromRoute]);

  console.log(setStableRestoredState, stableRestoredState)

  useEffect(() => {
    if (stableRestoredState?.session?.session_id) {
      wsService.send({
        type: "set_session",
        learning_session_id: stableRestoredState.session.session_id
      });
    }
    console.log("session_switched")
    //console.log("learning_session_id", stableRestoredState.session.session_id)
  }, [stableRestoredState]);
  

  // -----------------------------
  // 🔹 ATTEMPT LOAD
  // -----------------------------
  const attemptIdToLoad = selectedAttemptId || id;

  const {
    data: attempt,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["attempt", attemptIdToLoad],
    queryFn: async () => {
      const res = await fetch(`${ATTEMPTS_SERVICE}/attempt/${attemptIdToLoad}`);
      if (!res.ok) throw new Error("Failed to fetch attempt");
      return res.json();
    },
    enabled: !!attemptIdToLoad,
  });

  
  useEffect(() => {
    if (!token) return;

    const handler = (data) => {
      if (!data?.source?.startsWith("analytics_response")) return;

      const analysis = data?.data?.analysis;
      if (!analysis || typeof analysis !== "object") return;

      const safeArray = (val) => Array.isArray(val) ? val : [];
      const safeObject = (val) => (val && typeof val === "object" ? val : {});
      const safeValue = (val, fallback = null) => val ?? fallback;

      const mapped = [];

      // 🔹 summary
      if (analysis.summary) {
        mapped.push({
          type: "summary",
          message: analysis.summary,
        });
      }

      // 🔹 scores
      if (analysis.overall_score != null) {
        mapped.push({
          type: "score",
          value: analysis.overall_score,
          message: `Score: ${analysis.overall_score}/10`,
        });
      }

      if (analysis.code_quality_score != null) {
        mapped.push({
          type: "quality",
          value: analysis.code_quality_score,
          message: `Code quality: ${analysis.code_quality_score}`,
        });
      }

      // 🔹 correctness
      const correctness = safeObject(analysis.correctness);
      if (Object.keys(correctness).length) {
        mapped.push({
          type: "correctness",
          data: correctness,
        });
      }

      // 🔹 task compliance
      const compliance = safeObject(analysis.task_compliance);
      if (Object.keys(compliance).length) {
        mapped.push({
          type: "compliance",
          data: compliance,
        });
      }

      // 🔹 tags (🔥 С ПОЛНЫМ ОБЪЕКТОМ)
      safeArray(analysis.tags).forEach(tag => {
        if (!tag) return;

        mapped.push({
          type: "tag",
          tag: {
            name: tag?.name || "Unknown",
            weight: tag?.weight ?? null,
            applied: tag?.applied ?? null,
            score: tag?.score ?? null,
            evidence: tag?.evidence || "",
            raw: tag,
          },
        });
      });

      // 🔹 suggested tags
      safeArray(analysis.suggested_tags).forEach(tag => {
        mapped.push({
          type: "suggested_tag",
          tag: typeof tag === "string" ? { name: tag } : tag,
        });
      });

      // 🔹 strengths / weaknesses / recommendations
      ["strengths", "weaknesses", "recommendations"].forEach((key) => {
        const list = safeArray(analysis[key]);
        if (list.length) {
          mapped.push({
            type: key,
            items: list,
          });
        }
      });

      // 🔹 detailed analysis
      if (analysis.detailed_analysis) {
        mapped.push({
          type: "detailed",
          message: analysis.detailed_analysis,
        });
      }

      // 🔹 complexity (если появится позже)
      if (analysis.complexity) {
        mapped.push({
          type: "complexity",
          data: analysis.complexity,
        });
      }

      console.log("🔥 SAFE REVIEW:", mapped);

      setReviewData(mapped);
    };

    wsService.on("analytics_response", handler);
    wsService.connect(token).catch(console.error);

    return () => {
      wsService.off("analytics_response", handler);
    };
  }, [token]);

  // -----------------------------
  // 🔹 LOADING / ERROR (ПОСЛЕ ВСЕХ ХУКОВ)
  // -----------------------------
  if (mode === "history" && isLoading) {
    return <div>Загрузка попытки...</div>;
  }

  if (mode === "history" && error) {
    return <div>Ошибка загрузки</div>;
  }

  // -----------------------------
  // 🔹 DERIVED DATA
  // -----------------------------
  const conditionHistory = attempt?.condition ?? null;
  console.log (conditionHistory)
  // -----------------------------
  // 🔹 UI
  // -----------------------------
  console.log(mode)
  return (
    <CodeProvider initialCode={attempt?.code || initialCode}>
      <div className="free-mode">

        <div className={mode}>

          {/* HISTORY */}
          {mode && (
            <div className="history-wrapper">
              <History
                key={id}
                mode={mode}
                name={competency}
                attempt={attempt}
                restoredState={stableRestoredState}
                code={initialCode}
                titletask={taskTitle}
                isSidebarOpen={isSidebarOpen}
                selectedAttemptId={selectedAttemptId}
                conditionHistory={conditionHistory}
              />
            </div>
          )}

          {/* MAIN */}
          <div className="code-section">

            {/* MODULE HEADER */}
            {mode === "module" && (
              <div className="module-task-header">
                <ModuleTask  key={id} conditionHistory={conditionHistory} attempt={attempt}
                externalAnnotations={reviewData} />
              </div>
            )}

            {/* TABS */}
            <div className="workspace-tabs">
              <button
                className={`workspace-tab ${
                  activeTab === "code" ? "workspace-tab-active" : ""
                }`}
                onClick={() => setActiveTab("code")}
              >
                Код
              </button>

              <button
                className={`workspace-tab 
                  ${activeTab === "review" ? "workspace-tab-active" : ""} 
                  ${hasReview && activeTab !== "review" ? "has-notification" : ""}
                `}
                onClick={() => setActiveTab("review")}
              >
                Ревью
              </button>
            </div>

            {/* CONTENT */}
            {activeTab === "code" ? (
              <SandBox
                key={id}
                mode={mode}
                name={competency}
                attempt={attempt}
                restoredState={stableRestoredState}
                code={initialCode}
                titletask={taskTitle}
                isSidebarOpen={isSidebarOpen}
                selectedAttemptId={selectedAttemptId}
              />
            ) : (
              <Review
                key={id}
                attempt={attempt}
                mode={mode}
                externalAnnotations={reviewData}
              />
            )}

          </div>
        </div>

        {/* RECOMMENDATION */}
        <Recommendation
          key={id}
          mode={attempt ? "history" : mode}
          attempt={attempt}
        />

      </div>
    </CodeProvider>
  );
}