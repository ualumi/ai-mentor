export default async function fetchProgress(token) {
  const res = await fetch(`http://31.129.63.252:8008/progress/${token}`);
  if (!res.ok) throw new Error("error");
  return res.json();
}