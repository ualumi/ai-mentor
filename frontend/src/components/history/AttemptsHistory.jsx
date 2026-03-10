import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import "../../App.css"

const ATTEMPTS_SERVICE = "http://localhost:8009";

export default function AttemptsHistory({ onSelectAttempt }) {
  const token = localStorage.getItem("token");

  const { data: history, isLoading, error } = useQuery({
    queryKey: ['attemptsHistory'],
    queryFn: async () => {
      const res = await fetch(`${ATTEMPTS_SERVICE}/attempts/${token}/history`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch attempts history");
      }

      return res.json();
    },
  });

  if (isLoading) {
    return <div>⏳ Загрузка истории попыток...</div>;
  }

  if (error) {
    return <div>❌ Ошибка загрузки: {error.message}</div>;
  }

  if (!history || history.length === 0) {
    return <div>📭 История попыток отсутствует</div>;
  }

  return (
    <div className="menu-list history-list">
      {history.map((attempt) => (
        <button
          key={attempt.attempt_id}
          className="item"
          onClick={() => onSelectAttempt(attempt.attempt_id)}
        >
          <p className='menu-item-text'>{attempt.first_line}...</p>
          {/*<small>Attempt ID: {attempt.attempt_id}</small>*/}
        </button>
      ))}
    </div>
  );
}