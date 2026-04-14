/*import { useLocation } from "react-router-dom";
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

export default function Layout({ isSidebarOpen, toggleSidebar }) {
  const location = useLocation();

  const isAuthPage = location.pathname === "/auth";

  let mode = "free";
  if (location.pathname.startsWith("/module")) {
    mode = "module";
  }

  useEffect(() => {
    const setMode = async () => {
      try {
        await wsService.connect(); // гарантируем подключение

        await wsService.send({
          type: "set_mode",
          mode
        });

        console.log("📡 mode set:", mode);

      } catch (e) {
        console.error("WS mode error:", e);
      }
    };

    setMode();
  }, [mode]);

  return (
    <>
      {!isAuthPage && (
        <SideBar
          mode={mode}
          isOpen={isSidebarOpen}
          toggleSidebar={toggleSidebar}
        />
      )}

      <Routes>

        <Route path="/auth" element={<AuthForm />} />
        <Route path="/sso-callback" element={<SSOCallback />} />
        <Route
          path="/mentor"
          element={
            <ProtectedRoute>
              <WorkSpace mode="free" isOpen={isSidebarOpen} toggleSidebar={toggleSidebar}/>
            </ProtectedRoute>
          }
        />

        <Route
          path="/module"
          element={
            <ProtectedRoute>
              <Modules mode="modules"/>
            </ProtectedRoute>
          }
        />

        <Route
          path="/module/:id"
          element={
            <ProtectedRoute>
              <WorkSpace mode="module" isOpen={isSidebarOpen} toggleSidebar={toggleSidebar}/>
            </ProtectedRoute>
          }
        />


        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />

        
        <Route
          path="/mentor/attempt/:id"
          element={
            <ProtectedRoute>
              <WorkSpace mode="history" />
            </ProtectedRoute>
          }
        />

        <Route
          path="/progress"
          element={
            <ProtectedRoute>
              <Progress />
            </ProtectedRoute>
          }
        />
        

      </Routes>
    </>
  );
}*/

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
  /*if (location.pathname.startsWith("/")) {
    mode = "";
  }*/
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

  {/*return (
    <>

        <SideBar
          mode={mode}
          isOpen={isSidebarOpen}
          toggleSidebar={toggleSidebar}
          openAuth={() => setIsAuthOpen(true)} 
        />


      <Routes>
        <Route path="/auth" element={<AuthForm />} />
        <Route path="/sso-callback" element={<SSOCallback />} />


        <Route
          path="/mentor"
          element={
            <ProtectedRoute>
              <WorkSpace mode="free" isOpen={isSidebarOpen} toggleSidebar={toggleSidebar}/>
            </ProtectedRoute>
          }
        />

        <Route
          path="/module"
          element={
            <ProtectedRoute>
              <Modules mode="modules"/>
            </ProtectedRoute>
          }
        />

        <Route
          path="/module/:id"
          element={
            <ProtectedRoute>
              <WorkSpace mode="module" isOpen={isSidebarOpen} toggleSidebar={toggleSidebar}/>
            </ProtectedRoute>
          }
        />


        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />

        
        <Route
          path="/mentor/attempt/:id"
          element={
            <ProtectedRoute>
              <WorkSpace mode="history" />
            </ProtectedRoute>
          }
        />

        <Route
          path="/progress"
          element={
            <ProtectedRoute>
              <Progress />
            </ProtectedRoute>
          }
        />
      </Routes>


      <AuthForm
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />
    </>
  );
}*/}

  return (
    <>
      {/* Sidebar только для залогиненных */}
      {token && (
        <SideBar
          mode={mode}
          isOpen={isSidebarOpen}
          toggleSidebar={toggleSidebar}
          openAuth={() => setIsAuthOpen(true)}
        />
      )}

      <Routes>
        {/* ✅ ВСЕГДА доступны */}
        <Route path="/auth" element={<AuthForm />} />
        <Route path="/sso-callback" element={<SSOCallback />} />

        {/* ✅ Главная */}
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

        {/* ❌ Только для авторизованных */}
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
                {/*<Modules mode="modules"/>*/}
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

      {/* 🔥 МОДАЛКА */}
      <AuthForm
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />
    </>
  );}