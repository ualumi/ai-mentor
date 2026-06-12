export default async function fetchProgress(token) {
  const res = await fetch(`/api/progress/progress/${token}`);
  if (!res.ok) throw new Error("error");
  return res.json();
}