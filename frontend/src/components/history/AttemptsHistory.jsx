{/*import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import "../../App.css"
import { useNavigate } from "react-router-dom";
import Attempt from './Attempt';

const ATTEMPTS_SERVICE = "/api/attempts/";

export default function AttemptsHistory({ onSelectAttempt }) {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  /*const { data: history, isLoading, error } = useQuery({
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
  });*/
  const { data: history, isLoading, error } = useQuery({
    queryKey: ['attemptsHistory'],
    queryFn: async () => {
      const res = await fetch(`${ATTEMPTS_SERVICE}attempts/${token}/history`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch attempts history");
      }

      return res.json();
    },

    refetchInterval: 3000, // 🔥 каждые 3 секунды
  });

  if (isLoading) {
    return <div className='item'>Загрузка истории...</div>;
  }

  if (error) {
    return <div className='item'>Ошибка загрузки: {error.message}</div>;
  }

  if (!history || history.length === 0) {
    return <div></div>;
  }

  return (
    <div className="menu-list history-list">
      {history.map((attempt) => (
        <Attempt attempt={attempt} />

      ))}
    </div>
  );
}*/}

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import "../../App.css"
import { useNavigate } from "react-router-dom";
import Attempt from './Attempt';

const ATTEMPTS_SERVICE = "/api/attempts/";

export default function AttemptsHistory({ onSelectAttempt }) {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  /*const { data: history, isLoading, error } = useQuery({
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
  });*/
  const { data: history, isLoading, error } = useQuery({
    queryKey: ['attemptsHistory'],
    queryFn: async () => {
      const res = await fetch(`${ATTEMPTS_SERVICE}attempts/${token}/history`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch attempts history");
      }

      return res.json();
    },

    refetchInterval: 3000, // 🔥 каждые 3 секунды
  });

  if (isLoading) {
    return <div className='item'>Загрузка истории...</div>;
  }

  if (error) {
    return <div className='item'>Ошибка загрузки: {error.message}</div>;
  }

  if (!history || history.length === 0) {
    return <div></div>;
  }

  return (
    <div className="menu-list history-list">
      {history.map((attempt) => (
        <Attempt attempt={attempt} />

      ))}
    </div>
  );
}
