import '../App.css'
import myImage from '../assets/Chart1.svg';  
export default function LeftBar() {

  return (
    <div className="leftbar">
        <a>a</a>
        <a>b</a>
        <a><img src={myImage}></img></a>
    </div>
  );
}