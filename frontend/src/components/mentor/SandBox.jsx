import CodeEditor from "../CodeEditor";
import s from "./FreeMode.module.css"
import Item from "./Item";
import Terminal from "./Terminal";
import { Terminal as Therminal } from 'lucide-react';

export default function SandBox(props) {
  return (
    <section className={s["section-sandbox"]}>
        <h1 className={s["section-caption"]}>Free mode</h1>
        <div className={s["section-panel"]}>
            <Item type="text_item"  clas="item-light icon-only" icon={<Therminal strokeWidth={1} />}/>
            <Item type="text_item"text="Search" clas="item-light"/>
            <Item type="text_item" text="Search" clas="item-light"/>
        </div>
        <div className="editor">
            <CodeEditor></CodeEditor>
            <Terminal></Terminal>
        </div>
        
    </section>
  );
}