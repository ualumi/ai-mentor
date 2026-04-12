import { useNavigate } from "react-router-dom";

const LEARNING_SERVICE = "http://localhost:8001";

export default function StartModuleButton({ competency }) {

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
      console.log({
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({
            competency: competency
          })
        })
      if (!response.ok) {
        throw new Error("Failed to start session");
      }

      const data = await response.json();

      const sessionId = data.session_id;

      console.log("🧩 session_id =", sessionId);
      // ⭐ сообщаем родителю
      /*if (onStart) onStart();*/

      /*navigate(`/module/${sessionId}`);*/
      navigate(`/module/${sessionId}`, {
        state: { competency }
      });
      console.log(competency)
      // перезагрузка ПОСЛЕ перехода
      //setTimeout(() => {
      //  window.location.reload();
      //}, 0);

    } catch (err) {
      console.error("Start module error:", err);
    }
  };

  return (
    <button
      onClick={handleStart}
      className="module-button"
    >
      Начать модуль
    </button>
  );
}