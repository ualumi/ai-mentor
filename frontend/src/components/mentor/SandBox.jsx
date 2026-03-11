{/*import CodeEditor from "../CodeEditor";
import s from "./FreeMode.module.css"
import Item from "./Item";
import Terminal from "./Terminal";
import { Terminal as Therminal, Lightbulb, Paperclip } from 'lucide-react';
import { useState } from "react";
import ToggleButton from "./ToggleButton";

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CodeProvider } from '../CodeContext';
import SubmitCodeButton from '../SubmitCodeButton';
import ExecutionResult from '../ExecutionResult';
import { wsService } from '../../services/websocket';
import { useEffect } from 'react';

export default function SandBox(props) {
    const queryClient = new QueryClient();
    const [isTerminalOpen, setIsTerminalOpen] = useState(false);
    const handleToggle = () => {
        setIsTerminalOpen(!isTerminalOpen);
    };

    useEffect(() => {
        wsService.connect();
        return () => wsService.disconnect();
    }, []);
  return (
    <section className={s["section-sandbox"]}>
        <h1 className={s["section-caption"]}>Free mode</h1>
        <div className={s["section-panel"]}>
            <ToggleButton isOpen={isTerminalOpen} onToggle={handleToggle} className="item item-light icon-only"/>
            <Item type="button_item"  clas="item-light icon-only" icon={<Therminal strokeWidth={1} />}/>
            <Item type="text_item"text="Загрузить условие" clas="item-light" icon={<Paperclip strokeWidth={1} />}/>
            <Item type="text_item" text="Подсказка ментора" clas="item-light" icon={<Lightbulb strokeWidth={1} />}/>
        </div>
        <div className="editor">
            <CodeEditor></CodeEditor>
            <Terminal isOpen={isTerminalOpen} onToggle={handleToggle}></Terminal>
        </div>
        
    </section>
  );
}*/}

import CodeEditor from "../CodeEditor";
import s from "./FreeMode.module.css"
import Item from "./Item";
import Terminal from "./Terminal";
import { Terminal as Therminal, Lightbulb, Paperclip } from 'lucide-react';
import { useState } from "react";
import ToggleButton from "./ToggleButton";

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CodeProvider } from '../CodeContext';
import SubmitCodeButton from '../SubmitCodeButton';
import ExecutionResult from '../ExecutionResult';
import { wsService } from '../../services/websocket';
import { useEffect } from 'react';
import Actionpanel from './Actionpanel'
import { RunCodeButton } from "../RunCodeSutton";
import ProgressBar from "../modules/module/ProgressBar";


export default function SandBox({mode}) {
    const [isTerminalOpen, setIsTerminalOpen] = useState(false);
    const handleToggle = () => {
        setIsTerminalOpen(!isTerminalOpen);
    };
    const [analysis, setAnalysis] = useState([]);

    useEffect(() => { 
      const handler = (data) => {
        console.log("WS MESSAGE:", data);

        // ✅ Аннотации кода
        if (
          data.source?.startsWith("code_annotations") &&
          data.data?.annotations
        ) {
          const newAnnotations = data.data.annotations;

          setAnalysis(prev => {
            // фильтруем, чтобы не добавлять дубли
            const filtered = newAnnotations.filter(
              ann => !prev.some(p => p.id === ann.id) // предполагаем, что у каждой аннотации есть уникальный id
            );

            // если новых аннотаций нет — возвращаем старое состояние
            if (filtered.length === 0) return prev;

            return [...prev, ...filtered];
          });
        }
      };

      wsService.on("code_annotations", handler);

      return () => {
        wsService.off("code_annotations", handler);
      };
    }, []);
  return (
    <section className={s["section-sandbox"]}>
        {mode === "free" && <h1 className={s["section-caption"]}>Free mode</h1>}
        {mode === "module" && 
          <div className="progress">
            
            <h1 className={s["section-caption-module"]}>Clustering</h1>
            <div className="progress-info">
              <span className="progress-item-text">Прогресс по модулю: </span>
              <ProgressBar progress={15} />
            </div>
            
          </div>
        }
        
        <div className={s["section-panel"]}>
            {/*<ToggleButton isOpen={isTerminalOpen} onToggle={handleToggle} className="item icon-only item-light"/>*/}
            <RunCodeButton></RunCodeButton>
            {/*<Item type="button_item"  clas="item-light icon-only" icon={<Therminal strokeWidth={1} />}/>*/}
            {mode === "free" && <Item type="text_item"text="Загрузить условие" clas="item-light" icon={<Paperclip strokeWidth={1} />}/>}
            
            {/*<Item type="text_item" text="Подсказка ментора" clas="item-light" icon={<Lightbulb strokeWidth={1} />}/>*/}
            <SubmitCodeButton></SubmitCodeButton>
        </div>
        <div className="editor">
            <CodeEditor analysis={analysis}></CodeEditor>
            {mode === "free" && <Terminal isOpen={isTerminalOpen} onToggle={handleToggle}></Terminal>}
            {mode === "module" && <Actionpanel isOpen={isTerminalOpen} onToggle={handleToggle}></Actionpanel>}
            
        </div>
        
    </section>
  );
}


{/*import CodeEditor from "../CodeEditor";
import s from "./FreeMode.module.css"
import Item from "./Item";
import Terminal from "./Terminal";
import { Terminal as Therminal, Lightbulb, Paperclip } from 'lucide-react';
import { useState } from "react";
import ToggleButton from "./ToggleButton";

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CodeProvider } from '../CodeContext';
import SubmitCodeButton from '../SubmitCodeButton';
import ExecutionResult from '../ExecutionResult';
import { wsService } from '../../services/websocket';
import { useEffect } from 'react';



const queryClient = new QueryClient();

function SandBoxContent() {
    const [isTerminalOpen, setIsTerminalOpen] = useState(false);
    const handleToggle = () => {
        setIsTerminalOpen(!isTerminalOpen);
    };
  // Подключаемся к WebSocket при загрузке
  useEffect(() => {
    wsService.connect();
    return () => wsService.disconnect();
  }, []);

  return (
    <section className={s["section-sandbox"]}>
        <h1 className={s["section-caption"]}>Free mode</h1>
        <div className={s["section-panel"]}>
            <ToggleButton isOpen={isTerminalOpen} onToggle={handleToggle} className="item item-light icon-only"/>
            <Item type="button_item"  clas="item-light icon-only" icon={<Therminal strokeWidth={1} />}/>
            <Item type="text_item"text="Загрузить условие" clas="item-light" icon={<Paperclip strokeWidth={1} />}/>
      
            <SubmitCodeButton></SubmitCodeButton>
        </div>
        <div className="editor">
            <CodeEditor></CodeEditor>
            <Terminal isOpen={isTerminalOpen} onToggle={handleToggle}></Terminal>
        </div>
        
    </section>
  );
}


export default function SandBox(props) {
  return (
    <QueryClientProvider client={queryClient}>
      <CodeProvider>
        <SandBoxContent />
      </CodeProvider>
    </QueryClientProvider>
  );
}*/}