import '../App.css'

function Message(props) {
  return (
    <>
        <div className="message">
          <b>ИИ-ментор:</b>
          <pre>{props.response}</pre>
        </div>
    </>
  )
}

export default Message