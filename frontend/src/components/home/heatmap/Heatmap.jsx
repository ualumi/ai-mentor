import { useUserActivity } from '../../../hooks/useUserActivity';
import "./heatmap.css";

export default function Heatmap({ token, days = 30 }) {
  const { data, isLoading, error } = useUserActivity(token, days);

  if (isLoading) return <p>Загрузка активности...</p>;
  if (error) return <p>Ошибка: {error.message}</p>;

  // создаём массив по неделям для grid
  const weeks = [];
  let week = [];
  console.log(weeks)
  data.forEach((d, idx) => {
    week.push(d);
    if ((idx + 1) % 7 === 0) {
      weeks.push(week);
      week = [];
    }
  });
  if (week.length) weeks.push(week);

  return (
    <div className="heatmap">
        <h1>ACTIVIY</h1>
      {weeks.map((weekData, i) => (
        <div key={i} className="heatmap-week">
          {weekData.map((day) => (
            <div
              key={day.date}
              className="heatmap-day"
              style={{ opacity: Math.min(day.count / 5, 1) }} // чем больше попыток, тем ярче
              title={`${day.date}: ${day.count} попыток`}
            />
          ))}
        </div>
      ))}
    </div>
  );
}