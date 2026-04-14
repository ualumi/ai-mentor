export default async function fetchProgress(token) {
  const res = await fetch(`http://92.255.67.163:8008/progress/${token}`);
  if (!res.ok) throw new Error("error");
  return res.json();
}