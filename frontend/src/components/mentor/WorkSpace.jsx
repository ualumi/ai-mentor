
import SandBox from "./SandBox";
import React, { useState } from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CodeProvider } from '../CodeContext';
import Item from "./Item";
import s from "./FreeMode.module.css"
import Recommendation from "./Recommendation";
import { useParams } from "react-router-dom";
import TasksPanel from "../modules/TasksPanel";
import { useLocation } from "react-router-dom";

export default function WorkSpace({ mode }) {
    const location = useLocation();

    const competency = location.state?.competency;
    
  return (
        <CodeProvider>
            <div className={`free-mode `}>
                
                <div className={`${mode}`}>
                    <SandBox mode={mode} name={competency}></SandBox>
                    {mode === "module" && <TasksPanel />}
                </div>  
                <Recommendation mode={mode}/>
                
                
            </div>
        </CodeProvider>
  );
}