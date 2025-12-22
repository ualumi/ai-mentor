import { startSession } from "../api/learning";
import '../App.css'
import myImage from '../assets/Layers.svg';  

export default function SessionStarter({ token, onStart }) {
  async function start() {
    const data = await startSession(token);
    onStart(data.session_id);
  }

  return <button onClick={start} className="module_button"><img src={myImage}/><p>ML basic</p></button>;
}
