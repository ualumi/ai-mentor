{/*const ToggleButton = ({
  isOpen,
  onToggle,
  openLabel = "Open",
  closeLabel = "Close",
  className = "",
  iconOpen = "▼",
  iconClose = "▲",
  showIcon = true,
  ...buttonProps
}) => {
  const label = isOpen ? closeLabel : openLabel;
  const icon = isOpen ? iconClose : iconOpen;

  return (
    <button
      className={`toggle-button ${className}`}
      onClick={onToggle}
      aria-expanded={isOpen}
      {...buttonProps}
    >
      {showIcon && <span className="toggle-icon">{icon}</span>}
      <span className="toggle-label">{label}</span>
    </button>
  );
};

export default ToggleButton;*/}

// components/ToggleButton.jsx
import React from 'react';
import { ChevronLeft, ChevronRight, Menu, X } from 'lucide-react'; // или другие иконки
import "../../App.css"


const ToggleButton = ({
  isOpen,
  onToggle,
  openLabel = "Open",
  closeLabel = "Close",
  className = "",
  iconOpen = <ChevronLeft size={20} />,  // Иконка когда открыто (чтобы закрыть)
  iconClose = <ChevronRight size={20} />, // Иконка когда закрыто (чтобы открыть)
  showIcon = true,
  showLabel = true,
  position = 'right', // 'right', 'left', 'top', 'bottom'
  ...buttonProps
}) => {
  const label = isOpen ? closeLabel : openLabel;

  return (
    <button
      className={`toggle-button ${className} ${position} ${isOpen ? 'open' : 'closed'}`}
      onClick={onToggle}
      aria-expanded={isOpen}
      {...buttonProps}
    >
      {showIcon && <span className="toggle-icon">{isOpen ? iconOpen : iconClose}</span>}
    </button>
  );
};

export default ToggleButton;