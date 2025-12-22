import Login from "./components/Login";
import LearningFlow from "./components/LearningFlow";
import TopBar from "./components/TopBar";
import Analitycs from "./components/Analitycs";
import { AuthProvider, useAuth } from "./components/AuthContext";

function AppContent() {
  const { token, login } = useAuth();

  if (!token) {
    return <Login onAuth={login} />;
  }

  return (
    <>
      <TopBar />
      
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
