
export default function ProfileItem(props) {
  return (
    <div className="item menu-item profile-item">
        <p className="profile-ava">{props.name[0]}</p>
        <div>
            <p className="profile-name">{props.name}</p>
            <p>{props.email}</p>
        </div>
    </div>
  );
}