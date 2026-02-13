import FreeMode from "./components/mentor/FreeMode";
import {Route, BrowserRouter, Routes} from "react-router-dom"
import "./App.css"
export default function App() {
  return (
    <div className="body">
      <BrowserRouter>
          <Routes>
            <Route path='/mentor' Component={FreeMode}/>
            {/*<Route path="/modules" Component={Modules}/>
            <Route path="/progress" Component={Analyze}/>*/}
          </Routes>
        </BrowserRouter>
    </div>
  );
}
