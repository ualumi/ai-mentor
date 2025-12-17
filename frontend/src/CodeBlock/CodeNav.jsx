import '../App.css'
import ButtonFile from './ButtonFile.jsx'
import {SquareTerminal}from 'lucide-react';
import RunButton from './RunButton.jsx';


function CodeNav({ code, addMessage })  {
  return (
    <>
        <div className='codenav'>
          
            <ButtonFile></ButtonFile>
            <RunButton code={code} addMessage={addMessage} />
        </div>
        
    </>
  )
}

export default CodeNav