import WorkSpace from "./components/mentor/WorkSpace";
import {Route, BrowserRouter, Routes} from "react-router-dom"
import { wsService } from './services/websocket';
import { useRef, useEffect } from "react";
import "./App.css"
import Modules from "./components/modules/Modules";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

export default function App() {
  useEffect(() => {
    wsService.connect("ws://localhost:8004/ws/2");
  }, []);
  return (
    <QueryClientProvider client={queryClient}>
      <div className="body">
        <BrowserRouter>
            <Routes>
              <Route path="/mentor" element={<WorkSpace mode="free" />} />
              <Route path="/modules" element={<Modules />} />
              <Route path="/module/:id" element={<WorkSpace mode="module" />} />
              {/*<Route path="/progress" Component={Analyze}/>*/}
            </Routes>
          </BrowserRouter>
      </div>
    </QueryClientProvider>
  );
}
