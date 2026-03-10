// components/Modules.jsx
import { useQuery } from '@tanstack/react-query';

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
    return <div>⏳ Загрузка активных модулей...</div>;
  }

  if (error) {
    return <div>❌ Ошибка загрузки: {error.message}</div>;
  }

  if (!sessions || sessions.length === 0) {
    return <div>📭 Нет активных модулей</div>;
  }

  return (
    <div className="modules-container">
      <h3>📚 Активные модули</h3>

      {sessions.map((session) => (
        <div key={session.session_id} className="module-card">
          <h4>{session.competency}</h4>
          <p>Session ID: {session.session_id}</p>
          <p>Status: {session.status}</p>
        </div>
      ))}
    </div>
  );
}