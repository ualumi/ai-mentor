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
        {/*<Route path="/mentor" element={<WorkSpace mode="free" isOpen={isSidebarOpen} toggleSidebar={toggleSidebar}/>} />
        <Route path="/module" element={<Modules mode="modules"/>} />
        <Route path="/module/:id" element={<WorkSpace mode="module" isOpen={isSidebarOpen} toggleSidebar={toggleSidebar}/>} />*/}
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
        
        {/*НЕЗАПРОТЕКТЕНЫЕ РОУТЫ*/}
        {/*<Route
          path="/mentor/attempt/:id"
          element={<WorkSpace mode="history" />}
        />

        <Route path="/progress" element={<Progress labels={["Навык 1", "Навык 2", "Навык 3", "Навык 4"]} values={[20, 40, 30, 80]}/>} />*/}
      </Routes>
    </>
  );
}