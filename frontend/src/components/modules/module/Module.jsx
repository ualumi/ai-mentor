


{/*import icon3 from "../../../assets/module-icons/Layers.svg";

export default function Module ({competency}) {
    return (
        <div className="item item-light item-module">
          <div className='module-info'>

            <div className="module-icon">
              <img
                src={icon3}
                alt="module icon"
                className="module-icon-img"
              />
            </div>

            <div className='modules-description'>
              <span className='modules-item-text'>
                {competency}
              </span>

              <p className='modules-item-p'>Задач решено: n</p>
            </div>
          </div>
        </div>
    )
}*/}

import { useNavigate } from "react-router-dom";
import icon3 from "../../../assets/module-icons/Layers.svg";
import ProgressBar from "./ProgressBar";
import { useStartModule } from "../../../hooks/useStartModule";

export default function Module({ competency, session, mode }) {

  const navigate = useNavigate();
  const { mutateAsync, isPending } = useStartModule();

  /*const handleStart = async () => {
    const token = localStorage.getItem("token");

    try {
      const { sessionId } = await mutateAsync({
        competency,
        token
      });

      console.log("🧩 session_id =", sessionId);

      navigate(`/module/${sessionId}`, {
        state: { competency }
      });

      // если хочешь оставить reload
      setTimeout(() => {
        window.location.reload();
      }, 0);

    } catch (err) {
      console.error("Start module error:", err);
    }
  };*/
  const handleStart = async () => {
    const token = localStorage.getItem("token");

    try {
      const { sessionId, state, isExisting } = await mutateAsync({
        competency,
        token
      });

      console.log("🧩 session_id =", sessionId);
      console.log("♻️ existing =", isExisting);

      navigate(`/module/${sessionId}`, {
        state: {
          competency,
          restoredState: state, // 🔥 ВОТ ОНО
          isExisting
        }
      });

      setTimeout(() => {
        window.location.reload();
      }, 0);

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
      <div className='module-info'>
        
        <div className="module-icon">
          <img
            src={icon3}
            alt="module icon"
            className="module-icon-img"
          />
        </div>

        <div className='modules-description'>
          <span className='modules-item-text home-summary-block-label-text'>
            {competency}
          </span>
          <div>
            <p className='modules-item-p'>Модуль</p>
            <ProgressBar />
          </div>
          
        </div>

      </div>

      {mode !== "free" && (
        <div>
          <div className='menu-item-processflag'>In process</div>
          <ProgressBar progress={session?.progress || 0} />
        </div>
      )}
    </div>
  );
}

{/*import { useNavigate } from "react-router-dom";
import icon3 from "../../../assets/module-icons/Layers.svg";
import ProgressBar from "./ProgressBar";
const LEARNING_SERVICE = "http://localhost:8001";

export default function Module({ competency, session, mode }) {

  const navigate = useNavigate();

  const handleStart = async () => {
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        `${LEARNING_SERVICE}/learning/start`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({
            competency: competency
          })
        }
      );

      if (!response.ok) {
        throw new Error("Failed to start session");
      }

      const data = await response.json();
      const sessionId = data.session_id;

      console.log("🧩 session_id =", sessionId);

      // переход
      navigate(`/module/${sessionId}`, {
        state: { competency }
      });

      // 🔥 принудительная перезагрузка
      setTimeout(() => {
        window.location.reload();
      }, 0);

    } catch (err) {
      console.error("Start module error:", err);
    }
  };

  return (
    <div 
      className="item item-light item-module"
      onClick={handleStart}
      style={{ cursor: "pointer" }} // чтобы было ощущение кликабельности
    >
      <div className='module-info'>
        
        <div className="module-icon">
          <img
            src={icon3}
            alt="module icon"
            className="module-icon-img"
          />
        </div>

        <div className='modules-description'>
          <span className='modules-item-text'>
            {competency}
          </span>

          <p className='modules-item-p'>Задач решено: n</p>
        </div>

      </div>

      {mode !== "history" && (
        <div>
          <div className='menu-item-processflag'>In process</div>
          <ProgressBar progress={session?.progress || 0} />
        </div>
      )}
    </div>
  );
}*/}