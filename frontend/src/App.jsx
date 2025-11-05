import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Dialog from './Dialog/Dialog.jsx'
import CodeBlock from './CodeBlock/Codeblock.jsx'
import NavBar from './NavBar/NavBar.jsx'
import Panel from './Panel/Panel.jsx'
import FunctionPanel from './Panel/FunctionPanel.jsx'

function App() {

  return (
    <div className='main'>
      <NavBar></NavBar>
      <div className='window'>
        <FunctionPanel></FunctionPanel>
        <Panel></Panel>
        <CodeBlock></CodeBlock>
        <Dialog></Dialog>
      </div>
    </div>
  )
}

export default App
