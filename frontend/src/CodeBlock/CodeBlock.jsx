import '../App.css'
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

export default CodeBlock