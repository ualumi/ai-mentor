
{/*import { useUserActivity } from '../../../hooks/useUserActivity';
import "./heatmap.css";

export default function Heatmap({ token, days = 60 }) {
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

      <div className='heatmap-itself'>

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
                    ? Math.min(day.count / 7, 1)
                    : 1 // 🔥 чтобы пустая карта была видна
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
}*/}


{/*import { useUserActivity } from '../../../hooks/useUserActivity';
import "./heatmap.css";

export default function Heatmap({ token, days = 60 }) {
  const normalizedDays = normalizeDays(days);
  const { data, isLoading, error } = useUserActivity(token, normalizedDays);

  // 🔥 если нет данных → используем моки
  const safeData = Array.isArray(data) && data.length
    ? normalizeToFullGrid(data, normalizedDays)
    : generateMockData(normalizedDays);

  // 🔥 группировка по неделям (гарантированно ровно)
  const weeks = [];
  for (let i = 0; i < safeData.length; i += 7) {
    weeks.push(safeData.slice(i, i + 7));
  }

  return (
    <div className="heatmap">
      <div className="heatmap-itself">

        {isLoading && <p className="heatmap-status">Загрузка...</p>}
        {error && <p className="heatmap-status error">Ошибка загрузки</p>}

        {weeks.map((weekData, i) => (
          <div key={i} className="heatmap-week">
            {weekData.map((day) => (
              <div
                key={day.date}
                className="heatmap-day"
                style={{
                  backgroundColor: day.count > 0 ? "#3B68FF" : "#1E1F21"
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
// 🔥 делаем количество дней кратным 7
function normalizeDays(days) {
  return Math.ceil(days / 7) * 7;
}

// -----------------------------
// 🔥 если бекенд прислал не полный диапазон — дополняем
function normalizeToFullGrid(data, days) {
  const map = new Map(data.map(d => [d.date, d.count]));

  const result = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);

    const key = date.toISOString().split("T")[0];

    result.push({
      date: key,
      count: map.get(key) || 0
    });
  }

  return result;
}

// -----------------------------
// 🔥 мок-данные (реалистичная активность)
function generateMockData(days) {
  const result = [];

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);

    // случайная активность (примерно 40% дней активны)
    const isActive = Math.random() > 0.6;

    result.push({
      date: date.toISOString().split("T")[0],
      count: isActive ? Math.floor(Math.random() * 5) + 1 : 0
    });
  }

  return result;
}*/}

import { useUserActivity } from '../../../hooks/useUserActivity';
import "./heatmap.css";

export default function Heatmap({ token, weeksCount = 15 }) {
  const days = weeksCount * 7; // 🔥 теперь главный источник правды
  const { data, isLoading, error } = useUserActivity(token, days);

  // 🔥 если нет данных → используем моки
  const safeData = Array.isArray(data) && data.length
    ? normalizeToFullGrid(data, days)
    : generateMockData(days);

  // 🔥 всегда ровно weeksCount колонок
  const weeks = [];
  for (let i = 0; i < weeksCount; i++) {
    weeks.push(safeData.slice(i * 7, i * 7 + 7));
  }

  return (
    <div className="heatmap">
      <div className="heatmap-itself">

        {isLoading && <p className="heatmap-status">Загрузка...</p>}
        {error && <p className="heatmap-status error">Ошибка загрузки</p>}

        {weeks.map((weekData, i) => (
          <div key={i} className="heatmap-week">
            {weekData.map((day) => (
              <div
                key={day.date}
                className="heatmap-day"
                style={{
                  backgroundColor: day.count > 0 ? "#3B68FF" : "#1E1F21"
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
// 🔥 мок-данные (реалистичная активность)
function generateMockData(days) {
  const result = [];

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);

    // ~40% дней с активностью
    const isActive = Math.random() < 0.3;

    result.push({
      date: date.toISOString().split("T")[0],
      count: isActive ? Math.floor(Math.random() * 5) + 1 : 0
    });
  }

  return result;
}