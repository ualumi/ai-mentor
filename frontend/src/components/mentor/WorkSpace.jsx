
import SandBox from "./SandBox";
import React, { useState } from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CodeProvider } from '../CodeContext';
import Item from "./Item";
import s from "./FreeMode.module.css"
import Recommendation from "./Recommendation";
import { useParams } from "react-router-dom";
import TasksPanel from "../modules/TasksPanel";

export default function WorkSpace({ mode }) {

    
  return (
        <CodeProvider>
            <div className={`free-mode `}>
                
                <div className={`${mode}`}>
                    <SandBox mode={mode}></SandBox>
                    {mode === "module" && <TasksPanel />}
                </div>  
                <Recommendation mode={mode}/>
                
                
            </div>
        </CodeProvider>
  );
}