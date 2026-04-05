/*import { useUserActivity } from '../../../hooks/useUserActivity';
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
}*/
import { useUserActivity } from '../../../hooks/useUserActivity';
import "./heatmap.css";

export default function Heatmap({ token, days = 30 }) {
  const { data, isLoading, error } = useUserActivity(token, days);

  // 🔥 всегда есть данные
  const safeData = Array.isArray(data) && data.length
    ? data
    : generateEmptyData(days);

  // 🔥 группировка
  const weeks = [];
  let week = [];

  safeData.forEach((d, idx) => {
    week.push(d);
    if ((idx + 1) % 7 === 0) {
      weeks.push(week);
      week = [];
    }
  });

  if (week.length) weeks.push(week);

  return (
    <div className="heatmap">
      <h3 className="section-caption-module-recommended">Последняя активность</h3>
      <div className='heatmap-itself'>
        {/* 🔥 статус поверх, но НЕ блокирует карту */}
        {isLoading && <p className="heatmap-status">Загрузка...</p>}
        {error && <p className="heatmap-status error">Ошибка загрузки</p>}

        {weeks.map((weekData, i) => (
          <div key={i} className="heatmap-week">
            {weekData.map((day) => (
              <div
                key={day.date}
                className="heatmap-day"
                style={{
                  opacity: day.count
                    ? Math.min(day.count / 5, 1)
                    : 0.1 // 🔥 чтобы пустая карта была видна
                }}
                title={`${day.date}: ${day.count || 0} попыток`}
              />
            ))}
          </div>
        ))}
      </div>
      
    </div>
  );
}

// -----------------------------
function generateEmptyData(days) {
  const result = [];

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);

    result.push({
      date: date.toISOString().split("T")[0],
      count: 0
    });
  }

  return result;
}