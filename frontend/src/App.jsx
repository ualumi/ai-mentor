import Login from "./components/Login";
import LearningFlow from "./components/LearningFlow";
import TopBar from "./components/TopBar";
import { AuthProvider, useAuth } from "./components/AuthContext";
import LeftBar from "./components/LeftBar"

function AppContent() {
  const { token, login } = useAuth();

  if (!token) {
    return <Login onAuth={login} />;
  }

  return (
    <>
      <TopBar />
      <LeftBar />
      
      <LearningFlow />
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
