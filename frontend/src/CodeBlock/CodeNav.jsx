import '../App.css'
import ButtonFile from './ButtonFile.jsx'
import {SquareTerminal}from 'lucide-react';

function CodeNav() {
  return (
    <>
        <div className='codenav'>
          {/*<a><SquareTerminal size={32} /></a>*/}
            <ButtonFile></ButtonFile>
        </div>
        
    </>
  )
}

export default CodeNav