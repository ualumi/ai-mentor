import Login from "./components/Login";
import LearningFlow from "./components/LearningFlow";
import TopBar from "./components/TopBar";
import { AuthProvider, useAuth } from "./components/AuthContext";
import LeftBar from "./components/LeftBar"
import {Route, BrowserRouter, Routes} from "react-router-dom"
import Modules from "./components/modules";
import Analyze from "./components/Analyze";
import FreeModeChat from "./components/FreeModeChat";

function AppContent() {
  const { token, login } = useAuth();

  if (!token) {
    return <Login onAuth={login} />;
  }

  return (
    <>
      <BrowserRouter>
        <TopBar />
        <LeftBar />
        <Routes>
          <Route path='/' Component={LearningFlow}/>
          <Route path="/modules" Component={Modules}/>
          <Route path="/analitics" Component={Analyze}/>
          <Route path="/free-mode" Component={FreeModeChat}/>
        </Routes>
      </BrowserRouter>
      
      
    </>
  );
}

export default function App() {
  return (
    <div className="body">
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </div>

  );
}
