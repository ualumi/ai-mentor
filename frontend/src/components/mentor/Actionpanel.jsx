import { useState } from "react";
import { BookOpen } from 'lucide-react';
import { Terminal as Therminal } from 'lucide-react';
import Item from "./Item";
import "../../App.css"
import ModuleTask from "../modules/module/ModuleTask";

export default function Actionpanel({ isOpen, onToggle }) {
  const [activeTab, setActiveTab] = useState("task"); // по умолчанию "условие"

  isOpen=true;
  return (
    <div className="actionpanel">

        {isOpen && <div className="sidebar menu-item terminal">
            <div className="menu-item item-panel">
                <button 
                className={`${activeTab === "task" ? "active" : ""} item-light terminal-item icon-only`}
                onClick={() => setActiveTab("task")}
                >
                    <span className="item-icon"><BookOpen strokeWidth={1} /></span>
                </button>

                <button 
                className={`${activeTab === "terminal" ? "active" : ""} item-light terminal-item icon-only`}
                onClick={() => setActiveTab("terminal")}
                >
                    <span className="item-icon"><Therminal strokeWidth={1} /></span>
                    </button>
            </div>
            
            <div className="panel-content">
                {activeTab === "task" && <ModuleTask></ModuleTask>}
                {activeTab === "terminal" && <Item type="text_item"text="Terminal 1" clas="item-light terminal-item" />}
            </div>
        </div>}
      
      

      

    </div>
  );
}