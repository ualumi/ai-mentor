import Item from "./Item";

export default function History(props) {
  return (
    <div>
      <p>HISTORY</p>
      <div className="menu-list history-list">
        <Item type="text_item" text="Gjgsnrf1" clas="l" />
        <Item type="text_item" text="Gjgsnrf1gghj..." clas="l" />
        <Item type="text_item" text="Gjgsnrf1gghj..." clas="l" />
      </div>
      
    </div>
  );
}