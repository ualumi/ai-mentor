import Item from "./Item";
import ToggleButton from "./ToggleButton";
import { useState } from "react";
import History from "./History";
import { House, User, Settings, ChevronLeft, ChevronRight, Search, Activity, Toilet } from 'lucide-react';
import ProfileItem from "./ProfileItem";

export default function SideBar ({ isOpen, toggleSidebar }) {

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
                <Item type="text_item" text="Search" icon={<Search strokeWidth={1} />} />
                <Item type="text_item" text="Home" clas="l" icon={<House strokeWidth={1} />}/>
                <Item type="text_item" text="Progress" clas="l" icon={<Activity strokeWidth={1} />}/>
                <Item type="text_item" text="Бикиниботтом" clas="l" icon={<Toilet strokeWidth={1} />}/>
            </div>
            <History></History>
        </div>
        
        <ProfileItem name="test" email="test@gmail.com"/>
    </div>
  );
};