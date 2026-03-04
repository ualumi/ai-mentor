import { useAuth } from "../../context/AuthContext";

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
}