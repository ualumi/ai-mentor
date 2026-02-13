import '../App.css'

export default function TaskCondition({ condition }) {
  if (!condition) return null;

  return (
    <div
      className="task-condition"
    >
      <h3>Условие задачи</h3>
      <pre className='module_info'>
        {condition}
      </pre>
    </div>
  );
}
