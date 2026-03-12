import { useLocation } from "react-router-dom";
import {Route, BrowserRouter, Routes} from "react-router-dom"
import AuthForm from "./components/auth/AuthForm";
import SideBar from "./components/mentor/SideBar";
import Modules from "./components/modules/Modules";
import WorkSpace from "./components/mentor/WorkSpace";
import Home from "./components/home/Home";
import Progress from "./components/home/Progress";

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
        <Route path="/modules" element={<Modules mode="modules"/>} />
        <Route path="/module/:id" element={<WorkSpace mode="module" isOpen={isSidebarOpen} toggleSidebar={toggleSidebar}/>} />
        <Route path="/" element={<AuthForm />} />
        <Route path="/home" element={<Home/>} />
        <Route path="/progress" element={<Progress labels={["Навык 1", "Навык 2", "Навык 3", "Навык 4"]} values={[20, 40, 30, 80]}/>} />
      </Routes>
    </>
  );
}