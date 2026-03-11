{/*import Item from "./Item";
import ToggleButton from "./ToggleButton";
import { useState } from "react";
import History from "../history/History";
import { House, User, Settings, ChevronLeft, ChevronRight, Search, Activity, Toilet } from 'lucide-react';
import ProfileItem from "./ProfileItem";

export default function SideBar ({ mode="free", isOpen, toggleSidebar }) {

  return (
    <div className="sidebar">
        <div>
            <div className="sidebar-label">
                <h2 className="menu-caption">DevmindAI</h2>
                <ToggleButton
                    isOpen={isOpen}
                    onToggle={toggleSidebar}
                    openLabel=""
                    closeLabel=""
                    iconOpen={<ChevronLeft size={24} />}
                    iconClose={<ChevronRight size={24} />}
                    showLabel={false}
                    position="right"
                    className="round"
                    aria-label={isOpen ? 'Закрыть меню' : 'Открыть меню'}
                />
                
            </div>
        
            <div className="menu-list">
                <Item type="input_item" text="Search" clas="menu-item" icon={<Search strokeWidth={1} />} />
                <Item type="button_item" text="Home" clas="" icon={<House strokeWidth={1} />}/>
                <Item type="button_item" text="Progress" clas="l" icon={<Activity strokeWidth={1} />} link="progress"/>
                <Item type="button_item" text="Tasks" clas="menu-item-active"  link="any"/>
                <Item type="button_item" text="Modules" clas=""  link="modules"/>
            </div>
            <History mode={mode}></History>
        </div>
        
        <ProfileItem name="User" email="test@gmail.com"/>
    </div>
  );
};*/}
import "./Sidebar.css"
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
    { type:"button_item", text:"Home", icon:<House strokeWidth={1}/> },
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

          {/* ⭐ moving highlight */}
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
}

{/*import Item from "./Item";
import ToggleButton from "./ToggleButton";
import { useState } from "react";
import History from "../history/History";
import { House, User, Settings, ChevronLeft, ChevronRight, Search, Activity, Toilet } from 'lucide-react';
import ProfileItem from "./ProfileItem";
export default function SideBar ({ mode="free", isOpen, toggleSidebar }) {

  return (
    <div className={`sidebar ${isOpen ? "sidebar-open" : "sidebar-closed"}`}>

        <div>
            <div className="sidebar-label">

                {isOpen && <h2 className="menu-caption">DevmindAI</h2>}

                <ToggleButton
                    isOpen={isOpen}
                    onToggle={toggleSidebar}
                    openLabel=""
                    closeLabel=""
                    iconOpen={<ChevronLeft size={24} />}
                    iconClose={<ChevronRight size={24} />}
                    showLabel={false}
                    position="right"
                    className="round"
                    aria-label={isOpen ? 'Закрыть меню' : 'Открыть меню'}
                />

            </div>

            <div className="menu-list">
                <Item type="input_item" text={isOpen ? "Search" : ""} clas="menu-item" icon={<Search strokeWidth={1} />} />
                <Item type="button_item" text={isOpen ? "Home" : ""} clas="" icon={<House strokeWidth={1} />}/>
                <Item type="button_item" text={isOpen ? "Progress" : ""} clas="" icon={<Activity strokeWidth={1} />} link="progress"/>
                <Item type="button_item" text={isOpen ? "Tasks" : ""} clas="menu-item-active" link="any"/>
                <Item type="button_item" text={isOpen ? "Modules" : ""} clas="" link="modules"/>
            </div>

            {isOpen && <History mode={mode}/>}

        </div>

        {isOpen && <ProfileItem name="User" email="test@gmail.com"/>}

    </div>
  );
}*/}