import SideBar from "./SideBar";
import SandBox from "./SandBox";
import React, { useState } from 'react';
import ExecutionResult from "../ExecutionResult";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CodeProvider } from '../CodeContext';
import Item from "./Item";
import s from "./FreeMode.module.css"
import Recommendation from "./Recommendation";
import { useParams } from "react-router-dom";

export default function WorkSpace({ mode }) {

    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };
  return (
        <CodeProvider>
            <div className={`free-mode ${isSidebarOpen ? 'sidebar-visible' : 'sidebar-hidden'}`}>
                <div className="sidebar-container">
                    <SideBar mode={mode} isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} ></SideBar>
                </div>
                
                <SandBox mode={mode} isOpen={isSidebarOpen} toggleSidebar={toggleSidebar}></SandBox>
                <div >{/*className={s["insight-panel"]}*/}
                    <ExecutionResult></ExecutionResult>
                </div>
                <Recommendation mode={mode}/>
            </div>
        </CodeProvider>
  );
}