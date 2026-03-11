import { useLocation } from "react-router-dom";
import {Route, BrowserRouter, Routes} from "react-router-dom"
import AuthForm from "./components/auth/AuthForm";
import SideBar from "./components/mentor/SideBar";
import Modules from "./components/modules/Modules";
import WorkSpace from "./components/mentor/WorkSpace";

export default function Layout({ isSidebarOpen, toggleSidebar }) {

  const location = useLocation();

  let mode = "free";

  if (location.pathname.startsWith("/module")) {
    mode = "module";
  }

  return (
    <>
      <SideBar
        mode={mode}
        isOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
      />

      <Routes>
        <Route path="/mentor" element={<WorkSpace mode="free" isOpen={isSidebarOpen} toggleSidebar={toggleSidebar}/>} />
        <Route path="/modules" element={<Modules />} />
        <Route path="/module/:id" element={<WorkSpace mode="module" isOpen={isSidebarOpen} toggleSidebar={toggleSidebar}/>} />
        <Route path="/" element={<AuthForm />} />
      </Routes>
    </>
  );
}