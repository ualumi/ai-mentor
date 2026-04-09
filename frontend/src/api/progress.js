export default async function fetchProgress(token) {
  const res = await fetch(`http://89.248.207.102:8008/progress/${token}`);
  if (!res.ok) throw new Error("error");
  return res.json();
}