import { useNavigate } from "react-router-dom";
import icon3 from "../../../assets/module-icons/Layers.svg";
import ProgressBar from "./ProgressBar";
import { useStartModule } from "../../../hooks/useStartModule";

export default function Module({
  competency,
  mode,
  progress,
  progressBaseline,
  fallbackAttempts,
  explainGoal,
}) {
  const navigate = useNavigate();
  const { mutateAsync, isPending } = useStartModule();

  const handleStart = async () => {
    const token = localStorage.getItem("token");

    try {
      const { sessionId, state, isExisting } = await mutateAsync({
        competency,
        token,
      });

      navigate(`/module/${sessionId}`, {
        state: {
          competency,
          restoredState: state,
          isExisting,
        },
      });
    } catch (err) {
      console.error("Start module error:", err);
    }
  };

  return (
    <div
      className="item item-light item-module"
      onClick={handleStart}
      style={{ cursor: "pointer", opacity: isPending ? 0.6 : 1 }}
    >
      <div className="module-info">
        <div className="module-icon">
          <img src={icon3} alt="module icon" className="module-icon-img" />
        </div>

        <div className="modules-description">
          <span className="modules-item-text home-summary-block-label-text module-title">
            {formatModuleTitle(competency)}
          </span>
          {explainGoal && (
            <p className="modules-item-p module-explain-goal">{explainGoal}</p>
          )}

          <div className="jol">
            <p className="modules-item-p">Пройдено:</p>
            <ProgressBar
              progress={progress}
              progressBaseline={progressBaseline}
              fallbackAttempts={fallbackAttempts}
              mode={mode}
              competency={competency}
            />
          </div>

          
        </div>
      </div>
    </div>
  );
}

function formatModuleTitle(title) {
  return String(title || "")
    .split(/(\s+)/)
    .map((part) => {
      if (/^\s+$/.test(part) || part.length <= 12) {
        return part;
      }

      return part.match(/.{1,10}/g).join("\u00AD");
    })
    .join("");
}
