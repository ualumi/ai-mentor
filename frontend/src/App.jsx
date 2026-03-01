import WorkSpace from "./components/mentor/WorkSpace";
import {Route, BrowserRouter, Routes} from "react-router-dom"
import "./App.css"
export default function App() {
  return (
    <div className="body">
      <BrowserRouter>
          <Routes>
            <Route path="/mentor" element={<WorkSpace mode="free" />} />
            <Route path="/module/:id" element={<WorkSpace mode="module" />} />
            {/*<Route path="/progress" Component={Analyze}/>*/}
          </Routes>
        </BrowserRouter>
    </div>
  );
}
