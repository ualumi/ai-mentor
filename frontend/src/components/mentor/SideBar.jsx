import Item from "./Item";
import ToggleButton from "./ToggleButton";
import { useState } from "react";
import History from "../history/History";
import { House, User, Settings, ChevronLeft, ChevronRight, Search, Activity, Toilet } from 'lucide-react';
import ProfileItem from "./ProfileItem";

export default function SideBar ({ mode, isOpen, toggleSidebar }) {

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
};