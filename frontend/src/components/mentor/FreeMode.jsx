import SideBar from "./SideBar";
import SandBox from "./SandBox";
import React, { useState } from 'react';
import ExecutionResult from "../ExecutionResult";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CodeProvider } from '../CodeContext';
import Item from "./Item";
import s from "./FreeMode.module.css"

// Создаем queryClient на самом верхнем уровне
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 минут
      retry: 3,
      refetchOnWindowFocus: false,
    },
  },
});

export default function FreeMode() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };
  return (
    <QueryClientProvider client={queryClient}>
        <CodeProvider>
            <div className={`free-mode ${isSidebarOpen ? 'sidebar-visible' : 'sidebar-hidden'}`}>
                <div className="sidebar-container">
                    <SideBar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} ></SideBar>
                </div>
                
                <SandBox></SandBox>
                <div >{/*className={s["insight-panel"]}*/}
                    <ExecutionResult></ExecutionResult>
                </div>
            </div>
        </CodeProvider>
    </QueryClientProvider>
  );
}