import '../App.css'
import {X} from 'lucide-react';


function ButtonFile() {
  return (
    <>
        <button className='buttonfile'>
            <p>current file.py</p>
            <X />
        </button>
        
    </>
  )
}

export default ButtonFile