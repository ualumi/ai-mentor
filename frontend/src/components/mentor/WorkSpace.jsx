


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

const ATTEMPTS_SERVICE = "/api/attempts/";

export default function WorkSpace({ mode, isSidebarOpen }) {
  const { token } = useAuth();

  const location = useLocation();
  const { id } = useParams();

  // -----------------------------
  // 🔹 SAFE STATE (без undefined крашей)
  // -----------------------------
  const taskData = location.state || {};
  const taskDescription = taskData?.description;
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

  const [wsReady, setWsReady] = useState(false);

  useEffect(() => {
    if (!stableRestoredState?.session?.session_id) return;

    const initSession = async () => {
      await wsService.connect(token); // ⬅️ гарантируем соединение
      console.log("type set_session", stableRestoredState.session.session_id)
      wsService.send({
        type: "set_session",
        learning_session_id: stableRestoredState.session.session_id
      });

      setWsReady(true);
    };

    initSession();
  }, [stableRestoredState, token]);
  

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
      const res = await fetch(`${ATTEMPTS_SERVICE}attempt/${attemptIdToLoad}`);
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
                taskDescription={taskDescription}
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