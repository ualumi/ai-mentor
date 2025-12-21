import { startSession } from "../api/learning";

export default function SessionStarter({ token, onStart }) {
  async function start() {
    const data = await startSession(token);
    onStart(data.session_id);
  }

  return <button onClick={start}>Start Learning</button>;
}
