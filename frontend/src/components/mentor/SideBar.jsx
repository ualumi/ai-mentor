
{/*import "./Sidebar.css"
import Item from "./Item";
import ToggleButton from "./ToggleButton";
import { useState } from "react";
import History from "../history/History";
import { House, ChevronLeft, ChevronRight, Search, Activity } from 'lucide-react';
import ProfileItem from "./ProfileItem";

export default function SideBar ({ mode="free", isOpen, toggleSidebar }) {

  const [activeIndex, setActiveIndex] = useState(3); // Tasks по умолчанию

  const items = [
    { type:"input_item", text:"Search", clas:"", icon:<Search strokeWidth={1}/> },
    { type:"button_item", text:"Home", icon:<House strokeWidth={1}/>, link:"home"},
    { type:"button_item", text:"Progress", icon:<Activity strokeWidth={1}/>, link:"progress"},
    { type:"button_item", text:"Tasks", link:"mentor"},
    { type:"button_item", text:"Modules", link:"modules"}
  ];

  return (
    <div className={`sidebar ${isOpen ? "sidebar-open" : "sidebar-closed"}`}>

      <div>

        <div className="sidebar-label">

          {isOpen && <h2 className="menu-caption">DevmindAI</h2>}

          <ToggleButton
            isOpen={isOpen}
            onToggle={toggleSidebar}
            iconOpen={<ChevronLeft size={24} />}
            iconClose={<ChevronRight size={24} />}
            showLabel={false}
            position="right"
            className="round"
          />

        </div>

        <div className="menu-list">

          <div
            className="menu-highlight"
            style={{
              transform: `translateY(${activeIndex * 48}px)`
            }}
          />

          {items.map((item, i) => (
            <div key={i} onClick={() => setActiveIndex(i)}>
              <Item
                type={item.type}
                text={isOpen ? item.text : ""}
                icon={item.icon}
                link={item.link}
                clas={i === activeIndex ? "item-active" : ""}
              />
            </div>
          ))}

        </div>

        {isOpen && <History mode={mode}/>}

      </div>

      {isOpen && <ProfileItem name="User" email="test@gmail.com"/>}

    </div>
  );
}*/}


import "./Sidebar.css";
import Item from "./Item";
import ToggleButton from "./ToggleButton";
import { useLocation } from "react-router-dom";
import History from "../history/History";
import { House, ChevronLeft, ChevronRight, Search, Activity, Layers, Sparkles } from 'lucide-react';
import ProfileItem from "./ProfileItem";
import MenuItem from "./menu/MenuItem";
import { useAuth } from "../../context/AuthContext";
import { useEffect } from "react";


export default function SideBar({ mode = "", isOpen, toggleSidebar, openAuth }) {
  useEffect(() => {
    // если режим free или module → закрываем сайдбар
    if ((mode === "free" || mode === "module") && isOpen) {
      toggleSidebar(false); // 👈 важно: закрываем
    }
  }, [mode]);
  const { token, user } = useAuth();
  const location = useLocation();
  //{ type:"input_item", text:"Поиск", icon:<Search strokeWidth={1} size={20}/> },
  const items = [
    
    { type:"button_item", text:"Главная", icon:<House strokeWidth={1} size={20}/>, link:"/" },
    
    { type:"button_item", text:"Практика", link:"/mentor", icon: <Sparkles strokeWidth={1} size={20}/> },
    { type:"button_item", text:"Модули", link:"/module", icon: <Layers strokeWidth={1} size={20}/> },
    { type:"button_item", text:"Прогресс", icon:<Activity strokeWidth={1} size={20}/>, link:"/progress" }
  ];

  // 🔥 вычисляем активный индекс из URL
  {/*const activeIndex = items.findIndex(item =>
    item.link && location.pathname.startsWith(item.link)
  );*/}
  const activeIndex = items.findIndex(item => {
    if (item.type !== "button_item") return false;

    if (item.link === "/") {
      return location.pathname === "/";
    }

    return location.pathname.startsWith(item.link);
  });

  return (
    <div className={`sidebar ${isOpen ? "sidebar-open" : "sidebar-closed"}`}>

      <div>

        <div className="sidebar-label">

          {isOpen && <h2 className="menu-caption">DevmindAI</h2>}

          <ToggleButton
            isOpen={isOpen}
            onToggle={toggleSidebar}
            iconOpen={<ChevronLeft size={24} />}
            iconClose={<ChevronRight size={24} />}
            showLabel={false}
            position="right"
            className="round"
          />

        </div>

        <div className="menu-list">

          {/* ⭐ moving highlight */}
          {activeIndex !== -1 && (
            <div
              className="menu-highlight"
              style={{
                transform: `translateY(${activeIndex * 40}px)`
              }}
            />
          )}

          {items.map((item, i) => (
            <div key={i}>
              <MenuItem
                type={item.type}
                text={isOpen ? item.text : ""}
                icon={item.icon}
                link={item.link}
              />
            </div>
          ))}

        </div>

        {/*{isOpen && (token ? <History mode={mode}/>: '') }*/}

      </div>

      {/*{isOpen && <ProfileItem name="User" email="test@gmail.com"/>}*/}
      {isOpen && (
        token
          ? <ProfileItem name={user.username} email={user.email} />
          : <button 
              className="auth-open-button" 
              onClick={openAuth}
            >
              Личный кабинет
            </button>
      )}

    </div>
  );
}
