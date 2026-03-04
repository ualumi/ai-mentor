export async function startSession(token) {
  const res = await fetch("http://localhost:8001/learning/start", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      competency: "ml_basic",
      methodology: "scaffolding",
    }),
  });

  if (!res.ok) throw new Error("Session start failed");
  return res.json(); // { session_id }
}
