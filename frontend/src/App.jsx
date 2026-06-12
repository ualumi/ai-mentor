
import {Route, BrowserRouter, Routes} from "react-router-dom"
import { wsService } from './services/websocket';
import { useRef, useEffect } from "react";
import "./App.css"
import Layout from "./Layout";

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuth } from "./context/AuthContext";

import React, { useState } from 'react';

const queryClient = new QueryClient();

export default function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
      const toggleSidebar = (nextState) => {
          setIsSidebarOpen((current) =>
              typeof nextState === "boolean" ? nextState : !current
          );
      };

  const { token } = useAuth();
  useEffect(() => {
    if (!token) return;

    wsService.connect(token);

    /*return () => {
      wsService.disconnect();
    };*/
  }, [token]);
  return (
    <QueryClientProvider client={queryClient}>
      <div className="body">
        
        {/*<BrowserRouter>
            <SideBar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar}></SideBar>
            <Routes>
              <Route path="/mentor" element={<WorkSpace mode="free" isOpen={isSidebarOpen} toggleSidebar={toggleSidebar}/>} />
              <Route path="/modules" element={<Modules />} />
              <Route path="/module/:id" element={<WorkSpace mode="module" isOpen={isSidebarOpen} toggleSidebar={toggleSidebar}/>} />
              <Route path="/" element={<AuthForm />} />
            </Routes>
          </BrowserRouter>*/}
          <BrowserRouter>
            <Layout
              isSidebarOpen={isSidebarOpen}
              toggleSidebar={toggleSidebar}
            />
          </BrowserRouter>
      </div>
    </QueryClientProvider>
  );
}
