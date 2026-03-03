/*import ToggleButton from "./ToggleButton";
import { useState } from "react";
import "../../App.css"
import Item from "./Item";

export default function Terminal ({ isOpen, onToggle }) {
  isOpen=true;
  return (
    <div>
      
      {isOpen && <div className="sidebar menu-item terminal">
        <Item type="text_item"text="Terminal 1" clas="item-light terminal-item" />
        </div>}
    </div>
  );
};*/

import { useEffect, useState } from "react";
import { wsService } from "../../services/websocket";
import Item from "./Item";
import "../../App.css";

export default function Terminal({ isOpen, onToggle }) {
  const [output, setOutput] = useState("");
  isOpen=true;
  useEffect(() => {
    const handler = (message) => {
      console.log("Terminal received:", message);

      // проверяем источник
      if (message.source?.startsWith("sandbox_response")) {
        const result = message.data?.sandbox_result;

        if (result) {
          const text =
            (result.stdout || "") +
            (result.stderr ? "\n" + result.stderr : "");

          setOutput((prev) => {
            // если этот текст уже есть в output, не добавляем
            if (prev.includes(text)) return prev;

            return text;
          });
        }
      }
    };

    //wsService.on("*", handler);
    wsService.on("sandbox_response", handler);
    return () => {
      //wsService.off("*", handler);
      wsService.off("sandbox_response", handler);
    };
  }, []);

  return (
    <div>
      {isOpen && (
        <div className="sidebar menu-item terminal">
          <Item
            type="text_item"
            text="Terminal 1"
            clas="item-light terminal-item"
          />

          <pre className="terminal-output">
            {output}
          </pre>
        </div>
      )}
    </div>
  );
}