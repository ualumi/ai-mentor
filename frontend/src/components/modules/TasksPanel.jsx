import ModuleTask from "./module/ModuleTask";
import "./module.css"

export default function TasksPanel({ mode, restoredState }) {

    
  return (
    <div className="taskspanel">
        <div className="sidebar-label">

           <h2 className="menu-caption">Module tasks</h2>
            

        </div>
        <ModuleTask restoredState={restoredState}></ModuleTask>
    </div>
  );
}