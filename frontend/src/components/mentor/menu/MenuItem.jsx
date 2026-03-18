import { NavLink } from "react-router-dom";
import "../../../App.css"

export default function MenuItem({ type, text, icon, link }) {

  if (type === "button_item") {
    return (
      <NavLink
        to={link}
        className={({ isActive }) =>
          `item ${isActive ? "item-active" : ""}`
        }
      >
        {icon}
        {text && <span>{text}</span>}
      </NavLink>
    );
  }

  // input_item
  return (
    <div className="item">
      {icon}
      {text && <span>{text}</span>}
    </div>
  );
}