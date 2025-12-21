export async function login(email, password) {
  const res = await fetch("http://localhost:8002/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) throw new Error("Login failed");
  return res.json(); // { access_token }
}
