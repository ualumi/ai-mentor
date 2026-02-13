
export default function ProfileItem(props) {
  return (
    <div className="item menu-item profile-item">
      <p>{props.name}</p>
      <p>{props.email}</p>
    </div>
  );
}