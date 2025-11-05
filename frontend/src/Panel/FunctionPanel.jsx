import '../App.css'
import {SquareCode, History} from 'lucide-react';

function FunctionPanel() {
  return (
    <>
        <div className='functionpanel'>
            <a><SquareCode size={32} /></a>
            <a><History size={32} /></a>
        </div>
        
    </>
  )
}

export default FunctionPanel