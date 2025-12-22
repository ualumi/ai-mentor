export default function TaskCondition({ condition }) {
  if (!condition) return null;

  return (
    <div
      style={{
        border: "1px solid #94a3b8",
        padding: "12px",
        marginBottom: "16px",
        borderRadius: "8px",
        background: "#f8fafc",
      }}
    >
      <h3>📘 Условие задачи</h3>
      <pre style={{ whiteSpace: "pre-wrap" }}>
        {condition}
      </pre>
    </div>
  );
}
