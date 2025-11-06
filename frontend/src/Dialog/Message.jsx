import '../App.css'

{/*function Message({ response = "добро" }) {
  return (
    <div className="message">
      <b>ИИ-ментор:</b>
      <pre>{response}</pre>
    </div>
  )
}

export default Message;*/}

function Message({ sender, text }) {
  const isUser = sender === "user";

  return (
    <div
      className="message"
      style={{
        alignSelf: isUser ? "flex-end" : "flex-start",
        backgroundColor: isUser ? "#23292E" : "#23292E",
        borderRadius: "10px",
        padding: "8px 12px",
        margin: "6px 0",
        maxWidth: "80%",
      }}
    >
      <b>{isUser ? "Вы:" : "ИИ-ментор:"}</b>
      <pre style={{ whiteSpace: "pre-wrap", margin: 0 }}>{text}</pre>
    </div>
  );
}

export default Message;