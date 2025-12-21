export default function MessagePanel({ title, messages }) {
  return (
    <div style={{ border: "1px solid #ccc", padding: 10, marginTop: 10 }}>
      <h3>{title}</h3>
      {messages.length === 0 && <p>Нет сообщений</p>}
      {messages.map((m, i) => (
        <pre key={i} style={{ background: "#f6f6f6", padding: 8 }}>
          {m}
        </pre>
      ))}
    </div>
  );
}
