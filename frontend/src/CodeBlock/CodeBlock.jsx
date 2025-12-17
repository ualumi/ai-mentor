{/*import '../App.css'
import CodeEditor from './CodeEditor.jsx'
import CodeNav from './CodeNav.jsx'

function CodeBlock() {
  return (
    <>
        <div className='codeblock'>
            <CodeNav></CodeNav>
            <CodeEditor></CodeEditor>
        </div>
        
    </>
  )
}

export default CodeBlock*/}

import '../App.css';
import { useState } from "react";
import CodeEditor from './CodeEditor.jsx';
import CodeNav from './CodeNav.jsx';
{/*import Terminal from './Terminal.jsx'; // твой компонент терминала*/}
import Terminal from './Terminal.jsx';

function CodeBlock() {
  const [code, setCode] = useState("print('Hello, world!')");
  const [messages, setMessages] = useState([]);

  const addMessage = (msg) => {
    setMessages((prev) => [...prev, msg]);
  };

  return (
    <>
      <div className='codeblock'>
        {/* Передаем код и функцию добавления сообщений в CodeNav */}
        <CodeNav code={code} addMessage={addMessage} />

        {/* Передаем код и setCode в CodeEditor */}
        <CodeEditor code={code} setCode={setCode} />
      </div>

      {/* Терминал для отображения ответов сервера */}
      {/*<Terminal messages={messages} />*/}
    </>
  );
}

export default CodeBlock;
