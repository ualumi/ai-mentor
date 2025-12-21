export default function TaskView({ task }) {
  if (!task) return null;

  return (
    <div>
      <h3>{task.condition.title}</h3>
      <p>{task.condition.description}</p>
      <p>Step: {task.step_id}</p>
    </div>
  );
}
