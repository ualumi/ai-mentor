import { Search } from 'lucide-react'; // или любая другая библиотека иконок
import "../../App.css"
import { NavLink } from 'react-router-dom';

const Item = ({ type, icon, text="", placeholder = 'Search', clas="menu-item", showIcon=true, link="" }) => {
  switch (type) {
    case 'button_item':
      return (
        <NavLink to={`/${link}`} className={`item ${clas}`}>
          {/*{Icon && <Icon className="menu-item-icon" />}*/}
          
          {showIcon && icon && (
            <span className="item-icon">
              {icon} {/* Просто рендерим React-элемент */}
            </span>
          )}
          <span className="menu-item-text">{text}</span>
          {/*<NavLink to={`/${link}`} className="menu-item-text">{text}</NavLink>*/}
        </NavLink>
      );

    case 'text_item':
      return (
        <div className={`item ${clas}`}>
          {showIcon && icon && (
            <span className="item-icon">
              {icon} {/* Просто рендерим React-элемент */}
            </span>
          )}
          <span className="menu-item-text">{text}</span>
        </div>
      );

    case 'input_item':
      return (
        <div className="item menu-item menu-item-input">
          {showIcon && icon && (
            <span className="item-icon">
              {icon} {/* Просто рендерим React-элемент */}
            </span>
          )}
          <input 
            type="text"
            placeholder={placeholder}
            className="menu-item-field menu-item-text"
          />
        </div>
      );

    default:
      return null;
  }
};

export default Item;