// components/Modules.jsx
import { useQuery } from '@tanstack/react-query';
import "../../App.css"
const LEARNING_SERVICE = "http://localhost:8001";

export default function Modules() {

  const token = localStorage.getItem("token");
  console.log("TOKEN:", token);
  const { data: sessions, isLoading, error } = useQuery({
    queryKey: ['activeSessions'],
    queryFn: async () => {
      const res = await fetch(
        `${LEARNING_SERVICE}/learning/my?status=active`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        throw new Error("Failed to fetch sessions");
      }

      return res.json();
    },
  });

  if (isLoading) {
    return <div className='item'> Загрузка активных модулей...</div>;
  }

  if (error) {
    return <div className='item'> Ошибка загрузки: {error.message}</div>;
  }

  if (!sessions || sessions.length === 0) {
    return <div className='item'> Нет активных модулей</div>;
  }

  return (
    <div className="modules-container">

      {sessions.map((session) => (
        <div key={session.session_id} className="item item-light">
          <span className='menu-item-text'>{session.competency}</span>
        </div>
      ))}
    </div>
  );
}