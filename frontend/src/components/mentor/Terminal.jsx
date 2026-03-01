import ToggleButton from "./ToggleButton";
import { useState } from "react";
import "../../App.css"
import Item from "./Item";

export default function Terminal ({ isOpen, onToggle }) {
  isOpen=true;
  return (
    <div>
      
      {isOpen && <div className="sidebar menu-item terminal">
        <Item type="text_item"text="Terminal 1" clas="item-light terminal-item" />
        </div>}
    </div>
  );
};