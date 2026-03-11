{/*import { useAuth } from "../../context/AuthContext";

export default function ProfileItem() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="item menu-item profile-item">
      <p className="profile-ava">{user.username[0]}</p>
      <div>
        <p className="profile-name">{user.username}</p>
        <p>{user.email}</p>
      </div>
    </div>
  );
}*/}

import { useState } from "react";
import { useAuth } from "../../context/AuthContext"; 

export default function ProfileItem() {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false); // для показа кнопки "Выйти"

  if (!user) return null;

  return (
    <div className="item menu-item profile-item">
      {/* клик по аватару открывает меню */}
      <div 
        className="profile-header"
        onClick={() => setIsOpen(prev => !prev)}
        style={{ display: "flex", alignItems: "center", cursor: "pointer" }}
      >
        <p className="profile-ava">{user.username[0]}</p>
        <div style={{ marginLeft: 8 }}>
          <p className="profile-name">{user.username}</p>
          <p>{user.email}</p>
        </div>
      </div>

      {/* кнопка "Выйти" */}
      {isOpen && (
        <button
          className="logout-button"
          onClick={() => {
            logout(); // сброс токена и данных пользователя
            setIsOpen(false);
          }}
          style={{ marginTop: 8 }}
        >
          Выйти
        </button>
      )}
    </div>
  );
}