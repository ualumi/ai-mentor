import '../App.css'
import ButtonNew from './ButtonNew'
import FilesTasksSwitcher from './FilesTasksSwitcher'

function Panel() {
  return (
    <>
        <div className='panel'>
            <FilesTasksSwitcher></FilesTasksSwitcher>
            {/*<p>Your Directories here</p>*/}
        </div>
        
    </>
  )
}

export default Panel