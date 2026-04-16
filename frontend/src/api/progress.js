export default async function fetchProgress(token) {
  const res = await fetch(`http://94.26.225.13:8008/progress/${token}`);
  if (!res.ok) throw new Error("error");
  return res.json();
}