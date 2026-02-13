import ToggleButton from "./ToggleButton";
import { useState } from "react";
import "../../App.css"

export default function Terminal () {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div>
      <ToggleButton
        isOpen={isOpen}
        onToggle={() => setIsOpen(!isOpen)}
        openLabel="Open Terminal"
        closeLabel="Close Terminal"
        className="sidebar-toggle"
      />
      
      {isOpen && <div className="sidebar menu-item terminal">Content</div>}
    </div>
  );
};