

{/*import { useState } from "react";
import { useAuth } from "../../context/AuthContext"; 

export default function ProfileItem() {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false); // для показа кнопки "Выйти"

  if (!user) return null;

  return (
    <div className="item menu-item profile-item">

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
}*/}
import { useState } from "react";
import { useAuth } from "../../context/AuthContext"; 

export default function ProfileItem() {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(true);

  if (!user) return null;

  const username = user.username || "User";
  const email = user.email || "";

  return (
    <div className="item menu-item profile-item">
      <div 
        className="profile-header"
        onClick={() => setIsOpen(prev => !prev)}
        style={{ display: "flex", alignItems: "center", cursor: "pointer" }}
      >
        <p className="profile-ava">
          {username[0]?.toUpperCase() || "?"}
        </p>

        <div style={{ marginLeft: 8 }}>
          <p className="profile-name">{username}</p>
          <p className="example">{email}</p>
        </div>
      </div>

      {isOpen && (
        <button
          className="logout-button"
          onClick={() => {
            logout();
            setIsOpen(true);
          }}
          style={{ marginTop: 8 }}
        >
          Выйти
        </button>
      )}
    </div>
  );
}