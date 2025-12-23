export default function MessagePanel({ title, messages }) {
  return (
    <div>
      <h3>{title}</h3>
      {messages.length === 0 && <p className="module_info"></p>}
      {messages.map((m, i) => (
        <pre key={i} className="module_info">
          {m}
        </pre>
      ))}
    </div>
  );
}
