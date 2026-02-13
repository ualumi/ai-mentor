import '../App.css'
import myImage from '../assets/Chart1.svg';  
import Home from '../assets/Home.svg';  
import Book from '../assets/Category.svg'
import { NavLink } from 'react-router-dom';
export default function LeftBar() {

  return (
    <div className="leftbar">
        <NavLink to="/"><img className='img' src={Home}></img></NavLink>
        <NavLink to="/modules"><img className='img' src={Book}></img></NavLink>
        <NavLink to="/analitics"><img className='img' src={myImage}></img></NavLink>
    </div>
  );
}