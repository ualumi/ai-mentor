

import { useLocation } from "react-router-dom";
import {Route, BrowserRouter, Routes} from "react-router-dom"
import AuthForm from "./components/auth/AuthForm";
import SideBar from "./components/mentor/SideBar";
import Modules from "./components/modules/Modules";
import WorkSpace from "./components/mentor/WorkSpace";
import Home from "./components/home/Home";
import Progress from "./components/home/Progress";
import ProtectedRoute from "./ProtectedRoute";
import { wsService } from "./services/websocket";
import { useEffect } from 'react';
import { SSOCallback } from "./components/auth/SSOCallback";
import { useAuth } from "./context/AuthContext";
import { useState } from "react";
import DefaultPage from "./components/defaultpage/DefaultPage";
import ModulesPage from "./components/modules/ModulesPage";
import ProgressPage from "./components/home/ProgressPage";

export default function Layout({ isSidebarOpen, toggleSidebar }) {
  const location = useLocation();
  const { token } = useAuth();

  useEffect(() => {
    if (token) {
      setIsAuthOpen(false); // 🔥 закрываем при логине
    } else {
      setIsAuthOpen(true);  // 🔥 открываем если не залогинен
    }
  }, [token]);

  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const isAuthPage = location.pathname === "/auth";

  let mode = "free";
  
  if (location.pathname.startsWith("/module")) {
    mode = "module";
  }
  if (location.pathname.startsWith("/mentor")) {
    mode = "free";
  }
  

  // 🔥 авто-открытие
  useEffect(() => {
    if (!token) {
      setIsAuthOpen(true);
    }
  }, [token]);

  useEffect(() => {
    const setMode = async () => {
      try {
        await wsService.connect();
        await wsService.send({ type: "set_mode", mode });
      } catch (e) {
        console.error("WS mode error:", e);
      }
    };

    setMode();
  }, [mode]);

  return (
    <>

      {token && (
        <SideBar
          mode={mode}
          isOpen={isSidebarOpen}
          toggleSidebar={toggleSidebar}
          openAuth={() => setIsAuthOpen(true)}
        />
      )}

      <Routes>

        <Route path="/auth" element={<AuthForm />} />
        <Route path="/sso-callback" element={<SSOCallback />} />


        <Route
          path="/"
          element={
            token ? (
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            ) : (
              <DefaultPage openAuth={() => setIsAuthOpen(true)} />
            )
          }
        />


        <Route
          path="/mentor"
          element={
            token ? (
              <ProtectedRoute>
                <WorkSpace mode="free" isOpen={isSidebarOpen} toggleSidebar={toggleSidebar}/>
              </ProtectedRoute>
            ) : (
              <DefaultPage openAuth={() => setIsAuthOpen(true)} />
            )
          }
        />

        <Route
          path="/module"
          element={
            token ? (
              <ProtectedRoute>
                <ModulesPage />

              </ProtectedRoute>
            ) : (
              <DefaultPage openAuth={() => setIsAuthOpen(true)} />
            )
          }
        />

        <Route
          path="/module/:id"
          element={
            token ? (
              <ProtectedRoute>
                <WorkSpace mode="module" isOpen={isSidebarOpen} toggleSidebar={toggleSidebar}/>
              </ProtectedRoute>
            ) : (
              <DefaultPage openAuth={() => setIsAuthOpen(true)} />
            )
          }
        />

        <Route
          path="/module/:id/:attempt"
          element={
            token ? (
              <ProtectedRoute>
                <WorkSpace mode="module" isOpen={isSidebarOpen} toggleSidebar={toggleSidebar}/>
              </ProtectedRoute>
            ) : (
              <DefaultPage openAuth={() => setIsAuthOpen(true)} />
            )
          }
        />

        <Route
          path="/mentor/attempt/:id"
          element={
            token ? (
              <ProtectedRoute>
                <WorkSpace mode="history" />
              </ProtectedRoute>
            ) : (
              <DefaultPage openAuth={() => setIsAuthOpen(true)} />
            )
          }
        />

        <Route
          path="/progress"
          element={
            token ? (
              <ProtectedRoute>
                <ProgressPage />
              </ProtectedRoute>
            ) : (
              <DefaultPage openAuth={() => setIsAuthOpen(true)} />
            )
          }
        />
      </Routes>


      <AuthForm
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />
    </>
  );}
