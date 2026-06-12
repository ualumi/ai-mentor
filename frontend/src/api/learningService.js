const LEARNING_SERVICE = "/api/learning";

export const startLearningSession = async (competency, token) => {
  const res = await fetch(
    `${LEARNING_SERVICE}/learning/start`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ competency })
    }
  );

  if (!res.ok) {
    throw new Error("Failed to start session");
  }

  const data = await res.json();

  return {
    sessionId: data.session.session_id,
    session: data.session,
    isExisting: data.is_existing
  };
};

export const getLearningState = async (sessionId, token) => {
  const res = await fetch(
    `${LEARNING_SERVICE}/learning/session/${sessionId}/state`,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch learning state");
  }

  return res.json();
};