import { Search } from 'lucide-react'; // или любая другая библиотека иконок
import "../../App.css"

const Item = ({ type, icon, text="", placeholder = 'Search', clas="menu-item", showIcon=true }) => {
  switch (type) {
    case 'button_item':
      return (
        <div className="item menu-item">
          {/*{Icon && <Icon className="menu-item-icon" />}*/}
          <span className="menu-item-text">{text}</span>
          {showIcon && icon && (
            <span className="item-icon">
              {icon} {/* Просто рендерим React-элемент */}
            </span>
          )}
        </div>
      );

    case 'text_item':
      return (
        <div className={`item ${clas}`}>
          {showIcon && icon && (
            <span className="item-icon">
              {icon} {/* Просто рендерим React-элемент */}
            </span>
          )}
          <span>{text}</span>
        </div>
      );

    case 'input_item':
      return (
        <div className="item menu-item-input">
          {showIcon && icon && (
            <span className="item-icon">
              {icon} {/* Просто рендерим React-элемент */}
            </span>
          )}
          <Search className="menu-item-icon" />
          <input 
            type="text"
            placeholder={placeholder}
            className="menu-item-field"
          />
        </div>
      );

    default:
      return null;
  }
};

export default Item;