import SideBar from "./SideBar";
import SandBox from "./SandBox";
import React, { useState } from 'react';

export default function FreeMode() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };
  return (
    <div className={`free-mode ${isSidebarOpen ? 'sidebar-visible' : 'sidebar-hidden'}`}>
        <div className="sidebar-container">
            <SideBar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} ></SideBar>
        </div>
        
        <SandBox></SandBox>
        <div></div>
    </div>
  );
}