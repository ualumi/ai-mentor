export default async function fetchProgress(token) {
  const res = await fetch(`http://localhost:8008/progress/${token}`);
  if (!res.ok) throw new Error("error");
  return res.json();
}