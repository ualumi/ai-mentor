export default function StepProgress({ stepId, totalSteps }) {
  if (stepId === null || stepId === undefined) return null;

  const current = stepId; // step_id обычно с 0
  const percent = Math.min(
    (current / totalSteps) * 100,
    100
  );

  return (
    <div style={{ marginBottom: 16,   marginTop: 16}}>
      <div className="step">
        <h3>Scaffolding {current} / {totalSteps}</h3>
      </div>

      <div
        style={{
          height: 10,
          background: "#e5e7eb",
          borderRadius: 6,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${percent}%`,
            height: "100%",
            background: "#3b82f6",
            transition: "width 0.3s ease",
          }}
        />
      </div>
    </div>
  );
}
