import '../App.css';

function Terminal({ messages }) {
  return (
    <div className="terminal">
      {messages
        .filter((msg) => msg.type === "server" || msg.type === "mentor") // оставляем только сообщения от песочницы
        .map((msg, index) => (
          <div key={index} className="terminal-message server-message">
            <pre className="message-text">{msg.text}</pre>
          </div>
        ))}
    </div>
  );
}

export default Terminal;
