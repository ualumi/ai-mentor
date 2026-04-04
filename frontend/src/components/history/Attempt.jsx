import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import "../../App.css"
import { useNavigate } from "react-router-dom";

/*
export default function Attempt({ attempt }) {
  const navigate = useNavigate();

  return (
        <button
          key={attempt.attempt_id}
          className="item"
          onClick={() => navigate(`/attempt/${attempt.attempt_id}`)}
        >
          <span className='menu-item-text'>{attempt.first_line}...</span>
        </button>
  );
}*/

export default function Attempt({ attempt, mode }) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (mode === "module") {
      navigate(".", {
        state: {
          selectedAttemptId: attempt.attempt_id
        }
      });
    } else {
      navigate(`/mentor/attempt/${attempt.attempt_id}`);
    }
  };

  return (
    <button
      className="item"
      onClick={handleClick}
    >
      <span className='menu-item-text'>
        {attempt.first_line}...
      </span>
    </button>
  );
}