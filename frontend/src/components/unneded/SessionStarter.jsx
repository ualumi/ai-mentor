import { startSession } from "../../api/learning";
import '../App.css'
import myImage from '../assets/Box5.svg';  

export default function SessionStarter({ token, onStart }) {
  async function start() {
    const data = await startSession(token);
    onStart(data.session_id);
  }

  return <button onClick={start} className="module_button">
    <div className="nameandlink">
      <p className="module_text_light">info</p>
      <p className="module_text_light">0</p>
    </div>
    
    <img src={myImage}/>
    <p className="module_name">ML basic</p>
    <p className="module_text">Description</p>
  </button>;
}
