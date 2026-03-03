// components/SubmitButton.jsx
/*import { useExecuteCode } from '../hooks/useCodeExecution';
import { useCode } from './CodeContext';
import { Play, Loader, Lightbulb } from 'lucide-react'; // иконки
import "../App.css"

export default function SubmitCodeButton({ 
  eventType = 'submit_code',
  className = '',
  children = 'Подсказка ментора',
}) {
  const { code } = useCode(); // Берем код из контекста
  const executeMutation = useExecuteCode();

  const handleSubmit = async () => {
    if (!code.trim()) {
      alert('Введите код для выполнения');
      return;
    }

    try {
      await executeMutation.mutateAsync({ 
        code,
        event: eventType
      });
    } catch (error) {
      console.error('Execution failed:', error);
      alert('Ошибка выполнения: ' + error.message);
    }
  };

  return (
    <button
      className={`item item-light ${className}`}
      onClick={handleSubmit}
      disabled={executeMutation.isPending}
    >
        
      {executeMutation.isPending ? (
        <>
          <Loader size={18} className="spin" />
          <span>Выполняется...</span>
        </>
      ) : (
        <>
          <Lightbulb strokeWidth={1} />
          <span>{children}</span>
        </>
      )}
    </button>
  );
}*/

import { useExecuteCode } from '../hooks/useCodeExecution';
import { useCode } from './CodeContext';
import { Loader, Lightbulb } from 'lucide-react';
import "../App.css"

export default function SubmitCodeButton({ 
  className = '',
  children = 'Подсказка ментора',
}) {
  const { code } = useCode();
  const executeMutation = useExecuteCode();

  const handleSubmit = async () => {
    if (!code.trim()) {
      alert('Введите код для выполнения');
      return;
    }

    try {
      await executeMutation.mutateAsync({ 
        type: "code_event",          // ✅ добавлено
        event: "submit_code",        // ✅ строго как ждёт бек
        code
      });
    } catch (error) {
      console.error('Execution failed:', error);
      alert('Ошибка выполнения: ' + error.message);
    }
  };

  return (
    <button
      className={`item item-light ${className}`}
      onClick={handleSubmit}
      disabled={executeMutation.isPending}
    >
      {executeMutation.isPending ? (
        <>
          <Loader size={18} className="spin" />
          <span>Выполняется...</span>
        </>
      ) : (
        <>
          <Lightbulb strokeWidth={1} />
          <span>{children}</span>
        </>
      )}
    </button>
  );
}